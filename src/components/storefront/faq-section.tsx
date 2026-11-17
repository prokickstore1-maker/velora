import { FaqItem } from "@/db/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqSectionProps {
  faqEnabled?: boolean;
  faqItems?: FaqItem[];
}

export function FaqSection({ faqEnabled, faqItems }: FaqSectionProps) {
  if (!faqEnabled || !faqItems || faqItems.length === 0) {
    return null;
  }

  return (
    <section id="faq" className="py-16 md:py-20 bg-ivory/40 border-t border-border">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold tracking-widest text-plum-muted uppercase block">
            Questions &amp; Answers
          </span>
          <h2 className="mv-heading-italic text-3xl sm:text-4xl text-plum">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="text-sm text-plum-muted">
            Find answers to common questions about stock, payment, and delivery.
          </p>
        </div>

        {/* Accordion List */}
        <div className="bg-white rounded-2xl border border-border p-4 sm:p-6 shadow-xs">
          <Accordion className="w-full">
            {faqItems.map((item, idx) => (
              <AccordionItem key={item.id || idx} value={`item-${idx}`} className="border-border/60">
                <AccordionTrigger className="text-left font-heading font-semibold text-sm sm:text-base text-plum hover:text-pink transition-colors">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-plum-muted leading-relaxed font-sans whitespace-pre-line">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
