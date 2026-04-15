# Part 3: SQL Injection Demo (Flask + SQLite)

## 📌 Overview

This project demonstrates how a **SQL Injection attack** can affect a login form and how to prevent it using a **secure query approach**.

The application includes:
* A **vulnerable login flow** that builds the SQL query unsafely
* A **secure login flow** that uses **parameterized queries**
* A simple **SQLite database** with demo user credentials
* A web-based UI built with **Flask, HTML, CSS and JavaScript**

The goal of this project is to clearly show the difference between:
* an insecure implementation that is vulnerable to SQL Injection
* a secure implementation that blocks the same attack

---

## How to Run the Project

### 1. Prerequisites

Please make sure you have the following installed:

* Python 3.x
* Flask
* Git (optional)

---

### 2. Clone the Repository

> Recommended: use a dedicated workspace/folder to run the following commands.

```bash
git clone https://github.com/noanahum1/upwind-home-assignment.git
cd upwind-home-assignment\part3-SQL-Injection-Attack
```

---

### 3. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

---

### 4. Initialize the Database

```bash
python backend/init_db.py
```

This creates:

* `users.db`
* `users` table
* demo user:

```
Username: admin
Password: 1234
```

---

### 5. Run the Application

```bash
python backend/app.py
```

Expected output:

```
Running on http://127.0.0.1:5000
```

---

### 6. Open in Browser

```
http://127.0.0.1:5000
```

---

## Application Flow

1. Open the app in browser
2. Try **normal login**
3. Try **SQL injection on vulnerable form**
4. Try the same input on **secure form**
5. Compare results

---

##  How to Test

###  Normal Login

```
Username: admin
Password: 1234
```

Expected:

* Vulnerable login → success
* Secure login → success

---

###  SQL Injection Test

```
Username: ' OR '1'='1
Password: 1234
```

Expected:

* Vulnerable login → success 
* Secure login → fail

---

## ⚠️ Important Notes

* This is a **local simulation only**
* The vulnerable route is **intentionally insecure**
* Messages are shown only once (session + redirect)
* Refresh clears previous messages
* Buttons are disabled until inputs are filled
* Server also validates empty input

---

##  How It Works

### 🔴 Vulnerable Login

```python
query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
```

* User input is injected directly into SQL
* Allows attackers to manipulate the query
* Leads to SQL Injection vulnerability

---

### 🟢 Secure Login

```python
query = "SELECT * FROM users WHERE username = ? AND password = ?"
cursor.execute(query, (username, password))
```

* Uses placeholders (`?`)
* Input is passed separately
* Treated as **data**, not SQL code
* Prevents SQL Injection

---

##  Architecture

```
Frontend (HTML + CSS + JS)
        ↓
Flask Backend (app.py)
        ↓
SQLite Database (users.db)
```

---

##  Backend Flow

### Vulnerable Flow

1. User submits form
2. Flask receives POST
3. SQL query is built using string concatenation
4. Query is executed
5. Result saved in session
6. Redirect to `/`
7. Message displayed

---

### Secure Flow

1. User submits form
2. Flask receives POST
3. Parameterized query is created
4. Query executed safely
5. Result saved in session
6. Redirect to `/`
7. Message displayed

---

##  Frontend Behavior

* Two separate login forms:
  * Vulnerable (red)
  * Secure (blue)
* Buttons activate only when fields are filled
* Messages disappear when user starts typing again
* Success = green message
* Error = red message

---

##  Design Decisions

### Separate Forms

To clearly demonstrate the difference between vulnerable and secure flows.

### Session + Redirect (PRG Pattern)

Used to:
* prevent form resubmission
* show messages once
* avoid stale UI state

---

## 📂 Project Structure

```
part3-SQL-Injection-Attack/
├── backend/
│   ├── app.py
│   ├── init_db.py
│   ├── requirements.txt
│   └── users.db
├── static/
│   ├── script.js
│   └── style.css
├── templates/
│   └── index.html
└── README.md
```

---

##  Final Note

This project is a **safe educational simulation** designed to demonstrate:

* how SQL Injection works
* why unsafe queries are dangerous
* how parameterized queries prevent attacks

No real systems are harmed or targeted.

---