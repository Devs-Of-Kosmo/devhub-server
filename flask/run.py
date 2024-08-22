from website import create_app
from flask_migrate import Migrate

app = create_app()
migrate = Migrate(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)