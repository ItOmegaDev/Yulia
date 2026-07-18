export interface Measurements {
  height: string; // Зріст в см
  chest: string;  // Обхват грудей в см
  waist: string;  // Обхват талії в см
  hips: string;   // Обхват стегон в см
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  sizes: string[];
  materials: string;
  craftTime: string; // Час виготовлення, напр. "3-5 днів"
  featured: boolean;
  rating: number;
  reviews: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: string;
  measurements: Measurements | null; // null if standard size, filled if "Індивідуальний" size or custom measurements specified
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string; // Нова Пошта або адреса доставки
}

export interface PaymentDetails {
  provider: string;
  transactionId: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: Customer;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    selectedSize: string;
    measurements: Measurements | null;
  }>;
  total: number;
  status: string; // "Новий" | "В роботі" | "Відправлено" | "Завершено"
  paymentStatus: string; // "Очікує оплати" | "Оплачено"
  paymentDetails?: PaymentDetails;
  notes?: string;
}

export interface SiteSettings {
  announcement: string;
  heroTitle: string;
  heroDescription: string;
  benefit1Title: string;
  benefit1Desc: string;
  benefit2Title: string;
  benefit2Desc: string;
  benefit3Title: string;
  benefit3Desc: string;
  footerText: string;
  cardPaymentEnabled: boolean;
  cardPaymentTitle: string;
  cardPaymentDesc: string;
  codEnabled: boolean;
  codTitle: string;
  codDesc: string;
  ibanEnabled: boolean;
  ibanTitle: string;
  ibanDesc: string;
  ibanDetails: string;
}

