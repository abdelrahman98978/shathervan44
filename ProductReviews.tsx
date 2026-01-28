import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['product_reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 
      : 0
  }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (uploadedImages.length + files.length > 5) {
      toast({ title: t('reviews.error'), description: t('reviews.maxImages'), variant: 'destructive' });
      return;
    }
    setUploadedImages([...uploadedImages, ...files.slice(0, 5 - uploadedImages.length)]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!comment.trim() || !name.trim()) {
      toast({ title: t('reviews.error'), description: t('reviews.errorDesc'), variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Upload images if any
      const imageUrls: string[] = [];
      for (const file of uploadedImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${user?.id || 'anonymous'}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('review-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(filePath);
        
        imageUrls.push(publicUrl);
      }

      // Insert review
      const { error } = await supabase.from('product_reviews').insert({
        product_id: productId,
        user_id: user?.id || null,
        customer_name: name,
        customer_email: email || null,
        rating,
        comment,
        images: imageUrls,
        is_approved: false // Requires admin approval
      });

      if (error) throw error;

      toast({ 
        title: t('reviews.success'), 
        description: t('reviews.successDesc') 
      });

      // Reset form
      setRating(5);
      setComment('');
      setName('');
      setEmail('');
      setUploadedImages([]);
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['product_reviews', productId] });

    } catch (error: any) {
      toast({ title: t('reviews.error'), description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{avgRating}</div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(parseFloat(avgRating))
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">{reviews.length} {t('reviews.totalReviews')}</p>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-4">{t('reviews.writeReview')}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('reviews.addReview')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('reviews.rating')}</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                star <= rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground hover:text-yellow-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t('reviews.name')} *</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('reviews.name')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('reviews.email')}</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('reviews.comment')} *</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('reviews.shareFeedback')}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('reviews.images')}</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {uploadedImages.map((file, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {uploadedImages.length < 5 && (
                          <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 flex items-center justify-center cursor-pointer transition-colors">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          {t('reviews.submitting')}
                        </>
                      ) : (
                        t('reviews.submit')
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-12">{star} {t('reviews.stars')}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground">{t('reviews.loading')}</p>
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">{t('reviews.noReviews')}</h3>
              <p className="text-muted-foreground mb-4">{t('reviews.beFirst')}</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback>{review.customer_name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{review.customer_name}</h4>
                        {review.is_verified && (
                          <Badge variant="secondary" className="text-xs">{t('reviews.verified')}</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDate(review.created_at)}</span>
                    </div>
                    
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-sm leading-relaxed">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        {review.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Review image ${idx + 1}`}
                            className="aspect-square rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(img, '_blank')}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
