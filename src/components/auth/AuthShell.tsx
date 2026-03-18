import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthHighlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

interface AuthShellProps {
  backLabel?: string;
  onBack: () => void;
  title: string;
  description: string;
  children: ReactNode;
  eyebrow?: string;
  panelTitle?: string;
  panelDescription?: string;
  highlights?: AuthHighlight[];
  stats?: Array<{ label: string; value: string }>;
  formWrapperClassName?: string;
}

const defaultHighlights: AuthHighlight[] = [
  {
    icon: ShieldCheck,
    title: "Trusted account access",
    description: "Secure flows for login, recovery, and managing your MumCare membership.",
  },
  {
    icon: Heart,
    title: "Reward-ready shopping",
    description: "Track orders, save essentials, and keep your loyalty benefits in one place.",
  },
  {
    icon: Truck,
    title: "Smoother repeat orders",
    description: "Get back to diapers, milk, and care products faster whenever you need them.",
  },
];

const defaultStats = [
  { label: "Member support", value: "24/7" },
  { label: "Family rewards", value: "Loyalty" },
];

export function AuthShell({
  backLabel = "Back to Home",
  onBack,
  title,
  description,
  children,
  eyebrow = "MumCare Account",
  panelTitle = "A calmer account experience for modern families.",
  panelDescription = "Sign in, register, or recover access in a space that feels as warm and clear as the rest of MumCare.",
  highlights = defaultHighlights,
  stats = defaultStats,
  formWrapperClassName,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(253,242,248,0.72),rgba(255,255,255,1)_28%,rgba(239,246,255,0.88)_100%)] px-4 py-6 sm:px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-24 size-72 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="absolute -right-20 top-16 size-80 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute -bottom-25 left-1/2 size-96 -translate-x-1/2 rounded-full bg-fuchsia-100/40 blur-3xl" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="relative z-10 rounded-full border-white/80 bg-white/85 px-4 text-slate-700 shadow-sm backdrop-blur hover:bg-white"
      >
        <ArrowLeft className="size-4" />
        {backLabel}
      </Button>

      <div className="relative mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl items-center justify-center py-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="order-2 overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(253,242,248,0.88)_45%,rgba(224,242,254,0.9)_100%)] p-6 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8 lg:order-1 lg:p-10">
            <Badge className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="mr-1 size-4 text-pink-500" />
              {eyebrow}
            </Badge>

            <h2 className="mt-6 max-w-xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              {panelTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              {panelDescription}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-white/80 bg-white/80 px-5 py-4 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-[24px] border border-white/70 bg-white/78 px-5 py-4 shadow-sm"
                  >
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(244,114,182,0.16),rgba(14,165,233,0.16))]">
                      <Icon className="size-5 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
              <Star className="size-4 text-amber-400" />
              Thoughtful care for moms and babies
            </div>
          </div>

          <div className={cn("order-1 self-center lg:order-2", formWrapperClassName)}>
            <div className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_28px_80px_-55px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{eyebrow}</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
                <p className="mt-3 text-base leading-8 text-slate-600">{description}</p>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
