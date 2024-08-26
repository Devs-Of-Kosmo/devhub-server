import os
import zipfile
import tempfile
import difflib
import re
import openai
import jwt
import json
from functools import wraps
import requests
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity
)
from flask import Flask, render_template, request, jsonify, Blueprint, session
from website.model import db, User, SaveFile
from website.decorators import admin_required
from markupsafe import Markup
from datetime import datetime
from dotenv import load_dotenv  # 환경 변수 로드를 위한 모듈

# 환경 변수 로드 (확인 및 로드)
load_dotenv()

# OpenAI API 키 설정
openai.api_key = os.getenv('OPENAI_API_KEY')

main = Blueprint('main', __name__)
UPLOAD_FOLDER = tempfile.mkdtemp()

SPRING_BOOT_API_URL = 'http://localhost:8080'

@main.route('/')
def index():
    return render_template('index.html')


@main.route('/save_token', methods=['GET'])
def save_token():
    token = request.args.get('token')
    project_id = request.args.get('projectId')
    project_name = request.args.get('projectName')
    description = request.args.get('description')
    created_date = request.args.get('createdDate')

    if not token or not project_id or not project_name:
        return jsonify({"error": "토큰이나 프로젝트 정보가 제공되지 않았습니다."}), 400

    response_script = f"""
        <script>
            localStorage.setItem('accessToken', '{token}');
            sessionStorage.setItem('projectId', '{project_id}');
            sessionStorage.setItem('projectName', '{project_name}');
            sessionStorage.setItem('description', '{description}');
            sessionStorage.setItem('createdDate', '{created_date}');
            window.location.href = '/';  // 리디렉션
        </script>
    """
    return response_script, 200

@main.route('/api/personal/repo', methods=['POST'])
@jwt_required()  # JWT 토큰이 필요함을 나타냅니다.
def create_personal_repo():
    data = request.get_json()
    access_token = request.headers.get('Authorization')

    try:
        response = requests.post(
            f'{SPRING_BOOT_API_URL}/api/personal/repo',
            json=data,
            headers={'Authorization': access_token}
        )

        response.raise_for_status()
        return jsonify(response.json()), response.status_code

    except requests.exceptions.RequestException as e:
        return jsonify({'message': 'Failed to create personal repo', 'error': str(e)}), 500

@main.route('/api/personal/project/init', methods=['POST'])
@jwt_required()  # JWT 토큰이 필요함을 나타냅니다.
def init_personal_project():
    project_id = request.form.get('projectId')
    files = request.files.getlist('files')
    commit_message = request.form.get('commitMessage')
    access_token = request.headers.get('Authorization')

    # 필드 로그 출력 (디버깅용)
    print(f"Received project_id: {project_id}")
    print(f"Received commit_message: {commit_message}")
    print(f"Number of files received: {len(files)}")
    print(f"Access token: {access_token}")

    files_data = [('files', (file.filename, file.stream, file.content_type)) for file in files]

    # 로그: 파일 정보 확인 (디버깅용)
    for file_info in files_data:
        print(f"File: {file_info[1][0]}, Content-Type: {file_info[1][2]}")

    # 요청 보내기
    try:
        response = requests.post(
            f'{SPRING_BOOT_API_URL}/api/personal/project/init',
            data={'projectId': project_id, 'commitMessage': commit_message},
            files=files_data,
            headers={'Authorization': f'Bearer {access_token}'}
        )

        # 응답 상태 코드 확인 (디버깅용)
        print(f"Response Status Code: {response.status_code}")
        print(f"Response Content: {response.text}")

        response.raise_for_status()
        return jsonify(response.json()), response.status_code

    except requests.exceptions.RequestException as e:
        print(f"Error: {str(e)}")  # 디버깅을 위해 추가
        return jsonify({'message': 'Failed to initialize project', 'error': str(e)}), 500


@main.route('/api/personal/project/save', methods=['POST'])
@jwt_required()  # JWT 토큰이 필요함을 나타냅니다.
def save_personal_project():
    from_commit_id = request.form.get('fromCommitId')
    files = request.files.getlist('files')
    commit_message = request.form.get('commitMessage')
    access_token = request.headers.get('Authorization')

    files_data = [('files', (file.filename, file.stream, file.content_type)) for file in files]

    try:
        response = requests.post(
            f'{SPRING_BOOT_API_URL}/api/personal/project/save',
            data={'fromCommitId': from_commit_id, 'commitMessage': commit_message},
            files=files_data,
            headers={'Authorization': access_token}
        )

        response.raise_for_status()
        return jsonify(response.json()), response.status_code

    except requests.exceptions.RequestException as e:
        return jsonify({'message': 'Failed to save project version', 'error': str(e)}), 500


@main.route('/api/personal/project/download', methods=['GET'])
@jwt_required()
def download_project_file():
    commit_id = request.args.get('commitId')
    access_token = request.headers.get('Authorization')

    if not commit_id:
        return jsonify({'message': 'Missing commitId parameter'}), 400

    try:
        response = requests.get(
            f'{SPRING_BOOT_API_URL}/api/personal/project/download',
            headers={'Authorization': access_token},
            params={'commitId': commit_id},
            stream=True  # 파일 다운로드를 위해 스트리밍 모드 사용
        )

        if response.status_code == 200:
            content_disposition = response.headers.get('Content-Disposition', '')
            file_name = content_disposition.split('filename=')[-1].strip('"') if 'filename=' in content_disposition else 'downloaded_file.zip'
            file_path = os.path.join(tempfile.gettempdir(), file_name)

            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            return jsonify({'message': 'File downloaded successfully', 'filePath': file_path}), 200
        else:
            return jsonify({'message': 'Failed to download file', 'error': response.text}), response.status_code

    except requests.exceptions.RequestException as e:
        print(f"Error downloading file: {e}")  # 디버깅용 로그
        return jsonify({'message': 'Failed to download file', 'error': str(e)}), 500


@main.route('/api/personal/project/commit/<int:commit_id>', methods=['DELETE'])
@jwt_required()
def delete_commit(commit_id):
    access_token = request.headers.get('Authorization')

    print(f"Deleting commit with ID: {commit_id}")
    print(f"Using accessToken: {access_token}")

    try:
        response = requests.delete(
            f'{SPRING_BOOT_API_URL}/api/personal/project/commit/{commit_id}',
            headers={'Authorization': access_token}
        )

        if response.status_code == 200:
            return '', 204  # 요청이 성공했으나 응답 바디가 필요 없는 경우 204 반환
        else:
            print(f"Unexpected status code: {response.status_code}")
            print(f"Response content: {response.text}")
            return jsonify({'message': 'Failed to delete commit', 'status': response.status_code, 'errors': response.text}), response.status_code

    except requests.exceptions.HTTPError as e:
        print(f"HTTP error occurred: {e.response.text}")  # 디버깅용 로그
        return jsonify({'message': 'Failed to delete commit', 'error': e.response.text}), e.response.status_code
    except requests.exceptions.RequestException as e:
        print(f"Error deleting commit: {e}")  # 디버깅용 로그
        return jsonify({'message': 'Failed to delete commit', 'error': str(e)}), 500


@main.route('/api/personal/repo/list', methods=['GET'])
@jwt_required()
def get_selected_project():
    token = request.headers.get('Authorization')
    selected_project_id = request.args.get('projectId')

    if not token or not selected_project_id:
        return jsonify({"error": "토큰이나 프로젝트 ID가 제공되지 않았습니다."}), 400

    try:
        response = requests.get(
            f'{SPRING_BOOT_API_URL}/api/personal/repo/{selected_project_id}',
            headers={'Authorization': token}
        )
        response.raise_for_status()
        project_data = response.json()

        return jsonify(project_data), 200

    except requests.exceptions.RequestException as e:
        return jsonify({'message': 'Failed to fetch project', 'error': str(e)}), 500

@main.route('/upload', methods=['POST'])
def upload():
    file1 = request.files.get('file1')
    file2 = request.files.get('file2')

    if file1:
        file1_path, dir1_structure = process_zip_file(file1, 'original')
        return jsonify(result="Files uploaded successfully", combined_structure={"original_structure": dir1_structure})

    if file2:
        file2_path, content = process_text_file(file2)
        return jsonify(result="Files uploaded successfully", content=content)

    return jsonify(result="No file uploaded"), 400

def process_zip_file(file, type):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    extract_dir = os.path.join(UPLOAD_FOLDER, os.path.splitext(file.filename)[0])
    with zipfile.ZipFile(file_path, 'r') as zip_ref:
        zip_ref.extractall(extract_dir)
    dir_structure = get_directory_structure_html(extract_dir, type)
    return file_path, dir_structure

def process_text_file(file):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return file_path, content

def get_directory_structure_html(rootdir, type):
    structure = "<ul class='directory-list'>"
    for root, dirs, files in os.walk(rootdir):
        for dir_name in dirs:
            structure += f"<li class='directory' data-path='{os.path.join(root, dir_name)}' data-type='{type}'>{dir_name}<ul class='nested'></ul></li>"
        for file_name in files:
            structure += f"<li class='file' data-path='{os.path.join(root, file_name)}' data-type='{type}'>{file_name}</li>"
        break
    structure += "</ul>"
    return structure

def get_subdirectories_html(path, type):
    subdirs = "<ul class='nested active'>"
    for root, dirs, files in os.walk(path):
        for dir_name in dirs:
            subdirs += f"<li class='directory' data-path='{os.path.join(root, dir_name)}' data-type='{type}'>{dir_name}<ul class='nested'></ul></li>"
        for file_name in files:
            subdirs += f"<li class='file' data-path='{os.path.join(root, file_name)}' data-type='{type}'>{file_name}</li>"
        break
    subdirs += "</ul>"
    return subdirs

@main.route('/api/mail/public/send', methods=['POST'])
def send_email_verification():
    data = request.get_json()
    email = data.get('email')

    to_email = f"verification_code_for_{email}@example.com"
    print(f"Verification email sent to: {email}")

    return jsonify({'toEmail': to_email}), 200

@main.route('/api/personal/project/metadata', methods=['GET'])
@jwt_required()
def get_project_metadata():
    project_id = request.args.get('projectId')
    access_token = request.headers.get('Authorization')

    if not project_id:
        return jsonify({'message': 'projectId가 제공되지 않았습니다.'}), 400

    try:
        response = requests.get(
            f'{SPRING_BOOT_API_URL}/api/personal/project/metadata',
            headers={'Authorization': f'Bearer {access_token}'},
            params={'projectId': project_id}
        )
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        return jsonify({'message': 'Failed to fetch project metadata', 'error': str(e)}), 500


@main.route('/api/mail/public/check', methods=['POST'])
def check_email_verification():
    data = request.get_json()
    email = data.get('email')
    authentication_code = data.get('authenticationCode')

    verified = True
    print(f"Checked email: {email} with code: {authentication_code}")

    return jsonify({'verified': verified}), 200

@main.route('/api/user/info', methods=['GET'])
@jwt_required()
def user_info():
    auth_header = request.headers.get('Authorization')
    if auth_header:
        token = auth_header.split(" ")[1]
    else:
        return jsonify({'message': 'Token is missing!'}), 403

    try:
        response = requests.get(f'{SPRING_BOOT_API_URL}/api/user/info', headers={'Authorization': f'Bearer {token}'})
        response.raise_for_status()
        user_info = response.json()

        return jsonify(user_info), 200
    except requests.exceptions.RequestException as e:
        return jsonify({'message': 'Failed to fetch user info', 'error': str(e)}), 500

@main.route('/api/personal/save', methods=['POST'])
@jwt_required()
def save_personal_version():
    commit_id = request.form.get('commitId')
    files = request.form.getlist('files')
    commit_message = request.form.get('commitMessage')

    if not commit_id or not files or not commit_message:
        return jsonify({'message': 'Missing required data'}), 400

    current_user = get_jwt_identity()
    parent_commit = SaveFile.query.get(commit_id)

    if not parent_commit:
        return jsonify({'message': 'Parent commit not found'}), 404

    new_commit = SaveFile(
        personalProjectId=parent_commit.personalProjectId,
        masterId=current_user['user_id'],
        parentCommitCode=parent_commit.commitCode,
        commitMessage=commit_message,
        files=files
    )
    db.session.add(new_commit)
    db.session.commit()

    return jsonify({
        'personalCommitId': new_commit.id,
        'personalProjectId': new_commit.personalProjectId,
        'masterId': new_commit.masterId,
        'parentCommitCode': new_commit.parentCommitCode,
        'commitMessage': new_commit.commitMessage
    }), 200


@main.route('/api/personal/read', methods=['GET'])
@jwt_required()
def read_personal_projects():
    current_user = get_jwt_identity()
    projects = SaveFile.query.filter_by(masterId=current_user['user_id']).all()

    projects_list = [{
        'personalProjectId': project.id,
        'projectName': project.projectName,
        'description': project.description,
        'createdDate': project.createdDate.isoformat()
    } for project in projects]

    return jsonify(projects_list), 200

@main.route('/subdirectories', methods=['GET'])
def get_subdirectories():
    path = request.args.get('path')
    dir_type = request.args.get('type')
    if not path or not os.path.exists(path):
        return jsonify(result="Directory not found"), 404
    subdirs_html = get_subdirectories_html(path, dir_type)
    return jsonify(result="Subdirectories loaded successfully", subdirectories=subdirs_html)

@main.route('/file', methods=['GET'])
def get_file():
    file_path = request.args.get('path')
    if not file_path or not os.path.exists(file_path):
        return jsonify(result="File not found"), 404
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    return jsonify(result="File loaded successfully", content=content)

@main.route('/compare', methods=['POST'])
def compare():
    data = request.get_json()
    original = data.get('original')
    changed = data.get('changed')

    diff = difflib.ndiff(original.splitlines(), changed.splitlines())
    differences = []
    for line in diff:
        if line.startswith('- '):
            differences.append(f"<span style='background-color: #fdd;'>{line[2:]}</span>")
        elif line.startswith('+ '):
            differences.append(f"<span style='background-color: #dfd;'>{line[2:]}</span>")
    differences_html = '<br>'.join(differences)

    return jsonify(differences=Markup(differences_html))

@main.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify(access_token=new_access_token), 200

@main.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@main.route('/api/user/public/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password or not name:
        return jsonify({'message': 'Missing required data'}), 400

    user = User(email=email, password=password, name=name)
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'userId': user.id,
        'email': user.email,
        'name': user.name,
        'identificationCode': user.identification_code
    }), 200

@main.route('/api/auth/public/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.verify_password(password):
        access_token = create_access_token(identity={'user_id': user.id, 'email': user.email})
        refresh_token = create_refresh_token(identity={'user_id': user.id, 'email': user.email})
        return jsonify({'accessToken': access_token, 'refreshToken': refresh_token}), 200

    return jsonify({'message': 'Invalid email or password'}), 401

@main.route('/api/auth/public/reissue', methods=['POST'])
@jwt_required(refresh=True)
def reissue_access_token():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    return jsonify({'accessToken': new_access_token}), 200


@main.route('/get_file_content/<int:file_id>')
def get_file_content(file_id):
    file = SaveFile.query.get_or_404(file_id)
    return jsonify(result="success", file={
        "name": file.name,
        "timestamp": file.timestamp.isoformat(),
        "content": file.content,
        "differences": file.differences
    })

@main.route('/save_changes', methods=['POST'])
def save_changes():
    data = request.json
    original_files = data.get('original_files')
    changed_files = data.get('changed_files')

    try:
        save_files('saved_files/original', original_files)
        save_files('saved_files/changed', changed_files)
        return jsonify(result="Files saved successfully.")
    except Exception as e:
        return jsonify(result=str(e))

def save_files(base_path, files):
    for file in files:
        file_path = os.path.join(base_path, file['name'])
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w') as f:
            f.write(file['content'])

@main.route('/review-code', methods=['POST'])
def review_code():
    data = request.get_json()
    file1_content = data.get('file1')
    file2_content = data.get('file2')

    if not file1_content or not file2_content:
        return jsonify({"error": "Both file contents are required"}), 400

    # 두 파일의 차이점 계산
    diff = difflib.unified_diff(file1_content.splitlines(), file2_content.splitlines(), lineterm='')
    diff_text = '\n'.join(diff)

    review_prompt = [
        {"role": "system", "content": "You are a helpful assistant skilled in code review."},
        {"role": "user", "content": f"Please review the following code changes and provide feedback:\n\n{diff_text}\n\nFeedback (in Korean):"}
    ]

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=review_prompt,
            max_tokens=500,
            temperature=0.7,
        )
        review = response.choices[0].message['content'].strip()
        return jsonify({"review": review})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": f"Failed to get review: {str(e)}"}), 500