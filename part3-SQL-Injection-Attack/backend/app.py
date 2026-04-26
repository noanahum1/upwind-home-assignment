import sqlite3
import os
from flask import Flask, render_template, request, redirect, url_for, session

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

# Secret key is required for using session
app.secret_key = "simple-demo-secret-key"

def connect_db():
    # Create a connection to the SQLite database
    return sqlite3.connect(DB_PATH)

@app.route("/")
def index():
    # Read messages from session and remove them immediately
    vulnerable_message = session.pop("vulnerable_message", "")
    vulnerable_status = session.pop("vulnerable_status", "")
    secure_message = session.pop("secure_message", "")
    secure_status = session.pop("secure_status", "")

    return render_template(
        "index.html",
        vulnerable_message=vulnerable_message,
        vulnerable_status=vulnerable_status,
        secure_message=secure_message,
        secure_status=secure_status
    )

@app.route("/vulnerable-login", methods=["POST"])
def vulnerable_login():
    # Get values from the vulnerable form
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "").strip()

    # Server-side validation
    if username == "" or password == "":
        session["vulnerable_message"] = "Please enter both username and password."
        session["vulnerable_status"] = "error"
        return redirect(url_for("index"))

    connection = connect_db() # Establish a connection to the database
    cursor = connection.cursor() # Create a cursor object to execute SQL commands

    # Vulnerable query: user input is directly inserted into the SQL string
    query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
    print("VULNERABLE QUERY:", query)

    try:
        cursor.execute(query) # Execute the full SQL query (including raw user input)
        user = cursor.fetchone() # Get the first matching user from the database

        if user:
            message = "Vulnerable login succeeded."
            status = "success"
        else:
            message = "Vulnerable login failed."
            status = "error"

    except Exception as error:
        message = f"SQL error: {error}"
        status = "error"

    connection.close()

    # Save message temporarily in session, then redirect
    session["vulnerable_message"] = message
    session["vulnerable_status"] = status

    return redirect(url_for("index"))

@app.route("/secure-login", methods=["POST"])
def secure_login():
    # Get values from the secure form
    username = request.form.get("username", "").strip()
    password = request.form.get("password", "").strip()

    # Server-side validation
    if username == "" or password == "":
        session["secure_message"] = "Please enter both username and password."
        session["secure_status"] = "error"
        return redirect(url_for("index"))

    connection = connect_db() # Establish a connection to the database
    cursor = connection.cursor() # Create a cursor object to execute SQL commands

    # Secure query: uses placeholders instead of inserting user input directly
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    print("SECURE QUERY:", query)
    print("PARAMETERS:", username, password)

    try:
        cursor.execute(query, (username, password)) # Execute query and bind user input to placeholders 
        user = cursor.fetchone() # Get the first matching user from the database

        if user:
            message = "Secure login succeeded."
            status = "success"
        else:
            message = "Secure login failed."
            status = "error"

    except Exception as error:
        message = f"SQL error: {error}"
        status = "error"

    connection.close()

    # Save message temporarily in session, then redirect
    session["secure_message"] = message
    session["secure_status"] = status

    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True, port=5000)