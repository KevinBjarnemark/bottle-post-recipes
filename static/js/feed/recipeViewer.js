import { addStoredEventListener, getCookie } from "../helpers.js";


/**
 * Closes the recipe viewer component and clears 
 * previously generated content.
 * 
 */
const handleClose = (globalVariables, elements) => {
    // Clean up and hide
    globalVariables.currentComment = "";
    elements.recipeViewerGenerated.innerHTML = "";
    elements.recipeViewerContainer.style.visibility = "hidden";
};

/**
 * Creates a reusable comment html string.
 * 
 * @param {String}  username
 * @param {String}   date Date string
 * @param {String}   text Comment text
 * @returns {String} A comment HTML string 
 */
const htmlComment = (username, date, text) => {
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
const handleCommentTextarea = (e, globalVariables, commentFormData) => {
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
const handlePublishComment = async (recipeId) => {
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
            const commentSection = document.querySelector(
                `#comment-input-${recipeId}`
            ).parentElement.querySelector('div');

            // Create the new comment element
            const newCommentHTML = htmlComment(
                globalVariables.username,
                new Date().toLocaleString(), // Simulated
                globalVariables.currentComment,
            );
            // Insert the at the top
            commentSection.insertAdjacentHTML('afterbegin', newCommentHTML);

            // Clear textarea and form data
            document.getElementById(`comment-input-${recipeId}`).value = "";
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
 * Displays each recipe with detailed information such as 
 * ingredients, dietary attributes, and more.
 * 
 * Manages the contents of the recipe-viewer-generated element 
 * with global event listeners customized customized for each 
 * loaded recipe.
 * 
 */
export const recipeViewer = (globalVariables) => {
    // Comments form data
    const commentFormData = new FormData();
    // Associated HTML elements
    const elements = {
        recipeViewerGenerated: document.getElementById(
            "recipe-viewer-generated"
        ),
        recipeViewerContainer: document.getElementById(
            "recipe-viewer-container"
        ),
        recipeViewer: document.getElementById("recipe-viewer"),
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

                // Generate comments section
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

                    <section>
                        <h5>Comments <span class="text-orange">(BETA)</span></h5>
                        <div class="flex-column comment-section w-100">
                            <div class="flex-column w-100">${comments}</div>
                            <textarea 
                                class="flex-column comment-input border-radius-soft"
                                id="comment-input-${recipe.id}" 
                                placeholder="Write a comment..."></textarea>
                            <button 
                                id="publish-comment-button-${recipe.id}"  
                                class="standard-button w-25">
                                Publish comment
                            </button>
                        </div>
                    </section>
                    <button
                        id="recipe-viewer-close-button-${recipe.id}" 
                        class="close-button-fixed">
                        X
                    </button>
                `;

            // Add and store comment comment textarea listener
            addStoredEventListener(
                globalVariables,
                "input", 
                `comment-input-${recipe.id}`, 
                () => {handleCommentTextarea(e, globalVariables, commentFormData)}
            );

            // Add and store publish comment listener
            addStoredEventListener(
                globalVariables,
                "click", 
                `publish-comment-button-${recipe.id}`, 
                () => handlePublishComment(recipe.id)
            );
            // Add and store close button listener
            addStoredEventListener(
                globalVariables,
                "click", 
                `recipe-viewer-close-button-${recipe.id}`, 
                () => {handleClose(globalVariables, elements)}
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
