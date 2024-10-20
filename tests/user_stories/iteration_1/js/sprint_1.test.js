import { renderRecipes } from '../../../../static/js/feed/updateDOM.js';
import {expect, test} from '@jest/globals';
import '@testing-library/jest-dom'

// Mock the globalHTML and globalVariables objects
const mockFeedContainer = document.createElement('div');
mockFeedContainer.className = 'feed-container';
document.body.appendChild(mockFeedContainer);

let globalHTML = {
  feed: mockFeedContainer,
};

let globalVariables = {
  recipes: [],
  veganMode: false,
};

// Mock data from the backend
const mockData = {
  recipes: [
    {
      id: 1,
      title: 'Test Recipe 1',
      user_image: null,
      bottle_posted_count: 5,
      in_ocean: true,
      image: null,
      vegan: true,
      likes: 10,
    },
    {
      id: 2,
      title: 'Test Recipe 2',
      user_image: null,
      bottle_posted_count: 3,
      in_ocean: false,
      image: null,
      vegan: false,
      likes: 15,
    }
  ],
  total_recipes: 2,
  batch: 2
};

describe('renderRecipes', () => {
  beforeEach(() => {
    // Clear the feed container and reset recipes array
    mockFeedContainer.innerHTML = '';
    globalVariables.recipes = [];
  });

  test('renders recipes and appends to the DOM', () => {
    renderRecipes(mockData, globalHTML, globalVariables);
    // Check that recipes were appended to the feed container
    expect(globalHTML.feed.childElementCount).toBe(2);
    
    // Check the presence of specific recipe elements in the DOM
    expect(globalHTML.feed).toHaveTextContent('Test Recipe 1');
    expect(globalHTML.feed).toHaveTextContent('Test Recipe 2');
  });

});
