import { NextRequest, NextResponse } from "next/server"
import { executeCode } from "@/lib/piston"

export async function POST(request: NextRequest) {
  try {
    const { code, language, testCases } = await request.json()
    if (!code || !language || !Array.isArray(testCases)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const result = await executeCode(code, language, testCases)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
