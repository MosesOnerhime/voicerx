import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
import { ChevronDown, FileText, Activity, ShieldCheck } from 'lucide-react';

import { cn } from "../../lib/utils";

// --- 1. TABLE COMPONENTS ---
const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
));
const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn("border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50", className)} {...props} />
));
const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th ref={ref} className={cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className)} {...props} />
));
const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
));
const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
));

// --- 2. BADGE & STATUS COMPONENTS ---
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// Medical StatusBadge
export function StatusBadge({ status, className }: { status: any, className?: string }) {
  const config: any = {
    pending: { label: 'Pending Review', className: 'bg-amber-50 text-amber-600 border-amber-100' },
    updated: { label: 'Updated', className: 'bg-blue-50 text-blue-600 border-blue-100' },
    approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  };
  const active = config[status] || config.pending;
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', active.className, className)}>
      <span className={cn('mr-1.5 h-1.5 w-1.5 rounded-full bg-current', status === 'pending' && 'animate-pulse')} />
      {active.label}
    </span>
  );
}

// --- 3. ACCORDION (PATIENT DETAILS) ---
export function PatientAccordion() {
  const [open, setOpen] = React.useState<string | null>('medical-history');
  const sections = [
    { id: 'medical-history', title: 'Medical History', icon: FileText, content: 'History of hypertension...' },
    { id: 'vitals', title: 'Recent Vitals', icon: Activity, content: 'BP: 120/80...' },
    { id: 'insurance', title: 'Insurance', icon: ShieldCheck, content: 'Provider: BlueCross...' },
  ];
  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div key={s.id} className="border rounded-[24px] bg-white overflow-hidden shadow-sm">
          <button onClick={() => setOpen(open === s.id ? null : s.id)} className="w-full flex justify-between p-5 items-center hover:bg-slate-50 transition-all">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 text-[#A855F7] p-2 rounded-xl"><s.icon size={18} /></div>
              <span className="font-bold text-slate-700">{s.title}</span>
            </div>
            <ChevronDown size={20} className={cn("text-slate-400 transition-transform", open === s.id && "rotate-180")} />
          </button>
          <div className={cn("transition-all overflow-hidden", open === s.id ? "max-h-40 p-5 pt-0 opacity-100" : "max-h-0 opacity-0")}>
             <p className="text-sm text-slate-500 font-medium border-t pt-4">{s.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- 4. AVATAR COMPONENTS ---
const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
));
const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />
));
const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />
));

// --- 5. PROGRESS & TOOLTIP & HOVERCARD ---
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root ref={ref} className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
    <ProgressPrimitive.Indicator className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </ProgressPrimitive.Root>
));

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95", className)} {...props} />
));

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;
const HoverCardContent = React.forwardRef<React.ElementRef<typeof HoverCardPrimitive.Content>, React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn("z-50 w-64 rounded-md border bg-popover p-4 shadow-md outline-none animate-in fade-in-0 zoom-in-95", className)} {...props} />
));

// --- 6. UTILITY PRIMITIVES ---
const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;
const AspectRatio = AspectRatioPrimitive.Root;

export {
  Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption,
  Badge, badgeVariants,
  Avatar, AvatarImage, AvatarFallback,
  Progress,
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider,
  HoverCard, HoverCardTrigger, HoverCardContent,
  Collapsible, CollapsibleTrigger, CollapsibleContent,
  AspectRatio
};