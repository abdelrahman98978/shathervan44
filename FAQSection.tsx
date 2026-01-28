import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FAQItem {
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
}

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
  titleEn?: string;
  subtitle?: string;
  subtitleEn?: string;
}

export function FAQSection({ 
  items, 
  title,
  titleEn,
  subtitle,
  subtitleEn
}: FAQSectionProps) {
  const { t, language } = useLanguage();
  
  const displayTitle = language === 'ar' 
    ? (title || t('faq.title')) 
    : (titleEn || title || t('faq.title'));
    
  const displaySubtitle = language === 'ar' 
    ? (subtitle || t('faq.subtitle')) 
    : (subtitleEn || subtitle || t('faq.subtitle'));

  return (
    <section className="py-24 bg-card border-y border-border">
      <div className="container-rtl">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <span className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <HelpCircle className="h-4 w-4" />
            <span>{t('faq.frequentQuestions')}</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {displayTitle}
          </h2>
          <p className="text-lg text-muted-foreground">
            {displaySubtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((item, index) => {
              const question = language === 'ar' ? item.question : (item.questionEn || item.question);
              const answer = language === 'ar' ? item.answer : (item.answerEn || item.answer);
              
              return (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-300 px-6 overflow-hidden"
                >
                  <AccordionTrigger className="text-right hover:no-underline py-5 text-foreground font-semibold text-base md:text-lg gap-4">
                    <span className="text-right flex-1">{question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-base">
                    {answer}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
