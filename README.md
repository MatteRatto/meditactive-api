# MeditActive API

A RESTful API for managing personal meditation and physical activity goals with monitoring intervals.

## 📋 Table of Contents

- [Overview](#-overview)
- [Technologies](#️-technologies)
- [Project Structure](#-project-structure)
- [Setup](#-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Configuration](#database-configuration)
- [Running the Application](#-running-the-application)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
  - [Users](#users)
  - [Goals](#goals)
  - [Intervals](#intervals)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)

## 🔍 Overview

MeditActive is an API that helps users manage personal wellness goals like daily meditation, physical activity, and other healthy habits. Users can create time intervals during which they follow specific goals and track their progress.

### Key Features

- User management with data validation
- Creation and monitoring of personal goals
- Definition of time intervals associated with specific goals
- Dynamic association/dissociation between intervals and goals
- Complete RESTful API with data validation
- Centralized error handling

## 🛠️ Technologies

- **Node.js**: JavaScript runtime environment
- **Express**: Web framework for Node.js
- **MySQL**: Relational database
- **mysql2**: MySQL driver for Node.js
- **dotenv**: Environment variable management
- **express-validator**: Input data validation
- **cors**: Cross-Origin Resource Sharing handling
- **helmet**: HTTP header security
- **body-parser**: Request body parsing
- **Mocha/Chai/Sinon**: Testing framework

## 📂 Project Structure

```
meditactive-api/
│
├── config/
│   └── database.js         # Database connection configuration
│
├── controllers/
│   ├── goalController.js   # Goal management controller
│   ├── intervalController.js # Interval management controller
│   └── UserController.js   # User management controller
│
├── middleware/
│   ├── errorHandler.js     # Centralized error handling middleware
│   ├── validator.js        # Data validation middleware
│   └── responseFormatter.js # API response formatting utility
│
├── models/
│   ├── Goal.js             # Goal model
│   ├── Interval.js         # Interval model
│   ├── IntervalGoal.js     # Interval-Goal association model
│   └── User.js             # User model
│
├── routes/
│   ├── goalRoutes.js       # Goal route definitions
│   ├── intervalRoutes.js   # Interval route definitions
│   └── userRoutes.js       # User route definitions
│
├── test/
│   ├── goalController.test.js
│   ├── intervalController.test.js
│   └── userController.test.js
│
├── utils/
│   └── responseFormatter.js # Utility for formatting API responses
│
├── .env.example            # Template for .env file
├── .gitignore              # Files and folders to ignore for git
├── migrations.sql          # SQL script for database creation
├── package.json            # Dependencies and npm scripts
├── server.js               # Application entry point
└── README.md               # Project documentation
```

## 🔧 Setup

### Prerequisites

- Node.js (version 14.x or higher)
- npm (version 6.x or higher)
- MySQL (version 5.7 or higher)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/meditactive-api.git
cd meditactive-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on the `.env.example` template:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration parameters:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=meditactive
```

### Database Configuration

Create the database and tables by running the SQL script:

```bash
mysql -u root -p < migrations.sql
```

Alternatively, you can import the `migrations.sql` file using a MySQL client like MySQL Workbench or phpMyAdmin.

## 🚀 Running the Application

To start the application in development mode:

```bash
npm run dev
```

To start the application in production mode:

```bash
npm start
```

The API will be available at `http://localhost:3000` (or the port specified in your `.env` file).

## 🧪 Testing

The project includes unit tests for all controllers using Mocha, Chai, and Sinon.

To run the tests:

```bash
npm test
```

To run a specific test file:

```bash
npx mocha test/goalController.test.js
```

## 📡 API Documentation

### Users

| Method | Endpoint       | Description             |
| ------ | -------------- | ----------------------- |
| GET    | /api/users     | Get all users           |
| GET    | /api/users/:id | Get a specific user     |
| POST   | /api/users     | Create a new user       |
| PUT    | /api/users/:id | Update an existing user |
| DELETE | /api/users/:id | Delete a user           |

#### Example User Object

```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2023-09-01T10:20:30Z",
  "updatedAt": "2023-09-01T10:20:30Z"
}
```

### Goals

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| GET    | /api/goals                      | Get all goals             |
| GET    | /api/goals/:id                  | Get a specific goal       |
| GET    | /api/goals/interval/:intervalId | Get goals for an interval |
| POST   | /api/goals                      | Create a new goal         |
| PUT    | /api/goals/:id                  | Update an existing goal   |
| DELETE | /api/goals/:id                  | Delete a goal             |

#### Example Goal Object

```json
{
  "id": 1,
  "name": "Daily Meditation",
  "description": "Practice 15 minutes of meditation every day",
  "createdAt": "2023-09-01T10:20:30Z",
  "updatedAt": "2023-09-01T10:20:30Z"
}
```

### Intervals

| Method | Endpoint                         | Description                             |
| ------ | -------------------------------- | --------------------------------------- |
| GET    | /api/intervals                   | Get all intervals with optional filters |
| GET    | /api/intervals/:id               | Get a specific interval                 |
| GET    | /api/intervals/user/:userId      | Get intervals for a user                |
| GET    | /api/intervals/:id/goals         | Get all goals for an interval           |
| POST   | /api/intervals                   | Create a new interval                   |
| PUT    | /api/intervals/:id               | Update an existing interval             |
| DELETE | /api/intervals/:id               | Delete an interval                      |
| POST   | /api/intervals/:id/goals         | Associate a goal with an interval       |
| DELETE | /api/intervals/:id/goals/:goalId | Dissociate a goal from an interval      |

#### Example Interval Object

```json
{
  "id": 1,
  "startDate": "2023-09-01",
  "endDate": "2023-09-30",
  "userId": 1,
  "createdAt": "2023-09-01T10:20:30Z",
  "updatedAt": "2023-09-01T10:20:30Z",
  "goals": [
    {
      "id": 1,
      "name": "Daily Meditation"
    },
    {
      "id": 2,
      "name": "Physical Activity"
    }
  ]
}
```

## 📊 Database Schema

### `users` Table

- `id`: INT (Primary key, auto-increment)
- `email`: VARCHAR(255) (Unique)
- `firstName`: VARCHAR(50)
- `lastName`: VARCHAR(50)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

### `goals` Table

- `id`: INT (Primary key, auto-increment)
- `name`: VARCHAR(100)
- `description`: TEXT
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

### `intervals` Table

- `id`: INT (Primary key, auto-increment)
- `startDate`: DATE
- `endDate`: DATE
- `userId`: INT (Foreign key → users.id)
- `createdAt`: TIMESTAMP
- `updatedAt`: TIMESTAMP

### `interval_goals` Table

- `id`: INT (Primary key, auto-increment)
- `intervalId`: INT (Foreign key → intervals.id)
- `goalId`: INT (Foreign key → goals.id)
- `createdAt`: TIMESTAMP

## 🤝 Contributing

1. Fork the repository
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

---

Created by [Matteo Ratto]
