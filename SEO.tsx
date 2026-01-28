import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
  };
  product?: {
    price?: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock';
  };
  noindex?: boolean;
}

const SITE_NAME = 'أعمال مازن الزبير للطاقة الشمسية';
const BASE_URL = 'https://www.mazenalzubair.com';
const DEFAULT_IMAGE = `${BASE_URL}/logo-mazen.png`;

// صور OG مخصصة لكل صفحة
export const OG_IMAGES = {
  home: `${BASE_URL}/og-home.jpg`,
  services: `${BASE_URL}/og-services.jpg`,
  products: `${BASE_URL}/og-products.jpg`,
  projects: `${BASE_URL}/og-projects.jpg`,
  blog: `${BASE_URL}/og-blog.jpg`,
  about: `${BASE_URL}/og-about.jpg`,
  contact: `${BASE_URL}/og-contact.jpg`,
};

export function SEO({
  title,
  description,
  canonical,
  type = 'website',
  image = DEFAULT_IMAGE,
  article,
  product,
  noindex = false,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : BASE_URL);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Language Alternates */}
      <link rel="alternate" hrefLang="ar" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="ar_SA" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article Meta */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && <meta property="article:author" content={article.author} />}
        </>
      )}

      {/* Product Meta */}
      {product && (
        <>
          {product.price && (
            <meta property="product:price:amount" content={String(product.price)} />
          )}
          {product.currency && (
            <meta property="product:price:currency" content={product.currency} />
          )}
        </>
      )}
    </Helmet>
  );
}

// Schema.org JSON-LD Components
interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: {
    city?: string;
    country?: string;
  };
}

export function OrganizationSchema({
  name = 'أعمال مازن الزبير للطاقة الشمسية',
  url = BASE_URL,
  logo = DEFAULT_IMAGE,
  phone = '+249115136522',
  email = 'mazenalzubair0@gmail.com',
  address = { city: 'الخرطوم', country: 'السودان' },
}: OrganizationSchemaProps = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phone,
      email,
      contactType: 'customer service',
      areaServed: 'SD',
      availableLanguage: ['Arabic', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: address.city,
      addressCountry: address.country,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// LocalBusiness Schema for better local SEO
interface LocalBusinessSchemaProps {
  name?: string;
  url?: string;
  image?: string;
  phone?: string;
  email?: string;
  address?: {
    streetAddress?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  geo?: {
    latitude?: number;
    longitude?: number;
  };
  openingHours?: string[];
  priceRange?: string;
}

export function LocalBusinessSchema({
  name = 'أعمال مازن الزبير للطاقة الشمسية',
  url = BASE_URL,
  image = DEFAULT_IMAGE,
  phone = '+249115136522',
  email = 'mazenalzubair0@gmail.com',
  address = { streetAddress: 'الخرطوم', city: 'الخرطوم', country: 'SD' },
  geo = { latitude: 15.5007, longitude: 32.5599 },
  openingHours = ['Sa-Th 08:00-17:00'],
  priceRange = '$$',
}: LocalBusinessSchemaProps = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}#business`,
    name,
    url,
    image,
    telephone: phone,
    email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.city,
      addressCountry: address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    openingHoursSpecification: openingHours.map(hours => {
      const [days, time] = hours.split(' ');
      const [open, close] = time?.split('-') || ['08:00', '17:00'];
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: days,
        opens: open,
        closes: close,
      };
    }),
    priceRange,
    sameAs: [],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// WebSite Schema for sitelinks search box
interface WebSiteSchemaProps {
  name?: string;
  url?: string;
  searchUrl?: string;
}

export function WebSiteSchema({
  name = 'أعمال مازن الزبير للطاقة الشمسية',
  url = BASE_URL,
  searchUrl = `${BASE_URL}/blog/search?q=`,
}: WebSiteSchemaProps = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${searchUrl}{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// VideoObject Schema for video content
interface VideoSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}

export function VideoSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
}: VideoSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    contentUrl,
    embedUrl,
    publisher: {
      '@type': 'Organization',
      name: 'أعمال مازن الزبير للطاقة الشمسية',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_IMAGE,
      },
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image?: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock';
  sku?: string;
  brand?: string;
  reviewCount?: number;
  ratingValue?: number;
}

export function ProductSchema({
  name,
  description,
  image,
  price,
  currency = 'USD',
  availability = 'InStock',
  sku,
  brand = 'أعمال مازن الزبير للطاقة الشمسية',
  reviewCount,
  ratingValue,
}: ProductSchemaProps) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    sku,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      seller: {
        '@type': 'Organization',
        name: 'أعمال مازن الزبير للطاقة الشمسية',
      },
    },
  };

  if (reviewCount && ratingValue) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      reviewCount,
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  wordCount?: number;
}

export function ArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author = 'أعمال مازن الزبير للطاقة الشمسية',
  wordCount,
}: ArticleSchemaProps) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description,
    image,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'أعمال مازن الزبير للطاقة الشمسية',
      logo: {
        '@type': 'ImageObject',
        url: DEFAULT_IMAGE,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': BASE_URL,
    },
  };

  if (wordCount) {
    schema.wordCount = wordCount;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface ServiceSchemaProps {
  name: string;
  description: string;
  image?: string;
  provider?: string;
  areaServed?: string;
  serviceType?: string;
}

export function ServiceSchema({
  name,
  description,
  image,
  provider = 'أعمال مازن الزبير للطاقة الشمسية',
  areaServed = 'السودان',
  serviceType,
}: ServiceSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    image,
    serviceType,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    areaServed: {
      '@type': 'Country',
      name: areaServed,
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// HowTo Schema for guides and tutorials
interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  estimatedCost?: {
    value: number;
    currency: string;
  };
}

export function HowToSchema({
  name,
  description,
  steps,
  totalTime,
  estimatedCost,
}: HowToSchemaProps) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };

  if (totalTime) {
    schema.totalTime = totalTime;
  }

  if (estimatedCost) {
    schema.estimatedCost = {
      '@type': 'MonetaryAmount',
      value: estimatedCost.value,
      currency: estimatedCost.currency,
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
