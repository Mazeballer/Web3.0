'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Zap,
  Users,
  Lock,
  Globe,
  CheckCircle,
  Star,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Trust-Based Lending',
    description:
      'Dynamic interest rates based on your on-chain reputation and credit score',
  },
  {
    icon: TrendingUp,
    title: 'Competitive APY',
    description:
      'Earn up to 12% APY on your crypto assets with our optimized lending pools',
  },
  {
    icon: Zap,
    title: 'Instant Liquidity',
    description:
      'Access funds immediately with our flash loan technology and instant settlements',
  },
  {
    icon: Lock,
    title: 'Secure & Audited',
    description:
      'Smart contracts audited by leading security firms with $100M+ TVL protection',
  },
  {
    icon: Globe,
    title: 'Multi-Chain Support',
    description:
      'Available on Ethereum, Polygon, and Arbitrum with cross-chain compatibility',
  },
  {
    icon: Users,
    title: 'Community Governed',
    description:
      'Decentralized governance where token holders vote on protocol upgrades',
  },
];

const stats = [
  { label: 'Total Value Locked', value: '$2.4B', change: '+12.5%' },
  { label: 'Active Users', value: '45K+', change: '+8.2%' },
  { label: 'Loans Processed', value: '120K+', change: '+15.7%' },
  { label: 'Average APY', value: '8.5%', change: '+2.1%' },
];

const testimonials = [
  {
    name: 'Alex Chen',
    role: 'CreDiFi Trader',
    content:
      "CreDiFi's trust score system gave me better rates than any other platform. The UX is incredible.",
    rating: 5,
  },
  {
    name: 'Sarah Johnson',
    role: 'Crypto Investor',
    content:
      "I've been lending on CreDiFi for 6 months. Consistent returns and zero issues with withdrawals.",
    rating: 5,
  },
  {
    name: 'Michael Torres',
    role: 'CreDiFi Developer',
    content:
      'The smart contracts are well-architected and the documentation is top-notch. Highly recommend.',
    rating: 5,
  },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/signin' }); // Optional redirect
  };

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/transparent-logo.png"
                alt="DL Logo"
                width={47}
                height={47}
                className="object-contain"
              />
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CreDiFi
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#stats"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Stats
              </Link>
              <Link
                href="#security"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Security
              </Link>
              <Link
                href="#community"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Community
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {session?.user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" onClick={logout} asChild>
                    <Link href="/auth/signin">Logout</Link>
                  </Button>
                </>
              ) : (
                <Button
                  className="gradient-primary text-white hover:opacity-90"
                  asChild
                >
                  <Link href="/auth/signin">
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20">
              🚀 Now live on Mainnet with $2.4B TVL
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              The Future of
              <br />
              CreDiFi Lending
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Unlock the power of decentralized finance with trust-based
              lending, competitive yields, and instant liquidity. Built for the
              next generation of crypto users.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!session?.user ? (
                <Button
                  size="lg"
                  className="gradient-primary text-white hover:opacity-90 animate-glow text-lg px-8 py-6"
                >
                  <Link href="/auth/signin" className="flex items-center">
                    Start Earning Today
                    <ArrowRight className="h-5 w-4 ml-2" />
                  </Link>
                </Button>
              ) : null}
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                View Documentation
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>No KYC Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Instant Withdrawals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Audited Smart Contracts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="gradient-card text-center hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground mb-2">{stat.label}</div>
                  <Badge
                    variant="secondary"
                    className="text-emerald-600 bg-emerald-500/10"
                  >
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose Credifi?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience the next generation of decentralized lending with
              features designed for both beginners and CreDiFi veterans.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="gradient-card hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardHeader>
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 ${
                      hoveredFeature === index ? 'gradient-primary' : 'bg-muted'
                    }`}
                  >
                    <feature.icon
                      className={`h-6 w-6 transition-colors duration-300 ${
                        hoveredFeature === index
                          ? 'text-white'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get started with CreDiFi in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect Wallet</h3>
              <p className="text-muted-foreground">
                Connect your MetaMask or any Web3 wallet to get started. No
                registration required.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full gradient-secondary flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Choose Your Strategy
              </h3>
              <p className="text-muted-foreground">
                Lend your assets to earn yield or borrow against your collateral
                with competitive rates.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Start Earning</h3>
              <p className="text-muted-foreground">
                Watch your assets grow with our optimized yield strategies and
                transparent fee structure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See what our community has to say about their CreDiFi experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="gradient-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Security First
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Your funds are protected by industry-leading security measures and
              battle-tested smart contracts
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="gradient-card">
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                  <h3 className="text-xl font-semibold mb-4">
                    Smart Contract Audits
                  </h3>
                  <p className="text-muted-foreground">
                    Audited by Certik, ConsenSys Diligence, and OpenZeppelin
                    with zero critical vulnerabilities found.
                  </p>
                </CardContent>
              </Card>
              <Card className="gradient-card">
                <CardContent className="p-8 text-center">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-xl font-semibold mb-4">
                    Insurance Coverage
                  </h3>
                  <p className="text-muted-foreground">
                    $100M+ insurance coverage through leading CreDiFi insurance
                    protocols to protect user funds.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="gradient-card max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ready to Start Earning?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already earning competitive
                yields on their crypto assets with CreDiFi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="gradient-primary text-white hover:opacity-90 text-lg px-8 py-6"
                  asChild
                >
                  <Link href="/dashboard">
                    Launch App
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                >
                  Read Whitepaper
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/transparent-logo.png"
                  alt="DL Logo"
                  width={47}
                  height={47}
                  className="object-contain"
                />
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  CreDiFi
                </span>
              </div>
              <p className="text-muted-foreground">
                The next generation of decentralized lending and borrowing
                platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/borrow"
                    className="hover:text-foreground transition-colors"
                  >
                    Borrow
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/lend"
                    className="hover:text-foreground transition-colors"
                  >
                    Lend
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/credit-score"
                    className="hover:text-foreground transition-colors"
                  >
                    Credit Score
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Whitepaper
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Security Audits
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Bug Bounty
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Telegram
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 CreDiFi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
