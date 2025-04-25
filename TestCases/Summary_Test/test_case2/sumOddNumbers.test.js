// Function to calculate the sum of odd numbers in an array
function sumOddNumbers(arr) {
  return arr.filter(num => num % 2 !== 0).reduce((acc, num) => acc + num, 0);
}

// Test Suite for sumOddNumbers function
describe("sumOddNumbers", () => {

  test("sum with positive numbers", () => {
    expect(sumOddNumbers([1, 2, 3, 4, 5])).toBe(9);  // 1 + 3 + 5 = 9
  });

  test("sum with mixed numbers", () => {
    expect(sumOddNumbers([0, -1, 2, -3, 4])).toBe(-4);  // -1 + (-3) = -4
  });

  test("sum with no odd numbers", () => {
    expect(sumOddNumbers([2, 4, 6])).toBe(0);  // No odd numbers
  });

  test("sum with all odd numbers", () => {
    expect(sumOddNumbers([1, 3, 5, 7])).toBe(16);  // 1 + 3 + 5 + 7 = 16
  });
});
