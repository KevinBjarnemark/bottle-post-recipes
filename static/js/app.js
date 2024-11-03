import { addStoredEventListener, getCookie } from "./helpers.js";

document.addEventListener("DOMContentLoaded", function() {
    window.appHTML = {
        // Loading container
        loadingContainer: document.getElementById("loading-container"),
        // Account button
        accountButton: {
            deleteAccountButton: document.getElementById(
                "account-button-delete-account-button"
            ),
            // My recipes (only visible at the home page)
            myRecipes: document.getElementById('account-button-my-recipes'),
        },
        // Hint window
        hintWindow: document.getElementById('hint-window'),
        hintWindowText: document.getElementById('hint-window-text'),
        // Password confirmation pop-up
        passwordConfirmationPopUp: {
            container: document.getElementById(
                "password-confirmation-pop-up-container"
            ),
            info: document.getElementById(
                "password-confirmation-pop-up-info"
            ),
            input: document.getElementById(
                "password-confirmation-pop-up-input"
            ),
            confirmButton: document.getElementById(
                "password-confirmation-pop-up-confirm-button"
            ),
            closeButton: document.getElementById(
                "password-confirmation-pop-up-close-button"
            ),
        },
    };
    
    window.appVariables = {
        loadingItems: [],
        confirmPassword: "", 
        eventListeners: {},
        hintWindowTimer: null,
    };

    // Delete account button (only visible at home page)
    if (window.appHTML.accountButton.deleteAccountButton) {
        window.appHTML.accountButton.deleteAccountButton
        .addEventListener("click", async () => {deleteAccount()});
    }

});

export const setLoading = (bool) => {
    if (bool){
        window.appVariables.loadingItems.push(".");
    }else {
        window.appVariables.loadingItems.pop(".");
    }

    if (window.appVariables.loadingItems.length === 0) {
        window.appHTML.loadingContainer.style.display = "none";
    }else {
        window.appHTML.loadingContainer.style.display = "flex";
    }
};

/**
 * Sets the innerHTML of hint_window.html component and clear it after 
 * 5 seconds.
 * 
 * @param {Object}  feedVariables
 * @param {Object}  feedHTML
 * @param {String}  html The html string to insert in the hint window
 */
export const hintWindow = (html, time=5000) => {
    // Clear any previously set timers
    if (window.appVariables.hintWindowTimer) {
        clearTimeout(appVariables.hintWindowTimer);
    }
        // Display user message
        window.appHTML.hintWindow.style.display = 'block';
        window.appHTML.hintWindow.style.transform = 'scale(1)';
        window.appHTML.hintWindowText.innerHTML = html;

    window.appVariables.hintWindowTimer = setTimeout(() => {
        // Display user message
        window.appHTML.hintWindow.style.display = 'none';
        window.appHTML.hintWindow.style.transform = 'scale(0)';
        window.appHTML.hintWindowText.innerHTML = "";
    }, time);
};

export const confirmPassword = (confirmFunction, infoHTML="<p></p>") => {
    // Show component with custom info
    window.appHTML.passwordConfirmationPopUp.container.style.display = "block";
    window.appHTML.passwordConfirmationPopUp.info.innerHTML = infoHTML;

    // Add and store close button listener
    addStoredEventListener(
        window.appVariables,
        "click", 
        window.appHTML.passwordConfirmationPopUp.closeButton.id, 
        () => {
            // Clear password
            window.appVariables.confirmPassword = "";
            // Hide pop-up
            window.appHTML.passwordConfirmationPopUp.container.style.display = "none";
        }
    );

    // Add and store password input listener
    addStoredEventListener(
        window.appVariables,
        "input", 
        window.appHTML.passwordConfirmationPopUp.input.id, 
        (e) => {
            // Store password
            window.appVariables.confirmPassword = e.target.value;
        }
    );

    // Add and store confirm button listener
    addStoredEventListener(
        window.appVariables,
        "click", 
        window.appHTML.passwordConfirmationPopUp.confirmButton.id, 
        () => {
            confirmFunction(window.appVariables.confirmPassword);
            window.appVariables.confirmPassword = "";
            window.appHTML.passwordConfirmationPopUp.container.style.display = "none";
        }
    );
};

/**
 * Shows a hint message and redirects to home.
 * 
 * @param {bool}  hintHtml innerHTML in hint window
 * @param {str}   time Time to wait before redirect.
 */
export const confirmedRedirect = async (hintHtml, time) => {
    hintWindow(hintHtml, time);
    setLoading(false);
    // Give the user some time to read
    await new Promise(resolve => setTimeout(resolve, time));
    window.location.href = '/';
};

export const deleteAccount = async () => {
    confirmPassword(
        async (password) => await deleteAccountConfirmed(password),
        `
            <p>
                <span class="text-red">WARNING!</span> Your account and all your 
                recipes will be deleted (cannot be undone). Please confirm your 
                password if you want to proceed deleting your account.
            </p>
        `
    );
};

const deleteAccountConfirmed = async (password) => {
    const init = async () => {
        try {
            const response = await fetch(`/delete_account/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password }),
            });

            if (response.ok) {
                await confirmedRedirect(
                    `<p>
                        Your account is now deleted ✔️
                        <br />
                        Redirecting to home...
                    </p>`,
                    7000
                );
            } else {
                const data = await response.json();
                console.error('Error deleting account:', data);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };
    await init();
};


/**
 * Displays a client-side error in the hint window.
 * 
 * Also, blocks 'developer' errors, use 'clientError:' prefix
 * whenever you throw errors.
 * 
 * @param {Object}  errors Object of errors
 * @param {Number}   time Time to display the errors
 * @param {Boolean}   client Client-side errors, if true
 */
export const displayClientError = (error="", time=7000, client=true) => {
    /* Distinguish client-side errors and avoid 'developer errors' to be exposed to 
    the client */
    if (error.startsWith("clientError:")) {
        hintWindow(`
            <p>❌ Client error <br /> ${error.replace("clientError:", "").trim()}</p>
            `, time
        );
    }else {
        hintWindow(`<p>❌ Client error <br /> Something went wrong..</p>`, time);
    }
};

/**
 * Displays a server-side error in the hint window.
 * 
 * @param {String} error The composed error message from the server response.
 * @param {Number} time Time to display the error (default is 7000ms).
 */
export const displayServerError = (error = "An unknown error occurred.", time = 7000) => {
    if (typeof error === "string" && error) {
        hintWindow(`
            <p>Server error ❌<br /> ${error}</p>
        `, time);
    } else {
        hintWindow(`<p>Something went wrong on our server ❌</p>`, time);
    }
};