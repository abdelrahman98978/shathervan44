import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const phoneNumber = "249115136522";
  const message = "مرحباً، أود الاستفسار عن خدماتكم";
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 xs:bottom-5 sm:bottom-6 left-4 xs:left-5 sm:left-6 z-50 group"
      aria-label="تواصل عبر واتساب"
    >
      <div className="relative">
        {/* Pulse Animation */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25" />
        
        {/* Main Button - Responsive */}
        <div className="relative w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300">
          <MessageCircle className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" />
        </div>
        
        {/* Tooltip - Hidden on mobile */}
        <div className="absolute left-full mr-3 top-1/2 -translate-y-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
          تواصل معنا عبر واتساب
        </div>
      </div>
    </a>
  );
}
