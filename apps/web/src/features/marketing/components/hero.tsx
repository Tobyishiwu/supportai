import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,theme(colors.primary/25%),transparent)]"
      />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <Sparkles className="h-3 w-3" />
            AI-first customer support
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl"
        >
          Resolve customer questions instantly with AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 max-w-2xl text-lg text-muted-foreground text-balance"
        >
          SupportAI answers your customers from your own knowledge base, and hands off to your
          team for everything it can&apos;t. One platform for AI chat, live inbox, and support
          analytics.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button size="lg" asChild>
            <Link to="/register">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#how-it-works">
              <MessageSquare className="h-4 w-4" />
              See how it works
            </a>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          No credit card required · Free 14-day trial
        </motion.p>
      </div>
    </section>
  );
}
