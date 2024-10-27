

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
            description: "Test description",
            instructions: "Test instructions",
            dietary_attributes: ["soy"],
            ingredients: [
                {name: "Kale", quantity: "3 handfuls of"},
                {name: "Olive oil", quantity: "1/4 cup of"},
            ],
            bottle_posted_count: 5,
            image: null,
            user_image: null,
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
            user_image: null,
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
            user_image: null,
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
            user_image: null,
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
total_recipes: 4,
batch: 6,
};

export const getFeedGlobalHtmlMockData = () => {
    const elements = {
        // Feed
        feed: { tag: 'div', id: 'feed' },
        feedContainer: { tag: 'div', id: 'feed-container' },
        feedContainer: { tag: 'div', id: 'feed-container' },
        loadRecipesButton: { tag: 'button', id: 'load-recipes-button' },
        // Sidebar
        feedContainer: { tag: 'div', id: 'feed-sidebar-buttons-container' },
        sidebarSearchButton: { tag: 'button', id: 'sidebar-search-button' },
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
        // Hint window
        hintWindow: { tag: 'div', id: 'hint-window' },
        hintWindowText: { tag: 'div', id: 'hint-window-text' },
        // Recipe viewer
        recipeViewerContainer: { tag: 'section', id: 'recipe-viewer-container' },
        recipeViewer: { tag: 'div', id: 'recipe-viewer' },
        recipeViewerGenerated: { tag: 'div', id: 'recipe-viewer-generated' },
    };

    // Create and append the elements to the document body
    const globalHTML = {};
    Object.entries(elements).forEach(([key, { tag, id }]) => {
        const element = document.createElement(tag);
        // Assign ID
        element.id = id;
        // Append to DOM
        document.body.appendChild(element);
        // Build the globalHTML that will be returned
        globalHTML[key] = element;
    });

    return globalHTML;
};

export const getFeedGlobalVariablesMockData = () => {
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
                },
            eventListeners: {},
        };
};

