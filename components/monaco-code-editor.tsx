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
        return `// JavaScript solution
const input = [];
require('readline')
  .createInterface(process.stdin, process.stdout)
  .on('line', line => input.push(line))
  .on('close', () => {
    // Your code here
  });`
      case 'python':
        return `# Python solution
import sys

# Your code here`
      case 'cpp':
        return `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`
      case 'java':
        return `import java.util.*;

class Solution {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        // Your code here
        scanner.close();
    }
}`
      case 'c':
        return `#include <stdio.h>

int main() {
    // Your code here
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