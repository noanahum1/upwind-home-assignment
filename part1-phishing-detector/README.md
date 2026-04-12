# Part 1 – Phishing Email Detector

A simple web-based phishing detector built with **HTML, CSS, and JavaScript**.

This tool allows the user to enter:
- a sender email address
- an email subject
- an email body

The system analyzes the content and checks whether the email may be a phishing attempt.

---

## Live Demo

[Open Part 1 - Phishing Email Detector](https://noanahum1.github.io/upwind-home-assignment/part1-phishing-detector/)

---

## Project Goal

The goal of this part is to detect common phishing indicators in an email.

The detector focuses on:
- suspicious links
- spoofed sender addresses
- urgent or pressuring language

In addition, the system also checks for:
- requests for sensitive information
- threatening language
- promotional wording that may look suspicious but is not always phishing

---

## Technologies Used

- HTML
- CSS
- JavaScript

---

## Project Files

```text
part1-phishing-detector/
├── index.html
├── style.css
├── script.js
└── README.md

How the UI Works

The user fills in the following fields:

Sender Email Address
Email Subject
Email Body

When the user clicks the Analyze Email button, the JavaScript function analyzeEmail() runs and starts the detection process.

The result section then shows:

the final risk level
the list of detected indicators

Main Variables in the Code
senderEmail

Stores the sender email address entered by the user.

subject

Stores the email subject entered by the user.

body

Stores the email body entered by the user.

fullText

A combined lowercase version of the email subject and body.

normalizedFullText

A cleaned version of the text after normalization.

This helps the system detect manipulated words such as:

p@ssw0rd
ver1fy
urgenttt
words

An array of normalized words taken from the email content.

indicators

An array that stores all suspicious findings detected during the scan.

score

A numeric risk score used to decide the final result.
