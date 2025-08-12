"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import {
  TrendingUp,
  Clock,
  Activity,
  Shield,
  CheckCircle,
  AlertCircle,
  Target,
  Ban,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calculator,
  UserCheck,
  Bank,
  Users,
  Repeat,
  CircleSlash,
  ArrowDownCircle,
  Lock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const reasonMeta = {
  // ✅ Credit (Reward) Rules
  "On-time loan repayment": {
    description: "Per loan paid on or before due date",
    icon: Clock,
    category: "reward",
  },
  "3 Consecutive good loans": {
    description: "No late repayment for 3 loans in a row",
    icon: Calculator,
    category: "reward",
  },
  "Verified identity (KYC)": {
    description: "Full KYC profile completed",
    icon: UserCheck,
    category: "reward",
  },
  "Lending funds ≥ 30 days": {
    description:
      "Funds locked for lending pool without withdrawal for 30+ days",
    icon: TrendingUp,
    category: "reward",
  },
  "Consistent lending over 3 months": {
    description: "Minimum monthly lending activity for 3 months",
    icon: Bank,
    category: "reward",
  },
  "No withdrawal from lending pool ≥ 60 days": {
    description: "Passive, long-term lending support",
    icon: Lock,
    category: "reward",
  },

  // ❌ Punishment Rules
  "Late payment": {
    description: "Missed due date, within grace period",
    icon: AlertTriangle,
    category: "punishment",
  },
  "Missed repayment > 30 days": {
    description: "Considered default or major delay",
    icon: XCircle,
    category: "punishment",
  },
  "High loan frequency": {
    description: "More than 2 loans within 30 days",
    icon: Repeat,
    category: "punishment",
  },
  "Over-borrowing": {
    description: "Borrowed more than 90% of assigned credit limit",
    icon: CircleSlash,
    category: "punishment",
  },
  "Early withdrawal from lending pool": {
    description:
      "User removes funds from the pool before 30 days, while liquidity is still healthy",
    icon: ArrowDownCircle,
    category: "punishment",
  },
};

const improvementTips = [
  {
    title: "🕒 On-time loan repayment",
    description: "Per loan paid on or before due date",
    impact: "+20",
    difficulty: "Easy",
  },
  {
    title: "🧮 3 Consecutive good loans",
    description: "No late repayment for 3 loans in a row",
    impact: "+20",
    difficulty: "Hard",
  },
  {
    title: "🧍‍♂️ Verified identity (KYC)",
    description: "Full KYC profile completed",
    impact: "+20",
    difficulty: "Easy",
  },
  {
    title: "💹 Lending funds ≥ 30 days",
    description:
      "Funds locked for lending pool without withdrawal for 30+ days",
    impact: "+15",
    difficulty: "Easy",
  },
  {
    title: "🏦 Consistent lending over 3 months",
    description: "Minimum monthly lending activity for 3 months",
    impact: "+60",
    difficulty: "Hard",
  },
  {
    title: "🔐 No withdrawal from lending pool ≥ 60 days",
    description: "Passive, long-term lending support",
    impact: "+35",
    difficulty: "Medium",
  },
];

const punishmentRules = [
  {
    title: "⌛ Late payment",
    description: "Missed due date, within grace period",
    impact: "-20",
  },
  {
    title: "❌ Missed repayment > 30 days",
    description: "Considered default or major delay",
    impact: "-60",
  },
  {
    title: "🔁 High loan frequency",
    description: "More than 2 loans within 30 days",
    impact: "-40",
  },
  {
    title: "⚠️ Over-borrowing",
    description: "Borrowed more than 90% of assigned credit limit",
    impact: "-25",
  },
  {
    title: "💸 Early withdrawal from lending pool",
    description:
      "User removes funds from the pool before 30 days, while liquidity is still healthy (i.e., no active borrower impact)",
    impact: "-20",
  },
];

export default function CreditScorePage() {
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const [scoreLoaded, setScoreLoaded] = useState(false);
  const [factorsLoaded, setFactorsLoaded] = useState(false);
  const isLoading = !scoreLoaded || !factorsLoaded;
  const [overallScore, setOverallScore] = useState(0);
  const [creditFactors, setCreditFactors] = useState([]);
  const [penaltyFactors, setPenaltyFactors] = useState([]);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const res = await fetch("/api/credit-score/get");
        const data = await res.json();
        setOverallScore(data.score);
      } catch (err) {
        console.error("Failed to fetch credit score", err);
      } finally {
        setScoreLoaded(true);
      }
    };

    fetchScore();
  }, []);

  useEffect(() => {
    const fetchFactors = async () => {
      try {
        const res = await fetch("/api/credit-score/score-breakdown");
        const data = await res.json();

        const grouped = data.reduce((acc, entry) => {
          const key = entry.reason;
          if (!acc[key]) {
            acc[key] = { ...entry };
          } else {
            acc[key].points += entry.points;
          }
          return acc;
        }, {});

        const enriched = Object.values(grouped).map((entry) => {
          const meta = reasonMeta[entry.reason] || {};
          return {
            title: entry.reason,
            description: meta.description || "",
            icon: meta.icon,
            impact:
              entry.status === "reward"
                ? `+${entry.points}`
                : `-${entry.points}`,
            points: entry.points,
            category: entry.status,
            awardedAt: entry.awarded_at,
          };
        });

        setCreditFactors(enriched.filter((e) => e.category === "reward"));
        setPenaltyFactors(enriched.filter((e) => e.category === "punishment"));
      } catch (err) {
        console.error("Error fetching score factors:", err);
      } finally {
        setFactorsLoaded(true);
      }
    };

    fetchFactors();
  }, []);

  // useEffect(() => {
  //   console.log("✅ Updated Credit Array", creditFactors);
  //   console.log("✅ Updated Punishment Array", penaltyFactors);
  // }, [creditFactors, penaltyFactors]);

  const scoreCategory =
    overallScore >= 700 && overallScore <= 850
      ? "Elite"
      : overallScore >= 500 && overallScore <= 699
      ? "Trusted"
      : overallScore >= 300 && overallScore <= 499
      ? "Average"
      : overallScore >= 100
      ? "Low"
      : "New";

  const Spinner = () => (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  // if (!isConnected) {
  //   return (
  //     <Card className="gradient-card text-center p-12">
  //       <CardContent>
  //         <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
  //         <h3 className="text-xl font-semibold mb-2">
  //           Connect Wallet to View Credit Score
  //         </h3>
  //         <p className="text-muted-foreground mb-6">
  //           Connect your wallet to view your DeFi credit score and improvement
  //           recommendations
  //         </p>
  //         <Button
  //           onClick={() => open()}
  //           className="gradient-primary text-white hover:opacity-90"
  //         >
  //           Connect Wallet
  //         </Button>
  //       </CardContent>
  //     </Card>
  //   );
  // }
  return isLoading ? (
    <Spinner />
  ) : (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Credit Score
        </h1>
        <p className="text-muted-foreground mt-2">
          Your DeFi credit score based on on-chain activity and lending behavior
        </p>
      </header>

      {/* Overall Score */}
      <Card className="gradient-card">
        <CardHeader className="text-center">
          <CardTitle>Your DeFi Credit Score</CardTitle>
          <CardDescription>
            Based on your on-chain activity and lending history
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {overallScore}
              </span>
              <span className="text-sm text-muted-foreground">out of 850</span>
            </div>
          </div>
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className={`text-lg px-4 py-2 ${
                scoreCategory === "Elite"
                  ? "bg-emerald-500/20 text-emerald-600"
                  : scoreCategory === "Trusted"
                  ? "bg-blue-500/20 text-blue-600"
                  : scoreCategory === "Average"
                  ? "bg-yellow-500/20 text-yellow-600"
                  : scoreCategory === "Low"
                  ? "bg-red-500/20 text-red-600"
                  : "bg-gray-500/20 text-gray-600"
              }`}
            >
              Credit Level: {scoreCategory}
            </Badge>
            <p className="text-muted-foreground">
              You have a {scoreCategory.toLowerCase()} credit score. This
              qualifies you for premium lending rates.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>
            Breakdown of factors increasing and decreasing your credit score
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Positive Score Breakdown */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-emerald-500">
                Gained Points
              </h3>

              {creditFactors.map((factor) => (
                <div key={factor.title} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        <factor.icon className="h-5 w-5 text-emerald-500" />
                        <div className="font-medium">{factor.title}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {factor.points}/{overallScore}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((factor.points / overallScore) * 100).toFixed(2)}%
                        weight
                      </div>
                    </div>
                  </div>
                  <Progress value={factor.points} className="h-2" />
                </div>
              ))}
            </div>

            {/* Negative Score Breakdown */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-red-500">
                Deducted Points
              </h3>
              {penaltyFactors.map((penalty) => (
                <div key={penalty.title} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <penalty.icon className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="font-medium text-red-400">
                          {penalty.title}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-red-500">
                        {penalty.impact}
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={Math.abs(parseInt(penalty.impact))}
                    className="h-2 bg-red-500/10"
                  />
                </div>
              ))}
            </div>
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
          <CardDescription>
            Actions you can take to improve your credit score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {improvementTips.map((tip, i) => (
              <Card key={i} className="border border-border/50">
                <CardHeader className="pb-3 flex justify-between items-start">
                  <CardTitle className="text-base">{tip.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {tip.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-emerald-600">
                      {tip.impact}
                    </span>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Credit Score Penalties */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            Credit Score Penalties
          </CardTitle>
          <CardDescription>
            Actions you have to avoid to maintain good credit score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {punishmentRules.map((rule, i) => (
              <Card key={i} className="border border-border/50">
                <CardHeader className="pb-3 flex justify-between items-start">
                  <CardTitle className="text-base">{rule.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {rule.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-red-500">
                      {rule.impact}
                    </span>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Score History */}
      {/* <Card className="gradient-card">
        <CardHeader>
          <CardTitle>Score History</CardTitle>
          <CardDescription>
            Your credit score progression over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-4">
              {[680, 695, 710, 725, 740, 750].map((score, idx) => (
                <div key={idx} className="text-center">
                  <div className="h-20 bg-muted/30 rounded-lg flex items-end justify-center p-2">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-sm"
                      style={{ height: `${(score / 1000) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {new Date(
                      Date.now() - (5 - idx) * 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-US", { month: "short" })}
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
      </Card> */}
    </div>
  );
}
