import os
from dotenv import load_dotenv

load_dotenv()

def get_database_url():
    """
    Get database URL from environment variables.
    Supports both Railway's DATABASE_URL and individual components.
    """
    # Check if DATABASE_URL is provided (Railway standard)
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        # Railway uses postgres://, but SQLAlchemy requires postgresql://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        return database_url

    # Fall back to individual components
    username = os.getenv('POSTGRESQL_USERNAME', 'filip')
    password = os.getenv('POSTGRESQL_PASSWORD', '1234')
    server = os.getenv('POSTGRESQL_SERVER', 'localhost')
    port = os.getenv('POSTGRESQL_PORT', '5432')
    database = os.getenv('POSTGRESQL_DATABASE', 'downstream')

    return f'postgresql://{username}:{password}@{server}:{port}/{database}'
