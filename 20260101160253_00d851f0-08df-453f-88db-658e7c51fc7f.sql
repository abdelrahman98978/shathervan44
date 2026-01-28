-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_reviews
CREATE POLICY "Anyone can view approved reviews"
  ON public.product_reviews
  FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can create reviews"
  ON public.product_reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews"
  ON public.product_reviews
  FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete reviews"
  ON public.product_reviews
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for review images
CREATE POLICY "Anyone can view review images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'review-images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own review images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'review-images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete their own review images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'review-images' 
    AND auth.uid() IS NOT NULL
  );

-- Add trigger for updated_at
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON public.product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX idx_product_reviews_approved ON public.product_reviews(is_approved);