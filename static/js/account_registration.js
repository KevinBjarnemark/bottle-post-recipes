import {getCookie} from './helpers.js'
import {
    confirmedRedirect, 
    setLoading, 
    displayClientError, 
    displayServerError
} from './app.js'

document.addEventListener("DOMContentLoaded", function() {

    let registerHTML = {
        username: document.getElementById("register-username"),
        password: document.getElementById("register-password"),
        confirmedPassword: document.getElementById("register-confirmed-password"),
        image: document.getElementById("register-image"),
        termsOfService: document.getElementById("register-terms-of-service"),
        privacyPolicy: document.getElementById("register-privacy-policy"),
        submitButton: document.getElementById("register-submit-button"),
    }

    let registerVariables = {
        inputs: {
            username: "",
            password: "",
            confirmPassword: "",
            image: null,
        }
    }

    const checkTerms = () => {
        // Enable the button only if both checkboxes are checked
        registerHTML.submitButton.disabled = !(
                registerHTML.termsOfService.checked && 
                registerHTML.privacyPolicy.checked
            );
    };

    // Listen to checkboxes
    registerHTML.privacyPolicy.addEventListener("change", checkTerms);
    registerHTML.termsOfService.addEventListener("change", checkTerms);
    // Listen to inputs
    registerHTML.username.addEventListener("change", (e) => {
        registerVariables.inputs.username = e.target.value;
    });
    registerHTML.password.addEventListener("change", (e) => {
        registerVariables.inputs.password = e.target.value;
    });
    registerHTML.password.addEventListener("change", (e) => {
        registerVariables.inputs.confirmPassword = e.target.value;
    });
    // Listen to submit button 
    registerHTML.submitButton.addEventListener("click", async (e) => {
        e.preventDefault();
        await createAccount(registerHTML, registerVariables);
    });
});

/**
 * Submits the register form to the back-end
 * 
 * @param {Object}  feedVariables 
 * @param {String}   recipeId 
 */
const createAccount = async (registerHTML, registerVariables) => {
    setLoading(true);
    const init = async () => {
        try {
            // Create the form data constructor
            const formData = new FormData();

            // Populate formData with input values
            formData.append('username', registerVariables.inputs.username);
            formData.append('password1', registerVariables.inputs.password);
            formData.append('password2', registerVariables.inputs.confirmPassword);
            if (registerHTML.image.files.length > 0) {
                formData.append('image', registerHTML.image.files[0]);
            }
            
            // Validate inputs
            const username = registerVariables.inputs.username
            const password = registerVariables.inputs.username
            const confirmedPassword = registerVariables.inputs.username
            if (!username) {
                throw new Error("clientError: Username is missing.")
            }
            if (!password) {
                throw new Error("clientError: Password is missing.")
            }
            if (password !== confirmedPassword) {
                throw new Error("clientError: Passwords must to be identical.")
            }

            // Send destructed form data
            const response = await fetch('/register_account/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData,
            });

            const jsonResponse = await response.json();
            if (jsonResponse.success) {
                await confirmedRedirect(
                    `<p>
                        Account created successfully! ✔️
                        <br />
                        Redirecting to home soon...
                    </p>`,
                    7000
                );
            } else {
                displayServerError(jsonResponse.error, 7000);
            }
        } catch (error) {
            displayClientError(error.message);
        } finally {
            setLoading(false);
        }
    };
    await init();
};
