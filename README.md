# Coding Platform

A competitive coding platform with real-time multiplayer games and practice problems.

## Features

- 🎮 **Real-time multiplayer coding games**
- 📝 **Practice problems with multiple languages**
- 🏆 **Leaderboards and scoring**
- 👥 **Room-based gameplay**
- 📊 **Code execution with Judge0 API**

## Setup

### 1. Environment Variables

Create a `.env.local` file:

```env
# Judge0 API Configuration (Required)
RAPIDAPI_KEY=your_rapidapi_key_here

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 2. Get RapidAPI Key (IMPORTANT!)

**Step 1: Sign up for RapidAPI**
1. Go to [RapidAPI](https://rapidapi.com)
2. Create an account or sign in

**Step 2: Subscribe to Judge0 CE**
1. Go to [Judge0 CE API](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Click "Subscribe to Test"
3. Choose the free plan (100 requests/month)
4. Complete the subscription

**Step 3: Get your API Key**
1. In your RapidAPI dashboard, go to "My Apps"
2. Find your Judge0 CE subscription
3. Copy the API key (starts with something like `7cc9136ademsh...`)
4. Add it to your `.env.local` file

**Step 4: Verify Setup**
- Make sure the API key is in your `.env.local` file
- Restart your development server
- Try submitting code again

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

## Troubleshooting

### "Judge0 API error: 403"
This means your RapidAPI key is not working. To fix:

1. **Check your API key**: Make sure it's copied correctly from RapidAPI
2. **Verify subscription**: Ensure you're subscribed to Judge0 CE API
3. **Check environment**: Make sure `RAPIDAPI_KEY` is in your `.env.local` file
4. **Restart server**: Stop and restart your development server

### "Authentication failed"
- Make sure you've subscribed to the Judge0 CE API on RapidAPI
- Check that your API key is valid and active
- Verify the key is properly set in your environment variables

## Supported Languages

- **JavaScript** (Node.js 18.15.0)
- **Python** (3.8.1)
- **C++** (GCC 9.2.0)
- **Java** (OpenJDK 13.0.1)
- **C** (GCC 9.2.0)

## Architecture

- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma
- **Code Execution**: Judge0 API
- **Authentication**: Clerk
- **Real-time**: Socket.IO

## Code Execution

The platform uses **Judge0 CE** for reliable code execution:

- ✅ **No SIGSEGV issues** (unlike Piston)
- ✅ **Stable execution environment**
- ✅ **Multiple language support**
- ✅ **Proper error handling**
- ✅ **Timeout and memory limits**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
