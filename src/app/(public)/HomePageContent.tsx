import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Shield, Check } from "lucide-react";

const HomePageContent = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1fr_1.12fr] gap-10 lg:gap-14 px-7 py-10 lg:px-14 lg:py-20 items-center max-w-[1840px] mx-auto">
      {/* Copy column */}
      <div>
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="block w-3 h-3 bg-primary" />
          <span className="uppercase text-xs font-bold tracking-wide text-primary">
            Pharmacy revenue recovery
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-brand text-5xl md:text-6xl lg:text-7xl font-semibold leading-none tracking-tight">
          Get back every dollar you&apos;re{" "}
          <span className="text-primary">owed</span>
        </h1>

        {/* Lead */}
        <p className="text-muted-foreground text-lg leading-relaxed mt-7 mb-10 max-w-[500px]">
          Cyber Pharma audits every claim against expected reimbursement and flags
          PBM underpayments to the cent — so independent pharmacies recover what
          they&apos;re owed.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 mb-12">
          <Button
            asChild
            size="lg"
            className="uppercase tracking-wide font-bold"
          >
            <Link href="/register">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="lg"
            className="uppercase tracking-wide font-bold gap-3 border border-primary"
          >
            <Link href="#book-demo">
              <span className="inline-flex w-10 h-10 items-center justify-center border-2 border-border">
                <Play className="h-3 w-3" fill="currentColor" />
              </span>
              Book a demo
            </Link>
          </Button>
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center gap-4">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 uppercase text-xs font-bold tracking-wide py-2 px-4"
          >
            <Shield className="h-3.5 w-3.5 text-primary" />
            HIPAA-ready
          </Badge>
          <span className="uppercase text-xs font-bold tracking-wide text-muted-foreground">
            Trusted by 200+ independent pharmacies
          </span>
        </div>
      </div>

      {/* Visual column */}
      <div className="relative w-full">
        {/* Stage */}
        <div className="relative overflow-hidden p-6 lg:p-12 pb-16 lg:pb-20 rounded-[28px] bg-gradient-to-br from-primary/10 via-primary/5 to-card">
          {/* Browser frame */}
          <div className="relative overflow-hidden rounded-[14px] border border-foreground/10 shadow-2xl">
            <div className="bg-secondary h-8 flex items-center gap-2 px-3.5">
              <span className="w-3 h-3 rounded-full bg-muted-foreground/50" />
              <span className="w-3 h-3 rounded-full bg-muted-foreground/50" />
              <span className="w-3 h-3 rounded-full bg-muted-foreground/50" />
            </div>
            <Image
              src="/landing/owedbook-mockup.png"
              alt="OwedBook dashboard"
              width={1760}
              height={1020}
              className="block w-full h-auto"
              priority
            />
          </div>

          {/* Float card */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 lg:bottom-6 lg:right-6 lg:left-auto lg:translate-x-0 bg-card border border-border rounded-[14px] shadow-xl px-4 py-3 lg:px-5 lg:py-4 flex items-center gap-3 lg:gap-3.5">
            <span className="w-10 h-10 grid place-items-center bg-success/10 text-success rounded-[11px]">
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <div>
              <div className="text-lg lg:text-xl font-bold tabular-nums">$12,627</div>
              <div className="text-xs text-muted-foreground">recovered this month</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomePageContent;
