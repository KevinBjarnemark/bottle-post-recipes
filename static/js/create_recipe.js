import { getCookie, capitalizeFirstLetter } from './helpers.js';

document.addEventListener("DOMContentLoaded", function() {
    // Targeted HTML elements
    const globalHTML = {
        form: document.getElementById('recipe-form'),
        ingredientsList: document.getElementById('create-recipe-ingredients-list'),
        addIngredientButton: document.getElementById('create-recipe-add-ingredient-btn'),
        ingredientNameInput: document.getElementById('create-recipe-ingredient-name'),
        ingredientQuantityInput: document.getElementById('create-recipe-ingredient-quantity'),
        dietaryAttributes: document.getElementById('create-recipe-dietary-attributes'),
        image: document.getElementById('create-recipe-image'),
        imagePreviewContainer: document.getElementById('create-recipe-image-preview-container'),
    };

    // Global states
    let globalVariables = {
        // Form data prepared for backend
        formData: {
            title: "",
            description: "",
            tags: "",
            instructions: "",
            ingredients: [],
            dietary_attributes: [],
            image: null,
            preparation_time: {},
            cooking_time: {},
            estimated_price: {},
        },
        formObject: {
            // All text inputs
            textInputs: {
                title: {id: "create-recipe-title"},
                description: {id: "create-recipe-description"},
                tags: {id: "create-recipe-tags"},
                instructions: {id: "create-recipe-instructions"},
            },
        },
    };

    // Add event listeners
    configureListeners(globalHTML, globalVariables);
    // Build form components 
    buildForm(globalHTML, globalVariables);
    // Handle form submission
    globalHTML.form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitForm(globalVariables);
    });
});

const configureListeners = (globalHTML, globalVariables) => {
    globalHTML.addIngredientButton.addEventListener('click', function() {
        const ingredientName = globalHTML.ingredientNameInput.value;
        const ingredientQuantity = globalHTML.ingredientQuantityInput.value;

        if (ingredientName && ingredientQuantity) {
            addIngredientToList(globalHTML, globalVariables, {
                name: ingredientName, 
                quantity: ingredientQuantity,
            });
            globalHTML.ingredientNameInput.value = '';
            globalHTML.ingredientQuantityInput.value = '';
        }
    });

    // Recipe image
    globalHTML.image.addEventListener('change', function(e) {
        const file = e.target.files[0];
        globalVariables.formData.image = file;
        const imagePreviewUrl = URL.createObjectURL(file);
         const previewImage = document.createElement('img');
         previewImage.src = imagePreviewUrl;
         previewImage.alt = 'Recipe image';
         globalHTML.imagePreviewContainer.innerHTML = `
         <img 
             src=${imagePreviewUrl} 
             alt="Recipe image" 
             class="flex-center w-50"
         />
         `;
    });

    // Set up listeners for text inputs
    const textInputs = globalVariables.formObject.textInputs;
    Object.entries(textInputs).forEach(([entry, item]) => {
        const element = document.getElementById(item.id);
        element.addEventListener("keyup", function(e) {
            // Update the form data
            globalVariables.formData[entry] = e.target.value;
        });
    });
};

const buildNumberFields = (globalVariables) => {
    // Combined number fields data
    const numberFields = [
        {
            element: document.getElementById(
                "create-recipe-preparation-time"
            ),
            formDataEntry: "preparation_time",
            name: "preparation-time",
            fields: ["days", "hours", "minutes"]
        },
        {
            element: document.getElementById(
                "create-recipe-cooking-time"
            ),
            formDataEntry: "cooking_time",
            name: "cooking-time",
            fields: ["days", "hours", "minutes"]
        },
        {
            element: document.getElementById(
                "create-recipe-estimated-price"
            ),
            formDataEntry: "estimated_price",
            name: "estimated-price",
            fields: ["from", "to"]
        },
    ]; 

    numberFields.forEach(i => {
        // Create numberinputs
        const fields = i.fields.map(numberField => {
            return (
                {
                    id: `create-recipe-${i.name}-${numberField}`,
                    label: numberField,
                    name: `${i.name}-${numberField}`
                }
            );
        });
        combinedNumberField(i.element, globalVariables, i.formDataEntry, fields);
    });
};

const buildForm = (globalHTML, globalVariables) => {
    buildDietaryAttributes(globalHTML, globalVariables);
    buildNumberFields(globalVariables);
};

/**
 * Submits the concatenated form to the backend
 * 
 * @param {Object}  globalHTML 
 * @param {Object}   globalVariables 
 */
const submitForm = async (globalVariables) => {
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
        } catch (error) {
            // TODO client errors
            console.error('Error:', error);
        }
    };
    await init();
};

/**
 * Adds an ingredient with a managing functionaility for UX
 * 
 * @param {Object}  globalHTML
 * @param {Object}  globalVariables
 * @param {Object}  ingredient {name, quantity}
 */
const addIngredientToList = (globalHTML, globalVariables, ingredient) => {
    const ingredientElement = document.createElement("div");
    ingredientElement.className = "ingredient";
    let ingredients = globalVariables.formData.ingredients;

    const removeIngredientButton = document.createElement("button");
    removeIngredientButton.innerText = "X";
    removeIngredientButton.className = "remove-ingredient-btn";
    removeIngredientButton.addEventListener("click", function() {
        ingredientElement.remove();
        ingredients = ingredients.filter(i => i !== ingredient);
    });

    ingredientElement.innerHTML = `
        <p class="quantity">${ingredient.quantity}</p>
        <p class="name">${ingredient.name}</p>
    `;
    ingredientElement.appendChild(removeIngredientButton);

    globalHTML.ingredientsList.appendChild(ingredientElement);
    ingredients.push(ingredient);
};

const buildDietaryAttributes = (globalHTML, globalVariables) => {
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
            />
            <label class="form-check-label text-white" for="${i.id}">
                ${i.label}
            </label>
        </div>
        `;
    });

    globalHTML.dietaryAttributes.innerHTML = `
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
