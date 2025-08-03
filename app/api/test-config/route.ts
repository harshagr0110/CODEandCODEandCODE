import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY
  
  return NextResponse.json({
    hasApiKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyStart: apiKey?.substring(0, 10) || 'none',
    environment: process.env.NODE_ENV,
    message: apiKey ? 'API key is configured' : 'API key is missing'
  })
} 