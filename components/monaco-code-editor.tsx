"use client"

import { Editor } from "@monaco-editor/react"
import { useTheme } from "next-themes"

interface MonacoCodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
  readOnly?: boolean
}

export function MonacoCodeEditor({ 
  value, 
  onChange, 
  language, 
  height = "300px",
  readOnly = false 
}: MonacoCodeEditorProps) {
  const { theme } = useTheme()

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'javascript': return 'javascript'
      case 'python': return 'python'
      case 'cpp': return 'cpp'
      case 'java': return 'java'
      case 'c': return 'c'
      default: return 'javascript'
    }
  }

  const getDefaultCode = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return `// Write your JavaScript solution here
// The input will be provided via stdin
// Use console.log() for output

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let input = [];
rl.on('line', (line) => {
  input.push(line);
});

rl.on('close', () => {
  // Your solution here
  const lines = input;
  const n = parseInt(lines[0]);
  const arr = lines[1].split(' ').map(Number);
  
  // Calculate sum
  const sum = arr.reduce((a, b) => a + b, 0);
  
  console.log(sum);
});`
      case 'python':
        return `# Write your Python solution here
# The input will be provided via stdin
# Use print() for output

import sys

def main():
    # Read input
    lines = sys.stdin.read().strip().split('\\n')
    n = int(lines[0])
    arr = list(map(int, lines[1].split()))
    
    # Calculate sum
    result = sum(arr)
    
    print(result)

if __name__ == "__main__":
    main()`
      case 'cpp':
        return `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    try {
        // Read input safely
        int n;
        cin >> n;
        
        // Validate input
        if (n <= 0 || n > 100000) {
            cout << "Invalid input size" << endl;
            return 1;
        }
        
        vector<int> arr(n);
        for(int i = 0; i < n; i++) {
            cin >> arr[i];
        }
        
        // Calculate sum
        int sum = 0;
        for(int i = 0; i < n; i++) {
            sum += arr[i];
        }
        
        cout << sum << endl;
        return 0;
    } catch (const exception& e) {
        cerr << "Error: " << e.what() << endl;
        return 1;
    } catch (...) {
        cerr << "Unknown error occurred" << endl;
        return 1;
    }
}`
      case 'java':
        return `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        try {
            // Read input
            int n = sc.nextInt();
            int[] arr = new int[n];
            for(int i = 0; i < n; i++) {
                arr[i] = sc.nextInt();
            }
            
            // Calculate sum
            int sum = 0;
            for(int i = 0; i < n; i++) {
                sum += arr[i];
            }
            
            System.out.println(sum);
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        } finally {
            sc.close();
        }
    }
}`
      case 'c':
        return `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Read input safely
    int n;
    if (scanf("%d", &n) != 1) {
        printf("Invalid input\\n");
        return 1;
    }
    
    // Validate input
    if (n <= 0 || n > 100000) {
        printf("Invalid input size\\n");
        return 1;
    }
    
    int* arr = (int*)malloc(n * sizeof(int));
    if (arr == NULL) {
        printf("Memory allocation failed\\n");
        return 1;
    }
    
    for(int i = 0; i < n; i++) {
        if (scanf("%d", &arr[i]) != 1) {
            printf("Invalid input\\n");
            free(arr);
            return 1;
        }
    }
    
    // Calculate sum
    int sum = 0;
    for(int i = 0; i < n; i++) {
        sum += arr[i];
    }
    
    printf("%d\\n", sum);
    free(arr);
    return 0;
}`
      default:
        return '// Write your code here'
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={getMonacoLanguage(language)}
        value={value || getDefaultCode(language)}
        onChange={(val) => onChange(val || "")}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          contextmenu: true,
          selectOnLineNumbers: true,
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  )
}