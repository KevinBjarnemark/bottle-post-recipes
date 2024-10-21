
import { 
    toggleSidebarSettings, 
    toggleVeganMode 
} from './utilities.js';
import { getRecipePage, cleanUpFeed } from './updateDOM.js';

/**
 * Configure sidebar listeners such as search settings
 * 
 * @param {Object}  globalHTML
 * @param {Object}   globalVariables
 */
const sidebarListeners = (globalHTML, globalVariables) => {
    // Settings obejct
    const sidebarButtonsObject = [
        {
            containerEntry: "searchContainer", // globalHTML
            buttonEntry: "sidebarSearchButton", // globalHTML
            icon: "magnifying-glass"
        },
        {
            containerEntry: "filterContainer", // globalHTML
            buttonEntry: "sidebarFilterButton", // globalHTML
            icon: "filter"
        },
    ];
    
    // Setting containers and buttons
    sidebarButtonsObject.forEach(i => {
        globalHTML[i.buttonEntry].addEventListener("click", async () => {
            // Close other open setting containers
            sidebarButtonsObject.forEach(iNested => {
                const containerIsOpen = globalHTML[iNested.containerEntry].
                    style.display === "flex";
                if (containerIsOpen && iNested.containerEntry !== i.containerEntry) {
                    toggleSidebarSettings(
                        globalHTML, 
                        iNested.icon, 
                        iNested.containerEntry, 
                        iNested.buttonEntry
                    );
                }
            });
            toggleSidebarSettings(globalHTML, i.icon, i.containerEntry, i.buttonEntry);
        });
    });

    // Search input
    globalHTML.searchInput.addEventListener("keyup", async function(event) {
        globalVariables.filterObject.q = event.target.value;
    });

    // Search button
    globalHTML.searchButton.addEventListener("click", async () => {
        cleanUpFeed(globalHTML, globalVariables);
        await getRecipePage(1, globalHTML, globalVariables);
    });

    // Filter button
    globalHTML.filterButton.addEventListener("click", async () => {
        cleanUpFeed(globalHTML, globalVariables);
        await getRecipePage(1, globalHTML, globalVariables);
    });
};

/**
 * Configures the listeners that should be active on page load
 * 
 * @param {Object}  globalHTML
 * @param {Object}   globalVariables
 */
export const configureListeners = (globalHTML, globalVariables) => {
    // Toggle vegan mode button
    globalHTML.veganButton.addEventListener("click", () => {
        toggleVeganMode(globalHTML, globalVariables)
    });

    // Load recipes in groups
    globalHTML.loadRecipesButton.addEventListener("click", async () => {
        globalVariables.page++; // Increment page number
        await getRecipePage(globalVariables.page, globalHTML, globalVariables);
    });

    sidebarListeners(globalHTML, globalVariables);
};
