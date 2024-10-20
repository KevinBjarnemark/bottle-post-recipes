import { htmlSidebarFilters, htmlSidebarSearchAreas } from './generateHTML.js';
import { configureListeners } from './listeners.js';
import { getRecipePage } from './updateDOM.js';

document.addEventListener("DOMContentLoaded", function() {
    // Data loaded from db
    const initialData = {
        userProfileData: JSON.parse(document.getElementById('user-profile-data').textContent),
    }
    // Targeted HTML elements
    const globalHTML = {
        feed: document.getElementById('feed'),
        veganButton: document.getElementById('vegan-mode-button'),
        veganIcon: document.getElementById('vegan-mode-icon'),
        hintWindow: document.getElementById('hint-window'),
        hintWindowText: document.getElementById('hint-window-text'),
        loadRecipesButton: document.getElementById('load-recipes-button'),
        sidebarSearchButton: document.getElementById('sidebar-search-button'),
        // Search
        searchContainer: document.getElementById('search-container'),
        searchInput: document.getElementById('search-input'),
        searchAreas: document.getElementById('search-areas'),
        searchButton: document.getElementById('search-button'),
        // Filter
        sidebarFilterButton: document.getElementById('sidebar-filter-button'),
        filterContainer: document.getElementById('filter-container'),
        filters: document.getElementById('filters'),
        filterButton: document.getElementById('filter-button'),
    };

    // Global states
    let globalVariables = {
        veganMode: initialData.userProfileData.vegan_mode,
        hintWindowTimer: null,
        recipes: [],
        total_recipes: 0,
        filterObject: 
            {
                // Search query (string)
                "q": "", 
                // Include search areas (array of strings)
                "search_areas": [], 
            },
        page: 1,
        // Search areas ids (last item is extracted when creating listeners)
        searchAreaBoolIds: [
            "search-area-description", 
            "search-area-ingredients", 
            "search-area-tags",
        ],
        sidebarSettingContainers: [
            "search-container",
            "filter-container",
        ],
    };

    // Set initial states
    setInitialStates(globalHTML, globalVariables);
    // Generate html
    generateHTML(globalHTML);
    // Configure listeners
    configureListeners(globalHTML, globalVariables);
});

const generateHTML = (globalHTML) => {
    // Sidebar search areas checkboxes
    htmlSidebarSearchAreas(globalHTML);
    // Sidebar include filters (vegan, vegetarian, meat)
    htmlSidebarFilters(globalHTML);
};

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
const setInitialStates = async (globalHTML, globalVariables) => {
    // Set vegan mode color
    globalHTML.veganIcon.style.color = veganModeColor(globalVariables.veganMode);
    // Load the first recipe group
    await getRecipePage(1, globalHTML, globalVariables);
};

// Export for testing
export { 
    veganModeColor, 
    setInitialStates
};
