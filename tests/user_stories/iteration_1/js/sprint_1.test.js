import { initPage } from '../../../../static/js/feed/feed.js';
import { toggleVeganMode } from '../../../../static/js/feed/utilities.js';
import { veganModeColor } from '../../../../static/js/helpers.js';
import { MOCKRECIPEDATA, getFeedGlobalVariablesMockData, 
  getFeedGlobalHtmlMockData, extraMocking } from '../../../helpers/js/helpers.js';
import {expect, test} from '@jest/globals';
import '@testing-library/jest-dom'

// Mock data
extraMocking();
let globalHTML = getFeedGlobalHtmlMockData();
let globalVariables = getFeedGlobalVariablesMockData();

/* REMINDER! You cannot test filtering and quering
with static MOCKRECIPEDATA data! These operations takes 
place on the backend.  */

/* NOTE! These simulate successful responses */
global.fetch = jest.fn((url) => {
    if (url.includes('/toggle_vegan_mode')) {
        return Promise.resolve({
        status: 200,
        json: () => Promise.resolve({})
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
        extraMocking();
        globalHTML = getFeedGlobalHtmlMockData();
        globalVariables = getFeedGlobalVariablesMockData();
    });

    test("renders recipes and appends to the DOM", async () => {
        await initPage(globalHTML, globalVariables);
        // Check that recipes were appended to the DOM
        expect(globalHTML.feed.childElementCount).toBe(4);
        // Check the presence of all recipes in the DOM
        MOCKRECIPEDATA.recipes.forEach(async recipe => {
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(globalHTML.feed).toHaveTextContent(recipe.title);
        });
    });
});

describe('Vegan mode button', () => {
    beforeEach(() => {
        extraMocking();
        globalHTML = getFeedGlobalHtmlMockData();
        globalVariables = getFeedGlobalVariablesMockData();
    });

    test("Swiches vegan mode, color and text accurately", async () => {
        // Expect vegan mode to be true initially
        expect(globalVariables.user.veganMode).toBe(true);
        // Toggle off, check color and text 
        await toggleVeganMode(globalHTML, globalVariables);
        expect(globalHTML.veganIcon.style.color).toBe(veganModeColor(false));
        expect(globalHTML.hintWindowText).toHaveTextContent("OFF");
        // Toggle off, check color and text
        await toggleVeganMode(globalHTML, globalVariables);
        expect(globalHTML.veganIcon.style.color).toBe(veganModeColor(true));
        expect(globalHTML.hintWindowText).toHaveTextContent("ON");
        expect(globalHTML.hintWindowText).toHaveTextContent(
            "This overrides any other settings."
        );
    });
});
