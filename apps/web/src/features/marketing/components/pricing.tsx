import { Link } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    description: 'For small teams getting started with AI support.',
    features: ['1,000 AI resolutions/mo', '3 team seats', '1 knowledge base', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$149',
    description: 'For growing teams that need the full toolkit.',
    features: [
      '10,000 AI resolutions/mo',
      '10 team seats',
      'Unlimited knowledge bases',
      'Agent copilot & analytics',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For larger organizations with custom needs.',
    features: ['Unlimited resolutions', 'Unlimited seats', 'SSO & audit logs', 'Dedicated support'],
    highlighted: false,
  },
] as const;

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-4 text-muted-foreground">Start free. Upgrade as your support volume grows.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn('flex flex-col', plan.highlighted && 'border-primary shadow-md ring-1 ring-primary/40')}
            >
              <CardHeader>
                {plan.highlighted && (
                  <Badge className="mb-2 w-fit" variant="default">
                    Most popular
                  </Badge>
                )}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="pt-2 text-3xl font-semibold">
                  {plan.price}
                  {plan.price !== 'Custom' && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </p>
              </CardHeader>
              <CardContent className="flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.highlighted ? 'default' : 'outline'} asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
