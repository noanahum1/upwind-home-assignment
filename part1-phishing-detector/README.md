# Part 1: Email Phishing Detector 

## 📌 Overview
This project is a client-side web application designed to act as an **Email Phishing Detector**. It analyzes email content (Sender, Subject and Body) to identify common phishing indicators and malicious patterns. 

This project fulfills the core requirements of Part 1, alongside the **Bonus Requirement** of implementing a fully functional and responsive User Interface (UI).

The detector focuses on:
- suspicious links
- spoofed sender addresses
- urgent or pressuring language

In addition, the system also checks for:
- requests for sensitive information
- threatening language
- promotional wording that may look suspicious but is not always phishing

## How to Run the Project
<a href="https://noanahum1.github.io/upwind-home-assignment/part1-phishing-detector/" target="_blank">**Click here to run the live application**</a>

---

## How It Works
The application follows a structured pipeline to analyze the email and assign a risk score:

1. **Input Collection & Validation:** The script retrieves the Sender Email, Subject, and Body from the DOM. It verifies that at least some content exists before proceeding.
2. **Text Normalization (Evasion Bypass):** Attackers often use "leetspeak" (e.g., `p@ssw0rd`, `urgen7`) or repetitive characters to bypass simple keyword filters. The `normalizeText` and `normalizeWord` functions clean the input by translating specific symbols back to letters and removing duplicate consecutive characters.
3. **Fuzzy Keyword Matching (Levenshtein Distance):** The combined text is scanned against predefined threat categories (Urgency, Promotional, Sensitive Info, Threats). Instead of relying solely on exact matches, the script uses the **Levenshtein Distance** algorithm. This allows the system to detect words even if they contain typos (e.g., matching "urgnt" to "urgent").
4. **Link Inspection:** Using Regular Expressions (Regex), the script extracts all URLs from the text. It flags URLs that use direct IP addresses (e.g., `http://192.168.1.1`) or contain obfuscated characters (like `%`, `@`, or `--`), which are classic phishing tactics.
5. **Sender Domain Anti-Spoofing:** The script extracts the domain from the sender's email address and compares it to a hardcoded whitelist of `legitimateDomains` (including major global tech companies and local Israeli institutions). Using Levenshtein distance, it flags domains that look suspiciously similar to real ones (e.g., `g00gle.com` instead of `google.com`).
6. **Scoring & Verdict Presentation:** Each detected threat adds specific weights to a cumulative `score`. The UI is then updated dynamically with a visual verdict (Safe, Low Risk, Medium Risk, High Risk) and a detailed bulleted list of all triggered indicators.

---

## Key Variables & Data Structures

* **`score` (Integer):** The core metric of the application. Starts at 0. 
  * `Urgency/Threats`: +2 or +3 points.
  * `Sensitive Info/IP Links`: +4 points.
  * `Spoofed Domain`: +4 points.
  * *Thresholds:* `< 1` (Safe), `1-3` (Low Risk), `4-6` (Medium Risk), `7+` (High Risk).
* **`indicators` (Array):** An array of strings that accumulates human-readable descriptions of every threat found during the analysis. This array is mapped to the DOM at the end of the run.
* **The Threat Dictionaries (Arrays):**
  * `urgentWords`: Phrases meant to induce panic (e.g., "action required", "account locked").
  * `promotionalWords`: Spam/Marketing phrases (e.g., "free gift"). Used to distinguish benign spam from malicious phishing.
  * `sensitiveInfoWords`: Targets of credential harvesting (e.g., "password", "ssn", "cvv").
  * `threateningWords`: Coercive language (e.g., "legal action", "suspended immediately").
* **`legitimateDomains` (Array):** A baseline array of trusted domains used for the spoofing comparison engine.

---

## Test Cases
You can copy and paste the following examples into the live demo to observe the system's behavior:

### Test 1: The "High Risk" Spoofing Attack
* **Sender:** `security@g00gle.com`
* **Subject:** `URGENT: Your account has been compromised`
* **Body:** `Please verify your password immediately to prevent your account from being locked. Click here: http://192.168.1.45/login`
* **Expected Result:** **High Risk (Red)**
  * *Why:* The system will catch the spoofed `g00gle.com` domain, identify the urgent language, detect the request for a "password", and flag the IP-based URL.

### Test 2: The "Medium Risk" Attempt
* **Sender:** `admin@unknown-server.com`
* **Subject:** `Update your b1lling inf0rmation`
* **Body:** `We need your c.r.e.d.i.t c.a.r.d details to process the payment.`
* **Expected Result:** **Medium / High Risk (Red)**
  * *Why:* The `normalizeWord` function will translate `b1lling inf0rmation` and strip the punctuation from `c.r.e.d.i.t c.a.r.d`, successfully triggering the Sensitive Information alerts despite the obfuscation attempt.

### Test 3: The "Safe" Promotional Spam
* **Sender:** `newsletter@ksp.co.il`
* **Subject:** `Exclusive offer just for you!`
* **Body:** `Congratulations! You have won a free gift. Don't miss out on this deal.`
* **Expected Result:** **Safe / Promotional (Green)**
  * *Why:* The script will identify the promotional words, but because the sender domain is legitimate (`ksp.co.il`), there are no suspicious links, and no sensitive data is requested, it classifies it as benign promotional material rather than a threat.

  ---

##  Function Reference & Architecture

The application is built using a modular, functional approach. Functions are strictly divided into distinct responsibilities: orchestration, text processing, mathematical evaluation (Levenshtein) and specific threat detection. 

Below is a map of the script's functions, their inputs/outputs and their dependencies.

### 1. Main Orchestration
* **`analyzeEmail()`**
  * **Description:** The core entry point triggered by the "Analyze" button. It gathers user input from the DOM, orchestrates the analysis pipeline by calling various helper functions, calculates the final score, and updates the UI.
  * **Takes:** None (Reads directly from DOM elements).
  * **Returns:** None (Updates the DOM).
  * **Calls:** `normalizeText`, `getNormalizedWords`, `detectPhraseCategory`, `addCategoryIndicators`, `checkLinks`, `checkSenderEmail`, `addListToIndicators`, `renderVerdict`.

* **`renderVerdict(verdictText, indicatorsList, indicators, score, ...)`**
  * **Description:** Evaluates the final accumulated score and category findings to determine the final risk level (Safe, Low, Medium, High). It handles special cases (e.g., purely promotional emails) and renders the results to the screen.
  * **Takes:** DOM objects, Array of indicator strings, Integer (`score`), and Arrays of found matches per category.
  * **Returns:** None (Modifies the DOM).
  * **Calls:** Native DOM methods only.

### 2. Text Normalization & Processing
* **`normalizeText(text)`**
  * **Description:** Cleans a full sentence, removes invalid punctuation, and reconstructs it using normalized words.
  * **Takes:** String (`text`).
  * **Returns:** String (The fully normalized sentence).
  * **Calls:** `normalizeWord`.

* **`getNormalizedWords(text)`**
  * **Description:** Splits a string into an array of individual, cleaned words after normalization.
  * **Takes:** String (`text`).
  * **Returns:** Array of Strings.
  * **Calls:** `normalizeWord`.

* **`normalizeWord(word)`**
  * **Description:** Translates "leetspeak" (e.g., `@` to `a`, `0` to `o`), removes non-alphanumeric characters, and collapses duplicate consecutive letters to catch evasion attempts.
  * **Takes:** String (`word`).
  * **Returns:** String.
  * **Calls:** None.

### 3. Phrase & Threat Detection
* **`detectPhraseCategory(normalizedFullText, words, phrases)`**
  * **Description:** Iterates through a predefined array of threat phrases (e.g., `urgentWords`) and checks if they exist in the email content.
  * **Takes:** String (`normalizedFullText`), Array of Strings (`words`), Array of Strings (`phrases`).
  * **Returns:** Array of Strings (The specific phrases that were found).
  * **Calls:** `isPhraseDetected`.

* **`isPhraseDetected(normalizedFullText, words, phrase)`**
  * **Description:** Determines how to search for a phrase. If it's a multi-word phrase, it searches the full text. If it's a single word, it delegates to the similarity checker to catch typos.
  * **Takes:** String (`normalizedFullText`), Array of Strings (`words`), String (`phrase`).
  * **Returns:** Boolean.
  * **Calls:** `normalizeText`, `containsSimilarWord`.

* **`containsSimilarWord(words, keyword)`**
  * **Description:** Iterates through all words in the email to see if any single word closely matches the target keyword.
  * **Takes:** Array of Strings (`words`), String (`keyword`).
  * **Returns:** Boolean.
  * **Calls:** `isSimilar`.

### 4. Fuzzy Matching (Levenshtein Logic)
* **`isSimilar(word, keyword)`**
  * **Description:** Evaluates if two words are suspiciously similar. It sets dynamic thresholds (shorter words require exact matches, longer words allow 1-2 character differences).
  * **Takes:** String (`word`), String (`keyword`).
  * **Returns:** Boolean.
  * **Calls:** `levenshteinDistance`.

* **`levenshteinDistance(a, b)`**
  * **Description:** A mathematical algorithm that calculates the minimum number of single-character edits (insertions, deletions, or substitutions) required to change word `a` into word `b`.
  * **Takes:** String (`a`), String (`b`).
  * **Returns:** Integer (The distance score).
  * **Calls:** None.

### 5. Link (URL) Analysis
* **`checkLinks(fullText)`**
  * **Description:** Extracts all URLs from the email body using Regex, then evaluates them for malicious patterns.
  * **Takes:** String (`fullText`).
  * **Returns:** Object (`{ score: Integer, messages: Array }`).
  * **Calls:** `containsIPAddress`, `containsEncodedOrObfuscatedCharacters`.

* **`containsIPAddress(url)`**
  * **Description:** Checks if a URL relies on a raw IP address rather than a standard domain name.
  * **Takes:** String (`url`).
  * **Returns:** Boolean.
  * **Calls:** None.

* **`containsEncodedOrObfuscatedCharacters(url)`**
  * **Description:** Looks for suspicious symbols (`%`, `@`, `--`) often used to hide the true destination of a URL.
  * **Takes:** String (`url`).
  * **Returns:** Boolean.
  * **Calls:** None.

### 6. Sender Validation & Spoofing
* **`checkSenderEmail(senderEmail)`**
  * **Description:** Validates standard email format, extracts the domain, and cross-references it with a whitelist of legitimate domains to check for spoofing.
  * **Takes:** String (`senderEmail`).
  * **Returns:** Object (`{ score: Integer, messages: Array }`).
  * **Calls:** `extractDomainFromEmail`, `isDomainSpoofed`.

* **`extractDomainFromEmail(email)`**
  * **Description:** Isolates the domain portion of an email address (everything after the `@`).
  * **Takes:** String (`email`).
  * **Returns:** String.
  * **Calls:** None.

* **`isDomainSpoofed(senderDomain, legitimateDomain)`**
  * **Description:** Compares the sender's domain against a trusted domain using Levenshtein distance to catch slight misspellings (e.g., `amzon.com` vs `amazon.com`).
  * **Takes:** String (`senderDomain`), String (`legitimateDomain`).
  * **Returns:** Boolean.
  * **Calls:** `normalizeWord`, `levenshteinDistance`.

### 7. Array Utilities
* **`addCategoryIndicators(indicators, matches, prefix)`**
  * **Description:** Appends a formatted string (prefix + match) into the main findings array.
  * **Takes:** Array (`indicators`), Array (`matches`), String (`prefix`).
  * **Returns:** None (Mutates the `indicators` array directly).
  * **Calls:** None.

* **`addListToIndicators(indicators, messages)`**
  * **Description:** Merges a list of message strings into the main indicators array.
  * **Takes:** Array (`indicators`), Array (`messages`).
  * **Returns:** None (Mutates the `indicators` array directly).
  * **Calls:** None.