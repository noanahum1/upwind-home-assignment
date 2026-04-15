// This function enables or disables the login button based on whether both username and password are filled
function updateButtonState(form) {
    // Get input fields
    var usernameInput = form.querySelector('input[name="username"]');
    var passwordInput = form.querySelector('input[name="password"]');
    // Get the submit button
    var submitButton = form.querySelector('button[type="submit"]');

    // Get trimmed values from inputs
    var usernameFilled = usernameInput.value.trim();
    var passwordFilled = passwordInput.value.trim();

    if (usernameFilled && passwordFilled) {
        submitButton.disabled = false;
    } else {
        submitButton.disabled = true;
    }
}

// This function removes the result message when user starts typing again
function clearResultMessage(form) {
    // Find the card that contains the form
    var card = form.closest(".card");

    // Find the result message inside the card
    var resultBox = card.querySelector(".result");

    // If message exists → remove it
    if (resultBox) {
        resultBox.remove();
    }
}

// Run when the page finishes loading
document.addEventListener("DOMContentLoaded", function () {
    // Get all forms that have the class "login-form"
    var forms = document.querySelectorAll(".login-form");

    // Loop over each form in the page
    // "form" here is one specific form element from the list
    // first time = vulnerable form, second time = secure form
    forms.forEach(function (form) {

        // Listen to any typing inside the form in any input field
        form.addEventListener("input", function () {

            // Update the button (enable/disable)
            updateButtonState(form);

            // Remove previous result message
            clearResultMessage(form);
        });

        // When page loads, set initial button state
        updateButtonState(form);
    });
});