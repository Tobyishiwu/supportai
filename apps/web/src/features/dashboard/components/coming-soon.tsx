import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ComingSoonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: string;
}

export function ComingSoon({ icon: Icon, title, description, phase }: ComingSoonProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        <Badge variant="secondary">{phase}</Badge>
      </CardContent>
    </Card>
  );
}
