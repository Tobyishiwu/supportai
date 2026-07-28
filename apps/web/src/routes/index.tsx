import { createFileRoute } from '@tanstack/react-router';
import { MarketingLayout } from '@/layouts/marketing-layout';
import { Navbar } from '@/features/marketing/components/navbar';
import { Hero } from '@/features/marketing/components/hero';
import { FeaturesGrid } from '@/features/marketing/components/features-grid';
import { HowItWorks } from '@/features/marketing/components/how-it-works';
import { Pricing } from '@/features/marketing/components/pricing';
import { FAQ } from '@/features/marketing/components/faq';
import { CTA, Footer } from '@/features/marketing/components/cta-footer';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <MarketingLayout>
      <Navbar />
      <Hero />
      <FeaturesGrid />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </MarketingLayout>
  );
}
