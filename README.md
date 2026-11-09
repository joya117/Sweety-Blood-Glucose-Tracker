# 🩸 Sweety – Blood Glucose Tracker

A full-stack web application built to help users record, manage, and monitor their daily blood glucose levels through a simple and intuitive dashboard.

Sweety allows users to securely manage glucose readings, track daily measurements, and generate reports to understand their glucose trends over different time periods.

## ✨ Features

### 🔐 Authentication & Security

- User registration and login.
- Password hashing using bcrypt.
- JWT-based authentication.
- Protected API routes.
- Users can access only their own glucose readings.

### 📊 Glucose Reading Management

- Add, view, update, and delete glucose readings.
- Four daily time slots:
  - Morning fasting
  - After breakfast
  - After lunch
  - After dinner
- Input validation:
  - Glucose values must be between 40 and 600 mg/dL.
  - Only whole-number values are accepted.
  - One reading per time slot per day.
  - Future dates are not allowed.

### 📈 Reports & Dashboard

- Total number of readings.
- Today's reading count.
- Highest and lowest glucose readings.
- Daily glucose report.
- Month-to-date report.
- Previous full-month report.
- Average glucose calculation rounded to one decimal place.
- Empty-state handling when no readings are available.

## 🛠️ Technology Stack

| Category          | Technologies                    |
| ----------------- | ------------------------------- |
| Frontend          | React.js, JavaScript, HTML, CSS |
| Backend           | Node.js, Express.js             |
| Database          | PostgreSQL                      |
| Authentication    | JWT, bcrypt                     |
| API Communication | Axios, REST APIs                |
| Development Tools | VS Code, npm, Git, GitHub       |

## 📁 Project Structure

```text
Assignment/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── readingController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── readingRoutes.js
│   ├── .env.example
│   ├── seed.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Auth.jsx
│   │   ├── api.js
│   │   └── App.css
│   └── package.json
│
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Assignment
```

### 2. Database Setup

Make sure PostgreSQL is installed and running.

Create the database:

```sql
CREATE DATABASE sweety_db;
```

Create the required `users` and `readings` tables using the database schema provided in the project.

Configure your PostgreSQL username and password in the backend environment file.

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Configure the following variables:

```env
PORT=5001
DB_USER=your_postgres_username
DB_HOST=localhost
DB_NAME=sweety_db
DB_PASSWORD=your_postgres_password
DB_PORT=5432
JWT_SECRET=your_secure_secret
```

Start the backend server:

```bash
node server.js
```

Backend runs at:

`http://localhost:5001`

### 4. Seed Demo Data

From the backend directory, run:

```bash
node seed.js
```

This creates a demo account and sample glucose readings.

### 5. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

`http://localhost:5173`

## 🔑 Demo Login Credentials

| Field    | Value           |
| -------- | --------------- |
| Email    | demo@sweety.com |
| Password | DemoPass123     |

Run the seed script before using the demo account.

## 🔗 API Endpoints

All protected reading endpoints require a valid JWT Bearer token.

### Authentication

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| POST   | `/api/auth/signup` | Register a new user |
| POST   | `/api/auth/login`  | Authenticate a user |

### Glucose Readings

| Method | Endpoint            | Description         |
| ------ | ------------------- | ------------------- |
| POST   | `/api/readings`     | Add a reading       |
| GET    | `/api/readings`     | Get user's readings |
| PUT    | `/api/readings/:id` | Update a reading    |
| DELETE | `/api/readings/:id` | Delete a reading    |

### Reports

| Method | Endpoint                                               | Description                |
| ------ | ------------------------------------------------------ | -------------------------- |
| GET    | `/api/readings/reports/daily?date=YYYY-MM-DD`          | Daily report               |
| GET    | `/api/readings/reports/month-to-date?date=YYYY-MM-DD`  | Month-to-date report       |
| GET    | `/api/readings/reports/previous-month?date=YYYY-MM-DD` | Previous full-month report |

## 🧠 Key Implementation Details

- Used bcrypt to securely hash user passwords.
- Implemented JWT authentication middleware to protect private routes.
- Used PostgreSQL foreign keys and unique constraints to maintain data integrity.
- Used parameterized SQL queries to reduce SQL injection risks.
- Implemented server-side validation for glucose readings.
- Calculated report statistics dynamically from stored readings.
- Used React state and Axios to manage frontend data and API communication.

## 🚀 Future Improvements

- Interactive glucose trend charts.
- Pagination for large reading histories.
- Doctor and patient roles.
- Automated reminders for glucose measurements.
- Exportable PDF reports.

## 👩‍💻 Author

**Joya**

B.E. Computer Engineering Student

Interested in Full-Stack Development, JavaScript, React.js, and building practical web applications.
