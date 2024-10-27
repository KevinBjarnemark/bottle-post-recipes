import { htmlSidebarFilters, htmlSidebarSearchAreas } from './generate_html.js';
import { configureListeners } from './listeners.js';
import { getRecipePage } from './update_dom.js';
import { veganModeColor } from '../helpers.js';
import { recipeEditor } from '../feed/recipe_editor.js';

document.addEventListener("DOMContentLoaded", function() {
    // Global states
    let globalVariables = {
        page: 1, // The recipe group loaded represented as 'page'
        user: {
            veganMode: initialData.userProfileData.vegan_mode,
            username: initialData.userProfileData.username,
            userId: initialData.userProfileData.user_id,
        },
        // Hint window timer
        hintWindowTimer: null,
        recipes: [],
        // A managed comment state for the recipe viewer component
        currentComment: "", 
        // Sidebar filter settings
        filterObject: 
            {
                // Search query (string)
                q: "", 
                // Include search areas (array of strings)
                searchAreas: [], 
                recipeTypes: {
                    vegan: true,
                    vegetarian: true,
                    fish: true,
                    meat: true,
                },
                userId: "",
            },
        // Stored event listeners that might be removed at some point
        eventListeners: {},

        // Form data prepared for backend
        formData: {
            title: "",
            description: "",
            tags: "",
            instructions: "",
            ingredients: [],
            dietary_attributes: [],
            image: null,
            preparation_time: {days: 0, hours: 0, minutes: 0},
            cooking_time: {days: 0, hours: 0, minutes: 0},
            estimated_price: {from: 0, to: 0},
        },
    };

    // Set initial states
    setInitialStates(globalHTML, globalVariables);
    // Generate HTML
    generateHTML(globalHTML, globalVariables);
    // Configure listeners
    configureListeners(globalHTML, globalVariables);

    globalHTML.createRecipeButton.addEventListener('click', function(e) {
        e.preventDefault();
        recipeEditor(globalHTML, globalVariables, "NEW RECIPE");
    });
});

const generateHTML = (globalHTML, globalVariables) => {
    // Sidebar search areas checkboxes
    htmlSidebarSearchAreas(globalHTML, globalVariables);
    // Sidebar include filters (vegan, vegetarian, meat)
    htmlSidebarFilters(globalHTML, globalVariables);
};

/**
 * Sets the initial states when the user arrives after a page load.
 * 
 */
const setInitialStates = async (globalHTML, globalVariables) => {
    // Set vegan mode button color
    globalHTML.veganIcon.style.color = veganModeColor(globalVariables.user.veganMode);
    // Load the first recipe group
    await getRecipePage(1, globalHTML, globalVariables);
};

// Export for testing
export { 
    veganModeColor, 
    setInitialStates
};
