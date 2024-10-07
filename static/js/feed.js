import { getCookie } from './helpers.js';

document.addEventListener("DOMContentLoaded", function() {
    // Data loaded from db
    const initialData = {
        userProfileData: JSON.parse(document.getElementById('user-profile-data').textContent),
        recipesData: JSON.parse(document.getElementById('recipesJSON-data').textContent),
    }
    // Targeted HTML elements
    const globalHTML = {
        veganButton: document.getElementById('vegan-mode-button'),
        veganIcon: document.getElementById('vegan-mode-icon'),
        hintWindow: document.getElementById('hint-window'),
        hintWindowText: document.getElementById('hint-window-text'),
        veganStatusText: document.querySelector('h2'),
    };

    // Global states
    let globalVariables = {
        veganMode: initialData.userProfileData.vegan_mode,
        recipes: JSON.parse(initialData.recipesData),
        hintWindowTimer: null,
    };

    // Set initial states
    setInitialStates(globalHTML, globalVariables);
    // This prevents non-vegan recipes showing on load
    filterVeganRecipes(globalVariables);

    // Listeners
    globalHTML.veganButton.addEventListener("click", () => {
        toggleVeganMode(globalHTML, globalVariables)});
    });

/**
 * 
 * @param {Boolean}  Vegan bool
 * @returns {String} Returns the color of the vegan depending on its state.
 */
const veganModeColor = (veganMode) => {
    return veganMode ? 'rgb(255, 165, 96)' : 'rgb(255, 255, 255)';
};

/**
 * Sets the initial states when the user arrives after a page load.
 * 
 */
const setInitialStates = (globalHTML, globalVariables) => {
    // Set html
    globalHTML.veganIcon.style.color = veganModeColor(globalVariables.veganMode);
};

/**
 * Sets the innerHTML of hint_window.html component and clears it after 
 * 5 seconds.
 * 
 * @param {Object}  globalVariables
 * @param {Object}  globalHTML
 * @param {String}  html The html string to insert in the hint window
 */
const hintWindow = (globalVariables, globalHTML, html) => {
    // Clear any previously set timers
    if (globalVariables.hintWindowTimer) {
        clearTimeout(globalVariables.hintWindowTimer);
    }
    // Display user message
    globalHTML.hintWindow.style.display = 'block';
    globalHTML.hintWindow.style.transform = 'scale(1)';
    globalHTML.hintWindowText.innerHTML = html;

    globalVariables.hintWindowTimer = setTimeout(() => {
    // Display user message
        globalHTML.hintWindow.style.display = 'none';
        globalHTML.hintWindow.style.transform = 'scale(0)';
        globalHTML.hintWindowText.innerHTML = "";
    }, 5000);
};

/**
 * Toggles the vegan_mode state (in Profile model) and 
 * triggers the hint window to display an informative 
 * message to the user. 
 * 
 */
const filterVeganRecipes = (globalVariables) => {
    globalVariables.recipes.forEach(i => {
        const recipeItem = document.getElementById(`recipe-item-${i.pk}`);

        if (globalVariables.veganMode){
            if (!i.fields.vegan){
                recipeItem.style.display = "none";
            }else {
                recipeItem.style.display = "flex";
            }
        }else {
            recipeItem.style.display = "flex";
        }
    }) 
};

/**
 * Toggles the vegan_mode state (in Profile model) and 
 * triggers the hint window to display an informative 
 * message to the user. 
 * 
 */
const toggleVeganMode = async (globalHTML, globalVariables) => {
    const request = await fetch('/toggle_vegan_mode/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ vegan_mode: !globalVariables.veganMode })
    });
    
    if (request.status === 200) {
        // Toggle vegan mode variable
        globalVariables.veganMode = !globalVariables.veganMode; 
        // Change color
        globalHTML.veganIcon.style.color = globalVariables.veganMode ? '#ffa560' : 'rgb(255, 255, 255)';

        const hintWindowHtml = globalVariables.veganMode ? 
        `
        <p>Vegan mode is 
            <span style='color:#8aeb84; font-weight: 600'>
                ON
            </span>
            <i class="fa-solid fa-carrot" id="vegan-mode-icon"></i>
        </p>
        ` 
        :
        `
        <p>Vegan mode is 
            <span style='color:#fa6e6e; font-weight: 600'>
                OFF
            </span>
        </p>
        `;
        hintWindow(globalVariables, globalHTML, hintWindowHtml);

        filterVeganRecipes(globalVariables);

    } else {
        console.error('Failed to toggle vegan mode');
    }
};

// Export for testing
export { veganModeColor, setInitialStates, toggleVeganMode };
