class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:admin1234@localhost/flask_comments'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'your_secret_key'
    JWT_SECRET_KEY = 'c2lsdmVybmluZS10ZWNoLXNwcmluZy1ib290LWp3dC10dXRvcmlhbC1zZWNyZXQtc2lsdmVybmluZS10ZWNoLXNwcmluZy1ib290LWp3dC10dXRvcmlhbC1zZWNyZXQK'
    JWT_ACCESS_TOKEN_EXPIRES = 86400
    JWT_REFRESH_TOKEN_EXPIRES = 604800