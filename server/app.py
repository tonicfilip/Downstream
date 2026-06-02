from flask import Flask
from flask_cors import CORS
from sqlalchemy.orm import sessionmaker
from models.case import engine
from router.router import router_blueprint
import os

app = Flask(__name__)

# Configure CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
CORS(app, resources={r"/case/*": {"origins": cors_origins}})

# Database session setup
SessionLocal = sessionmaker(bind=engine)

# Middleware to inject session into request context
@app.before_request
def setup_db_session():
    from flask import g
    g.db = SessionLocal()

@app.teardown_appcontext
def teardown_db_session(exception):
    from flask import g
    if hasattr(g, 'db'):
        g.db.close()

app.register_blueprint(router_blueprint, url_prefix="/")

if __name__ == "__main__":
    # 1. Determine if we are in local development
    is_local = os.getenv('ENVIRONMENT', 'local') == 'local'
    
    # 2. Grab Railway's dynamic PORT variable, fallback to 5000 locally
    port = int(os.getenv('PORT', 5000))
    
    # 3. Bind to 0.0.0.0 so the public internet can route to the container
    app.run(host='0.0.0.0', port=port, debug=is_local)