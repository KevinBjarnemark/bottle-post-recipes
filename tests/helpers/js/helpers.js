

/**
 * 4 recipes (vegan, vegetarian, fish, meat)
 * 
 * 
 */
export const MOCKRECIPEDATA = {
    recipes: [
        {
            id: 1,
            user_id: 0,
            title: "Vegan Recipe",
            vegan: true,
            recipe_type: "vegan",
            description: "Test description",
            instructions: "Test instructions",
            dietary_attributes: ["soy"],
            ingredients: [
                {name: "Kale", quantity: "3 handfuls of"},
                {name: "Olive oil", quantity: "1/4 cup of"},
            ],
            bottle_posted_count: 5,
            image: null,
            in_ocean: true,
            user_image: null,
            comments: [
                {
                    user: "Test user",
                    text: "Test comment",
                    created_at: "2024-01-01 00 00 00",
                }
            ],
        },
        {// Note, no comment
            id: 2,
            user_id: 0,
            recipe_type: "vegetarian",
            vegan: false,
            title: "Vegetarian Recipe",
            description: "Test description",
            instructions: "Test instructions",
            dietary_attributes: ["meat"],
            ingredients: [
                {name: "Mozzarella", quantity: "100g"},
                {name: "Olive oil", quantity: "1/4 cup of"},
            ],
            bottle_posted_count: 5,
            image: null,
            in_ocean: true,
            user_image: null,
            comments: [],
        },
        {
            id: 3,
            user_id: 0,
            recipe_type: "fish",
            vegan: false,
            title: "Fish Recipe",
            description: "Test description",
            instructions: "Test instructions",
            dietary_attributes: ["fish"],
            ingredients: [
                {name: "Salmon", quantity: "300g"},
                {name: "Olive oil", quantity: "1/4 cup of"},
            ],
            bottle_posted_count: 5,
            image: null,
            in_ocean: true,
            user_image: null,
            comments: [
                {
                    user: "Test user",
                    text: "Test comment",
                    created_at: "2024-01-01 00 00 00",
                }
            ],
        },
        {
            id: 4,
            user_id: 0,
            recipe_type: "meat",
            vegan: false,
            title: "Meat Recipe",
            description: "Test description",
            instructions: "Test instructions",
            dietary_attributes: ["meat"],
            ingredients: [
                {name: "Chicken", quantity: "300g"},
                {name: "Olive oil", quantity: "1/4 cup of"},
            ],
            bottle_posted_count: 5,
            image: null,
            in_ocean: true,
            user_image: null,
            comments: [
                {
                    user: "Test user",
                    text: "Test comment",
                    created_at: "2024-01-01 00 00 00",
                }
            ],
        },
    ],
    success: true,
    error: "",
    total_recipes: 4,
    batch: 6,
};

/**
 * Creates/mocks HTML elements based on a pre-defined object. 
 * 
 *  
 * @param {Object}  elements NOTE! Only support single nested items. 
 *  { tag: 'section', id: 'hint-window' },
        hintWindowText: { tag: 'p', id: 'hint-window-text' },
 * Example:
 * {
 *      HtmlElementA: {tag: 'section', id: "a"}, // OK
 *      HtmlElementB: {
 *          HtmlElementANested: {tag: 'div', id: "a-nested"}, // OK
 *          HtmlElementBNested: {
 *              notSupported: {tag: 'p', id: "not-supported"}, // NOT SUPPORTED!
 *          },
 *      }, 
 * }
 * @param {Array}   nestedKeys Array of strings. Should 
 * contain the key names of the single nested items if any. 
 * @returns {any}  The HTML elements assigned to the keys 
 * declared in the elements parameter.
 */
const createAndDestructHtmlMockData = (elements, nestedKeys) => {
    // Create and append the elements to the document body
    const htmlObj = {};
    /*  
        1. Send all HTML to the DOM with special handling for nested elements.  
        2. Build the html object
    */
        Object.entries(elements).forEach(([key, value]) => {
            if (nestedKeys.includes(key)) {
                // Handle nested elements
                htmlObj[key] = {}; // Ensure this is an object for nested elements
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                    const nestedElement = document.createElement(nestedValue.tag);
                    nestedElement.id = nestedValue.id;
                    document.body.appendChild(nestedElement);
                    htmlObj[key][nestedKey] = nestedElement;
                });
            } else {
                // Handle non-nested elements
                const element = document.createElement(value.tag);
                element.id = value.id;
                document.body.appendChild(element);
                htmlObj[key] = element;
            }
        });

    return htmlObj;
};

/**
 * Mock the feedHTML in feed.js
 * 
 * @returns {any} A mocked feedHTML
 */
export const getFeedHtmlMockData = () => {
    const elements = {
        // Feed
        feed: { tag: 'div', id: 'feed' },
        feedContainer: { tag: 'div', id: 'feed-container' },
        topText: { tag: 'h1', id: 'feed-top-text' },
        loadRecipesButton: { tag: 'button', id: 'load-recipes-button' },
        bottlePostNotificationButton: { tag: 'button', id: 'bottle-post-notification-button' },
        // Sidebar
        feedSidebarButtonsContainer: { tag: 'div', id: 'feed-sidebar-buttons-container' },
        sidebarSearchButton: { tag: 'button', id: 'sidebar-search-button' },
        createRecipeButton: { tag: 'button', id: 'create-recipe-button' },
        // Search
        searchContainer: { tag: 'div', id: 'search-container' },
        searchInput: { tag: 'input', id: 'search-input' },
        searchAreas: { tag: 'div', id: 'search-areas' },
        searchButton: { tag: 'button', id: 'search-button' },
        /// Filter
        sidebarFilterButton: { tag: 'button', id: 'sidebar-filter-button' },
        filterContainer: { tag: 'div', id: 'filter-container' },
        filters: { tag: 'div', id: 'filters' },
        filterButton: { tag: 'button', id: 'filter-button' },
        // Vegan button
        veganButton: { tag: 'button', id: 'vegan-mode-button' },
        veganIcon: { tag: 'i', id: 'vegan-mode-icon' },
        // Recipe viewer
        recipeViewer: {
            reviewSection: { tag: 'section', id: 'recipe-review-section' },
            container: { tag: 'section', id: 'recipe-viewer-container' },
            info: { tag: 'section', id: 'recipe-viewer-info' },
            title: { tag: 'h2', id: 'recipe-viewer-title' },
            image: { tag: 'img', id: 'recipe-viewer-image' },
            description: { tag: 'p', id: 'recipe-viewer-description' },
            instructions: { tag: 'p', id: 'recipe-viewer-instructions' },
            ingredients: { tag: 'ul', id: 'recipe-viewer-ingredients' },
            dietaryAttributes: { tag: 'div', id: 'recipe-viewer-dietary-attributes' },
            comments: { tag: 'div', id: 'recipe-viewer-comments' },
            commentInput: { tag: 'textarea', id: 'recipe-viewer-comment-input' },
        },
        // Recipe editor
        recipeEditor: {
            container: { tag: 'section', id: 'recipe-editor-container' },
            deleteButtonContainer: { tag: 'section', id: 'recipe-editor-delete-button-container' },
            deleteButton: { tag: 'button', id: 'recipe-editor-delete-button' },
            mainTitle: { tag: 'span', id: 'recipe-editor-main-title' },
            mainInfo: { tag: 'div', id: 'recipe-editor-main-info' },
            imagePreviewContainer: { tag: 'div', id: 'recipe-editor-image-preview-container' },
            /* textInputs: {
                title: { tag: 'input', id: 'recipe-editor-title' },
                description: { tag: 'textarea', id: 'recipe-editor-description' },
                instructions: { tag: 'textarea', id: 'aaaaaaaaaaaaa' },
                tags: { tag: 'input', id: 'recipe-editor-tags' },
            },
            ingredient: {
                quantity: { tag: 'input', id: 'recipe-editor-ingredient-quantity' },
                name: { tag: 'input', id: 'recipe-editor-ingredient-name' },
                addButton: { tag: 'button', id: 'aaaaaaaaaaaaa' },
            }, */
            ingredients: { tag: 'ul', id: 'recipe-editor-added-ingredients' },
            dietaryAttributes: { tag: 'div', id: 'recipe-editor-dietary-attributes' },
        },
    };

    // Nested keys
    const nestedKeys = [
        "recipeViewer",
        "recipeEditor",
        "accountButton",
    ];

    const htmlObject = createAndDestructHtmlMockData(elements, nestedKeys);
    return htmlObject;
};

export const getFeedVariablesMockData = () => {
    return {
            page: 1,
            user: {
                veganMode: true,
                username: "Test user",
                userId: 0,
            },
            hintWindowTimer: null,
            recipes: [],
            currentComment: "", 
            filterObject: 
                {
                    q: "", 
                    searchAreas: [], 
                    recipeTypes: {
                        vegan: true,
                        vegetarian: true,
                        fish: true,
                        meat: true,
                    },
                    userId: 0,
                    recipe_id: "",
                },
            eventListeners: {},
        };
};

/**
 * Mock the feedHTML in feed.js
 * 
 * @returns {any} A mocked feedHTML
 */
export const getAppHtmlMockData = () => {
    const elements = {
        loadingContainer: { tag: 'section', id: 'account-button-my-recipes' },
        accountButton: {
            deleteAccountButton: { 
                tag: 'button', 
                id: 'account-button-delete-account-button' 
            },
            myRecipes: { tag: 'button', id: 'account-button-my-recipes' },
        },
        hintWindow: { tag: 'section', id: 'hint-window' },
        hintWindowText: { tag: 'p', id: 'hint-window-text' },
        passwordConfirmationPopUp: {
            container: { tag: 'section', id: 'password-confirmation-pop-up-container' },
            info: { tag: 'div', id: 'password-confirmation-pop-up-info' },
            input: { tag: 'input', id: 'password-confirmation-pop-up-input' },
            confirmButton: { tag: 'button', id: 'password-confirmation-pop-up-confirm-button' },
            closeButton: { tag: 'button', id: 'password-confirmation-pop-up-close-button' },
        }
    };

    // Nested keys
    const nestedKeys = ["passwordConfirmationPopUp", "accountButton"];

    const htmlObject = createAndDestructHtmlMockData(elements, nestedKeys);
    return htmlObject;
};

export const getAppVariablesMockData = () => {
    return {
        loadingItems: [],
        confirmPassword: "", 
        eventListeners: {},
        hintWindowTimer: null,
    };
};
