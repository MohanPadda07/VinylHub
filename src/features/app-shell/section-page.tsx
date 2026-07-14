import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/features/app-shell/app-shell";
import { cn } from "@/lib/utils";

type SectionMetric = {
  label: string;
  value: string;
  tone?: string;
};

type SectionPanel = {
  title: string;
  items: string[];
};

type SectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: SectionMetric[];
  panels: SectionPanel[];
};

export function SectionPage({
  eyebrow,
  title,
  description,
  metrics,
  panels,
}: SectionPageProps) {
  return (
    <AppShell>
      <div className="space-y-5 py-5">
        <section className="glass-border rounded-lg bg-panel/80 p-5">
          <Badge className="border-emerald/25 bg-emerald/10 text-emerald">
            {eyebrow}
          </Badge>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-zinc-300">
            {description}
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="bg-white/[0.045]">
              <CardContent className="p-4">
                <p className="text-xs text-muted">{metric.label}</p>
                <p
                  className={cn(
                    "mt-2 text-2xl font-semibold text-white",
                    metric.tone,
                  )}
                >
                  {metric.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {panels.map((panel) => (
            <Card key={panel.title}>
              <CardHeader>
                <CardTitle>{panel.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {panel.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-zinc-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
