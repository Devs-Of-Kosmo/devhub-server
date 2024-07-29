from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from website.model import db, User, SaveFile
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

def create_app():
    app = Flask(__name__)

    load_dotenv()

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS') == 'True'
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')


    db.init_app(app)
    migrate = Migrate(app, db)
    login_manager = LoginManager()
    login_manager.login_view = 'main.login'
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))


    CORS(app)

    from website.main.routes import main
    app.register_blueprint(main)

    with app.app_context():
        db.create_all()

    return app
