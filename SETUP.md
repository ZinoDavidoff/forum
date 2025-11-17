# Quick Start Guide

## Setting Up PostgreSQL Database

### Windows Installation

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember your postgres password
4. Open pgAdmin 4 or use psql command line

### Create Database

Using pgAdmin:
1. Right-click on "Databases"
2. Select "Create" > "Database"
3. Name it "mommy_forum"
4. Click "Save"

Using psql command line:
```cmd
psql -U postgres
CREATE DATABASE mommy_forum;
\q
```

## Backend Setup

1. Open terminal in backend folder:
```cmd
cd backend
```

2. Install dependencies:
```cmd
npm install
```

3. Copy environment file:
```cmd
copy .env.example .env
```

4. Edit .env file with your settings:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_DATABASE=mommy_forum
JWT_SECRET=change-this-to-a-random-secret-key
PORT=3000
```

5. Start the server:
```cmd
npm run start:dev
```

You should see: `🚀 Server is running on: http://localhost:3000/api`

## Frontend Setup

1. Open a NEW terminal in frontend folder:
```cmd
cd frontend
```

2. Install dependencies:
```cmd
npm install
```

3. Start the development server:
```cmd
npm start
```

The app will open at: `http://localhost:4200`

## First Time Use

1. Navigate to http://localhost:4200
2. Click "Join Us" to create an account
3. Fill in your details
4. You're ready to start using the forum!

## Creating Sample Data

To add sample categories, you can use a tool like Postman or the included seed script:

### Sample Categories (POST to http://localhost:3000/api/categories)
```json
{
  "name": "Pregnancy Journey",
  "slug": "pregnancy-journey",
  "description": "Share your pregnancy experiences",
  "icon": "🤰",
  "color": "#FFB6C1"
}
```

```json
{
  "name": "Newborn Care",
  "slug": "newborn-care",
  "description": "Tips for caring for your newborn",
  "icon": "👶",
  "color": "#B0D4F1"
}
```

```json
{
  "name": "Health & Wellness",
  "slug": "health-wellness",
  "description": "Health topics for mom and baby",
  "icon": "💊",
  "color": "#C7EFCF"
}
```

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in .env
- Ensure port 3000 is not in use

### Frontend won't start
- Delete node_modules and run `npm install` again
- Clear npm cache: `npm cache clean --force`
- Ensure port 4200 is not in use

### Can't connect to database
- Verify PostgreSQL service is running
- Check Windows Services for PostgreSQL
- Test connection with pgAdmin

## Next Steps

1. Customize the theme colors in `frontend/src/styles.css`
2. Add more categories
3. Create your first discussion thread
4. Invite users to join!

Happy coding! 👶💖
