"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MainLayout } from "@/components/main-layout"
import { Plus, Trash2, AlertCircle } from "lucide-react"

interface TestCase {
  input: string
  expectedOutput: string
  explanation?: string
}

export default function UploadQuestionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "medium",
    recommendedTimeComplexity: "",
    questionType: "normal",
  })
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", expectedOutput: "", explanation: "" }
  ])
  const [errors, setErrors] = useState<string[]>([])

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", expectedOutput: "", explanation: "" }])
  }

  const removeTestCase = (index: number) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter((_, i) => i !== index))
    }
  }

  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    const updated = testCases.map((testCase, i) => 
      i === index ? { ...testCase, [field]: value } : testCase
    )
    setTestCases(updated)
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!formData.title.trim()) {
      newErrors.push("Question title is required")
    }

    if (!formData.description.trim()) {
      newErrors.push("Question description is required")
    }

    // Validate test cases
    const validTestCases = testCases.filter(tc => 
      tc.input.trim() || tc.expectedOutput.trim()
    )

    if (validTestCases.length === 0) {
      newErrors.push("At least one test case is required")
    }

    // Check for test cases with only input or only output
    const incompleteTestCases = validTestCases.filter(tc => 
      !tc.input.trim() || !tc.expectedOutput.trim()
    )

    if (incompleteTestCases.length > 0) {
      newErrors.push("All test cases must have both input and expected output")
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Clean and validate test cases
    const validTestCases = testCases
      .filter(tc => tc.input.trim() && tc.expectedOutput.trim())
      .map(tc => ({
        input: tc.input.trim(),
        expectedOutput: tc.expectedOutput.trim(),
        explanation: tc.explanation?.trim() || undefined
      }))

    setLoading(true)

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          testCases: validTestCases,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create question")
      }

      alert("Question created successfully!")
      router.push("/questions")
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create question")
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Question</h1>
            <p className="text-gray-600">Create a new coding challenge for the platform</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Question Details</CardTitle>
                <CardDescription>Fill in the details for your coding question</CardDescription>
              </CardHeader>
              <CardContent>
                {errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="font-medium text-red-800">Please fix the following errors:</span>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Question Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Two Sum Problem"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty *</Label>
                      <select
                        id="difficulty"
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="timeComplexity">Recommended Time Complexity</Label>
                      <Input
                        id="timeComplexity"
                        value={formData.recommendedTimeComplexity}
                        onChange={(e) => setFormData({ ...formData, recommendedTimeComplexity: e.target.value })}
                        placeholder="e.g., O(n), O(n log n)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="questionType">Question Type *</Label>
                      <select
                        id="questionType"
                        value={formData.questionType}
                        onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      >
                        <option value="normal">Normal</option>
                        <option value="debugging">Debugging</option>
                        <option value="puzzle">Puzzle</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Problem Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the problem in detail. You can use markdown formatting..."
                      rows={8}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Use clear language and provide examples. You can include constraints, input format, and expected output format.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Test Cases *</Label>
                      <Button type="button" onClick={addTestCase} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Test Case
                      </Button>
                    </div>

                    {testCases.map((testCase, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Test Case {index + 1}</h4>
                          {testCases.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeTestCase(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Input *</Label>
                            <Textarea
                              value={testCase.input}
                              onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                              placeholder="Input for this test case (can be multiline)"
                              rows={4}
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Enter the input exactly as it should be provided to the program
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Expected Output *</Label>
                            <Textarea
                              value={testCase.expectedOutput}
                              onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                              placeholder="Expected output for this test case (can be multiline)"
                              rows={4}
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Enter the exact output that should be produced
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <Label>Explanation (Optional)</Label>
                          <Input
                            value={testCase.explanation || ""}
                            onChange={(e) => updateTestCase(index, 'explanation', e.target.value)}
                            placeholder="Brief explanation of this test case"
                          />
                          <p className="text-xs text-gray-500">
                            Explain why this test case is important or what it tests
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex space-x-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Creating..." : "Create Question"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}