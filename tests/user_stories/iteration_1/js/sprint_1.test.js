import { initPage } from '../../../../static/js/feed/feed.js';
import { toggleVeganMode } from '../../../../static/js/feed/utilities.js';
import { veganModeColor } from '../../../../static/js/helpers.js';
import { 
    MOCKRECIPEDATA, 
    getFeedVariablesMockData, 
    getFeedHtmlMockData, 
    getAppHtmlMockData,
    getAppVariablesMockData,
} from '../../../helpers/js/helpers.js';
import {expect, test} from '@jest/globals';
import '@testing-library/jest-dom'

// Mock data
let feedHTML = getFeedHtmlMockData();
let feedVariables = getFeedVariablesMockData();
window.appHTML = getAppHtmlMockData();
window.appVariables = getAppVariablesMockData();

/* REMINDER! You cannot test filtering and quering
with static MOCKRECIPEDATA data! These operations takes 
place on the backend.  */

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

describe('Render recipes', () => {
    beforeEach(() => {
        feedHTML = getFeedHtmlMockData();
        feedVariables = getFeedVariablesMockData();
        window.appHTML = getAppHtmlMockData();
        window.appVariables = getAppVariablesMockData();
    });

    test("renders recipes and appends to the DOM", async () => {
        await initPage(feedHTML, feedVariables);
        // Check that recipes were appended to the DOM
        expect(feedHTML.feed.childElementCount).toBe(4);
        // Check the presence of all recipes in the DOM
        MOCKRECIPEDATA.recipes.forEach(async recipe => {
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(feedHTML.feed).toHaveTextContent(recipe.title);
        });
    });
});

describe('Vegan mode button', () => {
    beforeEach(() => {
        feedHTML = getFeedHtmlMockData();
        feedVariables = getFeedVariablesMockData();
        window.appHTML = getAppHtmlMockData();
        window.appVariables = getAppVariablesMockData();
    });

    test("Swiches vegan mode, color and text accurately", async () => {
        // Expect vegan mode to be true initially
        expect(feedVariables.user.veganMode).toBe(true);
        // Toggle off, check color and text 
        await toggleVeganMode(feedHTML, feedVariables);
        expect(feedHTML.veganIcon.style.color).toBe(veganModeColor(false));
        expect(window.appHTML.hintWindowText).toHaveTextContent("OFF");
        // Toggle off, check color and text
        await toggleVeganMode(feedHTML, feedVariables);
        expect(feedHTML.veganIcon.style.color).toBe(veganModeColor(true));
        expect(window.appHTML.hintWindowText).toHaveTextContent("ON");
        expect(window.appHTML.hintWindowText).toHaveTextContent(
            "This overrides any other settings."
        );
    });
});
