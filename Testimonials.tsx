import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  id: number;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  company: string;
  companyEn: string;
  content: string;
  contentEn: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "أحمد محمد علي",
    nameEn: "Ahmed Mohamed Ali",
    role: "مدير المشاريع",
    roleEn: "Projects Manager",
    company: "شركة النور للمقاولات",
    companyEn: "Al-Nour Construction Co.",
    content: "تعاملنا مع أعمال مازن الزبير للطاقة الشمسية في تركيب نظام الطاقة الشمسية لمصنعنا، وكانت التجربة ممتازة من البداية للنهاية. فريق محترف وجودة عالية.",
    contentEn: "We worked with Mazen Alzubair Solar Works to install a solar system for our factory. The experience was excellent from start to finish. Professional team and high quality.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Ahmed+Ali&background=0891b2&color=fff&size=100"
  },
  {
    id: 2,
    name: "سارة عبدالله حسن",
    nameEn: "Sara Abdullah Hassan",
    role: "مديرة العمليات",
    roleEn: "Operations Director",
    company: "مجموعة الأمل التجارية",
    companyEn: "Al-Amal Trading Group",
    content: "كاميرات المراقبة من هيك فيشن التي ركبها مازن الزبير لنا توفر أماناً كاملاً لمنشآتنا. الدعم الفني سريع ومتميز.",
    contentEn: "The Hikvision surveillance cameras installed by Mazen Alzubair provide complete security for our facilities. Technical support is fast and excellent.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Sara+Hassan&background=0891b2&color=fff&size=100"
  },
  {
    id: 3,
    name: "محمد الأمين عثمان",
    nameEn: "Mohamed Al-Amin Osman",
    role: "المدير العام",
    roleEn: "General Manager",
    company: "مصنع السلام للأغذية",
    companyEn: "Al-Salam Food Factory",
    content: "ماكينات التعبئة والتغليف التي وفرها مازن الزبير رفعت إنتاجيتنا بنسبة 40%. شركة تستحق الثقة والتعامل المستمر.",
    contentEn: "The packaging machines provided by Mazen Alzubair increased our productivity by 40%. A company worthy of trust and continued partnership.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Mohamed+Osman&background=0891b2&color=fff&size=100"
  },
  {
    id: 4,
    name: "فاطمة إبراهيم أحمد",
    nameEn: "Fatima Ibrahim Ahmed",
    role: "مهندسة كهربائية",
    roleEn: "Electrical Engineer",
    company: "شركة الطاقة المتجددة",
    companyEn: "Renewable Energy Co.",
    content: "أنصح بشدة بالتعامل مع مازن الزبير. الألواح الشمسية عالية الكفاءة والضمان الشامل يعطي راحة بال كبيرة.",
    contentEn: "I highly recommend working with Mazen Alzubair. High-efficiency solar panels and comprehensive warranty provide great peace of mind.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Fatima+Ahmed&background=0891b2&color=fff&size=100"
  },
];

export function Testimonials() {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container-rtl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 animate-fade-in">
          <span className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {language === 'ar' ? 'آراء عملائنا' : 'Client Testimonials'}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            {language === 'ar' ? 'ماذا يقول عملاؤنا عنا' : 'What Our Clients Say About Us'}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            {language === 'ar' 
              ? 'نفخر بثقة عملائنا ونسعى دائماً لتقديم أفضل الخدمات والحلول الهندسية'
              : 'We are proud of our clients\' trust and always strive to provide the best engineering services and solutions'}
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card rounded-3xl shadow-card p-6 sm:p-8 md:p-12 border border-border/50">
            {/* Quote Icon */}
            <div className="absolute -top-6 right-8 sm:right-12 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl gradient-accent flex items-center justify-center shadow-glow">
              <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-accent-foreground" />
            </div>

            {/* Content */}
            <div className="pt-4 sm:pt-6 space-y-6 sm:space-y-8">
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      i < currentTestimonial.rating 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-lg sm:text-xl md:text-2xl text-foreground leading-relaxed font-medium">
                "{language === 'ar' ? currentTestimonial.content : currentTestimonial.contentEn}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <img
                  src={currentTestimonial.avatar}
                  alt={language === 'ar' ? currentTestimonial.name : currentTestimonial.nameEn}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-accent shadow-lg"
                />
                <div>
                  <h4 className="font-bold text-foreground text-base sm:text-lg">
                    {language === 'ar' ? currentTestimonial.name : currentTestimonial.nameEn}
                  </h4>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {language === 'ar' ? currentTestimonial.role : currentTestimonial.roleEn}
                    {' - '}
                    <span className="text-accent font-medium">
                      {language === 'ar' ? currentTestimonial.company : currentTestimonial.companyEn}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-2 sm:-mx-4">
              <button
                onClick={prevTestimonial}
                className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-all hover:scale-110 active:scale-95"
                aria-label={language === 'ar' ? 'السابق' : 'Previous'}
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent transition-all hover:scale-110 active:scale-95"
                aria-label={language === 'ar' ? 'التالي' : 'Next'}
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className={`h-2.5 sm:h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-accent w-8 sm:w-10' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2.5 sm:w-3'
                }`}
                aria-label={`${language === 'ar' ? 'انتقال لشهادة' : 'Go to testimonial'} ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
