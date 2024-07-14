from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    role_type = db.Column(db.String(50), nullable=False, default='USER')
    delete_condition = db.Column(db.String(50), nullable=False, default='N')

    def to_entity(self):
        return {
            'email': self.email,
            'password': self.password,
            'name': self.username,
            'roleType': self.role_type,
            'deleteCondition': self.delete_condition,
        }

class Comment(db.Model):
    __tablename__ = 'comment'
    id = db.Column(db.Integer, primary_key=True)
    page = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    user_comment = db.Column(db.Text, nullable=False)
    admin_response = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Comment {self.id} - {self.username}>'

class SaveFile(db.Model):
    __tablename__ = 'save_file'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    differences = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<SaveFile {self.id} - {self.name}>'
