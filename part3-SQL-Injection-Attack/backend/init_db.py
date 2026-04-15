import sqlite3
import os

# Defining the path to the SQLite database file
DB_PATH = os.path.join(os.path.dirname(__file__), "users.db")

# Establishing a connection to the SQLite database 
connection = sqlite3.connect(DB_PATH)

# Creating a cursor object to execute SQL commands 
cursor = connection.cursor()

# Creating the 'users' table if it does not already exist
# id = unique auto-increment primary key | username = cannot be null | password = cannot be null
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
)
""")

# Deleting all existing records from the 'users' table
cursor.execute("DELETE FROM users")

# Inserting a demo user into the 'users' table 
cursor.execute("""
INSERT INTO users (username, password)
VALUES (?, ?)
""", ("admin", "1234"))

# Saving changes to the database 
connection.commit()

# Closing the database connection 
connection.close()

print("Database initialized successfully.")
print("Demo user created: admin / 1234")