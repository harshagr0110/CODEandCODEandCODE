// Test script for Piston API improvements
const axios = require('axios');

// Test the C++ transformation function
function testCppTransformation() {
  console.log('🧪 Testing C++ transformation...\n');
  
  const testCases = [
    {
      name: 'Basic cin>>n; pattern',
      code: `#include <iostream>
using namespace std;

int main() {
    int n;cin>>n;
    cout<<1<<endl;
    return 0;
}`,
      input: '11',
      expectedOutput: '1'
    },
    {
      name: 'cin >> n; with spaces',
      code: `#include <iostream>
using namespace std;

int main() {
    int n; cin >> n;
    cout << 1 << endl;
    return 0;
}`,
      input: '11',
      expectedOutput: '1'
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`Original code: ${testCase.code.substring(0, 100)}...`);
    
    // Simulate the transformation
    let fixed = testCase.code;
    if (fixed.includes('cin>>')) {
      const cinMatch = fixed.match(/cin\s*>>\s*(\w+)/g);
      if (cinMatch) {
        cinMatch.forEach(match => {
          const varName = match.replace(/cin\s*>>\s*/, '').replace(';', '');
          fixed = fixed.replace(match, `${varName} = ${testCase.input};`);
        });
      }
    }
    
    console.log(`Transformed code: ${fixed.substring(0, 100)}...`);
    console.log('---\n');
  }
}

async function testPistonAPI() {
  console.log('🧪 Testing Piston API improvements...\n');

  const testCases = [
    {
      name: 'Basic JavaScript execution',
      code: 'console.log("Hello, World!");',
      language: 'javascript',
      input: '',
      expectedOutput: 'Hello, World!'
    },
    {
      name: 'JavaScript with input',
      code: `
        const input = readline();
        console.log("Input was:", input);
      `,
      language: 'javascript',
      input: 'test input',
      expectedOutput: 'Input was: test input'
    },
    {
      name: 'Python basic execution',
      code: 'print("Hello from Python!")',
      language: 'python',
      input: '',
      expectedOutput: 'Hello from Python!'
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    
    try {
      const response = await axios.post('http://localhost:3000/api/practice/submit', {
        code: testCase.code,
        language: testCase.language,
        testCases: [{
          input: testCase.input,
          expectedOutput: testCase.expectedOutput
        }]
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const result = response.data;
      console.log(`✅ Status: ${result.isCorrect ? 'PASSED' : 'FAILED'}`);
      console.log(`📊 Feedback: ${result.feedback}`);
      console.log(`⏱️  Execution time: ${result.executionTime}ms`);
      
      if (result.testResults && result.testResults.length > 0) {
        const testResult = result.testResults[0];
        console.log(`📤 Expected: "${testResult.expectedOutput}"`);
        console.log(`📥 Actual: "${testResult.actualOutput}"`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
    
    console.log('---\n');
  }

  console.log('🎉 Test completed!');
}

// Run the tests if this file is executed directly
if (require.main === module) {
  testCppTransformation();
  // testPistonAPI().catch(console.error);
}

module.exports = { testPistonAPI, testCppTransformation }; 