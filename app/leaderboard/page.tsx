import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Medal, Award, TrendingUp, Clock, Target } from "lucide-react"
import Link from "next/link"
import { MainLayout } from "@/components/main-layout"

export default async function LeaderboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const topPlayers = await prisma.user.findMany({
    orderBy: { totalScore: "desc" },
    take: 20,
    select: {
      id: true,
      username: true,
      totalScore: true,
      gamesPlayed: true,
      gamesWon: true,
    },
  })

  const recentGames = await prisma.game.findMany({
    orderBy: { endedAt: "desc" },
    take: 10,
  })

  const userRank = topPlayers.findIndex((player: any) => player.id === user.id) + 1

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Leaderboard</h1>
            <p className="text-gray-600">See how you rank against other coders</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* User Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span>Your Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Global Rank</span>
                    <Badge variant="outline">{userRank > 0 ? `#${userRank}` : "Unranked"}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Score</span>
                    <span className="font-bold">{user.totalScore}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Games Played</span>
                    <span className="font-bold">{user.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Games Won</span>
                    <span className="font-bold">{user.gamesWon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Players */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Top Players</span>
                </CardTitle>
                <CardDescription>Ranked by total score across all games</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topPlayers.map((player: any, index: number) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        player.id === user.id ? "bg-blue-50 border-blue-200" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          {index === 0 && <Trophy className="h-6 w-6 text-yellow-500" />}
                          {index === 1 && <Medal className="h-6 w-6 text-gray-400" />}
                          {index === 2 && <Award className="h-6 w-6 text-amber-600" />}
                          {index > 2 && <span className="text-lg font-bold text-gray-500">#{index + 1}</span>}
                        </div>
                        <div>
                          <h4 className="font-medium flex items-center space-x-2">
                            <span>{player.username}</span>
                            {player.id === user.id && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                          </h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Games */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Recent Games</span>
              </CardTitle>
              <CardDescription>Latest completed matches</CardDescription>
            </CardHeader>
            <CardContent>
              {recentGames.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent games found</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {recentGames.map((game: any) => (
                    <div key={game.id} className="block p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">Game ID: {game.id}</h4>
                          <p className="text-xs text-gray-500">Room ID: {game.roomId}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {JSON.parse(game.players).length} players
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{game.endedAt ? new Date(game.endedAt).toLocaleString() : "Not ended"}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Trophy className="h-3 w-3 text-yellow-500" />
                          <span>Winner: {game.winnerName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
