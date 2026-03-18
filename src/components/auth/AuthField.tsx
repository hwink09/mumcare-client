import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  icon: LucideIcon;
  rightSlot?: ReactNode;
}

export function AuthField({
  label,
  icon: Icon,
  rightSlot,
  className,
  ...props
}: AuthFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
        <input
          {...props}
          className={cn(
            "h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100",
            rightSlot ? "pr-12" : "pr-4",
            className,
          )}
        />
        {rightSlot ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {rightSlot}
          </div>
        ) : null}
      </div>
    </div>
  );
}
