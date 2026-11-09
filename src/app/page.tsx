import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Download,
  GitCompareArrows,
  Package,
  Rocket,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Wand2,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Vendora AI — Your AI. Your Store. Your Commerce Engine.",
  description:
    "AI-powered dropshipping automation: research winning products, compare global suppliers, auto-price your catalog, fulfill orders 24/7 and take payments with Paystack, Flutterwave and Stripe.",
};

const suppliers = ["CJdropshipping", "AliExpress", "Alibaba", "Zendrop", "Spocket"];
const paymentRails = ["Paystack", "Flutterwave", "Stripe"];

const features = [
  {
    icon: Search,
    title: "AI Product Research",
    description:
      "Every product gets a transparent 100-point opportunity score — demand, competition, profit, supplier availability and shipping viability — with the evidence behind it. No fabricated numbers, ever.",
  },
  {
    icon: GitCompareArrows,
    title: "Supplier Discovery & Comparison",
    description:
      "Compare wholesale price, shipping cost, delivery estimates and terms side-by-side across every connected supplier, and always see who wins on landed cost.",
  },
  {
    icon: Download,
    title: "One-Click Product Import",
    description:
      "Import winning products straight into your store with titles, images and variants — priced automatically by your own pricing rules.",
  },
  {
    icon: Calculator,
    title: "Landed-Cost Profit Engine",
    description:
      "Deterministic profit math: product cost, shipping, taxes, customs, payment fees, ad spend and refunds are all accounted for before a suggested selling price is set.",
  },
  {
    icon: Truck,
    title: "Automated Order Fulfillment",
    description:
      "Orders are routed to the right supplier automatically, fulfillment is tracked end-to-end, and customers get updates without you lifting a finger.",
  },
  {
    icon: Bot,
    title: "AI Commerce Assistant",
    description:
      "Ask your store anything — what to reorder, which products are stalling, where margin is leaking — and get grounded answers from your own live data.",
  },
  {
    icon: CreditCard,
    title: "Payments Built for You",
    description:
      "Collect checkout in naira with Paystack and Flutterwave, or globally with Stripe — card and bank, settled straight to your account.",
  },
  {
    icon: BarChart3,
    title: "Analytics That Matter",
    description:
      "Revenue, margin, refunds and store performance in one place — so decisions come from your real numbers, not guesswork.",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us about your business",
    description:
      "Pick your market, categories, suppliers and business model. Vendora configures your store, currency and target margins in minutes.",
  },
  {
    number: "02",
    title: "Find winning products with AI",
    description:
      "Run a research job, review opportunity scores with real evidence, and lock in the products worth your ad budget.",
  },
  {
    number: "03",
    title: "Import & auto-price your catalog",
    description:
      "Products land in your store with your markup, psychological pricing and minimum-margin safeguards already applied.",
  },
  {
    number: "04",
    title: "Sell while autopilot runs",
    description:
      "Orders flow to suppliers, shipments and tracking sync automatically, and every sale's true profit is booked for you.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "₦0",
    period: "/ month",
    blurb: "For validating your first product ideas.",
    cta: "Start free",
    href: "/register",
    highlighted: false,
    features: [
      "1 storefront",
      "10 AI research jobs / month",
      "50 product imports / month",
      "Paystack, Flutterwave & Stripe checkout",
      "Core analytics dashboard",
      "Community support",
    ],
  },
  {
    name: "Growth",
    price: "₦49,000",
    period: "/ month",
    blurb: "For stores ready to scale profitably.",
    cta: "Start 14-day trial",
    href: "/register",
    highlighted: true,
    features: [
      "3 storefronts",
      "Unlimited AI research & imports",
      "Automated order fulfillment & tracking",
      "Landed-cost pricing engine + rules",
      "Supplier comparison with landed-cost winners",
      "Priority support",
    ],
  },
  {
    name: "Scale",
    price: "₦149,000",
    period: "/ month",
    blurb: "For high-volume, multi-store operators.",
    cta: "Talk to sales",
    href: "mailto:hello@vendora.ai?subject=Scale%20plan",
    highlighted: false,
    features: [
      "Unlimited storefronts",
      "Custom automation workflows",
      "Dedicated onboarding & success manager",
      "API access & webhooks",
      "99.9% uptime SLA",
      "Quarterly strategy reviews",
    ],
  },
];

const faqs = [
  {
    question: "Do I need to hold inventory?",
    answer:
      "No. Vendora is built for dropshipping and demand-led selling — you only pay suppliers for items your customers have already paid you for. No warehouse, no upfront stock risk.",
  },
  {
    question: "Which suppliers can I connect?",
    answer:
      "CJdropshipping, AliExpress, Alibaba, Zendrop and Spocket ship with built-in integrations. New supplier adapters can be registered without rewriting your store, so the catalog keeps growing.",
  },
  {
    question: "How do payments and payouts work?",
    answer:
      "Checkout runs through Paystack or Flutterwave in naira — card, bank transfer and USSD — or Stripe for international cards. Funds settle directly to your own business account; Vendora never touches your money.",
  },
  {
    question: "How accurate is the opportunity score?",
    answer:
      "Scores are computed from search interest, advertising activity, social engagement, competition saturation, supplier availability and shipping viability — with verified sales data used when it exists. Every score ships with its evidence and data sources, and confidence is labelled low, medium or high.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Plans are monthly and flexible — upgrade, downgrade or cancel from your billing settings whenever you want. Your data exports with you.",
  },
];

const stats = [
  { value: "5", label: "major supplier networks, one dashboard" },
  { value: "100-pt", label: "transparent opportunity scoring" },
  { value: "24/7", label: "automated fulfillment & tracking" },
  { value: "₦0", label: "to start — no upfront inventory" },
];

function LogoMark({ className = "h-9 w-9 text-lg" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-brand flex items-center justify-center text-brand-contrast font-bold ${className}`}
      aria-hidden="true"
    >
      V
    </div>
  );
}

function Wordmark({ className = "text-2xl" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight text-text ${className}`}>
      Vendora<span className="text-brand">AI</span>
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text antialiased">
      {/* ───────────────── Navigation ───────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Vendora AI home">
            <LogoMark className="h-8 w-8 text-base" />
            <Wordmark className="text-xl" />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted lg:flex">
            <a href="#features" className="transition-colors hover:text-text">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-text">How it works</a>
            <a href="#pricing" className="transition-colors hover:text-text">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-text">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-text"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand px-3.5 py-2 text-sm font-bold text-brand-contrast transition-transform hover:scale-[1.03] sm:px-4"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ───────────────── Hero ───────────────── */}
        <section className="relative overflow-hidden">
          {/* ambient glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(ellipse at center, rgba(57,255,20,0.14) 0%, transparent 65%)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-40 -right-40 h-96 w-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 70%)" }}
          />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                AI-powered dropshipping automation
              </div>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl">
                Your AI. Your Store.
                <br />
                <span className="text-brand">Your Commerce Engine.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
                Vendora finds winning products, compares global suppliers, prices your catalog
                profitably and fulfills orders on autopilot — so you run the brand, not the busywork.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-bold text-brand-contrast transition-transform hover:scale-[1.02]"
                >
                  Start free today
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-6 text-base font-semibold text-text transition-colors hover:border-brand/40 hover:text-brand"
                >
                  See how it works
                </a>
              </div>
              <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
                {["No credit card required", "Cancel anytime", "Set up in minutes"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </p>
            </div>

            {/* Product preview — opportunity score card */}
            <div className="relative mx-auto w-full max-w-md lg:max-w-lg" aria-hidden="true">
              <div
                className="absolute -inset-4 rounded-3xl blur-2xl"
                style={{ background: "radial-gradient(ellipse at center, rgba(57,255,20,0.12) 0%, transparent 70%)" }}
              />
              <div className="relative rounded-2xl border border-border bg-card shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-warning/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-brand/80" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
                    <Store className="h-3.5 w-3.5" /> vendora.ai/dashboard
                  </div>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">Product research</p>
                      <p className="mt-1 text-sm font-bold text-text">Posture-correcting lumbar support</p>
                      <p className="mt-0.5 text-[11px] text-muted">Home &amp; Living · AliExpress · CJdropshipping</p>
                    </div>
                    {/* Opportunity score ring */}
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                        <circle cx="40" cy="40" r="32" stroke="#26352b" strokeWidth="8" fill="none" />
                        <circle
                          cx="40" cy="40" r="32" stroke="#39ff14" strokeWidth="8" fill="none"
                          strokeLinecap="round" strokeDasharray="201" strokeDashoffset="24"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-xl font-extrabold text-brand">88</span>
                      </div>
                    </div>
                  </div>

                  {/* Evidence bars */}
                  <div className="space-y-2 rounded-xl border border-border/70 bg-secondary-bg p-3.5">
                    {[
                      { label: "Demand 30%", width: "84%" },
                      { label: "Competition 25%", width: "62%" },
                      { label: "Profit 20%", width: "91%" },
                      { label: "Suppliers 15%", width: "78%" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-2">
                        <span className="w-28 text-[10px] font-medium text-muted">{row.label}</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                          <div className="h-full rounded-full bg-brand/90" style={{ width: row.width }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Landed-cost math */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Landed cost", value: "₦8,450" },
                      { label: "Selling price", value: "₦24,999" },
                      { label: "Net margin", value: "58%" },
                    ].map((cell) => (
                      <div key={cell.label} className="rounded-xl border border-border/70 bg-secondary-bg px-2 py-2.5">
                        <p className="text-[9px] uppercase tracking-wide text-muted">{cell.label}</p>
                        <p className="mt-0.5 text-sm font-bold text-text">{cell.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI assistant bubble */}
                  <div className="flex items-start gap-2.5 rounded-xl border border-brand/25 bg-brand/5 p-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand">
                      <Wand2 className="h-3.5 w-3.5 text-brand-contrast" />
                    </div>
                    <p className="text-[11px] leading-5 text-text/90">
                      <span className="font-semibold text-brand">Vendora AI:</span> Winning product.
                      Lowest landed cost is CJdropshipping at ₦8,450 — import now and I&apos;ll apply your 35% markup with .99 pricing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating stat chips */}
              <div className="absolute -left-3 top-24 hidden rounded-xl border border-border bg-card/95 px-3.5 py-2 shadow-lg backdrop-blur sm:block">
                <p className="text-[9px] uppercase tracking-wide text-muted">Orders this month</p>
                <p className="text-sm font-extrabold text-text">1,284 <span className="text-brand">+38%</span></p>
              </div>
              <div className="absolute -right-3 bottom-28 hidden rounded-xl border border-border bg-card/95 px-3.5 py-2 shadow-lg backdrop-blur sm:block">
                <p className="text-[9px] uppercase tracking-wide text-muted">Fulfillment</p>
                <p className="text-sm font-extrabold text-text">Auto-routed <span className="text-brand">✓</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────── Supplier / payment rails ───────────────── */}
        <section className="border-y border-border/70 bg-secondary-bg/50 py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Connects the suppliers you already use
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-bold text-text/70">
              {suppliers.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Payouts via <span className="text-text/80">{paymentRails.join(" · ")}</span>
            </p>
          </div>
        </section>

        {/* ───────────────── Features ───────────────── */}
        <section id="features" className="scroll-mt-24 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand">
                <Zap className="h-4 w-4" aria-hidden="true" /> Everything in one engine
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                From product hunt to payout, <span className="text-brand">one login</span>
              </h2>
              <p className="mt-4 text-lg text-muted">
                Research, sourcing, pricing, fulfillment, payments and intelligence — Vendora runs
                the full commerce loop with AI at every step.
              </p>
            </div>
            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand transition-transform group-hover:scale-110">
                    <feature.icon className="h-5.5 w-5.5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-text">{feature.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-muted">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────────── How it works ───────────────── */}
        <section id="how-it-works" className="scroll-mt-24 border-t border-border/70 bg-secondary-bg/40 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand">
                <Rocket className="h-4 w-4" aria-hidden="true" /> From zero to selling in minutes
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Four steps to your <span className="text-brand">first automated sale</span>
              </h2>
            </div>
            <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <li key={step.number} className="relative">
                  {i < steps.length - 1 && (
                    <div
                      aria-hidden="true"
                      className="absolute left-full top-6 hidden h-px w-6 bg-gradient-to-r from-brand/50 to-transparent lg:block"
                    />
                  )}
                  <div className="h-full rounded-2xl border border-border bg-card p-6">
                    <span className="text-xs font-black tracking-widest text-brand/80">STEP {step.number}</span>
                    <h3 className="mt-3 text-lg font-bold text-text">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───────────────── Proof stats ───────────────── */}
        <section className="border-y border-border/70 py-12">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 text-center sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-3xl font-extrabold text-brand sm:text-4xl">{stat.value}</dd>
                <dd className="mt-2 text-xs font-medium leading-5 text-muted">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ───────────────── Pricing ───────────────── */}
        <section id="pricing" className="scroll-mt-24 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand">
                <ShoppingBag className="h-4 w-4" aria-hidden="true" /> Simple, honest pricing
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Start free. Upgrade when <span className="text-brand">it pays you</span>.
              </h2>
              <p className="mt-4 text-lg text-muted">
                Monthly plans, no long-term contracts. Every plan includes checkout, supplier
                connections and the AI assistant.
              </p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border p-6 sm:p-7 ${
                    plan.highlighted
                      ? "border-brand bg-card shadow-2xl shadow-brand/10 ring-1 ring-brand"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-1 text-[11px] font-black uppercase tracking-widest text-brand-contrast">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-text">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted">{plan.blurb}</p>
                  <p className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold tracking-tight text-text">{plan.price}</span>
                    <span className="text-sm font-medium text-muted">{plan.period}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-text/90">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`mt-7 inline-flex h-11 items-center justify-center rounded-xl text-sm font-bold transition-transform hover:scale-[1.02] ${
                      plan.highlighted
                        ? "bg-brand text-brand-contrast"
                        : "border border-border bg-secondary-bg text-text hover:border-brand/40 hover:text-brand"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-muted">
              Prices in naira, billed monthly. International billing available in USD — contact sales.
            </p>
          </div>
        </section>

        {/* ───────────────── FAQ ───────────────── */}
        <section id="faq" className="scroll-mt-24 border-t border-border/70 py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
            <div className="lg:col-span-2">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand">
                <ClipboardList className="h-4 w-4" aria-hidden="true" /> Honest answers
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Questions, <span className="text-brand">answered</span>
              </h2>
              <p className="mt-4 text-muted">
                Still curious? Reach the team at{" "}
                <a href="mailto:hello@vendora.ai" className="font-semibold text-brand hover:underline">
                  hello@vendora.ai
                </a>
              </p>
            </div>
            <div className="lg:col-span-3">
              <div className="divide-y divide-border rounded-2xl border border-border bg-card">
                {faqs.map((faq) => (
                  <details key={faq.question} className="group px-6 py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-text [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <ChevronDown
                        className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────── Final CTA ───────────────── */}
        <section className="relative overflow-hidden border-t border-border/70 py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 90% at 50% 120%, rgba(57,255,20,0.18) 0%, transparent 65%)" }}
          />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <LogoMark className="mx-auto h-14 w-14 text-2xl" />
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Your store could be <span className="text-brand">selling tonight</span>.
            </h2>
            <p className="mt-4 text-lg text-muted">
              Create your account, connect a supplier and import your first product before your
              next coffee gets cold.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-8 text-base font-bold text-brand-contrast transition-transform hover:scale-[1.02]"
              >
                Create your store free
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-8 text-base font-semibold text-text transition-colors hover:border-brand/40 hover:text-brand"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ───────────────── Footer ───────────────── */}
      <footer className="border-t border-border/70 bg-secondary-bg/60">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xs">
              <Link href="/" className="flex items-center gap-2.5" aria-label="Vendora AI home">
                <LogoMark className="h-8 w-8 text-base" />
                <Wordmark className="text-lg" />
              </Link>
              <p className="mt-4 text-sm leading-6 text-muted">
                The AI commerce engine for modern dropshippers — research, source, price, fulfill
                and get paid, all from one place.
              </p>
            </div>
            <nav className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3" aria-label="Footer">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Product</p>
                <ul className="mt-3 space-y-2">
                  <li><a href="#features" className="text-text/85 transition-colors hover:text-brand">Features</a></li>
                  <li><a href="#pricing" className="text-text/85 transition-colors hover:text-brand">Pricing</a></li>
                  <li><a href="#how-it-works" className="text-text/85 transition-colors hover:text-brand">How it works</a></li>
                  <li><a href="#faq" className="text-text/85 transition-colors hover:text-brand">FAQ</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Account</p>
                <ul className="mt-3 space-y-2">
                  <li><Link href="/register" className="text-text/85 transition-colors hover:text-brand">Create account</Link></li>
                  <li><Link href="/login" className="text-text/85 transition-colors hover:text-brand">Sign in</Link></li>
                  <li><Link href="/dashboard" className="text-text/85 transition-colors hover:text-brand">Dashboard</Link></li>
                  <li><Link href="/onboarding" className="text-text/85 transition-colors hover:text-brand">Onboarding</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Company</p>
                <ul className="mt-3 space-y-2">
                  <li>
                    <a href="mailto:hello@vendora.ai" className="text-text/85 transition-colors hover:text-brand">
                      hello@vendora.ai
                    </a>
                  </li>
                  <li className="flex items-center gap-1.5 text-text/85">
                    <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" /> Your data stays yours
                  </li>
                  <li className="flex items-center gap-1.5 text-text/85">
                    <Package className="h-4 w-4 text-brand" aria-hidden="true" /> No inventory required
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-6 text-xs text-muted sm:flex-row">
            <p>© 2026 Vendora AI. All rights reserved.</p>
            <p className="flex items-center gap-4">
              <span>Built for sellers in Nigeria &amp; worldwide</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand" /> All systems operational
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
