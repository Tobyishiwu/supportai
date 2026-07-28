import { Link } from '@tanstack/react-router';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-secondary/40 px-8 py-16 text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to resolve support instantly?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Set up your AI support workspace in minutes. No credit card required.
        </p>
        <div className="mt-8 flex justify-center">
          <Button size="lg" asChild>
            <Link to="/register">
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          SupportAI
        </div>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SupportAI. All rights reserved.</p>
      </div>
    </footer>
  );
}
