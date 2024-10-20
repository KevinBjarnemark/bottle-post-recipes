import { veganModeColor, setInitialStates } from '../../static/js/feed/feed.js';
import { toggleVeganMode } from '../../static/js/feed/utilities.js';
import {expect, jest, test} from '@jest/globals';

// Mock the global document elements
const globalHTML = {
    veganButton: document.createElement('button'),
    veganIcon: document.createElement('i'),
    hintWindow: document.createElement('div'),
    hintWindowText: document.createElement('div'),
};

// Add mock IDs
globalHTML.veganButton.id = 'vegan-mode-button';
globalHTML.veganIcon.id = 'vegan-mode-icon';
globalHTML.hintWindow.id = 'hint-window';
globalHTML.hintWindowText.id = 'hint-window-text';

// Mock fetch function
global.fetch = jest.fn(() =>
    Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
    })
);

// Mock the getCookie function
jest.mock('../../static/js/helpers.js', () => ({
    getCookie: () => 'mocked-csrf-token',
}));

describe('Vegan Mode Tests', () => {

    test('veganModeColor should return correct colors', () => {
        // Vegan mode ON
        expect(veganModeColor(true)).toBe('rgb(255, 165, 96)');  
        // Vegan mode OFF
        expect(veganModeColor(false)).toBe('rgb(255, 255, 255)'); 
    });

    test('setInitialStates should set correct initial colors', () => {
        const globalVariables = { veganMode: true };  // Vegan mode is ON

        setInitialStates(globalHTML, globalVariables);
        // Icon should be orange when vegan mode is ON
        expect(globalHTML.veganIcon.style.color).toBe('rgb(255, 165, 96)');

        globalVariables.veganMode = false;  // Vegan mode is OFF
        setInitialStates(globalHTML, globalVariables);
        // Icon should be white when vegan mode is OFF
        expect(globalHTML.veganIcon.style.color).toBe('rgb(255, 255, 255)');
    });

    test('toggleVeganMode should toggle vegan mode and update UI', async () => {
        // Initial state: Vegan mode is ON
        const globalVariables = { veganMode: true, recipes: [] }; 

        // Call toggleVeganMode and wait for async operation
        await toggleVeganMode(globalHTML, globalVariables);

        // Expect the veganMode to be toggled (OFF now)
        expect(globalVariables.veganMode).toBe(false);

        // Check if UI has updated (icon color should be white)
        expect(globalHTML.veganIcon.style.color).toBe('rgb(255, 255, 255)');

        // Check if hint window is shown
        expect(globalHTML.hintWindow.style.display).toBe('block');
        expect(globalHTML.hintWindowText.innerHTML).toContain('OFF');
    });

    test('toggleVeganMode should handle failed request', async () => {
        // Mock fetch to return a failure status
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                status: 500,
            })
        );

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        // Initial state: Vegan mode is ON
        const globalVariables = { veganMode: true };  

        await toggleVeganMode(globalHTML, globalVariables);

        // Ensure that veganMode did not change (still ON)
        expect(globalVariables.veganMode).toBe(true);

        consoleSpy.mockRestore();
    });
});
