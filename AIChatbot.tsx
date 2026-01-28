import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, X, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const suggestions = [
  'ما هي أفضل ألواح شمسية للمنزل؟',
  'كم تكلفة نظام مراقبة كامل؟',
  'هل تقدمون خدمة التركيب؟',
  'ما هي مدة الضمان على المنتجات؟',
];

const aiResponses: Record<string, string> = {
  'default': 'مرحباً! أنا مساعدك الذكي في أعمال مازن الزبير للطاقة الشمسية. كيف يمكنني مساعدتك اليوم؟',
  'ألواح': 'نوفر ألواح شمسية عالية الجودة بقدرات مختلفة (250W - 550W). الألواح الأنسب للمنازل هي بقدرة 400W-450W من نوع مونو كريستالين التي تتميز بكفاءة عالية تصل إلى 21%. هل تريد معرفة المزيد عن الأسعار؟',
  'مراقبة': 'نظام المراقبة الكامل يشمل: كاميرات IP بدقة 4K، جهاز تسجيل DVR/NVR، هارد ديسك للتخزين، وأسلاك التوصيل. التكلفة تعتمد على عدد الكاميرات والمساحة المراد تغطيتها. للحصول على عرض سعر مخصص، يرجى التواصل معنا.',
  'تركيب': 'نعم، نقدم خدمة التركيب الاحترافي لجميع منتجاتنا. فريقنا الفني مدرب ومؤهل لتركيب أنظمة الطاقة الشمسية وكاميرات المراقبة والماكينات الصناعية. التركيب يشمل الضمان.',
  'ضمان': 'نقدم ضمان شامل على جميع منتجاتنا:\n• الألواح الشمسية: 25 سنة\n• الإنفرترات: 5-10 سنوات\n• كاميرات المراقبة: سنتين\n• الماكينات الصناعية: سنة واحدة\nالضمان يشمل الصيانة وقطع الغيار.',
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: aiResponses.default }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('ألواح') || lowerMessage.includes('شمسية') || lowerMessage.includes('solar')) {
      return aiResponses['ألواح'];
    }
    if (lowerMessage.includes('مراقبة') || lowerMessage.includes('كاميرا') || lowerMessage.includes('camera')) {
      return aiResponses['مراقبة'];
    }
    if (lowerMessage.includes('تركيب') || lowerMessage.includes('تثبيت') || lowerMessage.includes('install')) {
      return aiResponses['تركيب'];
    }
    if (lowerMessage.includes('ضمان') || lowerMessage.includes('warranty')) {
      return aiResponses['ضمان'];
    }
    
    return 'شكراً لتواصلك معنا! للحصول على معلومات أكثر تفصيلاً، يمكنك التواصل مع فريقنا عبر الواتساب أو زيارة صفحة "اتصل بنا". هل هناك شيء آخر يمكنني مساعدتك به؟';
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(messageText)
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-6 z-50 h-14 w-14 rounded-full shadow-lg animate-pulse-glow"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-24 left-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] shadow-lg border-border/50">
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5" />
          المساعد الذكي
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[350px] p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === 'user' ? "bg-accent" : "bg-primary"
                )}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-accent-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <div className={cn(
                  "rounded-lg p-3 max-w-[80%] text-sm",
                  message.role === 'user' 
                    ? "bg-accent text-accent-foreground" 
                    : "bg-muted"
                )}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="p-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">اقتراحات:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSend(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="اكتب رسالتك..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
