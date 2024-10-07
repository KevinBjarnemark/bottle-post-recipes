import { textInput, textAreaInput, fileInput, 
    checkboxInput, numberInput } from './htmlComponents/inputs.js'

document.addEventListener("DOMContentLoaded", function() {
    // Data loaded from db
    const initialData = {
        formData: JSON.parse(document.getElementById('form_data').textContent),
    }

    console.log(initialData)

    // Targeted HTML elements
    const globalHTML = {
        form: document.getElementById('recipe-form'),
        mappedForm: document.getElementById('mapped-form'),
        ingredientsList: document.getElementById('ingredients-list'),
        addIngredientButton: document.getElementById('add-ingredient-btn'),
        ingredientNameInput: document.getElementById('ingredient-name'),
        ingredientQuantityInput: document.getElementById('ingredient-quantity'),
    };

    // Global states
    let globalVariables = {
        formData: initialData.formData,
        ingredients: [],

    };

    // Event listeners
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

    // Handle form submission
    globalHTML.form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Create a hidden input to send the ingredients array
        const ingredientsField = document.createElement('input');
        ingredientsField.setAttribute('type', 'hidden');
        ingredientsField.setAttribute('name', 'ingredients');
        ingredientsField.setAttribute('value', JSON.stringify(globalVariables.ingredients));
        this.appendChild(ingredientsField);
        // Submit form
        submitForm(globalHTML, globalVariables);
    });

    // Generate the form based on models
    mapForm(globalHTML, globalVariables)
});

/**
 * Submits the concatenated form to the backend
 * 
 * @param {Object}  globalHTML 
 * @param {Object}   globalVariables 
 */
const submitForm = async (globalHTML, globalVariables) => {
    const init = async () => {
        // Gather all data
        const formData = new FormData(globalHTML.form);

        // Append the ingredients array to FormData
        formData.append('ingredients', JSON.stringify(globalVariables.ingredients));
        // Send the data
        await fetch(globalHTML.form.action, {
            method: 'POST',
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            },
            body: formData,
        });
        alert('Recipe successfully created!');
        // Redirect to home
        window.location.href = '/'; 
    };
    await init();
};

/**
 * Generates the recipe_form inherited from backend. 
 * This avoids repetition by generating a full form based on a 
 * model in an iterated fasion. Default values, labels, and more 
 * are automatically referenced from source.
 * 
 * @param {Object}  globalHTML
 * @param {Object}  globalVariables
 * @param {String}  variableEntry An entry that points to an array of 
 * objects referncing the models from source. 
 * @param {String}  htmlEntry An entry that points to the html 
 * container, where the inputs should land. 
 */
const generateForm = (globalHTML, globalVariables, variableEntry, htmlEntry) => {
    globalVariables[variableEntry].forEach(i => {
        Object.entries(i).forEach(([key, value]) => {
            const newInput = document.createElement("div");
            const inputType = value.widget.type;
            let inputData = {
                key, 
                defaultValue: value.default_value, 
                label: value.label,
                placeholder: value?.widget.attrs?.placeholder
            };

            if (inputType === "TextInput"){
                newInput.innerHTML = textInput(inputData);
            }else if (inputType === "Textarea"){
                newInput.innerHTML = textAreaInput(inputData);
            }else if (inputType === "ClearableFileInput"){
                newInput.innerHTML = fileInput(inputData);
            }else if (inputType === "CheckboxInput"){
                newInput.innerHTML = checkboxInput(inputData);
            }else if (inputType === "NumberInput"){
                newInput.innerHTML = numberInput(inputData);
            }
            // Append
            globalHTML[htmlEntry].appendChild(newInput);
        });
    });
};

const mapForm = (globalHTML, globalVariables) => {
    generateForm(globalHTML, globalVariables, "formData", "mappedForm");
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

    const removeIngredientButton = document.createElement("button");
    removeIngredientButton.innerText = "X";
    removeIngredientButton.className = "remove-ingredient-btn";
    removeIngredientButton.addEventListener("click", function() {
        ingredientElement.remove();
        globalVariables.ingredients = globalVariables.ingredients.filter(i => i !== ingredient);
    });

    ingredientElement.innerHTML = `
        <p class="quantity">${ingredient.quantity}</p>
        <p class="name">${ingredient.name}</p>
    `;
    ingredientElement.appendChild(removeIngredientButton);

    globalHTML.ingredientsList.appendChild(ingredientElement);
    globalVariables.ingredients.push(ingredient);
};
