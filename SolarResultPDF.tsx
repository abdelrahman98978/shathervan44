import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Mail, Printer, MessageCircle, Loader2, FileText, Share2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SolarResult {
  panelCount: number;
  requiredCapacity: number;
  systemCost: number;
  annualSavings: number;
  paybackYears: number;
  lifetimeSavings: number;
  co2Saved: number;
  inverterSize: number;
  batteryCapacity: number;
  monthlyBillBefore: number;
  monthlyBillAfter: number;
  systemType: 'on_grid' | 'off_grid' | 'hybrid';
}

interface SolarInput {
  monthlyConsumption: number;
  usageType: 'residential' | 'commercial' | 'industrial';
  city: string;
  sunHours: number;
  systemType: 'on_grid' | 'off_grid' | 'hybrid';
}

interface SolarResultPDFProps {
  result: SolarResult;
  input: SolarInput;
  trigger?: React.ReactNode;
}

const systemTypeLabels: Record<string, string> = {
  'on_grid': 'متصل بالشبكة (On-Grid)',
  'off_grid': 'مستقل (Off-Grid)',
  'hybrid': 'هجين (Hybrid)',
};

const usageTypeLabels: Record<string, string> = {
  'residential': 'منزلي',
  'commercial': 'تجاري',
  'industrial': 'صناعي',
};

export default function SolarResultPDF({ result, input, trigger }: SolarResultPDFProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `نتائج حاسبة الطاقة الشمسية`,
  });

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num);
  };

  const today = new Date();
  const validUntil = new Date(today);
  validUntil.setDate(validUntil.getDate() + 30);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate PDF as Base64
  const generatePDFBase64 = async (): Promise<string> => {
    const element = printRef.current;
    if (!element) throw new Error('No element to print');
    
    const canvas = await html2canvas(element, { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    
    pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
    
    return pdf.output('datauristring');
  };

  // Download PDF locally
  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    try {
      const element = printRef.current;
      if (!element) throw new Error('No element');
      
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      
      pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`نتائج_حاسبة_الطاقة_الشمسية.pdf`);
      
      toast({
        title: 'تم التحميل ✓',
        description: 'تم تحميل ملف PDF بنجاح',
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء ملف PDF',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      toast({
        title: 'بريد إلكتروني غير صالح',
        description: 'يرجى إدخال بريد إلكتروني صحيح',
        variant: 'destructive',
      });
      return;
    }

    if (!customerName.trim()) {
      toast({
        title: 'الاسم مطلوب',
        description: 'يرجى إدخال اسمك',
        variant: 'destructive',
      });
      return;
    }

    setSendingEmail(true);
    try {
      const pdfBase64 = await generatePDFBase64();
      
      const { error } = await supabase.functions.invoke('send-solar-quote', {
        body: {
          recipientEmail: emailAddress,
          recipientName: customerName,
          quoteNumber: `CALC-${Date.now().toString(36).toUpperCase()}`,
          systemType: input.systemType,
          totalCost: result.systemCost,
          panelCount: result.panelCount,
          capacity: result.requiredCapacity,
          validUntil: validUntil.toISOString(),
          pdfBase64: pdfBase64,
          monthlyProduction: Math.round(input.monthlyConsumption * 0.9),
          inverterSize: result.inverterSize,
          batteryCount: result.batteryCapacity > 0 ? Math.ceil(result.batteryCapacity / 5) : undefined,
        },
      });

      if (error) throw error;

      toast({
        title: 'تم الإرسال بنجاح ✓',
        description: `تم إرسال نتائج الحاسبة كملف PDF إلى ${emailAddress}`,
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: 'خطأ في الإرسال',
        description: error.message || 'حدث خطأ أثناء إرسال البريد',
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleWhatsApp = async () => {
    await handleDownloadPDF();
    
    const message = encodeURIComponent(
      `مرحباً،\n\n` +
      `أرفق لكم نتائج حاسبة الطاقة الشمسية من مازن الزبير للطاقة الشمسية:\n\n` +
      `📋 تفاصيل النظام:\n` +
      `• نوع النظام: ${systemTypeLabels[input.systemType]}\n` +
      `• عدد الألواح: ${result.panelCount} لوح\n` +
      `• القدرة: ${result.requiredCapacity} كيلوواط\n` +
      `• الإنفرتر: ${result.inverterSize} كيلوواط\n` +
      (result.batteryCapacity > 0 ? `• البطاريات: ${result.batteryCapacity} كيلوواط/ساعة\n` : '') +
      `\n💰 الإجمالي: $${formatNumber(result.systemCost)}\n` +
      `📈 التوفير السنوي: ${formatNumber(result.annualSavings)} ج.س\n\n` +
      `📎 يرجى إرفاق ملف PDF الذي تم تحميله.\n\n` +
      `للاستفسار أو طلب عرض سعر مخصص، تواصل معنا.\n\n` +
      `مازن الزبير للطاقة الشمسية`
    );
    
    window.open(`https://wa.me/249123456789?text=${message}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            تصدير PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            تصدير نتائج الحاسبة
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Info Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1.5">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                placeholder="اسمك الكامل"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                placeholder="249123456789"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                dir="ltr"
                className="text-left"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSendEmail} disabled={sendingEmail} className="gap-2">
              {sendingEmail ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {sendingEmail ? 'جاري الإرسال...' : 'إرسال PDF بالبريد'}
            </Button>
            <Button onClick={handleDownloadPDF} disabled={generatingPDF} variant="outline" className="gap-2">
              {generatingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              تحميل PDF
            </Button>
            <Button onClick={() => handlePrint()} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              طباعة
            </Button>
            <Button variant="outline" onClick={handleWhatsApp} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              واتساب + PDF
            </Button>
          </div>

          {/* PDF Preview */}
          <div className="border rounded-lg overflow-hidden">
            <div 
              ref={printRef}
              className="bg-white"
              dir="rtl"
              style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '15mm',
                margin: '0 auto',
                boxSizing: 'border-box',
                fontSize: '11pt',
                lineHeight: '1.6',
              }}
            >
              {/* Decorative Border */}
              <div style={{ border: '2px solid #d97706', borderRadius: '8px', padding: '2px' }}>
                <div style={{ border: '1px solid #fde68a', borderRadius: '6px', padding: '20px' }}>
                  
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #d97706' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ width: '70px', height: '70px', backgroundColor: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #fde68a' }}>
                                        <img 
                                          src="/logo-mazen.png" 
                                          alt="مازن الزبير" 
                                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                      </div>
                                      <div>
                                        <h1 style={{ fontSize: '20pt', fontWeight: 'bold', color: '#d97706', margin: 0 }}>مازن الزبير للطاقة الشمسية</h1>
                                        <p style={{ fontSize: '10pt', color: '#6b7280', margin: '3px 0 0' }}>Mazen Alzubair Solar</p>
                                        <p style={{ fontSize: '9pt', color: '#9ca3af', margin: '3px 0 0' }}>حلول الطاقة الشمسية المتكاملة</p>
                                      </div>
                    </div>
                    <div style={{ textAlign: 'left', backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', border: '1px solid #fde68a' }}>
                      <p style={{ fontSize: '14pt', fontWeight: 'bold', color: '#b45309', margin: 0 }}>نتائج الحاسبة الشمسية</p>
                      <p style={{ fontSize: '9pt', color: '#6b7280', margin: '5px 0 0' }}>التاريخ: {formatDate(today)}</p>
                      <p style={{ fontSize: '9pt', color: '#6b7280', margin: '3px 0 0' }}>صالح حتى: {formatDate(validUntil)}</p>
                    </div>
                  </div>

                  {/* Customer & Input Data */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb' }}>
                      <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#d97706', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #fde68a' }}>
                        ● بيانات العميل
                      </h3>
                      <div style={{ fontSize: '10pt' }}>
                        <p style={{ margin: '5px 0' }}><span style={{ color: '#6b7280' }}>الاسم:</span> <strong>{customerName || 'غير محدد'}</strong></p>
                        <p style={{ margin: '5px 0' }}><span style={{ color: '#6b7280' }}>البريد:</span> <span dir="ltr">{emailAddress || 'غير محدد'}</span></p>
                        <p style={{ margin: '5px 0' }}><span style={{ color: '#6b7280' }}>الهاتف:</span> <span dir="ltr">{customerPhone || 'غير محدد'}</span></p>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb' }}>
                      <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#d97706', marginBottom: '10px', paddingBottom: '5px', borderBottom: '1px solid #fde68a' }}>
                        ● البيانات المدخلة
                      </h3>
                      <div style={{ fontSize: '10pt' }}>
                        <p style={{ margin: '5px 0' }}><span style={{ color: '#6b7280' }}>الاستهلاك الشهري:</span> <strong>{formatNumber(input.monthlyConsumption)} كيلوواط/ساعة</strong></p>
                        <p style={{ margin: '5px 0' }}><span style={{ color: '#6b7280' }}>نوع الاستخدام:</span> <strong>{usageTypeLabels[input.usageType]}</strong></p>
                        <p style={{ margin: '5px 0' }}><span style={{ color: '#6b7280' }}>المدينة:</span> <strong>{input.city}</strong></p>
                        <p style={{ margin: '5px 0' }}><span style={{ color: '#6b7280' }}>ساعات الشمس:</span> <strong>{input.sunHours} ساعة/يوم</strong></p>
                      </div>
                    </div>
                  </div>

                  {/* System Summary */}
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', color: 'white', backgroundColor: '#d97706', padding: '10px 15px', borderRadius: '8px 8px 0 0', margin: 0 }}>
                      ملخص النظام - {systemTypeLabels[input.systemType]}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '0 0 8px 8px', border: '1px solid #fde68a', borderTop: 'none' }}>
                      <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #fde68a' }}>
                        <p style={{ fontSize: '18pt', fontWeight: 'bold', color: '#b45309', margin: 0 }}>{result.panelCount}</p>
                        <p style={{ fontSize: '9pt', color: '#6b7280', margin: '5px 0 0' }}>لوح شمسي</p>
                      </div>
                      <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #fde68a' }}>
                        <p style={{ fontSize: '18pt', fontWeight: 'bold', color: '#b45309', margin: 0 }}>{result.requiredCapacity}</p>
                        <p style={{ fontSize: '9pt', color: '#6b7280', margin: '5px 0 0' }}>كيلوواط</p>
                      </div>
                      <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #fde68a' }}>
                        <p style={{ fontSize: '18pt', fontWeight: 'bold', color: '#b45309', margin: 0 }}>{result.inverterSize}</p>
                        <p style={{ fontSize: '9pt', color: '#6b7280', margin: '5px 0 0' }}>كيلوواط إنفرتر</p>
                      </div>
                      {result.batteryCapacity > 0 && (
                        <div style={{ textAlign: 'center', padding: '10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #fde68a' }}>
                          <p style={{ fontSize: '18pt', fontWeight: 'bold', color: '#b45309', margin: 0 }}>{result.batteryCapacity}</p>
                          <p style={{ fontSize: '9pt', color: '#6b7280', margin: '5px 0 0' }}>kWh بطاريات</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', color: 'white', backgroundColor: '#059669', padding: '10px 15px', borderRadius: '8px 8px 0 0', margin: 0 }}>
                      التحليل المالي
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                      <tbody>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px 15px', fontWeight: '600' }}>التكلفة التقديرية</td>
                          <td style={{ padding: '10px 15px', textAlign: 'left', fontSize: '14pt', fontWeight: 'bold', color: '#1f2937' }}>
                            ${formatNumber(result.systemCost)}
                            <span style={{ fontSize: '10pt', color: '#6b7280', marginRight: '10px' }}>
                              ≈ {formatNumber(result.systemCost * 600)} ج.س
                            </span>
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px 15px', fontWeight: '600' }}>التوفير السنوي</td>
                          <td style={{ padding: '10px 15px', textAlign: 'left', fontSize: '14pt', fontWeight: 'bold', color: '#059669' }}>
                            {formatNumber(result.annualSavings)} ج.س
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px 15px', fontWeight: '600' }}>فترة الاسترداد</td>
                          <td style={{ padding: '10px 15px', textAlign: 'left', fontSize: '14pt', fontWeight: 'bold' }}>
                            {result.paybackYears} سنة
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '10px 15px', fontWeight: '600' }}>التوفير خلال 25 سنة</td>
                          <td style={{ padding: '10px 15px', textAlign: 'left', fontSize: '14pt', fontWeight: 'bold', color: '#059669' }}>
                            {formatNumber(result.lifetimeSavings)} ج.س
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '10px 15px', fontWeight: '600' }}>الفاتورة الشهرية (قبل)</td>
                          <td style={{ padding: '10px 15px', textAlign: 'left' }}>
                            <span style={{ color: '#dc2626' }}>{formatNumber(result.monthlyBillBefore)} ج.س</span>
                            <span style={{ margin: '0 10px' }}>→</span>
                            <span style={{ color: '#059669' }}>{formatNumber(result.monthlyBillAfter)} ج.س</span>
                            <span style={{ fontSize: '10pt', color: '#6b7280', marginRight: '5px' }}>(بعد)</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Environmental Impact */}
                  <div style={{ backgroundColor: '#ecfdf5', borderRadius: '8px', padding: '15px', marginBottom: '20px', border: '1px solid #a7f3d0' }}>
                    <h3 style={{ fontSize: '11pt', fontWeight: 'bold', color: '#059669', margin: '0 0 10px' }}>🌱 الأثر البيئي</h3>
                    <p style={{ fontSize: '10pt', margin: 0 }}>
                      انبعاثات CO2 المُوفَّرة سنوياً: <strong style={{ color: '#059669', fontSize: '14pt' }}>{formatNumber(result.co2Saved)} كجم</strong>
                      <span style={{ marginRight: '15px', color: '#6b7280' }}>= زراعة {Math.round(result.co2Saved / 20)} شجرة سنوياً 🌳</span>
                    </p>
                  </div>

                  {/* Footer */}
                  <div style={{ borderTop: '2px solid #d97706', paddingTop: '15px', marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9pt', color: '#6b7280' }}>
                      <div>
                        <p style={{ margin: '3px 0' }}>📞 الهاتف: +249 115 136 522</p>
                        <p style={{ margin: '3px 0' }}>📧 البريد: mazenalzubair0@gmail.com</p>
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ margin: '3px 0' }}>🌐 www.mazenalzubair.com</p>
                        <p style={{ margin: '3px 0' }}>📍 الخرطوم، السودان</p>
                      </div>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '8pt', color: '#9ca3af', marginTop: '10px' }}>
                      هذه النتائج تقديرية وقد تختلف حسب الظروف الفعلية. للحصول على عرض سعر دقيق، يرجى التواصل معنا.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
