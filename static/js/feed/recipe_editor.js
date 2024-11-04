import { 
    addStoredEventListener, 
    capitalizeFirstLetter, 
    toSnakeCase, getCookie } from "../helpers.js";
import {DIETARYATTRIBUTES_ALL, 
    DIETARYATTRIBUTES_NON_VEGAN,
    RECIPE_EMPTY,
} from '../constants.js';
import {
    setLoading, 
    confirmPassword, 
    confirmedRedirect,
    displayClientError,
    displayServerError,
} from '../app.js';


/**
 * Submits the concatenated form to the backend
 * 
 * @param {Object}  feedVariables 
 * @param {String}   recipeId 
 */
const publishRecipe = async (feedVariables, recipeId) => {
    setLoading(true);
    const init = async () => {
        try {
            // Create the form data constructor
            const formData = new FormData();
            
            // These entries should be stringified
            const stringifyEntries = [
                "dietary_attributes", 
                "ingredients", 
                "preparation_time", 
                "cooking_time",
                "estimated_price",
            ];

            // Append form data from feedVariables
            Object.entries(feedVariables.formData).forEach(([entry, value]) => {
                if (stringifyEntries.includes(entry)){
                    formData.append(entry, JSON.stringify(value));
                }else {
                    formData.append(entry, value);
                } 
            });
            // Include recipeId to handle edits
            formData.append("recipe_id", recipeId);

            // Send destructed form data
            const response = await fetch('/submit_recipe/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: formData,
            });

            const jsonResponse = await response.json();
            if (jsonResponse.success) {
                await confirmedRedirect(
                    `<p>
                        Recipe successfully created! ✔️
                        <br />
                        Redirecting to home soon...
                    </p>`,
                    7000
                );
            } else {
                displayServerError(jsonResponse.error);
            }
        } catch (error) {
            displayClientError(error.message);
        } finally {
            setLoading(false);
        }
    };
    await init();
};

/**
 * Deletes a recipe by its ID.
 * 
 * @param {String} recipeId 
 */
export const deleteRecipeConfirmed = async (recipeId, password) => {
    setLoading(true);
    const init = async () => {
        try {
            // Send a DELETE request to the backend
            const response = await fetch(`/delete_recipe/?recipe_id=${recipeId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password }),
            });

            const jsonResponse = await response.json();
            if (jsonResponse.success) {
                await confirmedRedirect(
                    `<p>
                        Recipe successfully deleted! ✔️
                        <br />
                        Redirecting to home soon...
                    </p>`,
                    7000
                );
            } else {
                displayServerError(jsonResponse.error, 7000);
            }
        } catch (error) {
            displayClientError(error.message, 7000);
        } finally {
            setLoading(false);
        }
    };

    init();
};

export const deleteRecipe = async (recipeId) => {
    setLoading(true);
    try {
        confirmPassword(
            async (password) => await deleteRecipeConfirmed(recipeId, password),
            `
                <p>
                    <span class="text-red">
                        Warning!
                    </span>
                    This action cannot be undone, please confirm your password 
                    to delete this recipe.
                </p>
            `
        );
    }catch (error) {
        displayClientError(error.message);
    } finally {
        setLoading(false);
    }
};

const buildDietaryAttributes = (feedHTML, feedVariables, attributesPreFill) => {
    setLoading(true);
    try {
        // Clear previous elements
        feedHTML.recipeEditor.dietaryAttributes.innerHTML = "";
        let attributes = [];
        // Build the boolean items
        DIETARYATTRIBUTES_ALL.forEach(i => {
            attributes.push(
                {
                    name: `dietary-attributes-${i}`,
                    field: `${i}`,
                    id: `create-recipe-boolean-dietary-attributes-${i}`,
                    label: `${capitalizeFirstLetter(i)}`,
                    nonVegan: DIETARYATTRIBUTES_NON_VEGAN.includes(i),
                }
            );
        });

        let htmlString = "";
        attributes.forEach(i => {
            const checked = attributesPreFill.includes(i.label.toLowerCase());
            // Add form data, if true
            if (checked){
                feedVariables.formData.dietary_attributes.push(i.field);
            }
            htmlString += 
            `<div class="flex-row pop-up-boolean-item align-items-start"
                style="margin: 5px 5px; padding: 0 5px; 
                    ${i.nonVegan ? "box-shadow: 0 0 3px 1.8px #ffb472" : ""}">
                <input 
                    class="form-check-input"
                    style="margin-right: 10px;" 
                    type="checkbox" 
                    name="${i.name}" 
                    id="${i.id}"
                    ${checked ? "checked" : ""} />
                <label class="form-check-label text-white" for="${i.id}">
                    ${i.label}
                </label>
            </div>
            `;
        });

        feedHTML.recipeEditor.dietaryAttributes.innerHTML = `
        <div class="flex-row mb-4" style="flex-wrap: wrap;">
            ${htmlString}
        </div>
        `;

        attributes.forEach(i => {
            // Set up listeners
            const element = document.getElementById(i.id);
            element.addEventListener("change", function(e) {
                let dietaryAttributes = feedVariables.formData.dietary_attributes;
                if (e.target.checked) {
                    if (!dietaryAttributes.includes(i.field)){
                        dietaryAttributes.push(i.field);
                    }
                }else {
                    if (dietaryAttributes.includes(i.field)){
                        dietaryAttributes = dietaryAttributes.filter(attr => attr !== i.field);
                    }
                }
                feedVariables.formData.dietary_attributes = dietaryAttributes;
            });
        });
    }catch (error) {
        displayClientError(error.message);
    } finally {
        setLoading(false);
    }
};

/**
 * Adds an ingredient with a managing functionaility for UX as 
 * well as updating form data.
 * 
 * 
 * @param {Object}  feedHTML
 * @param {Object}  feedVariables
 * @param {Object}  ingredient {name, quantity}
 */
const addIngredientToList = (feedHTML, feedVariables, ingredient) => {
        try {
        // Create the ingredient element and assign classname
        const ingredientElement = document.createElement("div");
        ingredientElement.className = "pop-up-list-element-container";
        // Create the remove button and assing attributes
        const removeIngredientButton = document.createElement("button");
        removeIngredientButton.innerText = "X";
        removeIngredientButton.className = "pop-up-list-element-remove-button";
        // Create event listener
        removeIngredientButton.addEventListener("click", function() {
            // Remove the ingredient from form data
            feedVariables.formData.ingredients = 
                feedVariables.formData.ingredients.filter(i => i !== ingredient);
            // Remove element (listener will also be removed in this action)
            ingredientElement.remove();
        });

        // Add the ingredient element
        ingredientElement.innerHTML = `
            <li class="text-nowrap">
                <span class="highlighted-word">${ingredient.quantity}</span> 
                ${ingredient.name}
            </li>
        `;
        ingredientElement.appendChild(removeIngredientButton);
        feedHTML.recipeEditor.ingredients.appendChild(ingredientElement);

        // Add the ingredient to the form data
        feedVariables.formData.ingredients.push(ingredient);
    }catch (error) {
        displayClientError(error.message);
    }
};

const buildIngredients = (feedHTML, feedVariables, ingredientsPreFill) => {
    try {
        // Clear previous values
        feedVariables.formData.ingredients = [];

        // Clear ingredients list
        feedHTML.recipeEditor.ingredients.innerHTML = "";
        // 'Prefill' ingredients by adding them
        ingredientsPreFill.forEach(ingredient => {
            addIngredientToList(feedHTML, feedVariables, ingredient);
        })

        // Add and store add ingredient button listener
        addStoredEventListener(
            feedVariables,
            "click",
            feedHTML.recipeEditor.ingredient.addButton.id, 
            () => {
                // Get the ingredient elements
                let quantity = feedHTML.recipeEditor.ingredient
                    .quantity;
                let name = feedHTML.recipeEditor.ingredient
                    .name;

                if (name.value && quantity.value) {
                    addIngredientToList(
                        feedHTML, 
                        feedVariables, 
                        {name: name.value, quantity: quantity.value}
                    );
                    quantity.value = '';
                    name.value = '';
                }
            }
        );
    }catch (error) {
        displayClientError(error.message);
    }
}

/**
 * Closes the recipe editor component and clears 
 * previously generated content.
 * 
 */
const handleClose = (feedHTML) => {
    // Hide
    feedHTML.recipeEditor.container.style.visibility = "hidden";
};

/**
 * Displays each recipe with detailed information such as 
 * ingredients, dietary attributes, and more.
 * 
 * Manages the contents of the recipe editor with global 
 * event listeners customized customized for each 
 * loaded recipe.
 * 
 */
export const recipeEditor = (feedHTML, feedVariables, recipeId) => {
    try {
        /* Render either an empty recipe to publish or a 
        prefilled recipe to edit */ 
        let recipe = {};
        if (recipeId === "NEW RECIPE") {
            recipe = RECIPE_EMPTY;
        }else {
            // Find the recipe to load
            recipe = feedVariables.recipes.find(i => i.id === recipeId);
        }

        // Title
        if (recipeId === "NEW RECIPE"){
            feedHTML.recipeEditor.mainTitle.innerText = "Create recipe"; 
        }else {
            feedHTML.recipeEditor.mainTitle.innerText = "Edit Recipe"; 
        }

        // Info text
        if (recipeId === "NEW RECIPE"){
            feedHTML.recipeEditor.mainInfo.innerHTML = `
            <em>How it works</em>
            <p>
                When you publish a recipe it will enter the 
                'ocean' <i class="fa-solid fa-water recipe-item-in-ocean-icon"></i>
                Randomly selected users will then be able to either, boost your recipe
                <em>or remove it from the ocean.</em> If users find value in your recipe, 
                they may boost it by putting it back into the ocean. 
                <br />
                <br />
                The more times your recipe gets passed around in the community, 
                the higher it will rank! In other words, your reach is determined by 
                the <em>quality of your recipes</em> rather than your ability to 
                network.
            </p>
            <em>Rules</em>
            <p>
                You cannot spam recipes into the ocean, and must wait <em>24 hours</em>
                before publishing another recipe.
            </p>
        `; 
        }else {
            feedHTML.recipeEditor.mainInfo.innerHTML = `
            <p>
                In this window, you can edit your already published recipe. 
                This won't affect your ocean status or previous engagements 
                such as likes and comments.
            </p>
        `;
        }
        if (recipeId !== "NEW RECIPE"){
            // Show the delete recipe button
            feedHTML.recipeEditor.deleteButtonContainer.
                style.display = "block";
        }else {
            // Hide the delete recipe button
            feedHTML.recipeEditor.deleteButtonContainer
                .style.display = "none";
        }

        // Add and store close button listener
        addStoredEventListener(
            feedVariables,
            "click", 
            feedHTML.recipeEditor.deleteButton.id, 
            () => {deleteRecipe(recipeId)}
        );

        // Text inputs (pre filling and listeners) 
        const textInputs = feedHTML.recipeEditor.textInputs;
        Object.entries(textInputs).forEach(([entry, element]) => {
            // Clear previous value (form data and input)
            element.value = "";
            feedVariables.formData[entry] = "";

            // Pre-fill values respectively
            if (recipe[entry]){
                element.value = recipe[entry];
                feedVariables.formData[entry] = recipe[entry];
            }else {
                element.value = "";
                feedVariables.formData[entry] = "";
            }
            // Update the form data on keyup
            element.addEventListener("keyup", function(e) {
                feedVariables.formData[entry] = e.target.value;
            });
        });

        /* Combined number inputs (pre filling and listeners) 
        using a helper function */
        /**
         * Helps with setting up multiple combined number inputs to avoid 
         * repetition.
         * 
         * @param {str}   feedHtmlEntry The entry that points to the 
         * combined entry in the feedHTML
         * @param {str}   recipeEntry The entry that points to the 
         * combined entry in the recipe object
         */
        const heleperCombinedNumber = (feedHtmlEntry) => {
            const feedHtmlEntrySnake = toSnakeCase(feedHtmlEntry);
            // Preparation time (pre filling and listeners) 
            const collection = feedHTML.recipeEditor
                .combinedNumberInputs[feedHtmlEntry];
            Object.entries(collection).forEach(([entry, element]) => {
                const entrySnake = toSnakeCase(entry)
                const entryData = recipe[feedHtmlEntrySnake][0][entrySnake];

                // Clear previous value (form data and input)
                element.value = "";
                feedVariables.formData[feedHtmlEntrySnake][entrySnake] = "";

                // Pre-fill values respectively and add form data
                if (entryData){
                    element.value = entryData;
                    feedVariables.formData[feedHtmlEntrySnake][entrySnake] = entryData;

                }else {
                    element.value = 0;
                    feedVariables.formData[feedHtmlEntrySnake][entrySnake] = 0;
                }
                // Update the form data on keyup
                element.addEventListener("change", function(e) {
                    // Set form data and convert to a number
                    feedVariables.formData[feedHtmlEntrySnake][entrySnake] = +e.target.value;
                });
            });
        };
        heleperCombinedNumber("preparationTime");
        heleperCombinedNumber("cookingTime");
        heleperCombinedNumber("estimatedPrice");

        // Image
        feedHTML.recipeEditor.imagePreviewContainer
            .innerHTML = `
                <img 
                    src=${recipe.image ? recipe.image : '/static/images/icons/missing.webp'} 
                    alt="Recipe image" 
                />
            `;
        // Set form data initially
        feedVariables.formData.image = recipe.image;

        // Dietary attributes
        buildDietaryAttributes(feedHTML, feedVariables, recipe.dietary_attributes);
        
        // Ingredients
        buildIngredients(feedHTML, feedVariables, recipe.ingredients)

        // Add and store submit button
        addStoredEventListener(
            feedVariables,
            "click", 
            `recipe-editor-submit-button`, 
            () => {
                publishRecipe(feedVariables, recipeId);
            }
        );

        // Add and store close button listener
        addStoredEventListener(
            feedVariables,
            "click", 
            `recipe-editor-close-button`, 
            () => {handleClose(feedHTML)}
        );

        // Add and store image preview listener
        addStoredEventListener(
            feedVariables,
            "change",
            `recipe-editor-image-upload`, // Doesn't need to be unique
            (e) => {
                const file = e.target.files[0];
                    feedVariables.formData.image = file;
                    const imagePreviewUrl = URL.createObjectURL(file);
                    const previewImage = document.createElement('img');
                    previewImage.src = imagePreviewUrl;
                    previewImage.alt = recipe.title;
                    feedHTML.recipeEditor.imagePreviewContainer
                        .innerHTML = `
                            <img 
                                src=${imagePreviewUrl} 
                                alt="${recipe.title}" 
                            />
                        `;
                }
        );

        // Finally, Make the component visible
        feedHTML.recipeEditor.container.style.visibility = "visible";
    } catch (error) {
        displayClientError(error.message);
    } finally {
        setLoading(false);
    }
};
