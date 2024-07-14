import os
import zipfile
import tempfile
import difflib
import re
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from flask import render_template, request, redirect, url_for, flash, jsonify, Blueprint
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from website.model import db, User, Comment, SaveFile
from website.decorators import admin_required
from markupsafe import Markup
from datetime import datetime

main = Blueprint('main', __name__)
UPLOAD_FOLDER = tempfile.mkdtemp()

@main.route('/')
def index():
    comments = Comment.query.filter_by(page='home').all()
    return render_template('index.html', comments=comments)

@main.route('/savefiles')
def savefiles():
    saved_files = SaveFile.query.all()
    return render_template('savefiles.html', saved_files=saved_files)

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
@main.route('/login', methods=['GET'])
def login_page():
    return render_template('login.html')
@main.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        return jsonify(access_token=access_token, refresh_token=refresh_token), 200
    else:
        return jsonify({"msg": "Invalid username or password"}), 401


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

@main.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.', 'success')
    return redirect(url_for('main.index'))

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


