import { getCookie, capitalizeFirstLetter, veganModeColor } from '../helpers.js';
import { filterVeganRecipes, hintWindow } from './update_dom.js';

/**
 * 1. Toggles the container and its content (with CSS)
 * 
 * 2. Changes the previous icon to a close button when 
 * toggled
 *  
 * 
 * @param {Object}  globalHTML
 * @param {str}   icon Font awesome declaration eg. "magnifying-glass"
 * the container
 * @param {str}   containerEntry The entry (in globalHTML) pointing to 
 * the container
 * @param {str}   buttonEntry The entry (in globalHTML) pointing to 
 * the button
 */
export const toggleSidebarSettings = (globalHTML, icon, containerEntry, buttonEntry) => {
    // Display attribute
    const previousAttribute = globalHTML[containerEntry].style.display;
    // If it's previously hidden, show or vice versa
    if (!previousAttribute || previousAttribute === "none") {
        globalHTML[containerEntry].style.display = "flex";
        // Transform search icon to an X button
        globalHTML[buttonEntry].innerHTML = 
            "<i class='fa-solid fa-x' style='color: rgb(255, 93, 93)'></i>";
    }else {
        globalHTML[containerEntry].style.display = "none";
        globalHTML[buttonEntry].innerHTML = 
            `<i class='fas fa-${icon}'></i>`;
    }
};

/**
 * Toggles the vegan_mode state (in Profile model) and 
 * triggers the hint window to display an informative 
 * message to the user. 
 * 
 */
export const toggleVeganMode = async (globalHTML, globalVariables) => {
    const request = await fetch('/toggle_vegan_mode/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ vegan_mode: !globalVariables.user.veganMode })
    });
    
    if (request.status === 200) {
        // Toggle vegan mode variable
        globalVariables.user.veganMode = !globalVariables.user.veganMode; 
        // Change color
        globalHTML.veganIcon.style.color = veganModeColor(
            globalVariables.user.veganMode
        );
        // Hint window message
        const hintWindowHtml = globalVariables.user.veganMode ? 
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
        hintWindow(globalVariables, globalHTML, hintWindowHtml);

        filterVeganRecipes(globalVariables);
    } else {
        console.error('Failed to toggle vegan mode');
    }
};

/**
 * Toggles the filter buttons 
 * 
 */
export const toggleFilters = (globalHTML, globalVariables, filter) => {
    // Toggle filter variable
    globalVariables.filterObject.recipeTypes[filter] = 
        !globalVariables.filterObject.recipeTypes[filter];

    const hintWindowHtml = globalVariables.filterObject.recipeTypes[filter] ? 
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
    hintWindow(globalVariables, globalHTML, hintWindowHtml);
};


/**
 * Adds or removes an item from the search query include array
 * in sync with the event.target.checked.
 * 
 * @param {Object}  globalVariables
 * @param {Object}   checked event.target.checked
 * @param {str}   area eg. tags, description, ingredients
 */
export const toggleSearchAreaItems = (globalVariables, checked, area) => {
    const array = globalVariables.filterObject.searchAreas;
    // Add (if it doesn't exist)
    if (checked) {
        if (!array.includes(area)) {
            array.push(area);
        }
    }else {
        const newArray = array.filter(item => item !== area);
        globalVariables.filterObject.searchAreas = newArray;
    }
};
