### Summary of Sum Odd Numbers Test Case

This script defines a function called `sumOddNumbers()`, which calculates the sum of odd numbers from a given array. It includes several test cases to validate the function's behavior.

Test Cases:
- **sum with positive numbers**: Tests the sum of odd numbers in an array of positive integers. Expected result: 9 (1 + 3 + 5).
- **sum with mixed numbers**: Tests the sum of odd numbers in an array containing both positive and negative integers, as well as zero. Expected result: -4 (-1 + -3).
- **sum with no odd numbers**: Verifies that the function returns 0 when there are no odd numbers in the array.
- **sum with all odd numbers**: Tests an array of only odd numbers. Expected result: 16 (1 + 3 + 5 + 7).

The function is validated by using Jest's testing framework to ensure the sum is correctly calculated for different input arrays.
