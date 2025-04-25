#include <iostream>
#include <vector>
using namespace std;

// Function to calculate the sum of even numbers in an array
int sumEvenNumbers(const vector<int>& arr) {
    int sum = 0;
    
    // Iterate through each element in the array
    for (int num : arr) {
        // If the number is even, add it to the sum
        if (num % 2 == 0) {
            sum += num;
        }
    }

    // Return the calculated sum of even numbers
    return sum;
}

int main() {
    vector<int> numbers = {1, 2, 3, 4, 5, 6};  // Example array
    int result = sumEvenNumbers(numbers);  // Calculate the sum of even numbers
    cout << "The sum of even numbers is: " << result << endl;  // Output the result
    return 0;
}
