import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, difficulty, recommendedTimeComplexity, testCases, questionType } = body

    if (!title || !description || !testCases || !Array.isArray(testCases)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate and clean test cases
    const cleanedTestCases = testCases
      .filter(testCase => testCase && testCase.input !== undefined && testCase.expectedOutput !== undefined)
      .map(testCase => ({
        input: testCase.input.toString().trim(),
        expectedOutput: testCase.expectedOutput.toString().trim(),
        explanation: testCase.explanation?.toString().trim() || undefined
      }))
      .filter(testCase => testCase.input || testCase.expectedOutput)

    if (cleanedTestCases.length === 0) {
      return NextResponse.json({ error: "At least one valid test case is required" }, { status: 400 })
    }

    const question = await prisma.question.create({
      data: {
        title,
        description,
        difficulty: difficulty || "medium",
        recommendedTimeComplexity,
        testCases: cleanedTestCases,
        questionType: questionType || "normal",
        createdBy: user.id,
      },
      include: { creator: { select: { username: true } } },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error("[POST] /api/questions - Error:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get('difficulty')
    const questionType = searchParams.get('questionType')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (difficulty) where.difficulty = difficulty
    if (questionType) where.questionType = questionType

    const questions = await prisma.question.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { username: true } } },
    })

    return NextResponse.json(questions)
  } catch (error) {
    console.error("[GET] /api/questions - Error:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}