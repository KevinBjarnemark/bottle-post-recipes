import { addStoredEventListener } from "./helpers.js";

document.addEventListener("DOMContentLoaded", function() {
    window.appHTML = {
        // Loading container
        loadingContainer: document.getElementById("loading-container"),
        // Hint window
        hintWindow: document.getElementById('hint-window'),
        hintWindowText: document.getElementById('hint-window-text'),
    };

    window.appVariables = {
        loadingItems: [],
        confirmPassword: "", 
        eventListeners: {},
        hintWindowTimer: null,
    };
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

export const confirmPassword = (confirmFunction, text="") => {
    /* Get elements */
    const popUpElement = document.getElementById(
        "password-confirmation-pop-up"
    );
    const inputElement = document.getElementById(
        "password-confirmation-pop-up-input"
    );
    const confirmButtonElement = document.getElementById(
        "password-confirmation-pop-up-confirm-button"
    );
    const closeButtonElement = document.getElementById(
        "password-confirmation-pop-up-close-button"
    );

    // Show component
    popUpElement.style.display = "block";
    // 

    // Add and store close button listener
    addStoredEventListener(
        window.appVariables,
        "click", 
        closeButtonElement.id, 
        () => {
            // Clear password
            window.appVariables.confirmPassword = "";
            // Hide pop-up
            popUpElement.style.display = "none";
        }
    );

    // Add and store password input listener
    addStoredEventListener(
        window.appVariables,
        "input", 
        inputElement.id, 
        (e) => {
            // Store password
            window.appVariables.confirmPassword = e.target.value;
        }
    );

    // Add and store confirm button listener
    addStoredEventListener(
        window.appVariables,
        "click", 
        confirmButtonElement.id, 
        () => {
            confirmFunction(window.appVariables.confirmPassword);
            window.appVariables.confirmPassword = "";
            popUpElement.style.display = "none";
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
