import { trimText, addStoredEventListener } from "../helpers.js";
import { recipeViewer } from "./recipe_viewer.js";
import { recipeEditor } from "./recipe_editor.js";
import { setLoading, hintWindow } from "../app.js";
import { loadUserRecipes } from "../feed/feed.js"; 

/**
 * Removes all recipes 
 * 
 * @param {Object}  feedHTML 
 * @param {Object}   feedVariables
 */
export const cleanUpFeed = (feedHTML, feedVariables) => {
    feedHTML.feed.innerHTML = '';
    feedVariables.recipes = [];
};

/**
 * Toggles the vegan_mode state (in Profile model) and 
 * triggers the hint window to display an informative 
 * message to the user. 
 * 
 */
export const filterVeganRecipes = (feedHTML, feedVariables) => {
    let veganRecipeCount = 0;
    let nonVeganRecipeCount = 0;

    feedVariables.recipes.forEach(i => {
        const recipeItem = document.getElementById(`recipe-item-${i.id}`);
        if (feedVariables.user.veganMode){
            if (!i.vegan){
                recipeItem.style.display = "none";
                nonVeganRecipeCount += 1;
            }else {
                recipeItem.style.display = "flex";
                veganRecipeCount += 1;
            }
        }else {
            recipeItem.style.display = "flex";
            veganRecipeCount += 1;
        }
    });

    // If all recipes are hidden, display message
    if (veganRecipeCount === 0 && nonVeganRecipeCount !== 0) {
        hintWindow(
            `<p>
                You need to disable vegan mode to view 
                the recipes on this page
                <i class="fa-solid fa-carrot"></i>
            </p>`,
        );
    }

    // Reset, just in case
    veganRecipeCount = 0;
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
 * @param {Object}   data Data from backend {recipes, total_recipes, batch}
 * @param {Object}   feedHTML
 * @param {Object}   feedVariables
 */
export const renderRecipes = (data, feedHTML, feedVariables) => {
    let recipesToRender = data.batch;
    const recipeAmount = feedVariables.recipes.length;
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
            const userIsAuthor = recipe?.user_id === feedVariables
                .user.userId;
            // Create a container for each recipe
            const recipeContainer = document.createElement('section');
            recipeContainer.className = 'recipe-item-container recipe-item';
            recipeContainer.id = `recipe-item-${recipe.id}`;

            // Recipe item
            const imageButtonId = `recipe-image-button-${recipe.id}`;
            recipeContainer.innerHTML = `
                <h1 class="hidden-heading">${recipe.title}</h1>
                <div class="flex-column">
                    <div class="${recipe.id === feedVariables.user.review_recipe_id ?
                        'recipe-item-background backdrop-blur allowed-review-glow' : 
                        'recipe-item-background backdrop-blur'}">
                    </div>
                    <h4 class="recipe-item-title backdrop-blur">
                        ${trimText(recipe.title, 20)}
                    </h4>
                    <button 
                        id="recipe-item-profile-image-button-${recipe.id}"
                        class="absolute-flex right-fib-1 top-fibb-1 
                            profile-image-container interactive-turn">
                        <img 
                            class="profile-image"
                            src="${recipe.user_image ? 
                                recipe.user_image : '/static/images/icons/missing.webp'}" 
                            alt="User Profile Picture" 
                        />
                    </button>
                    <div class="flex-row">
                        <div class="flex-column">
                            <button
                                id="${imageButtonId}"
                                class="flex-center interactive-turn">
                                <img 
                                    class="recipe-image"
                                    src="${recipe.image ? 
                                        recipe.image : '/static/images/icons/missing.webp'}" 
                                    alt="${recipe.title}">
                            </button>
                        </div>
                        <div class="flex-column recipe-item-sidebar-right">
                            <button 
                                id="ocean-status-button-${recipe.id}"
                                class="d-flex align-items-start justify-content-center 
                                pt-5 mt-2 interactive-turn">
                                ${recipe.in_ocean ? 
                                    '<i class="fa-solid fa-water recipe-item-in-ocean-icon pt-2"></i>' 
                                    : 
                                    '<i class="fa-solid fa-x text-red fs-4 pt-2"></i>'}
                            </button>
                            ${// Render edit button if the resipe blongs to the author
                                userIsAuthor ?
                                `
                                <button
                                    id="recipe-edit-button-${recipe.id}"
                                    class="d-flex align-items-start justify-content-center 
                                        pt-3 interactive-turn">
                                    <i class="fa-solid text-white fs-5 fa-edit"></i>
                                </button>
                                `
                            : ""}
                        </div>
                    </div>
                    <button class="absolute-flex recipe-item-bottle-post-count-container interactive-turn">
                        <div class="absolute-flex recipe-item-bottle-post-red-count">
                            ${recipe.bottle_posted_count}
                        </div>
                        <img
                            src="/static/images/global/logo_black.webp" 
                            alt="Bottle post icon" 
                            style="background-color: transparent;" />
                    </button>
                    <div class="recipe-item-bottom-bar">
                        <button 
                            id="comment-button-${recipe.id}"
                            class="incremental-icon-button">
                            <i class="fa-solid fa-comment text-white interactive-turn"></i>
                            <span class="text-white">
                                ${recipe.comments ? recipe.comments.length : 0}
                            </span>
                        </button>
                        <button 
                            id="recipe-item-like-button-${recipe.id}" 
                            class="incremental-icon-button">
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
            feedHTML.feed.appendChild(recipeContainer);

            // Push to global variable
            feedVariables.recipes.push(recipe);

            
            // Add and store event listener for the profile image button
            addStoredEventListener(
                feedVariables, 
                "click", 
                `recipe-item-profile-image-button-${recipe.id}`, 
                async () => {
                    await loadUserRecipes(
                        feedHTML, 
                        feedVariables, 
                        recipe.user_id,
                        recipe.username
                    );
                }
            );

            // Add and store event listener for the recipe editor button
            if (userIsAuthor) {
                addStoredEventListener(
                    feedVariables, 
                    "click", 
                    `recipe-edit-button-${recipe.id}`, 
                    () => {
                        recipeEditor(feedHTML, feedVariables, recipe.id);
                    }
                );
            }

            // Add and store event listener for the ocean status button
            addStoredEventListener(
                feedVariables, 
                "click", 
                `ocean-status-button-${recipe.id}`, 
                () => {
                    const htmlString = 
                        recipe.in_ocean ? 
                            `<p>
                                This recipe is in the ocean 
                                <i class="fa-solid fa-water text-blue"></i>
                            </p>
                            `
                        : 
                            `
                                <p>
                                    This recipe is not in the ocean 
                                    <i class="fa-solid fa-x text-red"></i>
                                </p>
                        `; 
                    hintWindow(htmlString);
                }
            );

            // Add and store event listener for the like button
            addStoredEventListener(
                feedVariables, 
                "click", 
                `recipe-item-like-button-${recipe.id}`, 
                () => {
                    const htmlString = 
                        `<p>
                            This feature is coming soon!
                            <i class="fa-solid fa-heart text-red"></i>
                        </p>
                        `;
                    hintWindow(htmlString);
                }
            );

            // Add and store event listener for the comment button
            addStoredEventListener(
                feedVariables, 
                "click", 
                `comment-button-${recipe.id}`, 
                () => {
                    recipeViewer(feedHTML, feedVariables, recipe.id);
                    feedHTML.recipeViewer.comments.scrollIntoView(
                        { behavior: "smooth", block: "start" }
                    );
                }
            );

            // Add and store event listener for the recipe image
            addStoredEventListener(
                feedVariables, 
                "click", 
                imageButtonId, 
                () => {
                    recipeViewer(feedHTML, feedVariables, recipe.id);
                }
            );

        });
        // Show recipes based on vegan mode
        filterVeganRecipes(feedHTML, feedVariables);
    }else {
        hintWindow("<p>All recipes are loaded!</p>");
    }
};

export const getRecipePage = async (page, feedHTML, feedVariables) => {
    setLoading(true);
        try {
        let additionalParametersObject = {
            q: feedVariables.filterObject.q,
            search_areas: "",
            recipe_types_exclude: "",
            // Only show recipes created by a certain user
            user_id: feedVariables.filterObject.userId,
            recipe_id: feedVariables.filterObject.recipe_id,
        };

        /* Convert the included search areas array to a 
        comma separated string */
        const searchAreas = feedVariables.filterObject.searchAreas;
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
        const recipeTypes = Object.entries(feedVariables.filterObject.recipeTypes)
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
            hintWindow("<p>Couldn't find any recipes.</p>");
        }else {
            // Append new recipes to the recipe feed
            renderRecipes(data, feedHTML, feedVariables);
        }
    }catch (error) {
        console.error(error)
    } finally {
        setLoading(false);
    }
};
