
import { 
    getFeedVariablesMockData, 
    getFeedHtmlMockData, 
    getAppHtmlMockData,
    getAppVariablesMockData,
    MOCKRECIPEDATA 
} from '../../../helpers/js/helpers.js';
import { capitalizeFirstLetter } from '../../../../static/js/helpers.js';
import { toggleFilters } from '../../../../static/js/feed/utilities.js';
import { initPage } from '../../../../static/js/feed/feed.js';
import {expect, test} from '@jest/globals';
import '@testing-library/jest-dom'

// Mock data
let feedHTML = getFeedHtmlMockData();
let feedVariables = getFeedVariablesMockData();
window.appHTML = getAppHtmlMockData();
window.appVariables = getAppVariablesMockData();

/* NOTE! These simulate successful responses */
global.fetch = jest.fn((url) => {
    if (url.includes('/toggle_vegan_mode')) {
        return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({
            success: true,
            error: "",
        })
        });
    } else if (url.includes('/load_recipes')) {
        return Promise.resolve({
        status: 200,
        json: () => Promise.resolve(MOCKRECIPEDATA)
        });
    } else {
        return Promise.reject(new Error('Unknown endpoint'));
    }
});

describe("toggles filters accurately", () => {
    beforeEach(() => {
        feedHTML = getFeedHtmlMockData();
        feedVariables = getFeedVariablesMockData();
        window.appHTML = getAppHtmlMockData();
        window.appVariables = getAppVariablesMockData();
    });

    test('displays user messages when toggling recipeTypes filters', async () => {
        const toggleFilterHelper = (attribute, expectedOutcome) => {
        // Toggle 
        toggleFilters(feedHTML, feedVariables, attribute);
        // Expect filter to be toggled
        expect(feedVariables.filterObject.recipeTypes[attribute]).toBe(expectedOutcome);
        // Expect certain keywords are present in the hint window
        const textOutcome = `${capitalizeFirstLetter(attribute)} recipes are ${!expectedOutcome ? "excluded" : "included"} in your search`
        expect(window.appHTML.hintWindowText).toHaveTextContent(textOutcome);
        };

        // Check if all filters can be toggled
        Object.entries(feedVariables.filterObject.recipeTypes)
            .forEach(([attribute, value]) => {
        // Expect all attributes to be true by default
        expect(value).toBeTruthy();
        // Toggle and check the hint window
        toggleFilterHelper(attribute, false);
        // Toggle and check the hint window
        toggleFilterHelper(attribute, true);
        });
    });
});

describe("Recipe viewer", () => {
    beforeEach(() => {
        feedHTML = getFeedHtmlMockData();
        feedVariables = getFeedVariablesMockData();
        window.appHTML = getAppHtmlMockData();
        window.appVariables = getAppVariablesMockData();
    });

    test("Loads the recipe viewer on click and verifies rendering to the DOM", 
            async () => {
        await initPage(feedHTML, feedVariables);
        // Check that recipes were appended to the DOM
        expect(feedHTML.feed.childElementCount).toBe(4);

        // Recursevly verify each recipe
        MOCKRECIPEDATA.recipes.forEach(async recipe => {
            await new Promise(resolve => setTimeout(resolve, 50));
            // Check the presence of the recipe in the DOM
            expect(feedHTML.feed).toHaveTextContent(recipe.title);
            // Get and click on the image button (to load the recipe viewer)
            const imageButton = document.getElementById(
                `recipe-image-button-${recipe.id}`
            );
            expect(imageButton).toBeInTheDocument();
            imageButton.click();
            
            // Verify key components 
            const parentElement = feedHTML.recipeViewer.container;
            expect(parentElement).toBeInTheDocument();
            expect(parentElement).toHaveTextContent(recipe.title);
            expect(parentElement).toHaveTextContent(recipe.description);
            expect(parentElement).toHaveTextContent(recipe.instructions);
            // Verify each ingredient
            recipe.ingredients.forEach(ingredient => {
                expect(parentElement).toHaveTextContent(ingredient.name);
                expect(parentElement).toHaveTextContent(ingredient.quantity);
            });
            // Verify each comment
            recipe.comments.forEach(comment => {
                expect(parentElement).toHaveTextContent(comment.user);
                expect(parentElement).toHaveTextContent(comment.text);
            });
        });
    });
});
