# Angel Project


## Project Structure

```
angel/
├── frontend/          # React + Vite frontend application
├── backend/          # Laravel (PHP) backend API
└── django/           # Django service for overdue tasks
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) and **npm** or **yarn**
- **PHP** (v8.2 or higher)
- **Composer** (PHP package manager)
- **Python** (v3.8 or higher)
- **MySQL**  (for database)
- **Git**

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd angel
```

### 2. Backend Setup (Laravel)

Navigate to the backend directory:

```bash
cd backend
```

#### Install PHP Dependencies

```bash
composer install
```

#### Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` file and configure your database settings:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backend
DB_USERNAME=root
DB_PASSWORD=your_password
```

#### Generate Application Key

```bash
php artisan key:generate
```

#### Run Database Migrations

```bash
php artisan migrate
```

#### Install Frontend Assets (for Laravel)

```bash
npm install
```

### 3. Frontend Setup (React)

Navigate to the frontend directory:

```bash
cd ../frontend
```

#### Install Dependencies

```bash
npm install
```

### 4. Django Service Setup

Navigate to the django directory:

```bash
cd ../django
```

#### Create Virtual Environment (Recommended)

```bash
python -m venv venv
```

#### Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### Run Database Migrations

```bash
cd overdue_service
python manage.py migrate
```

## Running the Application

### Option 1: Run All Services Separately

#### Start Laravel Backend

```bash
cd backend
php artisan serve
```

The backend will be available at `http://localhost:8000`

#### Start Laravel Queue Worker (in a separate terminal)

```bash
cd backend
php artisan queue:listen
```

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### Start Django Service (in a separate terminal)

```bash
cd django/overdue_service
python manage.py runserver
```

The Django service will be available at `http://localhost:8001` (or default Django port)

### Option 2: Run Backend with Concurrent Script (Laravel + Queue + Vite)

From the backend directory:

```bash
cd backend
composer run dev
```

This will start:
- Laravel server
- Queue worker
- Vite dev server

### Option 3: Quick Setup Script

For initial setup, you can use the Laravel setup script:

```bash
cd backend
composer run setup
```

This will:
- Install Composer dependencies
- Copy `.env.example` to `.env`
- Generate application key
- Run migrations
- Install npm dependencies
- Build assets

## Default Ports

- **Frontend (React)**: `http://localhost:5173`
- **Backend (Laravel)**: `http://localhost:8000`
- **Django Service**: `http://localhost:8001` (or default Django port)

## API Endpoints

- API Base URL: `http://localhost:8000/api`

## Database Configuration

### Laravel Backend

The backend uses MySQL by default. Make sure MySQL is running and create a database named `backend` (or update the `.env` file with your preferred database name).

### Django Service

The Django service uses SQLite by default (configured in `settings.py`). The database file will be created automatically at `django/overdue_service/db.sqlite3` when you run migrations.

## Troubleshooting

### Common Issues

1. **Composer dependencies not installing**
   - Ensure PHP version is 8.2 or higher
   - Check if Composer is properly installed

2. **Database connection errors**
   - Verify MySQL is running
   - Check database credentials in `.env` file
   - Ensure the database exists

3. **Port already in use**
   - Change the port in the respective configuration files
   - Or stop the service using that port

4. **Python dependencies issues**
   - Ensure you're using Python 3.8 or higher
   - Use a virtual environment to avoid conflicts

5. **Frontend not connecting to backend**
   - Check CORS configuration in Laravel
   - Verify backend API URL in frontend configuration

## Development Notes

- The Laravel backend uses Sanctum for authentication
- The frontend uses Axios for API calls
- Queue jobs are processed by Laravel's queue worker
- Django service handles overdue task notifications

## Additional Commands

### Laravel Backend

```bash
# Clear cache
php artisan cache:clear
php artisan config:clear

# Run tests
composer run test

# Build assets
npm run build
```

### Django Service

```bash
# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic
```

### Frontend

```bash
# Build for production
npm run build


