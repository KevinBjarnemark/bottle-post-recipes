import { toggleFilters, toggleSearchAreaItems } from "./utilities.js";
import { addStoredEventListener } from "../helpers.js";

export const htmlSidebarFilters = (globalHTML, globalVariables) => {
    const filters = [
        {
            title: "Vegan",
            border: "sidebar-settings-border-right",
            id: "filter-recipe-type-vegan",
            icon: "carrot",
        },
        {
            title: "Vegetarian",
            border: "sidebar-settings-border-right",
            id: "filter-include-vegetarian",
            icon: "egg",
        },
        {
            title: "Fish",
            border: "sidebar-settings-border-right",
            id: "filter-recipe-type-fish",
            icon: "fish",
        },
        {
            title: "Meat",
            border: "",
            id: "filter-recipe-type-meat",
            icon: "drumstick-bite",
        },
    ];

    let htmlString = "";
    filters.forEach(i => {
        htmlString +=
        `<div class="flex-center flex-column width-third ${i.border} 
            pt-1 pb-1">
            <p class="small-font text-white">${i.title}</p>
            <i class="fa-solid fa-${i.icon} text-white fs-3"></i>
                <input 
                    class="form-check-input"
                    style="margin-top: 10px"
                    type="checkbox" 
                    name=${i.id} 
                    id=${i.id}
                checked />
        </div>`;
    });

    globalHTML.filters.innerHTML = htmlString;

    filters.forEach(i => {
        const element = document.getElementById(i.id);
        element.addEventListener('click', function() {
            toggleFilters(globalHTML, globalVariables, i.title.toLowerCase());
        });
    });
};

export const htmlSidebarSearchAreas = (globalHTML, globalVariables) => {
    const filters = [
        {
            title: "Description",
            border: "sidebar-settings-border-right",
            id: "search-area-description",
            icon: "font"
        },
        {
            title: "Ingredients",
            border: "sidebar-settings-border-right",
            id: "search-area-ingredients",
            icon: "apple-whole"

        },
        {
            title: "Tags",
            border: "",
            id: "search-area-tags",
            icon: "hashtag"

        },
    ];

    let htmlString = "";
    filters.forEach(i => {
        htmlString +=
        `<div class="flex-center flex-column width-third ${i.border} 
            pt-1 pb-1">
            <p class="small-font text-white">${i.title}</p>
            <i class="fa-solid fa-${i.icon} text-white fs-3"></i>
                <input 
                    class="form-check-input"
                    style="margin-top: 10px"
                    type="checkbox" 
                    name=${i.id} 
                    id=${i.id} />
        </div>`;
    });

    globalHTML.searchAreas.innerHTML = htmlString;

    filters.forEach(i => {
        const element = document.getElementById(i.id);
        element.addEventListener('change', function(e) {
            // Extract the search area name
            const searchAreaName = i.id.split("-").pop();
            toggleSearchAreaItems(globalVariables, e.target.checked, searchAreaName);
        });
    });
};


/**
 * Builds the recipe viewer component with global event listeners,
 * customized for each loaded recipe. This component displays 
 * each recipe with detailed information such as ingredients, 
 * dietary attributes, and more. 
 * 
 */
export const buildRecipeViewer = (globalVariables) => {
    // Get html elements
    const elements = {
        recipeViewerGenerated: document.getElementById(
            "recipe-viewer-generated"
        ),
        recipeViewerContainer: document.getElementById(
            "recipe-viewer-container"
        ),
        recipeViewer: document.getElementById("recipe-viewer"),
    };
    
    /**
     * Closes the recipe viewer component and clears 
     * previously generated content
     * 
     */
    const handleClose = () => {
        // Clean up and hide
        elements.recipeViewerGenerated.innerHTML = "";
        elements.recipeViewerContainer.style.visibility = "hidden";
    };

    // Prepare click-triggered listeners that generate the respective recipe
    globalVariables.recipes.forEach(recipe => {
        // Define listener function
        const listener = () => {
            // Make the component visible
            elements.recipeViewerContainer.style.visibility = "visible";

            /* Dietary attributes 
            Note, This will be invisible if no dietary attributes are 
            attached to the recipe */
            let dietaryAttributes = "";
            if (recipe['dietary_attributes'].length > 0) {
                let dietaryAttributesItems = "";
                recipe['dietary_attributes'].forEach(attribute => {
                    dietaryAttributesItems += `
                    <div class="highlighted-word">
                        ${attribute}
                    </div>
                    `;
                });
                dietaryAttributes += `<h5>
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    This recipe contains 
                    
                </h5>
                <div class="d-flex flex-wrap flex-row">
                    ${dietaryAttributesItems}
                </div>
                `;
                }

                // List all ingredients as an unordered list
                let ingredients = "";
                Object.entries(recipe['ingredients']).forEach(([, ingredient]) => {
                    ingredients += `<li class="text-nowrap">
                        <span class="highlighted-word">${ingredient.quantity}</span> 
                        ${ingredient.name}
                    </li>
                    `;
                });

            elements.recipeViewerGenerated.innerHTML = `<h2>${recipe.title}</h2>
                    <section>
                        <img
                            src="${recipe.image ? 
                                recipe.image : '/static/images/icons/missing.webp'}" 
                            alt="${recipe.title}">
                    </section>

                    <section>
                        <h5>Description</h5>
                        <p>${recipe.description}</p>
                    </section>

                    <section>
                        <h5>Instructions</h5>
                        <p class="pre-line">${recipe.instructions}</p>
                    </section> 

                    <section>
                        ${dietaryAttributes}
                    </section>

                    <section>
                        <h5>Ingredients</h5>
                        <ul>
                            ${ingredients}
                        </ul>
                    </section>
                    
                    <button
                        id="recipe-viewer-close-button-${recipe.id}" 
                        class="close-button-fixed">
                        X
                    </button>
                `;

             // Add and store close button listener
            addStoredEventListener(
                globalVariables,
                "click", 
                `recipe-viewer-close-button-${recipe.id}`, 
                handleClose
            );
        };

        // Add and store recipe image button listener
        addStoredEventListener(
            globalVariables, 
            "click", 
            `recipe-image-button-${recipe.id}`, 
            listener
        );
    })
};
