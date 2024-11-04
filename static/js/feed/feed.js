import { htmlSidebarFilters, htmlSidebarSearchAreas } from './generate_html.js';
import { configureListeners } from './listeners.js';
import { getRecipePage, cleanUpFeed } from './update_dom.js';
import { veganModeColor } from '../helpers.js';
import { recipeEditor } from '../feed/recipe_editor.js';
import { DEFAULT_FILTER_OBJECT } from '../constants.js';
import { displayClientError, setLoading } from '../app.js';

document.addEventListener("DOMContentLoaded", function() {
    setLoading(true);
        try {
        // Data loaded from db
        const initialData = {
            userProfileData: JSON.parse(document.getElementById('user-profile-data').textContent),
        };
        // Targeted HTML elements
        const feedHTML = {
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
        let feedVariables = {
            page: 1, // The recipe group loaded represented as 'page'
            user: {
                veganMode: initialData.userProfileData.vegan_mode,
                username: initialData.userProfileData.username,
                userId: initialData.userProfileData.user_id,
                review_recipe_id: initialData.userProfileData.review_recipe_id,
            },
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
        initPage(feedHTML, feedVariables);
    }catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
});

export const loadUserRecipes = async (feedHTML, feedVariables, userId, username) => {
    const init = async () => {
        setLoading(true);
        try {
            // Reset filter
            feedVariables.filterObject = {...DEFAULT_FILTER_OBJECT};
            // Set user id as a filter
            feedVariables.filterObject.userId = userId;
            // Clean up feed and load page 1
            cleanUpFeed(feedHTML, feedVariables);
            await getRecipePage(1, feedHTML, feedVariables);
            if (userId === feedVariables.user.userId) {
                feedHTML.topText.innerText = "Showing only your recipes";
            }else {
                feedHTML.topText.innerText = `Showing only recipes made by ${username}`;
            }
        }catch (error) {
            displayClientError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    await init();
};

export const initPage = async (feedHTML, feedVariables) => {
    setLoading(true);
    try {
        // Set initial states
        await setInitialStates(feedHTML, feedVariables);
        // Generate HTML
        generateHTML(feedHTML, feedVariables);
        // Configure listeners
        configureListeners(feedHTML, feedVariables);

        feedHTML.createRecipeButton.addEventListener('click', function(e) {
            e.preventDefault();
            recipeEditor(feedHTML, feedVariables, "NEW RECIPE");
        });

        // Show my recipes button and add listener
        window.appHTML.accountButton.myRecipes.style.display = "block";
        window.appHTML.accountButton.myRecipes.addEventListener(
            'click', async () => {
                await loadUserRecipes(
                    feedHTML, 
                    feedVariables, 
                    feedVariables.user.userId
                );
        });

        handleBottlePostNotifications(feedHTML, feedVariables);
    }catch(error) {
        displayClientError(error.message)
    } finally {
        setLoading(false);
    }
};

export const handleBottlePostNotifications = async (feedHTML, feedVariables) => {
    const init = async () => {
        setLoading(true);
        try {
            /* Make the bottle post review button appear after a slight delay
            if the user is allowed to review. */
            if (feedVariables.user.review_recipe_id !== null){
                feedHTML.bottlePostNotificationButton.style.display = "block";
                // Pop-up effect with a slight delay
                setTimeout(() => {
                    feedHTML.bottlePostNotificationButton.style.transform = "scale(1)";
                }, 2500);
                
                feedHTML.bottlePostNotificationButton
                    .addEventListener("click", async () => {
                    // Reset filter
                    feedVariables.filterObject = {...DEFAULT_FILTER_OBJECT};
                    // Add recipe_id filter
                    feedVariables.filterObject.recipe_id = feedVariables
                        .user.review_recipe_id;
                    cleanUpFeed(feedHTML, feedVariables);
                    await getRecipePage(1, feedHTML, feedVariables);
                });
            }
        }catch (error) {
            displayClientError(error.message);
        } finally {
            setLoading(false);
        }
    };
    await init();
};

export const generateHTML = (feedHTML, feedVariables) => {
    setLoading(true);
    try {
        // Sidebar search areas checkboxes
        htmlSidebarSearchAreas(feedHTML, feedVariables);
        // Sidebar include filters (vegan, vegetarian, meat)
        htmlSidebarFilters(feedHTML, feedVariables);
    }catch (error) {
        displayClientError(error.message);
    } finally {
        setLoading(false);
    }
};

/**
 * Sets the initial states when the user arrives after a page load.
 * 
 */
export const setInitialStates = async (feedHTML, feedVariables) => {
    // Set vegan mode button color
    feedHTML.veganIcon.style.color = veganModeColor(feedVariables.user.veganMode);
    // Load the first recipe group
    await getRecipePage(1, feedHTML, feedVariables);
};
