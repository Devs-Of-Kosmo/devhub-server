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
from website.model import db, User, Comment, SaveFile
from website.decorators import admin_required
from markupsafe import Markup
from datetime import datetime

main = Blueprint('main', __name__)
UPLOAD_FOLDER = tempfile.mkdtemp()

SPRING_BOOT_API_URL = 'http://localhost:8080'

@main.route('/')
def index():
    comments = Comment.query.filter_by(page='home').all()
    return render_template('index.html', comments=comments)


@main.route('/save_token', methods=['GET'])
def save_token():
    # URL 매개변수에서 토큰과 프로젝트 데이터를 가져옵니다.
    token = request.args.get('token')
    project_id = request.args.get('projectId')
    project_name = request.args.get('projectName')
    description = request.args.get('description')
    created_date = request.args.get('createdDate')
    master_id = request.args.get('masterId')

    # 토큰이 있으면 토큰을 로컬 스토리지에 저장할 수 있는 JavaScript 코드를 반환합니다.
    response_script = f"""
        <script>
            if ('{token}') {{
                localStorage.setItem('accessToken', '{token}');
                alert('토큰이 성공적으로 저장되었습니다.');
            }} else {{
                alert('Token not provided');
                window.location.href = '/';  // 토큰이 없으면 홈 페이지로 리디렉션
            }}
    """

    # 프로젝트 데이터가 모두 있는지 확인하고, 로컬 스토리지에 저장하는 코드를 추가합니다.
    if project_id and project_name and description and master_id:
        response_script += f"""
            let projects = JSON.parse(localStorage.getItem('projects') || '[]');
            projects.push({{
                projectId: '{project_id}',
                projectName: '{project_name}',
                description: '{description}',
                createdDate: '{created_date}',
                masterId: '{master_id}'
            }});
            localStorage.setItem('projects', JSON.stringify(projects));
            alert('프로젝트 데이터가 성공적으로 저장되었습니다.');
            window.location.href = '/';  // 저장 후 홈 페이지로 리디렉션
        </script>
        """
    else:
        response_script += "<script>alert('Some project data is missing'); window.location.href = '/';</script>"

    return response_script, 400 if not token else 200

@main.route('/api/personal/repo', methods=['POST'])
@jwt_required()  # JWT 토큰이 필요함을 나타냅니다.
def create_personal_repo():
    data = request.get_json()
    access_token = request.headers.get('Authorization')

    try:
        # 스프링부트 API로 요청 보내기
        response = requests.post(
            f'{SPRING_BOOT_API_URL}/api/personal/repo',
            json=data,
            headers={'Authorization': access_token}
        )

        # 스프링부트에서 응답 처리
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

    files_data = [('files', (file.filename, file.stream, file.content_type)) for file in files]

    try:
        response = requests.post(
            f'{SPRING_BOOT_API_URL}/api/personal/project/init',
            data={'projectId': project_id, 'commitMessage': commit_message},
            files=files_data,
            headers={'Authorization': access_token}
        )

        response.raise_for_status()
        return jsonify(response.json()), response.status_code

    except requests.exceptions.RequestException as e:
        return jsonify({'message': 'Failed to initialize project', 'error': str(e)}), 500

@main.route('/api/personal/project/save', methods=['POST'])
@jwt_required()  # JWT 토큰이 필요함을 나타냅니다.
def save_personal_project():
    from_commit_id = request.form.get('fromCommitId')
    files = request.files.getlist('files')
    commit_message = request.form.get('commitMessage')
    access_token = request.headers.get('Authorization')

    # FormData에 포함될 파일 데이터를 준비합니다.
    files_data = [('files', (file.filename, file.stream, file.content_type)) for file in files]

    try:
        # 스프링 부트 API로 요청을 보냅니다.
        response = requests.post(
            f'{SPRING_BOOT_API_URL}/api/personal/project/save',
            data={'fromCommitId': from_commit_id, 'commitMessage': commit_message},
            files=files_data,
            headers={'Authorization': access_token}
        )

        # 응답이 성공적이지 않은 경우 예외를 발생시킵니다.
        response.raise_for_status()
        # 성공적인 응답을 JSON 형태로 반환합니다.
        return jsonify(response.json()), response.status_code

    except requests.exceptions.RequestException as e:
        # 요청 중 발생한 예외를 처리합니다.
        return jsonify({'message': 'Failed to save project version', 'error': str(e)}), 500


@main.route('/api/personal/repo/list', methods=['GET'])
@jwt_required()
def get_personal_projects():
    # JWT에서 사용자 정보 가져오기
    current_user = get_jwt_identity()

    # Authorization 헤더에서 'Bearer '를 포함하여 액세스 토큰을 가져옵니다.
    access_token = request.headers.get('Authorization')

    if not access_token:
        return jsonify({'message': 'Access token not provided'}), 401

    try:
        response = requests.get(
            f'{SPRING_BOOT_API_URL}/api/personal/repo/list',
            headers={'Authorization': access_token}
        )

        # API 응답 상태 코드에 따라 JSON 데이터 반환
        response.raise_for_status()
        return jsonify(response.json())

    except requests.exceptions.HTTPError as http_err:
        return jsonify({'message': 'HTTP error occurred', 'error': str(http_err)}), response.status_code
    except requests.exceptions.RequestException as req_err:
        return jsonify({'message': 'Failed to fetch personal projects', 'error': str(req_err)}), 500

@main.route('/group')
def grupt():
    return render_template('group.html')

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

    # Email verification logic here
    to_email = f"verification_code_for_{email}@example.com"
    print(f"Verification email sent to: {email}")

    return jsonify({'toEmail': to_email}), 200

@main.route('/api/mail/public/check', methods=['POST'])
def check_email_verification():
    data = request.get_json()
    email = data.get('email')
    authentication_code = data.get('authenticationCode')

    # Logic to check the authentication code
    verified = True
    print(f"Checked email: {email} with code: {authentication_code}")

    return jsonify({'verified': verified}), 200

@main.route('/api/user/info', methods=['GET'])
def user_info():
    # 요청 헤더에서 Authorization 토큰을 가져옵니다.
    auth_header = request.headers.get('Authorization')
    if auth_header:
        # "Bearer " 이후의 실제 토큰을 추출합니다.
        token = auth_header.split(" ")[1]
    else:
        token = None

    # 토큰이 존재하지 않으면 403 Forbidden 응답을 반환합니다.
    if not token:
        return jsonify({'message': 'Token is missing!'}), 403

    try:
        # 스프링부트 API에 요청을 보냅니다.
        response = requests.get(f'{SPRING_BOOT_API_URL}/api/user/info', headers={'Authorization': f'Bearer {token}'})
        response.raise_for_status()

        # 성공적으로 데이터를 가져왔다면, JSON 응답을 파싱합니다.
        user_info = response.json()

        # JSON 응답을 클라이언트에 반환합니다.
        return jsonify(user_info), 200
    except requests.exceptions.RequestException as e:
        # 외부 API 요청 실패 시 에러 메시지를 반환합니다.
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
            differences.append(f"<span style='background-color: #fdd;'>{line[2:]}</span>")
    differences_html = '<br>'.join(differences)

    return jsonify(differences=Markup(differences_html))

@main.route('/tools')
def tools():
    comments = Comment.query.filter_by(page='tools').all()
    return render_template('tools.html', comments=comments)

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

@main.route('/add_comment', methods=['POST'])
def add_comment():
    data = request.get_json()
    new_comment = Comment(page=data['page'], username=data['username'], user_comment=data['comment'])
    db.session.add(new_comment)
    db.session.commit()
    return jsonify(result="Comment added successfully")

@main.route('/add_response', methods=['POST'])
@admin_required
def add_response():
    data = request.get_json()
    comment_id = data['comment_id']
    response = data.get('response')
    comment = Comment.query.get(comment_id)
    if comment:
        comment.admin_response = response
        db.session.commit()
        return jsonify(result="Response added successfully")
    return jsonify(result="Comment not found"), 404

@main.route('/convert', methods=['POST'])
def convert():
    data = request.get_json()
    language = data.get('language')
    code = data.get('code')

    converted_code = code_converter(language, code)

    return jsonify(converted_code=converted_code)

def code_converter(language, code):
    if language == 'python':
        return java_to_python(code)
    elif language == 'java':
        return python_to_java(code)
    elif language == 'c':
        return java_to_c(code)
    else:
        return "Unsupported language"

def java_to_python(code):
    code = re.sub(r'// (.*)', r'# \1', code)
    code = re.sub(r'public static int (\w+)\((.*?)\) {', r'def \1(\2):', code)
    code = re.sub(r'public static void (\w+)\((.*?)\) {', r'def \1(\2):', code)
    code = re.sub(r'public static (\w+) (\w+)\((.*?)\) {', r'def \2(\3):', code)
    code = re.sub(r'public int (\w+)\((.*?)\) {', r'def \1(self, \2):', code)
    code = re.sub(r'public void (\w+)\((.*?)\) {', r'def \1(self, \2):', code)
    code = re.sub(r'public static void main\(String\[\] args\) {', 'def main():', code)
    code = re.sub(r'return (.*);', r'return \1', code)
    code = re.sub(r'System.out.println\((.*?)\);', r'print(\1)', code)
    code = code.replace('{', '').replace('}', '')
    code = re.sub(r'(\n\s*)\{(\n\s*)', r'\1\2', code)
    code = re.sub(r'\n\s*\}', r'\n', code)
    code = re.sub(r';', '', code)
    code = re.sub(r'public class (\w+) {', r'class \1:', code)
    code = re.sub(r'if \((.*?)\) {', r'if \1:', code)
    code = re.sub(r'else {', r'else:', code)
    code = re.sub(r'\n\s*\n', '\n', code)
    code = re.sub(r'\bnull\b', 'None', code)
    return code.strip()

def python_to_java(code):
    code = re.sub(r'# (.*)', r'// \1', code)
    code = re.sub(r'def (\w+)\((.*?)\):', r'public static int \1(\2) {', code)
    code = re.sub(r'def main\(\):', 'public static void main(String[] args) {', code)
    code = re.sub(r'return (.*)', r'return \1;', code)
    code = re.sub(r'print\((.*?)\)', r'System.out.println(\1);', code)
    code = re.sub(r'class (\w+):', r'public class \1 {', code)
    code = re.sub(r'if (.*):', r'if (\1) {', code)
    code = re.sub(r'else:', r'else {', code)
    code = re.sub(r'    ', '    ', code)
    code = re.sub(r'\n(?![^\n]*{)', r'\n}', code)
    code = re.sub(r'\n\s*\n', '\n', code)
    return code.strip()

def java_to_c(code):
    code = re.sub(r'//(.*)', r'/* \1 */', code)
    code = re.sub(r'/\*\*([^*]*\*+)+[^/]*\*/', lambda m: '/*' + m.group(1).replace('*', '').strip() + ' */', code)
    code = re.sub(r'public static int (\w+)\s*\((.*?)\)\s*\{', r'int \1(\2) {', code)
    code = re.sub(r'public static int (\w+)\((.*?)\)\s*\{', r'int \1(\2) {', code)
    code = re.sub(r'public static (\w+)\s+(\w+)\((.*?)\)\s*\{', r'\1 \2(\3) {', code)
    code = re.sub(r'public static void main\(String\[\] args\)\s*\{', 'int main() {', code)
    code = re.sub(r'System.out.println\("Error: (.*?)"\);', r'printf("Error: \1\\n");', code)
    code = re.sub(r'System.out.println\("(.*?)"\);', r'printf("\1\\n");', code)
    code = re.sub(r'System.out.println\((.*?)\);', r'printf("%d\\n", \1);', code)
    code = re.sub(r'System.out.println\((.*?), (.*?)\);', r'printf("%s: %d\\n", \1, \2);', code)
    code = re.sub(r'int (\w+) = (.*?);', r'int \1 = \2;', code)
    code = re.sub(r'public class \w+ \{', '', code)
    code = re.sub(r'\}\s*$', '', code)
    code = re.sub(r'\{', '{\n', code)
    code = re.sub(r'\}', '\n}', code)
    code = re.sub(r'\n\s*\}\s*$', '\n    return 0;\n}', code, flags=re.MULTILINE)
    code = '#include <stdio.h>\n\n' + code.strip()
    return code

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

@main.route('/review_files', methods=['POST'])
def review_files():
    data = request.get_json()
    file1_content = data.get('file1')
    file2_content = data.get('file2')

    if not file1_content or not file2_content:
        return jsonify(result="Both files are required"), 400

    diff = difflib.ndiff(file1_content.splitlines(), file2_content.splitlines())
    differences = '\n'.join(diff)

    review_prompt = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": f"Review the differences between two code files and provide feedback:\n\nDifferences:\n{differences}\n\nFeedback(한글로):"}
    ]

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=review_prompt,
            max_tokens=500,
            n=1,
            stop=None,
            temperature=0.5,
        )
        review = response.choices[0].message['content'].strip()
        return jsonify(result="success", review=review)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify(result=f"Failed to get review: {e}"), 500
