
export const getCookie = (name) => {
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
}

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
        return ""
    };
};

/**
 * 
 * @param {str}   text
 * @returns {any} The text with a capitalized first letter
 */
export const capitalizeFirstLetter = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
