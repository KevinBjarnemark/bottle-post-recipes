import { htmlSidebarFilters, htmlSidebarSearchAreas } from './generateHTML.js';
import { configureListeners } from './listeners.js';
import { getRecipePage } from './updateDOM.js';
import { veganModeColor } from '../helpers.js';

document.addEventListener("DOMContentLoaded", function() {
    // Data loaded from db
    const initialData = {
        userProfileData: JSON.parse(document.getElementById('user-profile-data').textContent),
    };
    // Targeted HTML elements
    const globalHTML = {
        // Feed
        feed: document.getElementById('feed'),
        feedContainer: document.getElementById('feed-container'),
        sidebarSearchButton: document.getElementById('sidebar-search-button'),
        // Sidebar
        feedSidebarButtonsContainer: document.getElementById(
            'feed-sidebar-buttons-container'
        ),
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
        // Vegan button
        veganButton: document.getElementById('vegan-mode-button'),
        veganIcon: document.getElementById('vegan-mode-icon'),
        // Hint window
        hintWindow: document.getElementById('hint-window'),
        hintWindowText: document.getElementById('hint-window-text'),
        loadRecipesButton: document.getElementById('load-recipes-button'),
        // Recipe viewer
        recipeViewerContainer: document.getElementById("recipe-viewer-container"),
        recipeViewer: document.getElementById("recipe-viewer"),
        recipeViewerGenerated: document.getElementById("recipe-viewer-generated"),
    };

    // Global states
    let globalVariables = {
        page: 1, // The recipe group loaded represented as 'page'
        veganMode: initialData.userProfileData.vegan_mode,
        username: initialData.userProfileData.username,
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
            },
        // Stored event listeners that might be removed at some point
        eventListeners: {},
    };

    // Set initial states
    setInitialStates(globalHTML, globalVariables);
    // Generate HTML
    generateHTML(globalHTML, globalVariables);
    // Configure listeners
    configureListeners(globalHTML, globalVariables);
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
    globalHTML.veganIcon.style.color = veganModeColor(globalVariables.veganMode);
    // Load the first recipe group
    await getRecipePage(1, globalHTML, globalVariables);
};

// Export for testing
export { 
    veganModeColor, 
    setInitialStates
};
