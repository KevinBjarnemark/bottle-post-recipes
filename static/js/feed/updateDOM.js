import { trimText } from "../helpers.js";
import { buildRecipeViewer } from "./generateHTML.js";

/**
 * Sets the innerHTML of hint_window.html component and clear it after 
 * 5 seconds.
 * 
 * @param {Object}  globalVariables
 * @param {Object}  globalHTML
 * @param {String}  html The html string to insert in the hint window
 */
export const hintWindow = (globalVariables, globalHTML, html) => {
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
 * Removes all recipes 
 * 
 * @param {Object}  globalHTML 
 * @param {Object}   globalVariables
 */
export const cleanUpFeed = (globalHTML, globalVariables) => {
    globalHTML.feed.innerHTML = '';
    globalVariables.recipes = [];
};

/**
 * Toggles the vegan_mode state (in Profile model) and 
 * triggers the hint window to display an informative 
 * message to the user. 
 * 
 */
export const filterVeganRecipes = (globalVariables) => {
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
    });
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
export const renderRecipes = (data, globalHTML, globalVariables) => {
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
    const totalRecipes = data.total_recipes;
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
                    <div class="recipe-item-background backdrop-blur"></div>
                    <h4 class="recipe-item-title backdrop-blur">
                        ${trimText(recipe.title, 20)}
                    </h4>
                    <button class="absolute-flex right-fib-1 top-fibb-1 
                        recipe-item-user-image-container interactive-turn">
                        <img 
                            src="${recipe.user_image ? 
                                recipe.user_image : '/static/images/icons/missing.webp'}" 
                            alt="User Profile Picture" 
                        />
                    </button>
                    <div class="flex-row">
                        <div class="flex-column">
                            <button
                                id="recipe-image-button-${recipe.id}" 
                                class="flex-center interactive-turn">
                                <img 
                                    src="${recipe.image ? 
                                        recipe.image : '/static/images/icons/missing.webp'}" 
                                    alt="${recipe.title}">
                            </button>
                        </div>
                        <button class="d-flex align-items-start justify-content-center 
                            recipe-item-sidebar-right pt-5 mt-2 interactive-turn">
                            ${recipe.in_ocean ? 
                                '<i class="fa-solid fa-water recipe-item-in-ocean-icon"></i>' 
                                : 
                                ''}
                        </button>
                    </div>
                    <button class="absolute-flex recipe-item-bottle-post-count-container interactive-turn">
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
                            <i class="fa-solid fa-comment text-white interactive-turn"></i>
                            <span class="text-white">0</span>
                        </button>
                        <button class="incremental-icon-button">
                            <i class="fa-solid fa-heart text-white interactive-turn"></i>
                            <span class="text-white">${recipe.likes}</span>
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
        // Build the recipe viewer component
        buildRecipeViewer(globalVariables);
    }else {
        hintWindow(globalVariables, globalHTML, "<p>All recipes are loaded!</p>");
    }
};

export const getRecipePage = async (page, globalHTML, globalVariables) => {
    // Test fix, for some reason, tests can't read initial values
    if (globalVariables.filterObject === undefined){
        globalVariables.filterObject = {
            q: "",
            searchAreas: [],
            recipeTypes: {
                vegan: true,
                vegetarian: true,
                fish: true,
                meat: true,
            }
        };
    }

    let additionalParametersObject = {
        q: globalVariables.filterObject.q,
        search_areas: "",
        recipe_types_exclude: "",
    };

    /* Convert the included search areas array to a 
    comma separated string */
    const searchAreas = globalVariables.filterObject.searchAreas;
    if (Array.isArray(searchAreas) && searchAreas.length > 0) {
        // Initialize the entry
        additionalParametersObject.search_areas = "";
        // Create a comma separated string
        searchAreas.forEach((i, index) => {
            const addComma = index < searchAreas.length -1 ? "," : "";
            additionalParametersObject.search_areas += i + addComma;
        });
        // Trim whitespaces
        additionalParametersObject.search_areas.replace(/,\s*$/, "").trim();
    }

    // Convert dietary types to a comma separated string
    // Filter only the 'false' ones to exclude
    const recipeTypes = Object.entries(globalVariables.filterObject.recipeTypes)
        .filter(([, value]) => !value); 
        recipeTypes.forEach((i, index) => {
        const addComma = index < recipeTypes.length - 1 ? "," : "";
        additionalParametersObject.recipe_types_exclude += i[0] + addComma;
    });

    // Additional filters (concatenated string)
    let additionalParameters = "";
    Object.entries(additionalParametersObject).forEach(([key, value]) => {
        // Only add declared parameters
        if (value) {
            additionalParameters += `&${key}=${value}`;
        }
    });

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
