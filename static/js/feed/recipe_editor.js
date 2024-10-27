import { 
    addStoredEventListener, 
    capitalizeFirstLetter, 
    toSnakeCase, getCookie } from "../helpers.js";
import {DIETARYATTRIBUTES_ALL, 
    DIETARYATTRIBUTES_NON_VEGAN,
    RECIPE_EMPTY,
} from '../constants.js';


/**
 * Submits the concatenated form to the backend
 * 
 * @param {Object}  globalVariables 
 * @param {String}   recipeId 
 */
const publishRecipe = async (globalVariables, recipeId) => {
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
            Object.entries(globalVariables.formData).forEach(([entry, value]) => {
                if (stringifyEntries.includes(entry)){
                    formData.append(entry, JSON.stringify(value));
                }else {
                    formData.append(entry, value);
                } 
            });

            if (recipeId === "NEW RECIPE"){
                // Send destructed form data
                const response = await fetch('/submit_recipe/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: formData,
                });

                if (response.ok) {
                    // Show success message and redirect to home
                    alert('Recipe successfully created!');
                    window.location.href = '/';
                } else {
                    // TODO handle backend errors
                    const data = await response.json();
                    console.error(data);
                }
            }
          
        } catch (error) {
            // TODO client errors
            console.error('Error:', error);
        }
    };
    await init();
};



const buildDietaryAttributes = (globalHTML, globalVariables, attributesPreFill) => {
    // Clear previous elements
    globalHTML.recipeEditor.dietaryAttributes.innerHTML = "";
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
            globalVariables.formData.dietary_attributes.push(i.field);
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

    globalHTML.recipeEditor.dietaryAttributes.innerHTML = `
    <div class="flex-row mb-4" style="flex-wrap: wrap;">
        ${htmlString}
    </div>
    `;

    attributes.forEach(i => {
        // Set up listeners
        const element = document.getElementById(i.id);
        element.addEventListener("change", function(e) {
            let dietaryAttributes = globalVariables.formData.dietary_attributes;
            if (e.target.checked) {
                if (!dietaryAttributes.includes(i.field)){
                    dietaryAttributes.push(i.field);
                }
            }else {
                if (dietaryAttributes.includes(i.field)){
                    dietaryAttributes = dietaryAttributes.filter(attr => attr !== i.field);
                }
            }
            globalVariables.formData.dietary_attributes = dietaryAttributes;
        });
    });
};

/**
 * Adds an ingredient with a managing functionaility for UX as 
 * well as updating form data.
 * 
 * 
 * @param {Object}  globalHTML
 * @param {Object}  globalVariables
 * @param {Object}  ingredient {name, quantity}
 */
const addIngredientToList = (globalHTML, globalVariables, ingredient) => {
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
        globalVariables.formData.ingredients = 
            globalVariables.formData.ingredients.filter(i => i !== ingredient);
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
    globalHTML.recipeEditor.ingredients.appendChild(ingredientElement);

    // Add the ingredient to the form data
    globalVariables.formData.ingredients.push(ingredient);
};

const buildIngredients = (globalHTML, globalVariables, ingredientsPreFill) => {
    // Clear previous values
    globalVariables.formData.ingredients = [];

    // Clear ingredients list
    globalHTML.recipeEditor.ingredients.innerHTML = "";
    // 'Prefill' ingredients by adding them
    ingredientsPreFill.forEach(ingredient => {
        addIngredientToList(globalHTML, globalVariables, ingredient);
    })

    // Add and store add ingredient button listener
    addStoredEventListener(
        globalVariables,
        "click",
        globalHTML.recipeEditor.ingredient.addButton.id, 
        () => {
            // Get the ingredient elements
            let quantity = globalHTML.recipeEditor.ingredient
                .quantity;
            let name = globalHTML.recipeEditor.ingredient
                .name;

            if (name.value && quantity.value) {
                addIngredientToList(
                    globalHTML, 
                    globalVariables, 
                    {name: name.value, quantity: quantity.value}
                );
                quantity.value = '';
                name.value = '';
            }
        }
    );

}

const combinedNumberField = (element, globalVariables, formDataEntry, numberFields) => {
    let htmlString = "";
    numberFields.forEach(i => {
        htmlString += 
        `<div class="flex-column mb-4 text-white">
            <label for="${i.id}">${i.label}</label>
            <input 
                class="form-control mt-1"
                type="number" 
                placeholder="${i.label}" 
                name="${i.name}" 
                id="${i.id}" 
                value="0"
            />
        </div>
        `;
    });

    element.innerHTML = 
    `
    <div class="flex-row mb-4 mt-2 text-white">
        ${htmlString}
    </div>
    `;

    // Configure listeners
    numberFields.forEach(i => {

        let formField = globalVariables.formData[formDataEntry];
        formField[i.name] = 0; // Default to 0
        // Get the recently created numberinput HTML
        const element = document.getElementById(i.id);
        element.addEventListener("input", function(e) {
             // Update on input
            formField[i.name] = Number(e.target.value);
        });
    });
};

/**
 * Closes the recipe editor component and clears 
 * previously generated content.
 * 
 */
const handleClose = (globalHTML, globalVariables) => {
    // Hide
    globalHTML.recipeEditor.container.style.visibility = "hidden";
};

/**
 * Displays each recipe with detailed information such as 
 * ingredients, dietary attributes, and more.
 * 
 * Manages the contents of the recipe-editor-generated element 
 * with global event listeners customized customized for each 
 * loaded recipe.
 * 
 */
export const recipeEditor = (globalHTML, globalVariables, recipeId) => {
    /* Render either an empty recipe to publish or a 
    prefilled recipe to edit */ 
    let recipe = {};
    if (recipeId === "NEW RECIPE") {
        recipe = RECIPE_EMPTY;
    }else {
        // Find the recipe to load
        recipe = globalVariables.recipes.find(i => i.id === recipeId);
    }

    // Title
    if (recipeId === "NEW RECIPE"){
        globalHTML.recipeEditor.mainTitle.innerText = "Create recipe"; 
    }else {
        globalHTML.recipeEditor.mainTitle.innerText = "Edit Recipe"; 
    }

    // Info text
    if (recipeId === "NEW RECIPE"){
        globalHTML.recipeEditor.mainInfo.innerHTML = `
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
            before publishing another one.
        </p>
    `; 
    }else {
        globalHTML.recipeEditor.mainInfo.innerHTML = `
        <p>
            In this window, you can edit your already published recipe. 
            This won't affect your ocean status or previous engagements 
            such as likes and comments.
        </p>
    `;
    }
    if (recipeId !== "NEW RECIPE"){
        // Show the delete recipe button
        globalHTML.recipeEditor.deleteButtonContainer.
            style.display = "block";
        // Reset click count
        globalHTML.recipeEditor.deleteRecipeClickCount
            .innerText = "10";

    }else {
        // Hide the delete recipe button
        globalHTML.recipeEditor.deleteButtonContainer
            .style.display = "none";
    }

        // Add and store close button listener
        addStoredEventListener(
            globalVariables,
            "click", 
            globalHTML.recipeEditor.deleteButton.id, 
            () => {
                const convertToNumber = parseInt(globalHTML.recipeEditor
                    .deleteRecipeClickCount.innerText);
                // Decrement number
                globalHTML.recipeEditor
                    .deleteRecipeClickCount.innerText = `${convertToNumber - 1}`;
                if (convertToNumber - 1 === 0) {
                    // TODO
                    console.log("ADD DELETE FUNCTION HERE");
                }
            }
        );
    
    
    

    // Text inputs (pre filling and listeners) 
    const textInputs = globalHTML.recipeEditor.textInputs;
    Object.entries(textInputs).forEach(([entry, element]) => {
        // Clear previous value (form data and input)
        element.value = "";
        globalVariables.formData[entry] = "";

        // Pre-fill values respectively
        if (recipe[entry]){
            element.value = recipe[entry];
            globalVariables.formData[entry] = recipe[entry];
        }else {
            element.value = "";
            globalVariables.formData[entry] = "";
        }
        // Update the form data on keyup
        element.addEventListener("keyup", function(e) {
            globalVariables.formData[entry] = e.target.value;
            console.log(globalVariables.formData)
        });
    });

    /* Combined number inputs (pre filling and listeners) 
    using a helper function */
    /**
     * Helps with setting up multiple combined number inputs to avoid 
     * repetition.
     * 
     * @param {str}   globalHtmlEntry The entry that points to the 
     * combined entry in the globalHTML
     * @param {str}   recipeEntry The entry that points to the 
     * combined entry in the recipe object
     */
    const heleperCombinedNumber = (globalHtmlEntry) => {
        const globalHtmlEntrySnake = toSnakeCase(globalHtmlEntry);
        // Preparation time (pre filling and listeners) 
        const collection = globalHTML.recipeEditor
            .combinedNumberInputs[globalHtmlEntry];
        Object.entries(collection).forEach(([entry, element]) => {
            const entrySnake = toSnakeCase(entry)
            const entryData = recipe[globalHtmlEntrySnake][0][entrySnake];

            // Clear previous value (form data and input)
            element.value = "";
            globalVariables.formData[globalHtmlEntrySnake][entrySnake] = "";

            // Pre-fill values respectively and add form data
            if (entryData){
                element.value = entryData;
                globalVariables.formData[globalHtmlEntrySnake][entrySnake] = entryData;
            }else {
                element.value = 0;
                globalVariables.formData[globalHtmlEntrySnake][entrySnake] = 0;
            }
            // Update the form data on keyup
            element.addEventListener("change", function(e) {
                // Set form data and convert to a number
                globalVariables.formData[globalHtmlEntrySnake][entrySnake] = +e.target.value 
            });
        });
    };
    heleperCombinedNumber("preparationTime");
    heleperCombinedNumber("cookingTime");
    heleperCombinedNumber("estimatedPrice");

    // Image
    globalHTML.recipeEditor.imagePreviewContainer
        .innerHTML = `
            <img 
                src=${recipe.image ? recipe.image : '/static/images/icons/missing.webp'} 
                alt="Recipe image" 
            />
        `;
    // Set form data initially
    globalVariables.formData.image = recipe.image;

    /* Dietary attributes NOTE! This will be invisible if no dietary attributes are 
    attached to the recipe */
    buildDietaryAttributes(globalHTML, globalVariables, recipe.dietary_attributes);

    // Ingredients
    buildIngredients(globalHTML, globalVariables, recipe.ingredients)

    // Add and store submit button
    addStoredEventListener(
        globalVariables,
        "click", 
        `recipe-editor-submit-button`, 
        () => {
            publishRecipe(globalVariables, recipeId);
        }
    );

    // Add and store close button listener
    addStoredEventListener(
        globalVariables,
        "click", 
        `recipe-editor-close-button`, 
        () => {handleClose(globalHTML, globalVariables)}
    );

    // Add and store image preview listener
    addStoredEventListener(
        globalVariables,
        "change",
        `recipe-editor-image-upload`, // Doesn't need to be unique
        (e) => {
            const file = e.target.files[0];
                globalVariables.formData.image = file;
                const imagePreviewUrl = URL.createObjectURL(file);
                const previewImage = document.createElement('img');
                previewImage.src = imagePreviewUrl;
                previewImage.alt = recipe.title;
                globalHTML.recipeEditor.imagePreviewContainer
                    .innerHTML = `
                        <img 
                            src=${imagePreviewUrl} 
                            alt="${recipe.title}" 
                        />
                    `;
            }
    );

    // Finally, Make the component visible
    globalHTML.recipeEditor.container.style.visibility = "visible";
};
