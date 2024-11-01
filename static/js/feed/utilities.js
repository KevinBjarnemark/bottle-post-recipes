import { getCookie, capitalizeFirstLetter, veganModeColor } from '../helpers.js';
import { filterVeganRecipes } from './update_dom.js';
import { setLoading, hintWindow } from '../app.js';

/**
 * 1. Toggles the container and its content (with CSS)
 * 
 * 2. Changes the previous icon to a close button when 
 * toggled
 *  
 * 
 * @param {Object}  feedHTML
 * @param {str}   icon Font awesome declaration eg. "magnifying-glass"
 * the container
 * @param {str}   containerEntry The entry (in feedHTML) pointing to 
 * the container
 * @param {str}   buttonEntry The entry (in feedHTML) pointing to 
 * the button
 */
export const toggleSidebarSettings = (feedHTML, icon, containerEntry, buttonEntry) => {
    // Display attribute
    const previousAttribute = feedHTML[containerEntry].style.display;
    // If it's previously hidden, show or vice versa
    if (!previousAttribute || previousAttribute === "none") {
        feedHTML[containerEntry].style.display = "flex";
        // Transform search icon to an X button
        feedHTML[buttonEntry].innerHTML = 
            "<i class='fa-solid fa-x' style='color: rgb(255, 93, 93)'></i>";
    }else {
        feedHTML[containerEntry].style.display = "none";
        feedHTML[buttonEntry].innerHTML = 
            `<i class='fas fa-${icon}'></i>`;
    }
};

/**
 * Toggles the vegan_mode state (in Profile model) and 
 * triggers the hint window to display an informative 
 * message to the user. 
 * 
 */
export const toggleVeganMode = async (feedHTML, feedVariables) => {
    setLoading(true);
    const request = await fetch('/toggle_vegan_mode/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ vegan_mode: !feedVariables.user.veganMode })
    });
    
    if (request.status === 200) {
        // Toggle vegan mode variable
        feedVariables.user.veganMode = !feedVariables.user.veganMode; 
        // Change color
        feedHTML.veganIcon.style.color = veganModeColor(
            feedVariables.user.veganMode
        );
        // Hint window message
        const hintWindowHtml = feedVariables.user.veganMode ? 
        `
        <p>
            Vegan mode is 
            <span style='color:#8aeb84; font-weight: 600'>
                ON
            </span>
            <i class="fa-solid fa-carrot"></i>
            <br />
            This overrides any other settings.
        </p>
        ` 
        :
        `
        <p>
            Vegan mode is 
            <span style='color:#fa6e6e; font-weight: 600'>
                OFF
            </span>
        </p>
        `;
        hintWindow(hintWindowHtml);

        filterVeganRecipes(feedHTML, feedVariables);
    } else {
        console.error('Failed to toggle vegan mode');
    }
    setLoading(false);
};

/**
 * Toggles the filter buttons 
 * 
 */
export const toggleFilters = (feedHTML, feedVariables, filter) => {
    // Toggle filter variable
    feedVariables.filterObject.recipeTypes[filter] = 
        !feedVariables.filterObject.recipeTypes[filter];

    const hintWindowHtml = feedVariables.filterObject.recipeTypes[filter] ? 
    `
    <p>
        <em>${capitalizeFirstLetter(filter)}</em> recipes are 
        <span style='color:#8aeb84; font-weight: 600'>
            included
        </span>
        in your search.
    </p>
    ` 
    :
    `
    <p>
        <em>${capitalizeFirstLetter(filter)}</em> recipes are
        <span style='color:#fa6e6e; font-weight: 600'>
                excluded
        </span>
        in your search.
    </p>
    `;
    hintWindow(hintWindowHtml);
};


/**
 * Adds or removes an item from the search query include array
 * in sync with the event.target.checked.
 * 
 * @param {Object}  feedVariables
 * @param {Object}   checked event.target.checked
 * @param {str}   area eg. tags, description, ingredients
 */
export const toggleSearchAreaItems = (feedVariables, checked, area) => {
    const array = feedVariables.filterObject.searchAreas;
    // Add (if it doesn't exist)
    if (checked) {
        if (!array.includes(area)) {
            array.push(area);
        }
    }else {
        const newArray = array.filter(item => item !== area);
        feedVariables.filterObject.searchAreas = newArray;
    }
};
