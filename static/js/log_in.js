import {getCookie} from './helpers.js';
import {
    confirmedRedirect, 
    setLoading, 
    displayClientError, 
    displayServerError
} from './app.js';

document.addEventListener("DOMContentLoaded", function() {

    let logInHTML = {
        username: document.getElementById("log-in-username"),
        password: document.getElementById("log-in-password"),
        logInButton: document.getElementById("log-in-button"),
    };

    let logInVariables = {
        inputs: {
            username: "",
            password: "",
        }
    };

    // Listen to inputs
    logInHTML.username.addEventListener("change", (e) => {
        logInVariables.inputs.username = e.target.value;
    });
    logInHTML.password.addEventListener("change", (e) => {
        logInVariables.inputs.password = e.target.value;
    });

    // Listen to log in button 
    logInHTML.logInButton.addEventListener("click", async (e) => {
        e.preventDefault();
        await logIn(logInVariables);
    });
});

/**
 * Submits the register form to the back-end
 * 
 * @param {Object}  feedVariables 
 * @param {String}   recipeId 
 */
const logIn = async (logInVariables) => {

    const init = async () => {
        setLoading(true);
        try {
            // Create the form data constructor
            const formData = new FormData();

            // Populate formData with input values
            formData.append('username', logInVariables.inputs.username);
            formData.append('password', logInVariables.inputs.password);
            
            // Validate inputs
            const username = logInVariables.inputs.username
            const password = logInVariables.inputs.password
            if (!username) {
                throw new Error("clientError: Username is missing.")
            }
            if (!password) {
                throw new Error("clientError: Password is missing.")
            }

            // Send destructed form data
            const response = await fetch('/submit_log_in/', {
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
                        Successful login! ✔️
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
