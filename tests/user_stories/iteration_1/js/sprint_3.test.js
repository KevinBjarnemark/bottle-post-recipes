
import { 
    getFeedVariablesMockData, 
    getFeedHtmlMockData, 
    getAppHtmlMockData,
    getAppVariablesMockData,
    MOCKRECIPEDATA 
} from '../../../helpers/js/helpers.js';
import { 
    deleteRecipeConfirmed, 
    deleteRecipe 
} from '../../../../static/js/feed/recipe_editor.js';
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
    if (url.includes('/delete_recipe/?recipe_id=0')) {// NOTE! recipe ID = 0
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
    }else {
        return Promise.reject(new Error('Unknown endpoint'));
    }
});

describe("Displays delete recipe components accurately", () => {
    beforeEach(() => {
        feedHTML = getFeedHtmlMockData();
        feedVariables = getFeedVariablesMockData();
        window.appHTML = getAppHtmlMockData();
        window.appVariables = getAppVariablesMockData();
    });

    test('Ensure that the password confirmation window appears', async () => {
        await initPage(feedHTML, feedVariables);
        await deleteRecipe(0);
        await new Promise(resolve => setTimeout(resolve, 50));
        // Check if warning message appears
        expect(window.appHTML.passwordConfirmationPopUp.info).toHaveTextContent(
            "Warning! This action cannot be undone, please confirm your password to delete this recipe."
        );
        // Expect key elements to exist (input, confirmation button, etc.)
        expect(window.appHTML.passwordConfirmationPopUp.container).toBeInTheDocument();
        expect(window.appHTML.passwordConfirmationPopUp.input).toBeInTheDocument();
        expect(window.appHTML.passwordConfirmationPopUp.confirmButton).toBeInTheDocument();
        expect(window.appHTML.passwordConfirmationPopUp.closeButton).toBeInTheDocument();
    });

    test('displays confirmation message after successful request', async () => {
        await initPage(feedHTML, feedVariables);
        await deleteRecipeConfirmed(0, "mocked-password");
        await new Promise(resolve => setTimeout(resolve, 50));
        // Check if confirmation message appears
        expect(window.appHTML.hintWindowText).toHaveTextContent(
            "Recipe successfully deleted! ✔️"
        );
    });
});

/* NOTE! Cannot test if authors recipes displays separately since
recipes are filtered in the back-end */
