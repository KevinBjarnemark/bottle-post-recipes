import { 
    addStoredEventListener, 
    getCookie 
} from "../helpers.js";


/**
 * Creates a reusable comment html string.
 * 
 * @param {String}  username
 * @param {String}   date Date string
 * @param {String}   text Comment text
 * @returns {String} A comment HTML string 
 */
export const htmlComment = (username, date, text) => {
    return (
        `<div class="comment-item">
            <div>
                <span class="comment-item-user">
                    ${username}
                </span>
                <span class="comment-item-date">
                    ${date}
                </span>
            </div>
            <p class="comment-item-text border-radius-soft">${text}</p>
        </div>`
    )
};


/**
 * Updates the currently written comment to a global variable
 * and adds that value to the form data.
 * 
 */
export const handleCommentTextarea = (e, globalVariables, commentFormData) => {
    globalVariables.currentComment = e.target.value;
    commentFormData.append("comment", e.target.value);
};


/**
 * Writes the comment to db, and simulates a comment 
 * entering the chat to avoid re-fetching and re-rendering.
 * 
 * BETA! Since newly added comments are simulated and 
 * other user's comments doesn't enter the chat live, this system
 * is far from perfect. Eg. If a user publishes a comment and then
 * closes the recipe viewer, the comment will dissapear until the user
 * refreshes the browser. 
 * 
 * @param {String} recipeId
 */
export const handlePublishComment = async (globalVariables, globalHTML, recipeId, commentFormData) => {
    try {
        // Add recipe_id to the FormData
        commentFormData.append("recipe_id", recipeId);

        // Send the comment to backend
        const response = await fetch('/publish_comment/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: commentFormData,
        });
        const result = await response.json();
        
        if (result.success) {
            // Target the first div inside the comment section
            const commentSection = globalHTML.recipeViewer.comments
                .parentElement.querySelector('div');

            // Create the new comment element
            const newCommentHTML = htmlComment(
                globalVariables.user.username,
                new Date().toLocaleString(), // Simulated
                globalVariables.currentComment,
            );
            // Insert the at the top
            commentSection.insertAdjacentHTML('afterbegin', newCommentHTML);

            // Clear textarea and form data
            globalHTML.recipeViewer.commentInput.value = "";
            commentFormData.delete("comment");
            commentFormData.delete("recipe_id");
        } else {
            alert('Failed to publish comment');
        }
    } catch (error) {
        console.error('Error publishing comment:', error);
    }
};

/**
 * Renders the dietary attributes.
 * 
 * NOTE! This may be invisible if there are no dietary 
 * attributes enabled in the recipe.
 * 
 * @param {Object}  element The parent dietary attributes HTML element
 * @param {Object}  dietaryAttributesArray The array of dietary attributes
 */
export const buildDietaryAttributes = (element, dietaryAttributesArray) => {
    let dietaryAttributes = "";
    if (dietaryAttributesArray.length > 0) {
        let dietaryAttributesItems = "";
        dietaryAttributesArray.forEach(attribute => {
            dietaryAttributesItems += `
            <div class="highlighted-word">
                ${attribute}
            </div>
            `;
        });
        dietaryAttributes += `
            <h5>
                <i class="fa-solid fa-triangle-exclamation"></i>
                This recipe contains 
            </h5>
            <div class="d-flex flex-wrap flex-row">
                ${dietaryAttributesItems}
            </div>
        `;
    }

    // Replace previous attributes with new ones (or none) 
    element.innerHTML = dietaryAttributes;
};

/**
 * Adds <li> ingredient elements to a selected <ul>
 * element.
 * 
 * 
 * @param {bool}  element HTML element 
 * @param {str}   ingredients Array of objects. {quantity: "", name: ""}
 */
export const buildIngredients = (element, ingredients) => {
    // Render ingredients
    let ingredientElements = ""; 
    ingredients.forEach(ingredient => {
        ingredientElements +=
            `
                <li class="text-nowrap">
                    <span class="highlighted-word">
                        ${ingredient.quantity}
                    </span> 
                    ${ingredient.name}
                </li>
            `;
    });

    // Replace previous content with this recipe's ingredients
    element.innerHTML = ingredientElements;
}

/**
 * Closes the recipe Viewer component and clears 
 * previously generated content.
 * 
 */
const handleClose = (globalHTML, globalVariables) => {
    // Clean and hide
    globalHTML.recipeViewer.container.style.visibility = "hidden";
    globalVariables.currentComment = "";
};

/**
 * Displays each recipe with detailed information such as 
 * ingredients, dietary attributes, and more.
 * 
 * If a 'reviewer' opens it some extra functionality are also 
 * added. A bottle post button and a delete button.   
 * 
 * 
 */
export const recipeViewer = (globalHTML, globalVariables, recipeId, review=false) => {
    // Find the recipe to load
    const recipe = globalVariables.recipes.find(i => i.id === recipeId);

    // Info text
    if (review){
        globalHTML.recipeViewer.info.innerHTML = `
            <i class="fa-solid fa-circle-info fs-4 pb-2"></i>
            <div  class="flex-column w-100">
                <em>How it works</em>
                <p>
                    You've been selected by our system randomly to review this recipe.
                    If you find value in this recipe, or if you think others will, you're 
                    allowed to put it back into the ocean! 
                    <i class="fa-solid fa-water recipe-item-in-ocean-icon"></i>
                    This will impact the reach of this recipe immensly.
                </p>
            </div>
    `;
    }else {
        globalHTML.recipeViewer.info.innerHTML = "";
    }

    // Title
    globalHTML.recipeViewer.title.innerText = recipe.title;

    // Image
    if (recipe.image){
        globalHTML.recipeViewer.image.src = recipe.image;
    }else {
        globalHTML.recipeViewer.image.src = "/images/icons/missing.webp";
    }
    // Description
    globalHTML.recipeViewer.description.innerText = recipe.description;
    // instructions
    globalHTML.recipeViewer.instructions.innerText = recipe.instructions;

    /* Dietary attributes NOTE! This will be invisible if no dietary attributes are 
    attached to the recipe */
    buildDietaryAttributes(
        globalHTML.recipeViewer.dietaryAttributes, 
        recipe.dietary_attributes
    );

    // Ingredients
    buildIngredients(
        globalHTML.recipeViewer.ingredients, 
        recipe.ingredients
    );

    // Comments form data
    const commentFormData = new FormData();
    // Comment section
    let comments = "";
    if (recipe['comments'].length > 0) {
        // Sort by date
        recipe['comments'].sort((a, b) => new Date(
            b.created_at) - new Date(a.created_at));
        // Build comments
        recipe['comments'].forEach(comment => {
            const createdComment = htmlComment(
                comment.user,
                comment.created_at,
                comment.text,
            );
            comments += createdComment;
        });
    }
    globalHTML.recipeViewer.comments.innerHTML = comments;


    // Add and store comment comment textarea listener
    addStoredEventListener(
        globalVariables,
        "input",
        `recipe-viewer-comment-input`, 
        (e) => {handleCommentTextarea(e, globalVariables, commentFormData)}
    );

    // Add and store publish comment listener
    addStoredEventListener(
        globalVariables,
        "click", 
        `recipe-viewer-publish-comment-button`, 
        () => {
            handlePublishComment(
                globalVariables, 
                globalHTML, 
                recipe.id, 
                commentFormData
            );
        }
    );

    // Add and store close button listener
    addStoredEventListener(
        globalVariables,
        "click", 
        `recipe-viewer-close-button`, 
        () => {handleClose(globalHTML, globalVariables)}
    );

    // Finally, Make the component visible
    globalHTML.recipeViewer.container.style.visibility = "visible";
};
