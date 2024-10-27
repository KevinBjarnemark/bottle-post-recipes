import { addStoredEventListener, getCookie, 
    capitalizeFirstLetter, toSnakeCase
} from "../helpers.js";

const buildDietaryAttributes = (globalHTML, globalVariables, attributesPreFill) => {
    // Clear
    globalHTML.recipeEditor.dietaryAttributes.innerHTML = "";

    const boolNamesArray = [
        "alcohol", 
        "dairy", 
        "meat", 
        "fish", 
        "honey", 
        "gelatin", 
        "nuts", 
        "gluten",
        "eggs",
        "soy",
        "lactose",
        "peanuts",
        "caffeine",
    ];

    const nonVeganAttributes = [ 
        "dairy", 
        "meat", 
        "fish", 
        "honey", 
        "gelatin", 
        "eggs", 
        "lactose", 
    ];

    let attributes = [];
    // Build the boolean items
    boolNamesArray.forEach(i => {
        attributes.push(
            {
                name: `dietary-attributes-${i}`,
                field: `${i}`,
                id: `create-recipe-boolean-dietary-attributes-${i}`,
                label: `${capitalizeFirstLetter(i)}`,
                nonVegan: nonVeganAttributes.includes(i),
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
        `<div class="flex-row create-recipe-boolean-item align-items-start"
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
    // Instantiate form entry
    let ingredients = globalVariables.formData.ingredients;

    // Create the ingredient element and assign classname
    const ingredientElement = document.createElement("div");
    ingredientElement.className = "ingredient";
    // Create the remove button and assing attributes
    const removeIngredientButton = document.createElement("button");
    removeIngredientButton.innerText = "X";
    removeIngredientButton.className = "remove-ingredient-btn";
    // Create event listener
    removeIngredientButton.addEventListener("click", function() {
        // Remove element (listener will also be removed in this action)
        ingredientElement.remove();
        // Remove the ingredient from form data
        ingredients = ingredients.filter(i => i !== ingredient);
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
    ingredients.push(ingredient);
};

const buildIngredients = (globalHTML, globalVariables, ingredientsPreFill) => {
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
    // Find the recipe to load
    const recipe = globalVariables.recipes.find(i => i.id === recipeId);
    
    // Text inputs (pre filling and listeners) 
    const textInputs = globalHTML.recipeEditor.textInputs;
    Object.entries(textInputs).forEach(([entry, element]) => {
        // Pre-fill values respectively
        if (recipe[entry]){
            element.value = recipe[entry];
            globalVariables.formData[entry] = recipe[entry];
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
            // Pre-fill values respectively and add form data
            if (entryData){
                element.value = entryData;
                globalVariables.formData[globalHtmlEntrySnake][entrySnake] = entryData;
            }
            // Update the form data on keyup
            element.addEventListener("change", function(e) {
                console.log(e.target.value);
                globalVariables.formData[globalHtmlEntrySnake][entrySnake] = 
                    // Convert to a number
                    +e.target.value
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
                src=${recipe.image} 
                alt="Recipe image" 
            />
        `;
    // Set form data initially
    globalVariables.formData.image = recipe.image;

    console.log(recipe)
    /* Dietary attributes NOTE! This will be invisible if no dietary attributes are 
    attached to the recipe */
    buildDietaryAttributes(globalHTML, globalVariables, recipe.dietary_attributes);

    // Ingredients
    buildIngredients(globalHTML, globalVariables, recipe.ingredients)

    // Add and store close button listener
    addStoredEventListener(
        globalVariables,
        "click", 
        `recipe-editor-submit-button`, 
        (e) => {
            e.preventDefault();
            // TODO Submit edited recipe
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
