export type Language = 'en' | 'si' | 'ta';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  lang?: Language;
  intent?: string;
  confidence?: number;
}

export interface ProductItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  status: 'active' | 'coming_soon';
  features: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  priceLKRMonthly: number;
  priceLKRAnnual: number;
  priceUSDMonthly: number;
  priceUSDAnnual: number;
  highlight?: boolean;
  limits: {
    conversations: string;
    languages: string;
    sources: string;
  };
  features: string[];
  ctaText: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  city: string;
  rating: number;
  avatarColor: string;
}

export interface IndustryUseCase {
  id: string;
  title: string;
  tag: string;
  icon: string;
  summary: string;
  keyMetric: string;
  metricLabel: string;
  sampleQuestion: Record<Language, string>;
  sampleAnswer: Record<Language, string>;
}

export interface HowItWorksStep {
  step: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  metrics: string;
  icon: string;
}
