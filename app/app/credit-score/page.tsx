"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/components/wallet-provider"
import { TrendingUp, Clock, Activity, Shield, CheckCircle, AlertCircle, Target } from "lucide-react"

const creditFactors = [
  {
    name: "Repayment History",
    score: 95,
    weight: 35,
    status: "excellent",
    description: "Perfect on-time payment record",
    icon: CheckCircle,
  },
  {
    name: "Wallet Age",
    score: 78,
    weight: 25,
    status: "good",
    description: "18 months of transaction history",
    icon: Clock,
  },
  {
    name: "Transaction Frequency",
    score: 85,
    weight: 20,
    status: "very-good",
    description: "Regular DeFi interactions",
    icon: Activity,
  },
  {
    name: "Collateral Ratio",
    score: 72,
    weight: 20,
    status: "good",
    description: "Healthy collateralization",
    icon: Shield,
  },
]

const improvementTips = [
  {
    title: "Increase Transaction Frequency",
    description: "Regular DeFi interactions improve your activity score",
    impact: "+15 points",
    difficulty: "Easy",
  },
  {
    title: "Maintain Higher Collateral",
    description: "Keep collateral ratio above 150% for better scores",
    impact: "+20 points",
    difficulty: "Medium",
  },
  {
    title: "Diversify Protocol Usage",
    description: "Use multiple DeFi protocols to show ecosystem engagement",
    impact: "+25 points",
    difficulty: "Medium",
  },
  {
    title: "Long-term Holdings",
    description: "Hold assets for longer periods to show stability",
    impact: "+10 points",
    difficulty: "Easy",
  },
]

export default function CreditScorePage() {
  const { isConnected } = useWallet()

  const overallScore = 750
  const scoreCategory =
    overallScore >= 800
      ? "Excellent"
      : overallScore >= 700
        ? "Very Good"
        : overallScore >= 600
          ? "Good"
          : overallScore >= 500
            ? "Fair"
            : "Poor"

  if (!isConnected) {
    return (
      <Card className="gradient-card text-center p-12">
        <CardContent>
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Connect Wallet to View Credit Score</h3>
          <p className="text-muted-foreground">
            Connect your wallet to view your DeFi credit score and improvement recommendations
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Credit Score
        </h1>
        <p className="text-muted-foreground mt-2">
          Your DeFi credit score based on on-chain activity and lending behavior
        </p>
      </div>

      {/* Credit Score Overview */}
      <Card className="gradient-card">
        <CardHeader className="text-center">
          <CardTitle>Your DeFi Credit Score</CardTitle>
          <CardDescription>Based on your on-chain activity and lending history</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="relative">
            <div className="w-48 h-48 mx-auto relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(overallScore / 1000) * 251.2} 251.2`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {overallScore}
                  </div>
                  <div className="text-sm text-muted-foreground">out of 1000</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Badge
              variant="secondary"
              className={`text-lg px-4 py-2 ${
                scoreCategory === "Excellent"
                  ? "bg-emerald-500/20 text-emerald-600"
                  : scoreCategory === "Very Good"
                    ? "bg-blue-500/20 text-blue-600"
                    : scoreCategory === "Good"
                      ? "bg-yellow-500/20 text-yellow-600"
                      : "bg-red-500/20 text-red-600"
              }`}
            >
              {scoreCategory}
            </Badge>
            <p className="text-muted-foreground">
              You have a {scoreCategory.toLowerCase()} credit score. This qualifies you for premium lending rates.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>How different factors contribute to your overall credit score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {creditFactors.map((factor) => (
              <div key={factor.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <factor.icon
                      className={`h-5 w-5 ${
                        factor.status === "excellent"
                          ? "text-emerald-500"
                          : factor.status === "very-good"
                            ? "text-blue-500"
                            : factor.status === "good"
                              ? "text-yellow-500"
                              : "text-red-500"
                      }`}
                    />
                    <div>
                      <div className="font-medium">{factor.name}</div>
                      <div className="text-sm text-muted-foreground">{factor.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{factor.score}/100</div>
                    <div className="text-xs text-muted-foreground">{factor.weight}% weight</div>
                  </div>
                </div>
                <Progress value={factor.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Tips */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Improvement Tips
          </CardTitle>
          <CardDescription>Actions you can take to improve your credit score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {improvementTips.map((tip, index) => (
              <Card key={index} className="border border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{tip.title}</CardTitle>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        tip.difficulty === "Easy"
                          ? "border-emerald-500 text-emerald-600"
                          : "border-yellow-500 text-yellow-600"
                      }`}
                    >
                      {tip.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">{tip.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-600">{tip.impact}</span>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score History */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Score History</CardTitle>
          <CardDescription>Your credit score progression over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4">
              {[680, 695, 710, 725, 740, 750].map((score, index) => (
                <div key={index} className="text-center">
                  <div className="h-20 bg-muted/30 rounded-lg flex items-end justify-center p-2">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-sm"
                      style={{ height: `${(score / 1000) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(Date.now() - (5 - index) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </div>
                  <div className="text-sm font-medium">{score}</div>
                </div>
              ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Your score has improved by 70 points over the last 6 months
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
