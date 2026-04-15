// Main function - runs when the user clicks the Analyze button
function analyzeEmail() {
  var senderEmailInput = document.getElementById("senderEmail");
  var subjectInput = document.getElementById("subject");
  var bodyInput = document.getElementById("body");
  var resultBox = document.getElementById("result");
  var verdictText = document.getElementById("verdict");
  var indicatorsList = document.getElementById("indicatorsList");

  var senderEmail = senderEmailInput.value.trim();
  var subject = subjectInput.value.trim();
  var body = bodyInput.value.trim();

  var indicators = [];
  var score = 0;

  // Stop only if both subject and body are empty
  if (!subject && !body) {
    alert("Please enter an email subject or body.");
    return;
  }

  // Combine subject + body into one text for scanning
  var fullText = (subject + " " + body).toLowerCase();

  // Clean the text to catch tricks like p@ssw0rd -> password
  var normalizedFullText = normalizeText(fullText);
  var words = getNormalizedWords(fullText);

  // Define categories of suspicious phrases
  // Some phrases can belong to multiple categories, for example "final warning", which indicates both urgency and threat.
  // In such cases, the system intentionally counts them in both categories to reflect a higher risk.

  var urgentWords = [
    "urgent", "immediately", "act now", "verify now", "action required", "click now", "confirm now", "last chance",
    "your account has been compromised", "your account will be closed", "your account has been suspended",
    "your account has been hacked", "account suspended", "suspicious activity detected", "risk of losing access",
    "account locked", "unusual login attempt", "limited time", "password expires", "payment required",
    "security alert", "important notice", "final warning", "update your information", "verify your account",
    "verify your identity", "verify your payment information", "update your billing information", "act fast",
    "don't delay", "expires soon", "offer expires"
  ];

  var promotionalWords = [
    "you have won", "free gift", "congratulations", "claim your prize", "exclusive offer", "limited offer", "don't miss out"
  ];

  var sensitiveInfoWords = [
    "password", "passcode", "verification code", "otp", "one time password", "login credentials",
    "username and password", "credit card", "card number", "cvv", "security code", "bank account",
    "billing information", "payment information", "ssn", "social security number", "pin"
  ];

  var threateningWords = [
    "your account will be closed", "your account has been suspended", "final warning", "risk of losing access",
    "legal action", "failure to respond", "your access will be revoked", "account locked", "suspended immediately"
  ];

  // Check each category and save what was found
  var riskyUrgencyFound = detectPhraseCategory(normalizedFullText, words, urgentWords);
  var promotionalFound = detectPhraseCategory(normalizedFullText, words, promotionalWords);
  var sensitiveFound = detectPhraseCategory(normalizedFullText, words, sensitiveInfoWords);
  var threateningFound = detectPhraseCategory(normalizedFullText, words, threateningWords);

  if (riskyUrgencyFound.length > 0) {
    score = score + 2;
    addCategoryIndicators(indicators, riskyUrgencyFound, 'Urgent or pressure-based language detected');
  }

  if (sensitiveFound.length > 0) {
    score = score + 4;
    addCategoryIndicators(indicators, sensitiveFound, 'Request for sensitive information detected');
  }

  if (threateningFound.length > 0) {
    score = score + 3;
    addCategoryIndicators(indicators, threateningFound, 'Threatening or coercive language detected');
  }

  // Check links separately because they return score + messages together
  var linkResult = checkLinks(fullText);
  score = score + linkResult.score;
  addListToIndicators(indicators, linkResult.messages);

  // Check sender email only if the user entered one
  if (senderEmail) {
    var senderResult = checkSenderEmail(senderEmail);
    score = score + senderResult.score;
    addListToIndicators(indicators, senderResult.messages);
  }

  // Promotional wording alone should not automatically mean phishing
  if (promotionalFound.length > 0) {
    addCategoryIndicators(indicators, promotionalFound, 'Promotional language detected');
  }

  resultBox.classList.remove("hidden");
  indicatorsList.innerHTML = "";

  renderVerdict(verdictText, indicatorsList, indicators, score, riskyUrgencyFound, promotionalFound, sensitiveFound, threateningFound);
}

// Decides what result text to show based on the final score
function renderVerdict(verdictText, indicatorsList, indicators, score, riskyUrgencyFound, promotionalFound, sensitiveFound, threateningFound) {
  var li;

  // Special case: promotional email with no strong phishing signs
  var isMostlyPromotional = promotionalFound.length > 0 &&
      riskyUrgencyFound.length === 0 &&
      sensitiveFound.length === 0 &&
      threateningFound.length === 0 &&
      score < 3;

  if (isMostlyPromotional) {
    verdictText.textContent = "This email looks more promotional than malicious, but review it carefully.";
    verdictText.className = "safe";

    for (var i = 0; i < indicators.length; i++) {
      li = document.createElement("li");
      li.textContent = indicators[i];
      indicatorsList.appendChild(li);
    }

    return;
  }

  if (score >= 7) {
    verdictText.textContent = "High risk: this email is likely a phishing attempt.";
    verdictText.className = "danger";
  } else if (score >= 4) {
    verdictText.textContent = "Medium risk: this email is potentially suspicious.";
    verdictText.className = "danger";
  } else if (score > 0) {
    verdictText.textContent = "Low risk: some suspicious indicators were detected.";
    verdictText.className = "danger";
  } else {
    verdictText.textContent = "No obvious phishing indicators were detected.";
    verdictText.className = "safe";
  }

  if (indicators.length > 0) {
    for (var j = 0; j < indicators.length; j++) {
      li = document.createElement("li");
      li.textContent = indicators[j];
      indicatorsList.appendChild(li);
    }
  } else {
    li = document.createElement("li");
    li.textContent = "No suspicious patterns found.";
    indicatorsList.appendChild(li);
  }
}

// The function formats detected phrases into readable messages
// Adds messages like: Request for sensitive information detected: "password"
function addCategoryIndicators(indicators, matches, prefix) {
  var i;
  for (i = 0; i < matches.length; i++) {
    indicators.push(prefix + ': "' + matches[i] + '"');
  }
}

// This function is used when we already have fully formatted messages, for example from the links and sender email checks.
// It simply adds these messages to the main indicators array.
function addListToIndicators(indicators, messages) {
  var i;
  for (i = 0; i < messages.length; i++) {
    indicators.push(messages[i]);
  }
}

// Checks one category list and returns only the phrases that were found
function detectPhraseCategory(normalizedFullText, words, phrases) {
  var matches = [];
  var i;

  for (i = 0; i < phrases.length; i++) {
    if (isPhraseDetected(normalizedFullText, words, phrases[i])) {
      matches.push(phrases[i]);
    }
  }

  return matches;
}

// If it is a full phrase, search inside the full text
// If it is one word, use similarity checking
function isPhraseDetected(normalizedFullText, words, phrase) {
  var normalizedPhrase = normalizeText(phrase);

  if (normalizedPhrase.indexOf(" ") !== -1) {
    return normalizedFullText.indexOf(normalizedPhrase) !== -1;
  }

  return containsSimilarWord(words, normalizedPhrase);
}

// Looks for one similar word inside all the words from the email
function containsSimilarWord(words, keyword) {
  var i;
  for (i = 0; i < words.length; i++) {
    if (isSimilar(words[i], keyword)) {
      return true;
    }
  }
  return false;
}

// Splits text into clean words after normalization
function getNormalizedWords(text) {
  var cleanedText = text.toLowerCase();
  var rawWords = cleanedText.split(/\s+/);
  var normalizedWords = [];
  var i;
  var word;

  for (i = 0; i < rawWords.length; i++) {
    word = normalizeWord(rawWords[i]); // Calls the function normalizeWord(word)
    if (word.length > 0) {
      normalizedWords.push(word);
    }
  }

  return normalizedWords;
}

// Cleans a full sentence and rebuilds it as normalized text
function normalizeText(text) {
  var lowerText = text.toLowerCase();
  var cleanedText = lowerText.replace(/[^a-z0-9\s]/g, " ");
  var words = cleanedText.split(/\s+/);
  var normalizedWords = [];
  var i;
  var word;

  for (i = 0; i < words.length; i++) {
    word = normalizeWord(words[i]); // Calls the function normalizeWord(word)
    if (word.length > 0) {
      normalizedWords.push(word);
    }
  }

  return normalizedWords.join(" ");
}

// Normalizes one word to catch tricks like p@ssw0rd or urgenttt
function normalizeWord(word) {
  var normalizedWord = word.toLowerCase();

  normalizedWord = normalizedWord.replace(/[@]/g, "a");
  normalizedWord = normalizedWord.replace(/[0]/g, "o");
  normalizedWord = normalizedWord.replace(/[1!]/g, "i");
  normalizedWord = normalizedWord.replace(/[3]/g, "e");
  normalizedWord = normalizedWord.replace(/[5$]/g, "s");
  normalizedWord = normalizedWord.replace(/[7]/g, "t");

  normalizedWord = normalizedWord.replace(/[^a-z0-9]/g, "");
  normalizedWord = normalizedWord.replace(/(.)\1{2,}/g, "$1");

  return normalizedWord;
}

// Checks if 2 words are close enough to be considered similar
function isSimilar(word, keyword) {
  var distance;
  var maxDistance;

  if (word === keyword) {
    return true;
  }

  // Very short words must match exactly to avoid false positives
  if (keyword.length <= 3) {
    return false;
  }

  if (Math.abs(word.length - keyword.length) > 2) {
    return false;
  }

  distance = levenshteinDistance(word, keyword);

  if (keyword.length <= 5) {
    maxDistance = 1;
  } else if (keyword.length <= 8) {
    maxDistance = 2;
  } else {
    maxDistance = 2;
  }

  return distance <= maxDistance;
}

// Calculates how many changes are needed to turn one word into another
function levenshteinDistance(a, b) {
  var matrix = [];
  var i;
  var j;
  var cost;

  for (i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        cost = 0;
      } else {
        cost = 1;
      }

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
}

// This function finds links in the email and checks whether they look suspicious
// Returns an object containing the total score from link analysis and a list of messages for the user
function checkLinks(fullText) {
  var messages = [];
  var score = 0;
  var urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  var urls = fullText.match(urlRegex);
  var i;
  var url;

  if (!urls) {
    return {
      score: score,
      messages: messages
    };
  }

  for (i = 0; i < urls.length; i++) {
    url = urls[i];

    if (containsIPAddress(url)) {
      score = score + 4;
      messages.push("Suspicious link detected: URL contains an IP address (" + url + ")");
    } else if (containsEncodedOrObfuscatedCharacters(url)) {
      score = score + 2;
      messages.push("Suspicious link detected: URL appears obfuscated (" + url + ")");
    } else {
      messages.push("Link detected: " + url);
    }
  }

  return {
    score: score,
    messages: messages
  };
}

// Checks if the URL uses an IP instead of a normal domain
function containsIPAddress(url) {
  var ipRegex = /(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}/i;
  return ipRegex.test(url);
}

// This function checks for common URL tricks such as encoding and obfuscation
// These techniques are often used to hide malicious links, for example:
// - Using % encoding to hide the real URL (e.g. http://%77%77%77%2Eexample%2Ecom)
// - Using @ to mislead users about the real domain (e.g. http://fake.com@real.com)
// - Using unusual patterns like "--" to make the URL look legitimate
function containsEncodedOrObfuscatedCharacters(url) {
  if (url.indexOf("%") !== -1) {
    return true;
  }

  if (url.indexOf("@") !== -1) {
    return true;
  }

  if (url.indexOf("--") !== -1) {
    return true;
  }

  return false;
}

// This function checks if the sender email format is valid and whether the domain appears spoofed
// It compares the sender's domain to a list of known legitimate domains using similarity (Levenshtein distance),
// Adds a score and message if the format is invalid or if the domain looks suspicious (e.g. amaz0n.com)
// Returns an object containing the score and a list of messages
function checkSenderEmail(senderEmail) {
  var messages = [];
  var score = 0;
  var emailFormatRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var legitimateDomains = [
    "amazon.com", "google.com", "microsoft.com", "atlassian.com", "jira.com", "confluence.com", "apple.com", "playtika.com",
    "instagram.com", "tiktok.com", "linkedin.com", "facebook.com", "meta.com",
    "taxes.gov.il", "btl.gov.il", "tel-aviv.gov.il", "gov.il", "israelpost.co.il", "iec.co.il",
    "ebay.com", "aliexpress.com", "ksp.co.il", "booking.com", "wolt.com", "10bis.co.il", "mishloha.co.il", "centralpark.co.il",
    "bankhapoalim.co.il", "discountbank.co.il", "leumi.co.il", "pepper.co.il", "payboxapp.com", "paypal.com", "bitpay.co.il",
    "mizrahitfahot.co.il", "isracard.co.il", "max.co.il", "cal-online.co.il", "clalit.co.il", "maccabi4u.co.il", "meuhedet.co.il", "spotify.com", "music.apple.com", "gett.com",
    "harel-group.co.il", "migdal.co.il", "fnx.co.il", "bezeq.co.il", "hot.net.il", "cellcom.co.il", "partner.co.il", "pelephone.co.il",
  ];

  var senderEmailLower = senderEmail.toLowerCase();
  var senderDomain = "";
  var i;

  if (!emailFormatRegex.test(senderEmail)) {
    messages.push("Invalid sender email format detected.");
    score = score + 2;

    return {
      score: score,
      messages: messages
    };
  }

  senderDomain = extractDomainFromEmail(senderEmailLower);

  for (i = 0; i < legitimateDomains.length; i++) {
    if (senderDomain === legitimateDomains[i]) {
      return {
        score: score,
        messages: messages
      };
    }

    if (isDomainSpoofed(senderDomain, legitimateDomains[i])) {
      messages.push(
        "Possible spoofed sender domain detected: " +
        senderDomain +
        " looks similar to " +
        legitimateDomains[i]
      );
      score = score + 4;
      break;
    }
  }

  return {
    score: score,
    messages: messages
  };
}

// This function extracts only the domain part from an email address
function extractDomainFromEmail(email) {
  var parts = email.split("@");

  if (parts.length !== 2) {
    return "";
  }

  return parts[1];
}

// This function compares the sender domain to known legitimate domains using similarity checking
function isDomainSpoofed(senderDomain, legitimateDomain) {
  var cleanedSenderDomain;
  var cleanedLegitimateDomain;
  var distance;

  if (senderDomain === legitimateDomain) {
    return false;
  }

  cleanedSenderDomain = normalizeWord(senderDomain.replace(/\./g, ""));
  cleanedLegitimateDomain = normalizeWord(legitimateDomain.replace(/\./g, ""));

  distance = levenshteinDistance(cleanedSenderDomain, cleanedLegitimateDomain);

  if (distance <= 2) {
    return true;
  }

  return false;
}