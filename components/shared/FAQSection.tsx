import React from 'react';
import prisma from '@/lib/prisma';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import Link from 'next/link';

interface FAQSectionProps {
  showViewAll?: boolean;
}

export default async function FAQSection({ showViewAll = false }: FAQSectionProps) {
  // Query active FAQs sorted by sortOrder
  const faqs = await prisma.fAQ.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
    take: 6,
  }).catch((err) => {
    console.error('[FAQSection] Failed to fetch FAQs:', err);
    return [];
  });

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto select-none pt-12">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight uppercase">
          Frequently Asked Questions
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed max-w-prose">
          Find answers to common questions regarding our platforms, operations, and developer utilities.
        </p>
      </div>

      <Accordion className="w-full space-y-3">
        {faqs.map((faq, idx) => (
          <AccordionItem
            key={faq.id}
            value={`faq-${idx}`}
            className="glass-panel border border-white/10 bg-white/5 backdrop-blur-sm rounded-xl px-6 overflow-hidden hover:border-accent/30 transition-colors"
          >
            <AccordionTrigger className="text-sm font-semibold text-white hover:text-accent hover:no-underline py-5">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-zinc-400 text-xs leading-relaxed pb-5 pt-1">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {showViewAll && (
        <div className="text-center pt-2">
          <Link
            href="/contact#faq"
            className="text-xs font-bold text-accent hover:text-accent-hover transition-colors uppercase tracking-wider"
          >
            View all FAQs →
          </Link>
        </div>
      )}
    </div>
  );
}
