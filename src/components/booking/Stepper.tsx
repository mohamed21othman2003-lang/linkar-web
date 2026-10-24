import Link from "next/link";
import { Fragment } from "react";
import { Icon } from "@/components/icons/Icon";
import { Container } from "@/components/ui/Container";

// Stepper (713:4414): «إتمام الحجز» + «جونسون Johnson · خدمتان» + رجوع، ثم 4 خطوات (الخدمات ← الفرع ← بياناتك ← الدفع)
// current: رقم الخطوة الحالية (1…4). الخطوة 1 دائماً مكتملة لأنها بتتم في كارت الحجز في W2-32 / W2-21.
export function Stepper({
  title,
  subtitle,
  backLabel,
  backHref,
  steps,
  current,
}: {
  title: string;
  subtitle: string;
  backLabel: string;
  backHref: string;
  steps: string[];
  current: number;
}) {
  return (
    <div className="border-b border-border-default bg-white py-6 md:py-7">
      <Container className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="text-h4 md:text-h3">{title}</h1>
            <p className="text-caption text-text-secondary">{subtitle}</p>
          </div>
          <Link href={backHref} className="flex shrink-0 items-center gap-1 text-label-m text-green-active hover:underline">
            <Icon name="chevron-right" size={16} flip className="text-nature-green" />
            {backLabel}
          </Link>
        </div>
        <ol className="flex items-center gap-2 md:gap-3">
          {steps.map((label, i) => {
            const n = i + 1;
            const state = n < current ? "done" : n === current ? "current" : "todo";
            return (
              <Fragment key={label}>
                {i > 0 && (
                  <li aria-hidden className={`h-0.5 min-w-3 flex-1 rounded-full md:max-w-[120px] ${n <= current ? "bg-neon-green" : "bg-border-default"}`} />
                )}
                <li className="flex shrink-0 items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
                  <span
                    className={`flex size-[30px] items-center justify-center rounded-full text-label-m ${
                      state === "done"
                        ? "bg-neon-green text-solid-black"
                        : state === "current"
                          ? "bg-deep-charcoal text-neon-green"
                          : "border border-border-default bg-white text-state-gray"
                    }`}
                  >
                    {state === "done" ? <Icon name="check" size={16} /> : n}
                  </span>
                  <span
                    className={`text-[16px] leading-[28px] ${state === "current" ? "font-medium text-deep-charcoal" : state === "done" ? "font-light text-deep-charcoal max-sm:hidden" : "font-light text-state-gray max-sm:hidden"}`}
                  >
                    {label}
                  </span>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </Container>
    </div>
  );
}
