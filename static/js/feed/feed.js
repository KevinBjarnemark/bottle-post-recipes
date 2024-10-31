import { htmlSidebarFilters, htmlSidebarSearchAreas } from './generate_html.js';
import { configureListeners } from './listeners.js';
import { getRecipePage, cleanUpFeed, hintWindow } from './update_dom.js';
import { veganModeColor } from '../helpers.js';
import { recipeEditor } from '../feed/recipe_editor.js';
import { DEFAULT_FILTER_OBJECT } from '../constants.js';
import { setLoading } from '../app.js';

document.addEventListener("DOMContentLoaded", function() {
    setLoading(true);
        try {
        // Data loaded from db
        const initialData = {
            userProfileData: JSON.parse(document.getElementById('user-profile-data').textContent),
        };
        // Targeted HTML elements
        const globalHTML = {
            // Account button
            accountButton: {
                // NOTE! This should be moved to a profile page in the future
                myRecipes: document.getElementById('account-button-my-recipes'),
            },
            // Feed
            feed: document.getElementById('feed'),
            feedContainer: document.getElementById('feed-container'),
            topText: document.getElementById('feed-top-text'),
            sidebarSearchButton: document.getElementById('sidebar-search-button'),
            bottlePostNotificationButton: document.getElementById(
                'bottle-post-notification-button'
            ),
            // Sidebar
            feedSidebarButtonsContainer: document.getElementById(
                'feed-sidebar-buttons-container'
            ),
            createRecipeButton: document.getElementById('create-recipe-button'),
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
            recipeViewer: {
                reviewSection: document.getElementById("recipe-review-section"),
                container: document.getElementById("recipe-viewer-container"),
                info: document.getElementById("recipe-viewer-info"),
                title: document.getElementById("recipe-viewer-title"),
                image: document.getElementById("recipe-viewer-image"),
                description: document.getElementById("recipe-viewer-description"),
                instructions: document.getElementById("recipe-viewer-instructions"),
                ingredients: document.getElementById(
                    "recipe-viewer-ingredients"
                ),
                dietaryAttributes: document.getElementById(
                    "recipe-viewer-dietary-attributes"
                ),
                comments: document.getElementById("recipe-viewer-comments"),
                commentInput: document.getElementById("recipe-viewer-comment-input"),
            },
            // Recipe editor
            recipeEditor: {
                container: document.getElementById("recipe-editor-container"),
                deleteButtonContainer: document.getElementById(
                    'recipe-editor-delete-button-container'
                ),
                deleteRecipeClickCount: document.getElementById(
                    'recipe-editor-delete-button-click-count'
                ),
                deleteButton: document.getElementById('recipe-editor-delete-button'),
                mainTitle: document.getElementById('recipe-editor-main-title'),
                mainInfo: document.getElementById('recipe-editor-main-info'),
                imagePreviewContainer: document.getElementById(
                    "recipe-editor-image-preview-container"
                ),
                textInputs: {
                    title: document.getElementById("recipe-editor-title"),
                    description: document.getElementById("recipe-editor-description"),
                    instructions: document.getElementById("recipe-editor-instructions"),
                    tags: document.getElementById("recipe-editor-tags"),
                },
                ingredient: {
                    quantity: document.getElementById("recipe-editor-ingredient-quantity"),
                    name: document.getElementById("recipe-editor-ingredient-name"),
                    addButton: document.getElementById("recipe-editor-ingredient-add-button"),
                },
                ingredients: document.getElementById("recipe-editor-added-ingredients"),
                dietaryAttributes: document.getElementById(
                    "recipe-editor-dietary-attributes"
                ),
                combinedNumberInputs: {
                    preparationTime: {
                        days: document.getElementById("recipe-editor-preparation-time-days"),
                        hours: document.getElementById("recipe-editor-preparation-time-hours"),
                        minutes: document.getElementById("recipe-editor-preparation-time-minutes"),
                    },
                    cookingTime: {
                        days: document.getElementById("recipe-editor-cooking-time-days"),
                        hours: document.getElementById("recipe-editor-cooking-time-hours"),
                        minutes: document.getElementById("recipe-editor-cooking-time-minutes"),
                    },
                    estimatedPrice: {
                        from: document.getElementById("recipe-editor-estimated-price-from"),
                        to: document.getElementById("recipe-editor-estimated-price-to"),
                    }
                },
            },
        };

        // Global states
        let globalVariables = {
            page: 1, // The recipe group loaded represented as 'page'
            user: {
                veganMode: initialData.userProfileData.vegan_mode,
                username: initialData.userProfileData.username,
                userId: initialData.userProfileData.user_id,
                review_recipe_id: initialData.userProfileData.review_recipe_id,
            },
            // Hint window timer
            hintWindowTimer: null,
            recipes: [],
            // A managed comment state for the recipe viewer component
            currentComment: "", 
            // Sidebar filter settings
            filterObject: {...DEFAULT_FILTER_OBJECT},
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
        initPage(globalHTML, globalVariables);
    }catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
});

export const initPage = async (globalHTML, globalVariables) => {
    setLoading(true);
    try {
        // Set initial states
        await setInitialStates(globalHTML, globalVariables);
        // Generate HTML
        generateHTML(globalHTML, globalVariables);
        // Configure listeners
        configureListeners(globalHTML, globalVariables);

        globalHTML.createRecipeButton.addEventListener('click', function(e) {
            e.preventDefault();
            recipeEditor(globalHTML, globalVariables, "NEW RECIPE");
        });

        // Show my recipes button
        globalHTML.accountButton.myRecipes.style.display = "block";
        globalHTML.accountButton.myRecipes.addEventListener('click', async function(e) {
            // Reset filter
            globalVariables.filterObject = {...DEFAULT_FILTER_OBJECT};
            // Set user id as a filter
            globalVariables.filterObject.userId = globalVariables.user.userId;
            // Clean up feed and load page 1
            cleanUpFeed(globalHTML, globalVariables);
            await getRecipePage(1, globalHTML, globalVariables);
            globalHTML.topText.innerText = "Showing only your recipes";
        });

        handleBottlePostNotifications(globalHTML, globalVariables);
    }catch(error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
};

export const handleBottlePostNotifications = async (globalHTML, globalVariables) => {
    const init = async () => {
        /* Make the bottle post review button appear after a slight delay
        if the user is allowed to review. */
        if (globalVariables.user.review_recipe_id !== null){
            globalHTML.bottlePostNotificationButton.style.display = "block";
            // Pop-up effect with a slight delay
            setTimeout(() => {
                globalHTML.bottlePostNotificationButton.style.transform = "scale(1)";
            }, 2500);
            
            globalHTML.bottlePostNotificationButton
                .addEventListener("click", async () => {
                // Reset filter
                globalVariables.filterObject = {...DEFAULT_FILTER_OBJECT};
                // Add recipe_id filter
                globalVariables.filterObject.recipe_id = globalVariables
                    .user.review_recipe_id;
                cleanUpFeed(globalHTML, globalVariables);
                await getRecipePage(1, globalHTML, globalVariables);
                // Alert vegan-mode users that the recipe might be hidden
                if (globalVariables.user.veganMode){
                    // Hint window message
                    const hintWindowHtml = `
                        <p>
                            You might need to disable vegan mode to see anything on this page! 
                        </p>
                    `;
                    hintWindow(globalVariables, globalHTML, hintWindowHtml);
                }
            });
        }
    };
    await init();
};

export const generateHTML = (globalHTML, globalVariables) => {
    // Sidebar search areas checkboxes
    htmlSidebarSearchAreas(globalHTML, globalVariables);
    // Sidebar include filters (vegan, vegetarian, meat)
    htmlSidebarFilters(globalHTML, globalVariables);
};

/**
 * Sets the initial states when the user arrives after a page load.
 * 
 */
export const setInitialStates = async (globalHTML, globalVariables) => {
    // Set vegan mode button color
    globalHTML.veganIcon.style.color = veganModeColor(globalVariables.user.veganMode);
    // Load the first recipe group
    await getRecipePage(1, globalHTML, globalVariables);
};

