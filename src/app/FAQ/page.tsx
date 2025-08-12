import type React from 'react';
import {
  HelpCircle,
  Shield,
  Wallet,
  DollarSign,
  Clock,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <section className="relative overflow-hidden py-14 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs md:text-sm bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <HelpCircle className="h-3.5 w-3.5" />
              Frequently Asked Questions
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              How can we help?
            </h1>
            <p className="mt-4 text-muted-foreground md:text-lg">
              Find quick answers about lending, repayments, security, and your
              account. If you still need help, reach out to support.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-md border border-border/50 bg-background/60 px-4 py-2 text-sm hover:bg-background"
              >
                Back to Dashboard
              </Link>
              <a
                href="mailto:support@defilend.example"
                className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm text-white hover:opacity-90"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mt-16 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left rail: quick topics */}
            <div className="space-y-6 lg:col-span-1">
              <Card className="gradient-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Popular Topics</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Topic
                    href="#lending"
                    icon={<Wallet className="h-4 w-4" />}
                    label="Lending Basics"
                  />
                  <Topic
                    href="#rewards"
                    icon={<DollarSign className="h-4 w-4" />}
                    label="Rewards & Earnings"
                  />
                  <Topic
                    href="#repayments"
                    icon={<Clock className="h-4 w-4" />}
                    label="Repayments"
                  />
                  <Topic
                    href="#security"
                    icon={<Shield className="h-4 w-4" />}
                    label="Security & Safety"
                  />
                  <Topic
                    href="#support"
                    icon={<MessageSquare className="h-4 w-4" />}
                    label="Support"
                  />
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Need more help?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Can’t find what you’re looking for? Our support team is here
                  to help.
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a
                      href="mailto:support@defilend.example"
                      className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-xs text-white hover:opacity-90"
                    >
                      Email Support
                    </a>
                    <Link
                      href="/"
                      className="rounded-md border border-border/50 bg-background/60 px-4 py-2 text-xs hover:bg-background"
                    >
                      Open Dashboard
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: FAQs */}
            <div className="lg:col-span-2">
              <Card className="gradient-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">All FAQs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    id="lending"
                    className="mb-6 text-xs uppercase text-muted-foreground tracking-wide"
                  >
                    Lending
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="lend-1">
                      <AccordionTrigger>
                        Which assets can I lend?
                      </AccordionTrigger>
                      <AccordionContent>
                        You can lend major assets and stablecoins offered in our
                        pools. Each pool displays its current APY, risk, and
                        liquidity so you can decide where to deploy capital.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="lend-2">
                      <AccordionTrigger>
                        How is APY calculated?
                      </AccordionTrigger>
                      <AccordionContent>
                        APY is dynamic and reflects pool utilization and market
                        conditions. Your “Total APY Accumulated” card shows a
                        weighted average across all your deposits, based on the
                        value you’ve supplied to each pool.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div
                    id="rewards"
                    className="mt-10 mb-6 text-xs uppercase text-muted-foreground tracking-wide"
                  >
                    Rewards & Earnings
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="rew-1">
                      <AccordionTrigger>
                        When are rewards updated?
                      </AccordionTrigger>
                      <AccordionContent>
                        Rewards accrue continuously and are reflected in the
                        “Total Earned” metric. Payouts compound automatically in
                        the pool unless you withdraw.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="rew-2">
                      <AccordionTrigger>
                        How do reward points work?
                      </AccordionTrigger>
                      <AccordionContent>
                        Reward points are loyalty incentives for active lenders.
                        They unlock fee discounts, priority access, and
                        occasional airdrops during campaigns.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div
                    id="repayments"
                    className="mt-10 mb-6 text-xs uppercase text-muted-foreground tracking-wide"
                  >
                    Repayments
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="repay-1">
                      <AccordionTrigger>
                        Where can I see what I need to repay?
                      </AccordionTrigger>
                      <AccordionContent>
                        Visit Dashboard → Repayments to view outstanding
                        stablecoin loans (USDC, DAI, USDT), minimum dues, and
                        due dates. You can make minimum, partial, or full
                        payments with a single click.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="repay-2">
                      <AccordionTrigger>
                        What happens if I miss a payment?
                      </AccordionTrigger>
                      <AccordionContent>
                        Missing payments may reduce your trust score and, if
                        your health factor falls too low, can lead to
                        liquidation of collateral. The Repayments page shows
                        color-coded health indicators and alerts to help you
                        stay safe.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div
                    id="security"
                    className="mt-10 mb-6 text-xs uppercase text-muted-foreground tracking-wide"
                  >
                    Security & Safety
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="sec-1">
                      <AccordionTrigger>
                        Are the smart contracts audited?
                      </AccordionTrigger>
                      <AccordionContent>
                        Yes. Our core contracts are audited by reputable
                        security firms, and we continuously monitor on-chain
                        activity. We also maintain insurance coverage via
                        partnered protocols.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="sec-2">
                      <AccordionTrigger>
                        How do you protect my wallet?
                      </AccordionTrigger>
                      <AccordionContent>
                        You retain control of your wallet at all times. We
                        recommend hardware wallets and enabling 2FA on connected
                        services. Never share your seed phrase.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div
                    id="support"
                    className="mt-10 mb-6 text-xs uppercase text-muted-foreground tracking-wide"
                  >
                    Support
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="sup-1">
                      <AccordionTrigger>
                        How can I contact support?
                      </AccordionTrigger>
                      <AccordionContent>
                        Email us at{' '}
                        <a
                          className="underline"
                          href="mailto:support@defilend.example"
                        >
                          support@defilend.example
                        </a>
                        . Include your wallet address and a brief description so
                        we can help quickly.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="sup-2">
                      <AccordionTrigger>
                        Do you have a public roadmap?
                      </AccordionTrigger>
                      <AccordionContent>
                        We publish highlights in announcements and release
                        notes. A full roadmap will be shared in the app once
                        governance opens.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Topic({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md border border-border/50 bg-background/60 px-3 py-2 text-sm hover:bg-background"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
