import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    console.log("[POST] /api/questions - handler called")
    const user = await getCurrentUser()
    console.log("[POST] /api/questions - user:", user)
    if (!user) {
      console.log("[POST] /api/questions - Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("[POST] /api/questions - request body:", body)
    const { title, description, difficulty, recommendedTimeComplexity, testCases, questionType } = body

    if (!title || !description || !testCases || !Array.isArray(testCases)) {
      console.log("[POST] /api/questions - Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate test cases structure
    for (const testCase of testCases) {
      if (!testCase.input || !testCase.expectedOutput) {
        console.log("[POST] /api/questions - Invalid test case:", testCase)
        return NextResponse.json({ error: "Each test case must have input and expectedOutput" }, { status: 400 })
      }
    }

    console.log("[POST] /api/questions - Creating question in DB")
    const question = await prisma.question.create({
      data: {
        title,
        description,
        difficulty: difficulty || "medium",
        recommendedTimeComplexity,
        testCases,
        questionType: questionType || "normal",
        createdBy: user.id,
      },
      include: { creator: { select: { username: true } } },
    })
    console.log("[POST] /api/questions - Question created:", question)
    return NextResponse.json(question)
  } catch (error) {
    console.error("[POST] /api/questions - Error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
    }
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[GET] /api/questions - handler called")
    const user = await getCurrentUser()
    console.log("[GET] /api/questions - user:", user)
    if (!user) {
      console.log("[GET] /api/questions - Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get('difficulty')
    const questionType = searchParams.get('questionType')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (difficulty) where.difficulty = difficulty
    if (questionType) where.questionType = questionType

    console.log("[GET] /api/questions - Querying DB", { where, limit })
    const questions = await prisma.question.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { username: true } } },
    })
    console.log("[GET] /api/questions - Questions fetched:", questions.length)
    return NextResponse.json(questions)
  } catch (error) {
    console.error("[GET] /api/questions - Error:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
    }
    return NextResponse.json({ error: JSON.stringify(error) }, { status: 500 })
  }
}