// Function to calculate the average of an array of numbers
function calculateAverage(arr) {
  // Check if the array is empty, and return 0 if it is
  if (arr.length === 0) return 0;

  // Sum all numbers in the array using reduce
  const sum = arr.reduce((acc, num) => acc + num, 0); 

  // Return the average by dividing the sum by the array length
  return sum / arr.length;
}

// Test Suite for calculateAverage function
describe('calculateAverage', () => {

  // Test case for calculating the average of positive numbers
  test('calculates average of positive numbers', () => {
    // Test input: [1, 2, 3, 4, 5], expected output: 3
    expect(calculateAverage([1, 2, 3, 4, 5])).toBe(3);
  });

  // Test case for calculating the average of an array with negative numbers
  test('calculates average with negative numbers', () => {
    // Test input: [-1, -2, -3, -4, -5], expected output: -3
    expect(calculateAverage([-1, -2, -3, -4, -5])).toBe(-3);
  });

  // Test case for checking edge case: empty array
  test('returns 0 for empty array', () => {
    // Test input: [], expected output: 0
    expect(calculateAverage([])).toBe(0);
  });

  // Test case for checking a single number in the array
  test('calculates average for a single number', () => {
    // Test input: [10], expected output: 10
    expect(calculateAverage([10])).toBe(10);
  });
});
