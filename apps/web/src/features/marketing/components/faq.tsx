import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'Will the AI make things up?',
    answer:
      "No. SupportAI only answers from the knowledge you give it — your docs, FAQs, and policies. If it can't find a confident answer there, it tells the customer and connects them with a human agent instead of guessing.",
  },
  {
    question: 'Can I switch AI providers?',
    answer:
      'Yes. SupportAI supports Google Gemini, OpenAI, Groq, and OpenRouter behind a single provider-agnostic layer, so you can switch models without changing anything else.',
  },
  {
    question: 'Is my data isolated from other companies?',
    answer:
      'Yes. Every workspace is fully isolated — conversations, knowledge base, and analytics never cross tenant boundaries.',
  },
  {
    question: 'What kind of businesses is this for?',
    answer:
      "SupportAI is industry-agnostic — e-commerce, hotels, healthcare, logistics, SaaS, real estate, and more. You customize the AI with your own content, so it fits your business.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-border/60 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked questions</h2>
        </div>

        <div className="mt-12 divide-y divide-border">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left font-medium">
                {faq.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
