import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import openai

# DB 인스턴스 생성 (필요한 경우)
db = SQLAlchemy()

def create_app():
    # 환경 변수 로드
    load_dotenv()

    # OpenAI API 키 설정
    openai.api_key = os.getenv('OPENAI_API_KEY')

    app = Flask(__name__)

    # Flask 설정 로드 (예: 데이터베이스 URI, 시크릿 키 등)
    app.config.from_object('website.config.Config')

    # 데이터베이스 초기화
    db.init_app(app)

    # 블루프린트 등록
    from website.main.routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app
