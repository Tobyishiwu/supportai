import { motion } from 'framer-motion';
import { BarChart3, BookOpen, Inbox, MessagesSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FEATURES = [
  {
    icon: MessagesSquare,
    title: 'AI customer chat',
    description:
      "Instant, accurate answers from your own content — never a hallucinated guess. If it doesn't know, it says so and loops in a human.",
  },
  {
    icon: Inbox,
    title: 'Live chat inbox',
    description: 'Assign conversations, add internal notes, tag, and track status across your whole team.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge base',
    description: 'Upload PDFs, docs, URLs, and FAQs. SupportAI extracts, processes, and indexes it all automatically.',
  },
  {
    icon: Sparkles,
    title: 'Agent copilot',
    description: 'Summaries, sentiment, suggested replies, and relevant articles — right when an agent opens a chat.',
  },
  {
    icon: BarChart3,
    title: 'Support intelligence',
    description: 'Resolution rate, CSAT, complaint trends, and plain-language insights into knowledge gaps.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for teams',
    description: 'Multi-tenant workspaces, role-based access, and audit logs — secure by default.',
  },
] as const;

export function FeaturesGrid() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything your support team needs
          </h2>
          <p className="mt-4 text-muted-foreground">
            One platform that replaces your chatbot, help desk, and knowledge base tools.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
            >
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
