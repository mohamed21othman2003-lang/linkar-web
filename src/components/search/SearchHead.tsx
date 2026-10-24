import { Breadcrumb, type Crumb } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { ServiceGlyph } from "@/components/icons/Icon";
import type { FactIcon } from "@/lib/data/search/types";
import type { ServiceSlug } from "@/lib/data/types";

// Page head في W2-30/W2-30a: تدرّج ليموني خفيف + مسار + عنوان + وصف، وكروت «الأسعار · المدة · الضمان»
export function SearchHead({
  crumbs,
  title,
  description,
  tile,
  facts,
}: {
  crumbs: Crumb[];
  title: string;
  description: string;
  tile: ServiceSlug | null;
  facts: { icon: FactIcon; label: string; value: string }[];
}) {
  return (
    <div className="bg-pagehead pt-7 pb-6">
      <Container className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="flex items-start gap-4">
          {tile && (
            <span className="hidden size-[72px] shrink-0 items-center justify-center rounded-md bg-neon-green text-deep-charcoal sm:flex">
              <ServiceGlyph name={tile} size={42} />
            </span>
          )}
          <div className="flex max-w-[560px] flex-col gap-2">
            <Breadcrumb items={crumbs} />
            <h1 className="text-h3 text-deep-charcoal md:text-h2">{title}</h1>
            {description && <p className="text-body-m text-state-gray">{description}</p>}
          </div>
        </div>
        {facts.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {facts.map((f) => (
              <div key={f.icon} className="flex items-center gap-2.5 rounded-[14px] border border-cool-gray bg-white px-3.5 py-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/figma/search/fact-${f.icon}.svg`} alt="" width={20} height={20} className="size-5 shrink-0 object-contain" />
                <div className="flex flex-col items-start whitespace-nowrap">
                  <span className="text-caption text-state-gray">{f.label}</span>
                  <span className="text-label-l text-deep-charcoal">{f.value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
