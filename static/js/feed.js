import { getCookie } from './helpers.js';

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
        veganStatusText: document.querySelector('h2'),
        loadRecipesButton: document.getElementById('load-recipes-button'),
    };

    // Global states
    let globalVariables = {
        veganMode: initialData.userProfileData.vegan_mode,
        hintWindowTimer: null,
        recipes: [],
        total_recipes: 0,
    };

    // Set initial states
    setInitialStates(globalHTML, globalVariables);

    // Listener (load recipes in groups)
    let page = 1;
    globalHTML.loadRecipesButton.addEventListener("click", async () => {
        page++; // Increment page number
        await getRecipePage(page, globalHTML, globalVariables);
    });

    // Listener (toggle vegan mode button)
    globalHTML.veganButton.addEventListener("click", () => {
        toggleVeganMode(globalHTML, globalVariables)});
    });

const getRecipePage = async (page, globalHTML, globalVariables) => {
    // Fetch recipe 'group'
    const response = await fetch(`/load_recipes?page=${page}`);
    const data = await response.json();
    // Append new recipes to the recipe feed
    renderRecipes(data, globalHTML, globalVariables);
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
                    <button class="absolute-flex right-fib-1 top-fibb-1 recipe-item-user-image-container">
                        <img src="${recipe.user_image ? recipe.user_image : '/static/images/icons/missing.webp'}" alt="User Profile Picture" />
                    </button>
                    <button class="absolute-flex recipe-item-bottle-post-count-container">
                        <div class="absolute-flex recipe-item-bottle-post-red-count">${recipe.bottle_posted_count}</div>
                        <img src="/static/images/global/logo.png" alt="Bottle post icon" style="background-color: transparent;" />
                    </button>
                    <div class="flex-row">
                        <div class="flex-column">
                            <img src="${recipe.image ? recipe.image : '/static/images/icons/missing.webp'}" alt="${recipe.title}">
                        </div>
                        <div class="d-flex align-items-start justify-content-center recipe-item-sidebar-right pt-5">
                            ${recipe.in_ocean ? '<i class="fa-solid fa-water recipe-item-in-ocean-icon"></i>' : ''}
                        </div>
                    </div>
                    <div class="recipe-item-bottom-bar">
                        <button class="incremental-icon-button"><i class="fa-solid fa-comment"></i><span>0</span></button>
                        <button class="incremental-icon-button"><i class="fa-solid fa-heart"></i><span>${recipe.likes}</span></button>
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
