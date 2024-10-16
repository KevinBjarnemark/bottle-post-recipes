import { getCookie, trimText } from './helpers.js';

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
        searchButton: document.getElementById('search-button'),
        // Filter
        sidebarFilterButton: document.getElementById('sidebar-filter-button'),
        filterContainer: document.getElementById('filter-container'),
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
            "search-area-tags"
        ],
        sidebarSettingContainers: [
            "search-container",
            "filter-container",

        ],
    };

    // Set initial states
    setInitialStates(globalHTML, globalVariables);
    // Configure listeners
    configureListeners(globalHTML, globalVariables);
});

/**
 * Removes all recipes 
 * 
 * @param {Object}  globalHTML 
 * @param {Object}   globalVariables
 */
const cleanUpFeed = (globalHTML, globalVariables) => {
    globalHTML.feed.innerHTML = '';
    globalVariables.recipes = [];
};

/**
 * Adds or removes an item from the search query include array
 * in sync with the event.target.checked.
 * 
 * @param {Object}  globalVariables
 * @param {Object}   checked event.target.checked
 * @param {str}   area eg. tags, description, ingredients
 */
const toggleQIncludeItems = (globalVariables, checked, area) => {
    const array = globalVariables.filterObject.search_areas;
    // Add (if it doesn't exist)
    if (checked) {
        if (!array.includes(area)) {
            array.push(area);
        }
    }else {
        const newArray = array.filter(item => item !== area);
        globalVariables.filterObject.search_areas = newArray;
    }
};

/**
 * Configure sidebar listeners such as search settings
 * 
 * @param {Object}  globalHTML
 * @param {Object}   globalVariables
 */
const configureSidebarListeners = (globalHTML, globalVariables) => {
    // Settings obejct
    const sidebarButtonsObject = [
        {
            containerEntry: "searchContainer", // globalHTML
            buttonEntry: "sidebarSearchButton", // globalHTML
            icon: "magnifying-glass"
        },
        {
            containerEntry: "filterContainer", // globalHTML
            buttonEntry: "sidebarFilterButton", // globalHTML
            icon: "filter"
        },
    ];
    
    // Setting containers and buttons
    sidebarButtonsObject.forEach(i => {
        globalHTML[i.buttonEntry].addEventListener("click", async () => {
            // Close other open setting containers
            sidebarButtonsObject.forEach(iNested => {
                const containerIsOpen = globalHTML[iNested.containerEntry].
                    style.display === "flex";
                if (containerIsOpen && iNested.containerEntry !== i.containerEntry) {
                    toggleSidebarSettings(
                        globalHTML, 
                        iNested.icon, 
                        iNested.containerEntry, 
                        iNested.buttonEntry
                    );
                }
            });
            toggleSidebarSettings(globalHTML, i.icon, i.containerEntry, i.buttonEntry);
        });
    });

    // Search input
    globalHTML.searchInput.addEventListener("keyup", async function(event) {
        globalVariables.filterObject.q = event.target.value;
    });

    // Search button
    globalHTML.searchButton.addEventListener("click", async () => {
        cleanUpFeed(globalHTML, globalVariables);
        await getRecipePage(1, globalHTML, globalVariables);
    });

    // Set up listeners for all search area boolean checkboxes
    globalVariables.searchAreaBoolIds.forEach(id => {
        const element = document.getElementById(id);
        // Extract the search area name
        const searchAreaName = id.split("-").pop();

        element.addEventListener("change", async function(event) {
            toggleQIncludeItems(globalVariables, event.target.checked, searchAreaName);
        });
    });
};

/**
 * Configures the listeners that should be active on page load
 * 
 * @param {Object}  globalHTML
 * @param {Object}   globalVariables
 */
const configureListeners = (globalHTML, globalVariables) => {
    // Toggle vegan mode button
    globalHTML.veganButton.addEventListener("click", () => {
        toggleVeganMode(globalHTML, globalVariables)
    });

    // Load recipes in groups
    globalHTML.loadRecipesButton.addEventListener("click", async () => {
        globalVariables.page++; // Increment page number
        await getRecipePage(globalVariables.page, globalHTML, globalVariables);
    });

    configureSidebarListeners(globalHTML, globalVariables);
};

/**
 * 1. Toggles the container and its content (with CSS)
 * 
 * 2. Changes the previous icon to a close button when 
 * toggled
 *  
 * 
 * @param {Object}  globalHTML
 * @param {str}   icon Font awesome declaration eg. "magnifying-glass"
 * the container
 * @param {str}   containerEntry The entry (in globalHTML) pointing to 
 * the container
 * @param {str}   buttonEntry The entry (in globalHTML) pointing to 
 * the button
 */
const toggleSidebarSettings = (globalHTML, icon, containerEntry, buttonEntry) => {
    // Display attribute
    const previousAttribute = globalHTML[containerEntry].style.display;
    // If it's previously hidden, show or vice versa
    if (!previousAttribute || previousAttribute === "none") {
        globalHTML[containerEntry].style.display = "flex";
        // Transform search icon to an X button
        globalHTML[buttonEntry].innerHTML = 
            "<i class='fa-solid fa-x' style='color: rgb(255, 93, 93)'></i>";
    }else {
        globalHTML[containerEntry].style.display = "none";
        globalHTML[buttonEntry].innerHTML = 
            `<i class='fas fa-${icon}'></i>`;
    }
};

const getRecipePage = async (page, globalHTML, globalVariables) => {
    // Test fix, for some reason, tests can't read initial values
    if (globalVariables.filterObject === undefined){
        globalVariables.filterObject = {
            q: "",
            search_areas: [],
        }
    }

    let filterObject = {
        "q": globalVariables.filterObject.q,
    };

    /* Convert the included search areas array to a 
    comma separated string */
    const qInclude = globalVariables.filterObject["search_areas"]
    if (Array.isArray(qInclude) && qInclude.length > 0) {
        // Initialize the entry
        filterObject["search_areas"] = "";
        // Create a comma separated string
        qInclude.forEach((i, index) => {
            const addComma = index < qInclude.length -1 ? "," : "";
            filterObject["search_areas"] += i + addComma;
        });
        // Trim whitespaces
        filterObject["search_areas"].replace(/,\s*$/, "").trim();
    }


    // Additional filters (concatenated string)
    let additionalParameters = ""
    if (filterObject.q || filterObject.search_areas) {
        Object.entries(filterObject).forEach(([key, value]) => {
            additionalParameters += `&${key}=${value}`;
        });
    }

    // Fetch recipe 'group'
    const response = await fetch(
        `/load_recipes?page=${page}${additionalParameters}`
    );
    const data = await response.json();

    // Handle no recipes found and then render recipes
    if (data.total_recipes === 0) {
        hintWindow(globalVariables, globalHTML, "<p>Couldn't find any recipes.</p>");
    }else {
    // Append new recipes to the recipe feed
    renderRecipes(data, globalHTML, globalVariables);
    }
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

/**
 * Sets the innerHTML of hint_window.html component and clear it after 
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
 * Renders recipes in groups determined by the backend.
 * 
 * 1. Calculates how many items to render on the last page
 * 
 * 2. Creates HTML elements for each recipe and displays 
 * them on the recipe feed (but hidden by default in CSS 
 * class)
 * 
 * 3. Adds the recipes to the global recipe variable
 * 
 * 4. Filters out vegan recipes and displays the recipes 
 * afterwards
 * 
 * @param {Object}  data Data from backend {recipes, total_recipes, batch}
 * @param {Object}   globalHTML
 * @param {Object}   globalVariables
 */
const renderRecipes = (data, globalHTML, globalVariables) => {
    /* 
        Fix testing issue 
        For some reason JEST tests identify this as 
        something other than an array despite it 
        is already decalred as such.
    */
    if (!Array.isArray(globalVariables.recipes)) {
        globalVariables.recipes = [];
    }


    let recipesToRender = data.batch;
    const recipeAmount = globalVariables.recipes.length;
    const totalRecipes = data['total_recipes'];
    /* If it's the last recipe group, only calculate how 
    many items to render */
    if (recipeAmount + recipesToRender > totalRecipes){
        recipesToRender = totalRecipes - recipeAmount;
    }

    const fetchedRecipes = data.recipes;
    if (recipesToRender > 0){
        const limitedFetchedRecipes = fetchedRecipes.slice(0, recipesToRender);

        // Append new recipes to the recipe feed
        limitedFetchedRecipes.forEach(recipe => {
            // Create a container for each recipe
            const recipeContainer = document.createElement('section');
            recipeContainer.className = 'recipe-item-container recipe-item';
            recipeContainer.id = `recipe-item-${recipe.id}`;

            // Recipe item
            recipeContainer.innerHTML = `
                <h1 class="hidden-heading">${recipe.title}</h1>
                <div class="flex-column">
                    <div class="recipe-shadow"></div>
                    <h4>${recipe.title}</h4>
                    <button class="absolute-flex right-fib-1 top-fibb-1 
                        recipe-item-user-image-container">
                        <img 
                            src="${recipe.user_image ? 
                                recipe.user_image : '/static/images/icons/missing.webp'}" 
                            alt="User Profile Picture" 
                        />
                    </button>
                    <div class="flex-row">
                        <div class="flex-column">
                            <img 
                                src="${recipe.image ? 
                                    recipe.image : '/static/images/icons/missing.webp'}" 
                                alt="${recipe.title}">
                        </div>
                        <div class="d-flex align-items-start justify-content-center 
                            recipe-item-sidebar-right pt-5">
                            ${recipe.in_ocean ? 
                                '<i class="fa-solid fa-water recipe-item-in-ocean-icon"></i>' 
                                : 
                                ''}
                        </div>
                    </div>
                    <button class="absolute-flex recipe-item-bottle-post-count-container">
                        <div class="absolute-flex recipe-item-bottle-post-red-count">
                            ${recipe.bottle_posted_count}
                        </div>
                        <img 
                            src="/static/images/global/logo.png" 
                            alt="Bottle post icon" 
                            style="background-color: transparent;" />
                    </button>
                    <div class="recipe-item-bottom-bar">
                        <button class="incremental-icon-button">
                            <i class="fa-solid fa-comment"></i><span>0</span>
                        </button>
                        <button class="incremental-icon-button">
                            <i class="fa-solid fa-heart"></i><span>${recipe.likes}</span>
                        </button>
                    </div>
                    <div class="d-flex recipe-item-description-container">
                        <p class="flex-center">${trimText(recipe.description, 50)}</p>
                    </div>
                </div>
            `;
        
            // Append the recipe container to the feed
            globalHTML.feed.appendChild(recipeContainer);
            // Push to global variable
            globalVariables.recipes.push(recipe);
        });

        // Show recipes based on vegan mode
        filterVeganRecipes(globalVariables);
    }else {
        hintWindow(globalVariables, globalHTML, "<p>All recipes are loaded!</p>");
    }
}

/**
 * Toggles the vegan_mode state (in Profile model) and 
 * triggers the hint window to display an informative 
 * message to the user. 
 * 
 */
const filterVeganRecipes = (globalVariables) => {
   /*  const slicedRecipes = globalVariables.recipes.slice(
        globalVariables.recipes.length - slice, slice); */

        globalVariables.recipes.forEach(i => {
            const recipeItem = document.getElementById(`recipe-item-${i.id}`);
            if (globalVariables.veganMode){
                if (!i.vegan){
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
export { 
    veganModeColor, 
    setInitialStates, 
    toggleVeganMode, 
    hintWindow, 
    renderRecipes,
    filterVeganRecipes,
};
