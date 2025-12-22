# Proxication

Django backend + React frontend with Mapbox.

## Setup

1. Create `.env` in root:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=proxication_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
VITE_MAPBOX_TOKEN=your_mapbox_token
```

2. Install dependencies:

```bash
npm run install:backend
npm run install:frontend
npm install
```

3. Setup database:

```bash
createdb proxication_db
npm run migrate
```

## Run

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
