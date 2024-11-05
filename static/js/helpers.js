import {displayClientError} from './app.js';

export const getCookie = (name) => {
    try {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }catch (error) {
        displayClientError(error.message);
    }
};

/**
 * 
 * @param {Boolean}  Vegan bool
 * @returns {String} Returns the color of the vegan button depending 
 * on its state.
 */
export const veganModeColor = (veganMode) => {
    return veganMode ? 'rgb(255, 165, 96)' : 'rgb(255, 255, 255)';
};

/**
 * 1. Trims lenghy text into a specified length. 
 * 
 * 2. Adds '....' to the end of the string
 * 
 * @param {String}  text
 * @param {Integer}   slice Specified length of the text
 * @returns {String} The trimmed text string
 */
export const trimText = (text, slice) => {
    if (text){
        if (text.length > slice){
            return text.slice(0, slice) + "....";
        }else {
            return text;
        }
    }else {
        return "";
    }
};

/**
 * Adds an event listener as a global variable. 
 * Used for event listeners that need to be properly
 * removed after they have already been added. 
 * 
 * @param {object}    feedVariables Specifically the 'eventListeners' entry
 * @param {str}       eventString eg. 'click', 'mouseup', etc.
 * @param {str}       id The HTML element's id, NOTE! This is used entry -->
 * feedVariables.eventListeners[id]
 * @param {Function}  listenerFunction The reference function that the eventlistener 
 * should reference.
 */
export const addStoredEventListener = (feedVariables, eventString, id, listenerFunction) => {
    try {
        const element = document.getElementById(id);
        // Remove existing event listener, if any
        if (feedVariables.eventListeners[id]) {
            element.removeEventListener(
                eventString,
                feedVariables.eventListeners[id]
            );
        }
        // Add and store listener
        element.addEventListener(eventString, listenerFunction);
        feedVariables.eventListeners[id] = listenerFunction;
    }catch (error) {
        displayClientError(error.message);
    }
};

/**
 * 
 * @param {str}   text
 * @returns {any} The text with a capitalized first letter
 */
export const capitalizeFirstLetter = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
};

export const toSnakeCase = (str) => {
    return str
        // Insert a hyphen between lowercase and uppercase letters
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        // Make everything lower case
        .toLowerCase();
};
