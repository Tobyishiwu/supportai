import { motion } from 'framer-motion';

const STEPS = [
  {
    step: '01',
    title: 'Add your knowledge',
    description: 'Upload docs, FAQs, and policies, or connect a URL. SupportAI processes it into searchable knowledge.',
  },
  {
    step: '02',
    title: 'Customize your AI',
    description: 'Set the tone, instructions, and fallback behavior — the AI only ever answers from your content.',
  },
  {
    step: '03',
    title: 'Go live in minutes',
    description: 'Drop the widget on your site. The AI resolves what it can, and hands the rest to your team.',
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border/60 bg-secondary/30 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Live in three steps</h2>
          <p className="mt-4 text-muted-foreground">No engineering required to get started.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <span className="text-sm font-mono text-primary">{step.step}</span>
              <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
