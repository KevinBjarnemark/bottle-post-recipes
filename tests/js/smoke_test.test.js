
import {smokeTest} from '../../static/js/smoke_test';

test('adds 1 + 2 to equal 3', () => {
  expect(smokeTest(1, 2)).toBe(3);
});
