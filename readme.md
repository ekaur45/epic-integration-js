# EMR Integration API

## Overview
This project is a **Node.js & Express.js** application designed to integrate with different **Electronic Medical Records (EMRs)** systems. It utilizes **TypeORM** for database management and follows best practices for error handling and logging.

---

## Features
- 🌍 **RESTful API** for EMR integration
- 🗄 **Supports multiple databases** (MySQL, MongoDB, etc.) using TypeORM
- 📂 **Modular structure** for scalability and maintainability
- 📜 **Robust error handling** using middleware
- 📊 **Integrated logging** with a logger utility

---

## Installation

### **1️⃣ Prerequisites**
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A database (MySQL or MongoDB)

### **2️⃣ Clone the Repository**
```sh
git clone https://github.com/your-repo/emr-integration.git
cd emr-integration
```

### **3️⃣ Install Dependencies**
```sh
npm install
```

### **4️⃣ Configure Environment Variables**
Create a `.env` file in the root directory and configure the following variables:
```env
PORT=3000
EPIC_BASE_URL=
EPIC_TOKEN_URL=
EPIC_KID=
EPIC_JKU=
EPIC_CLIENT_ID=
DB_TYPE=
MONGO_HOST=
MONGO_PORT=
MONGO_DATABASE=

MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=
```

---

## Usage

### **Start the Server**
```sh
npm start
```

### **API Endpoints**
| Method | Endpoint                                 | Description              |
|--------|------------------------------------------|--------------------------|
| POST   | `/api/epic/get-patient-appointments`     | Get patient appointments |

---

## Project Structure
```
📦 emr-integration
├── 📂 src
│   ├── 📂 controllers    # API controllers
│   ├── 📂 routes         # Express routes
│   ├── 📂 services       # Business logic
│   ├── 📂 utils          # Utility functions (logger, config, etc.)
│   ├── 📂 models         # Database models (TypeORM entities)
│   ├── 📂 middlewares    # Custom middleware (error handling, etc.)
├── 📜 app.js             # Main Express application
├── 📜 package.json       # Dependencies and scripts
├── 📜 .env               # Environment variables
├── 📜 README.md          # Project documentation
```

---

## Error Handling
Errors are handled centrally using middleware in `app.js`:
```js
app.use((err, req, res, next) => {
    logger.error(err.message, err);
    res.InternalServerError({ message: err.message, stack: err.stack });
});
```

---

## Logging
This project uses a logger utility (`logger.js`) for structured logging.

```js
logger.info("Server started successfully");
logger.error("Database connection failed", error);
```

---

## Contributing
1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m 'Add new feature'`.
4. Push to your branch: `git push origin feature-name`.
5. Open a Pull Request.

---

## License
This project is licensed under the [MIT License](LICENSE).

