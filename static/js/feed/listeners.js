
import { 
    toggleSidebarSettings, 
    toggleVeganMode 
} from './utilities.js';
import { getRecipePage, cleanUpFeed } from './update_dom.js';

/**
 * Configure sidebar listeners such as search settings
 * 
 * @param {Object}  feedHTML
 * @param {Object}   feedVariables
 */
const sidebarListeners = (feedHTML, feedVariables) => {
    // Settings obejct
    const sidebarButtonsObject = [
        {
            containerEntry: "searchContainer", // feedHTML
            buttonEntry: "sidebarSearchButton", // feedHTML
            icon: "magnifying-glass"
        },
        {
            containerEntry: "filterContainer", // feedHTML
            buttonEntry: "sidebarFilterButton", // feedHTML
            icon: "filter"
        },
    ];
    
    // Setting containers and buttons
    sidebarButtonsObject.forEach(i => {
        feedHTML[i.buttonEntry].addEventListener("click", async () => {
            // Close other open setting containers
            sidebarButtonsObject.forEach(iNested => {
                const containerIsOpen = feedHTML[iNested.containerEntry].
                    style.display === "flex";
                if (containerIsOpen && iNested.containerEntry !== i.containerEntry) {
                    toggleSidebarSettings(
                        feedHTML, 
                        iNested.icon, 
                        iNested.containerEntry, 
                        iNested.buttonEntry
                    );
                }
            });
            toggleSidebarSettings(feedHTML, i.icon, i.containerEntry, i.buttonEntry);
        });
    });

    // Search input
    feedHTML.searchInput.addEventListener("keyup", async function(event) {
        feedVariables.filterObject.q = event.target.value;
    });

    // Search button
    feedHTML.searchButton.addEventListener("click", async () => {
        cleanUpFeed(feedHTML, feedVariables);
        await getRecipePage(1, feedHTML, feedVariables);
    });

    // Filter button
    feedHTML.filterButton.addEventListener("click", async () => {
        cleanUpFeed(feedHTML, feedVariables);
        await getRecipePage(1, feedHTML, feedVariables);
    });
};

/**
 * Configures the listeners that should be active on page load
 * 
 * @param {Object}  feedHTML
 * @param {Object}   feedVariables
 */
export const configureListeners = (feedHTML, feedVariables) => {
    // Toggle vegan mode button
    feedHTML.veganButton.addEventListener("click", async () => {
        await toggleVeganMode(feedHTML, feedVariables);
    });

    // Load recipes in groups
    feedHTML.loadRecipesButton.addEventListener("click", async () => {
        feedVariables.page++; // Increment page number
        await getRecipePage(feedVariables.page, feedHTML, feedVariables);
    });

    sidebarListeners(feedHTML, feedVariables);
};
