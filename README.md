# Proxication - Django REST Framework Backend

A Django REST Framework backend with PostgreSQL database support.

## Prerequisites

- Python 3.8 or higher
- PostgreSQL 12 or higher
- pip (Python package manager)

## Setup Instructions

### 1. Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up PostgreSQL Database

Create a PostgreSQL database:

```bash
createdb proxication_db
```

Or using psql:

```sql
CREATE DATABASE proxication_db;
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=proxication_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

**Important**: Generate a secure secret key for production. You can use:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Create a Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 7. Run the Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

- Health Check: `GET /api/health/`
- Admin Panel: `http://localhost:8000/admin/`

## Project Structure

```
proxication/
├── config/          # Django project settings
│   ├── settings.py  # Main settings file
│   ├── urls.py      # Root URL configuration
│   ├── wsgi.py      # WSGI configuration
│   └── asgi.py      # ASGI configuration
├── api/             # Main API app
│   ├── models.py    # Database models
│   ├── serializers.py  # DRF serializers
│   ├── views.py     # API views
│   └── urls.py      # API URL routes
├── manage.py        # Django management script
├── requirements.txt # Python dependencies
└── README.md        # This file
```

## Development

### Creating a New App

```bash
python manage.py startapp app_name
```

### Creating Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Running Tests

```bash
python manage.py test
```

## Production Deployment

Before deploying to production:

1. Set `DEBUG=False` in your `.env` file
2. Set a secure `SECRET_KEY`
3. Configure proper `ALLOWED_HOSTS`
4. Set up proper database credentials
5. Configure static files serving
6. Set up proper CORS origins
7. Use environment variables for all sensitive data

