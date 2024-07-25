import os
import zipfile
import tempfile
import difflib
import re
import openai
import jwt
from functools import wraps
import requests
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from flask import render_template, request, redirect, url_for, flash, jsonify, Blueprint, Flask
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from website.model import db, User, Comment, SaveFile
from website.decorators import admin_required
from markupsafe import Markup
from datetime import datetime

main = Blueprint('main', __name__)
UPLOAD_FOLDER = tempfile.mkdtemp()

#openai.api_key = ''
# 결제후키메모장

@main.route('/')
def index():
    comments = Comment.query.filter_by(page='home').all()
    token = request.args.get('token')
    if token:
        return render_template('index.html', token=token,comments=comments)
    return render_template('index.html')
@main.route('/savefiles')
def savefiles():
    saved_files = SaveFile.query.all()
    return render_template('savefiles.html', saved_files=saved_files)

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

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 403

        try:
            data = jwt.decode(token, main.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data['user']
        except:
            return jsonify({'message': 'Token is invalid!'}), 403

        return f(current_user, *args, **kwargs)
    return decorated


@main.route('/user_info', methods=['GET'])
def user_info():
    SPRING_BOOT_API_URL = 'http://localhost:8080/api/user/info'

    auth_header = request.headers.get('Authorization')
    if auth_header:
        token = auth_header.split(" ")[1]
    else:
        token = None

    if not token:
        return jsonify({'message': 'Token is missing!'}), 403

    headers = {'Authorization': f'Bearer {token}'}
    try:
        response = requests.get(SPRING_BOOT_API_URL, headers=headers)
        response.raise_for_status()  # 요청이 성공했는지 확인
        user_info = response.json()
        return jsonify({
            'userId': user_info.get('userId'),
            'email': user_info.get('email'),
            'name': user_info.get('name'),
            'identificationCode': user_info.get('identificationCode')
        })
    except requests.exceptions.RequestException as e:
        return jsonify({'message': 'Failed to fetch user info', 'error': str(e)}), 500

@main.route('/api/personal/create', methods=['POST'])
def create_personal_project():
    data = request.get_json()
    projectName = data.get('projectName')
    description = data.get('description')
    projectsToken = data.get('projectsToken')  # 요청 본문에서 projectsToken 가져오기

    if not projectName or not description or not projectsToken:
        return jsonify({'message': 'Missing required data'}), 400

    # 프로젝트 생성 로직 추가
    new_project = {
        'personalProjectId': 123,  # 예시 ID
        'projectName': projectName,
        'description': description,
        'masterId': 1  # 예시 마스터 ID
    }
    #db.session.add(new_project)
    #db.session.commit()

    #return jsonify({
    #    'personalProjectId': new_project.id,  # 생성된 프로젝트의 ID
    #    'projectName': new_project.project_name,
    #    'description': new_project.description,
    #    'masterId': new_project.master_id
    #}), 200
    return jsonify(new_project), 200


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
    response = data['response']
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
    data = request.get_json()
    name = data.get('name')
    content = data.get('content')
    differences = data.get('differences')

    if not name or not content or not differences:
        return jsonify(result="Missing data"), 400

    timestamp = datetime.now()  # Save Changes 버튼을 누른 시간

    new_savefile = SaveFile(name=name, content=content, differences=differences, timestamp=timestamp)

    try:
        db.session.add(new_savefile)
        db.session.commit()
        print(f"Data saved: {new_savefile}")  # 디버그를 위한 출력
        return jsonify(result="File saved successfully.")
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")  # 디버그를 위한 출력
        return jsonify(result=f"Failed to save changes: {e}"), 500

@main.route('/review_files', methods=['POST'])
def review_files():
    data = request.get_json()
    file1_content = data.get('file1')
    file2_content = data.get('file2')

    if not file1_content or not file2_content:
        return jsonify(result="Both files are required"), 400

    # 파일 간의 차이점을 찾습니다
    diff = difflib.ndiff(file1_content.splitlines(), file2_content.splitlines())
    differences = '\n'.join(diff)

    # OpenAI API를 사용하여 차이점에 대한 코드 리뷰 및 피드백을 요청합니다
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
