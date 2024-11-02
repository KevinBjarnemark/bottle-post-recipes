import { 
    addStoredEventListener, 
    getCookie 
} from "../helpers.js";
import { setLoading } from "../app.js";


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
 * Handles bottle post reviews, integrated with the back end.
 * 
 * @param {String} recipeId 
 */
const submitBottlePostReview = async (action) => {
    setLoading(true);
    const init = async () => {
        try {
            // Send a DELETE request to the backend
            const response = await fetch(`/submit_bottle_post_review/?action=${action}`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                },
            });

            if (response.ok) {
                await confirmedRedirect(
                    `<p>
                        You've succesfully reviewed this recipe! ✔️
                        <br />
                        Redirecting to home soon...
                    </p>`,
                    7000,
                );
            } else {
                const data = await response.json();
                console.error('Error when submitting bottle post review:', data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    init();
};

/**
 * Updates the currently written comment to a global variable
 * and adds that value to the form data.
 * 
 */
export const handleCommentTextarea = (e, feedVariables, commentFormData) => {
    feedVariables.currentComment = e.target.value;
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
export const handlePublishComment = async (feedVariables, feedHTML, recipeId, commentFormData) => {
    setLoading(true);
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
            const commentSection = feedHTML.recipeViewer.comments
                .parentElement.querySelector('div');

            // Create the new comment element
            const newCommentHTML = htmlComment(
                feedVariables.user.username,
                new Date().toLocaleString(), // Simulated
                feedVariables.currentComment,
            );
            // Insert the at the top
            commentSection.insertAdjacentHTML('afterbegin', newCommentHTML);

            // Clear textarea and form data
            feedHTML.recipeViewer.commentInput.value = "";
            commentFormData.delete("comment");
            commentFormData.delete("recipe_id");
        } else {
            hintWindow(
                `<p>
                    Failed to publish comment ❌
                    <br />
                </p>`, 
                7000
            );
        }
    } catch (error) {
        console.error('Error publishing comment:', error);
    } finally {
        setLoading(false);
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
const handleClose = (feedHTML, feedVariables) => {
    // Clean and hide
    feedHTML.recipeViewer.container.style.visibility = "hidden";
    feedVariables.currentComment = "";
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
export const recipeViewer = (feedHTML, feedVariables, recipeId) => {
    try {
        // Find the recipe to load
        const recipe = feedVariables.recipes.find(i => i.id === recipeId);
        const thisIsAReview = feedVariables?.user?.review_recipe_id === recipe.id;

        // Info text
        if (thisIsAReview){
            feedHTML.recipeViewer.reviewSection.style.display = "block";

            // Add and store bottle post review delete button
            addStoredEventListener(
                feedVariables,
                "click",
                `bottle-post-review-delete-button`, 
                () => {
                    submitBottlePostReview("DELETE");
                }
            );

            // Add and store bottle post review 'boost' button
            addStoredEventListener(
                feedVariables,
                "click",
                `bottle-post-review-boost-button`, 
                () => {
                    submitBottlePostReview("BOTTLE_POST");
                }
            );
        }else {
            feedHTML.recipeViewer.info.innerHTML = "";
        }

        // Title
        feedHTML.recipeViewer.title.innerText = recipe.title;

        // Image
        if (recipe.image){
            feedHTML.recipeViewer.image.src = recipe.image;
        }else {
            feedHTML.recipeViewer.image.src = "/static/images/icons/missing.webp";
        }
        // Description
        feedHTML.recipeViewer.description.innerText = recipe.description;
        // instructions
        feedHTML.recipeViewer.instructions.innerText = recipe.instructions;

        /* Dietary attributes NOTE! This will be invisible if no dietary attributes are 
        attached to the recipe */
        buildDietaryAttributes(
            feedHTML.recipeViewer.dietaryAttributes, 
            recipe.dietary_attributes
        );

        // Ingredients
        buildIngredients(
            feedHTML.recipeViewer.ingredients, 
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
        feedHTML.recipeViewer.comments.innerHTML = comments;

        // Add and store comment comment textarea listener
        addStoredEventListener(
            feedVariables,
            "input",
            `recipe-viewer-comment-input`, 
            (e) => {handleCommentTextarea(e, feedVariables, commentFormData)}
        );

        // Add and store publish comment listener
        addStoredEventListener(
            feedVariables,
            "click", 
            `recipe-viewer-publish-comment-button`, 
            () => {
                handlePublishComment(
                    feedVariables, 
                    feedHTML, 
                    recipe.id, 
                    commentFormData
                );
            }
        );

        // Add and store close button listener
        addStoredEventListener(
            feedVariables,
            "click", 
            `recipe-viewer-close-button`, 
            () => {handleClose(feedHTML, feedVariables)}
        );

        // Finally, Make the component visible
        feedHTML.recipeViewer.container.style.visibility = "visible";
        // Scroll to the top component
        feedHTML.recipeViewer.info.scrollIntoView(
            { behavior: "smooth", block: "start" }
        );
    }catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
};
