import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Firestore,
} from "firebase/firestore";
import { Product, Order, SiteSettings } from "../types";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const INITIAL_PRODUCTS: Product[] = [];

const INITIAL_ORDERS: Order[] = [];

// Helper to check environment or stored config
export function getStoredFirebaseConfig(): FirebaseConfig | null {
  // Check localStorage first
  const saved = localStorage.getItem("nytka_firebase_config");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch {
      // Ignore
    }
  }

  // Check env variables
  const metaEnv = (import.meta as any).env || {};
  const envConfig = {
    apiKey: (metaEnv.VITE_FIREBASE_API_KEY || "") as string,
    authDomain: (metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "") as string,
    projectId: (metaEnv.VITE_FIREBASE_PROJECT_ID || "") as string,
    storageBucket: (metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "") as string,
    messagingSenderId: (metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "") as string,
    appId: (metaEnv.VITE_FIREBASE_APP_ID || "") as string,
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export function initializeFirebaseService(): boolean {
  const config = getStoredFirebaseConfig();
  if (!config) {
    firebaseApp = null;
    firestoreDb = null;
    return false;
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    firestoreDb = getFirestore(firebaseApp);
    return true;
  } catch (err) {
    console.error("Failed to initialize Firebase", err);
    firebaseApp = null;
    firestoreDb = null;
    return false;
  }
}

// Initial initialization attempt
initializeFirebaseService();

export function isFirebaseConnected(): boolean {
  return firestoreDb !== null;
}

// LOCAL STORAGE FALLBACK MANAGEMENT
function getLocalProducts(): Product[] {
  const saved = localStorage.getItem("nytka_local_products");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // reset below
    }
  }
  localStorage.setItem("nytka_local_products", JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  localStorage.setItem("nytka_local_products", JSON.stringify(products));
}

function getLocalOrders(): Order[] {
  const saved = localStorage.getItem("nytka_local_orders");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // reset below
    }
  }
  localStorage.setItem("nytka_local_orders", JSON.stringify(INITIAL_ORDERS));
  return INITIAL_ORDERS;
}

function saveLocalOrders(orders: Order[]) {
  localStorage.setItem("nytka_local_orders", JSON.stringify(orders));
}

// DB OPERATIONS
export async function clearAllDatabase(): Promise<boolean> {
  localStorage.setItem("nytka_db_initialized", "true");
  localStorage.setItem("nytka_clean_slate_v5", "true");
  
  localStorage.setItem("nytka_local_products", JSON.stringify([]));
  localStorage.setItem("nytka_products_cache", JSON.stringify([]));
  localStorage.setItem("nytka_local_orders", JSON.stringify([]));
  localStorage.setItem("nytka_cart", JSON.stringify([]));
  
  if (firestoreDb) {
    try {
      const prodSnap = await getDocs(collection(firestoreDb, "products"));
      for (const d of prodSnap.docs) {
        await deleteDoc(doc(firestoreDb, "products", d.id));
      }
      
      const ordSnap = await getDocs(collection(firestoreDb, "orders"));
      for (const d of ordSnap.docs) {
        await deleteDoc(doc(firestoreDb, "orders", d.id));
      }
    } catch (err) {
      console.error("Error clearing Firestore database:", err);
    }
  }
  return true;
}

export async function getProducts(): Promise<Product[]> {
  if (firestoreDb) {
    try {
      const q = collection(firestoreDb, "products");
      const querySnapshot = await getDocs(q);
      const list: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      localStorage.setItem("nytka_products_cache", JSON.stringify(list));
      return list;
    } catch (err) {
      console.error("Firestore getProducts error, falling back to local:", err);
    }
  }
  const local = getLocalProducts();
  localStorage.setItem("nytka_products_cache", JSON.stringify(local));
  return local;
}

export async function createProduct(prodData: Omit<Product, "id">): Promise<Product> {
  localStorage.setItem("nytka_db_initialized", "true");
  const newId = "prod_" + Date.now();
  const newProd: Product = {
    id: newId,
    ...prodData,
    rating: prodData.rating || 5.0,
    reviews: prodData.reviews || 0,
  };

  if (firestoreDb) {
    try {
      // We can use setDoc with a custom ID or addDoc. Let's use setDoc so the Firestore ID matches our custom ID
      await setDoc(doc(firestoreDb, "products", newId), {
        name: newProd.name,
        description: newProd.description,
        price: Number(newProd.price),
        category: newProd.category,
        image: newProd.image,
        sizes: newProd.sizes,
        materials: newProd.materials,
        craftTime: newProd.craftTime,
        featured: Boolean(newProd.featured),
        rating: Number(newProd.rating),
        reviews: Number(newProd.reviews),
      });
    } catch (err) {
      console.error("Firestore createProduct error:", err);
    }
  }

  // Always keep local list and cache synchronized!
  const local = getLocalProducts();
  local.push(newProd);
  saveLocalProducts(local);

  const cached = localStorage.getItem("nytka_products_cache");
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as Product[];
      parsed.push(newProd);
      localStorage.setItem("nytka_products_cache", JSON.stringify(parsed));
    } catch (e) {}
  }

  return newProd;
}

export async function updateProduct(id: string, prodData: Partial<Product>): Promise<Product> {
  localStorage.setItem("nytka_db_initialized", "true");
  let updatedProd: Product | null = null;

  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "products", id);
      // Clean undefined keys for Firestore safety
      const updatePayload: any = {};
      Object.keys(prodData).forEach((key) => {
        const val = (prodData as any)[key];
        if (val !== undefined && key !== "id") {
          updatePayload[key] = val;
        }
      });
      await updateDoc(docRef, updatePayload);
    } catch (err) {
      console.error("Firestore updateProduct error:", err);
    }
  }

  // Always keep local list and cache synchronized!
  const local = getLocalProducts();
  const index = local.findIndex((p) => p.id === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...prodData };
    saveLocalProducts(local);
    updatedProd = local[index];
  } else {
    updatedProd = { id, ...prodData } as Product;
  }

  const cached = localStorage.getItem("nytka_products_cache");
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as Product[];
      const cacheIndex = parsed.findIndex((p) => p.id === id);
      if (cacheIndex !== -1) {
        parsed[cacheIndex] = { ...parsed[cacheIndex], ...prodData };
        localStorage.setItem("nytka_products_cache", JSON.stringify(parsed));
      }
    } catch (e) {}
  }

  return updatedProd;
}

export async function deleteProduct(id: string): Promise<boolean> {
  localStorage.setItem("nytka_db_initialized", "true");
  let deletedFromFirestore = false;
  if (firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, "products", id));
      deletedFromFirestore = true;
    } catch (err) {
      console.error("Firestore deleteProduct error:", err);
    }
  }

  // Always keep local list and cache synchronized!
  const local = getLocalProducts();
  const filtered = local.filter((p) => p.id !== id);
  const deletedFromLocal = filtered.length < local.length;
  if (deletedFromLocal) {
    saveLocalProducts(filtered);
  }

  const cached = localStorage.getItem("nytka_products_cache");
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as Product[];
      const filteredCache = parsed.filter((p) => p.id !== id);
      localStorage.setItem("nytka_products_cache", JSON.stringify(filteredCache));
    } catch (e) {}
  }

  return deletedFromFirestore || deletedFromLocal;
}

export async function getOrders(): Promise<Order[]> {
  if (firestoreDb) {
    try {
      const q = collection(firestoreDb, "orders");
      const querySnapshot = await getDocs(q);
      const list: Order[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
      // Sort orders descending by date
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return list;
    } catch (err) {
      console.error("Firestore getOrders error, falling back to local:", err);
    }
  }
  return getLocalOrders();
}

export async function createOrder(orderData: any): Promise<Order> {
  const newId = "ord_" + Date.now();
  const trackingNum = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: Order = {
    id: newId,
    orderNumber: trackingNum,
    date: new Date().toISOString(),
    status: "Новий",
    paymentStatus: orderData.paymentStatus || "Очікує оплати",
    customer: orderData.customer,
    items: orderData.items,
    total: Number(orderData.total),
    paymentDetails: orderData.paymentDetails,
    notes: orderData.notes || "",
  };

  if (firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, "orders", newId), newOrder);
      return newOrder;
    } catch (err) {
      console.error("Firestore createOrder error:", err);
    }
  }

  const local = getLocalOrders();
  local.unshift(newOrder);
  saveLocalOrders(local);
  return newOrder;
}

export async function updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "orders", id);
      const updatePayload: any = {};
      Object.keys(orderData).forEach((key) => {
        const val = (orderData as any)[key];
        if (val !== undefined && key !== "id") {
          updatePayload[key] = val;
        }
      });
      await updateDoc(docRef, updatePayload);
      
      const local = getLocalOrders();
      const existing = local.find((o) => o.id === id);
      return { ...existing, ...orderData, id } as Order;
    } catch (err) {
      console.error("Firestore updateOrder error:", err);
    }
  }

  const local = getLocalOrders();
  const index = local.findIndex((o) => o.id === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...orderData };
    saveLocalOrders(local);
    return local[index];
  }
  throw new Error("Order not found");
}

// Mass-seed initial items to Firebase
export async function seedFirebaseWithInitialData(): Promise<boolean> {
  localStorage.setItem("nytka_db_initialized", "true");
  if (!firestoreDb) return false;
  try {
    // 1. Upload initial products
    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(firestoreDb, "products", prod.id), {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        category: prod.category,
        image: prod.image,
        sizes: prod.sizes,
        materials: prod.materials,
        craftTime: prod.craftTime,
        featured: prod.featured,
        rating: prod.rating,
        reviews: prod.reviews,
      });
    }

    // 2. Upload initial orders
    for (const ord of INITIAL_ORDERS) {
      await setDoc(doc(firestoreDb, "orders", ord.id), ord);
    }

    return true;
  } catch (err) {
    console.error("Failed to seed Firebase data:", err);
    return false;
  }
}

export const DEFAULT_SETTINGS: SiteSettings = {
  announcement: "Безкоштовне коригування лекал під ваші індивідуальні мірки для кожного замовлення",
  heroTitle: "Одяг та Текстиль за Вашими Індивідуальними Мірками",
  heroDescription: "Ми не віримо в стандартизовану індустрію. Кожен шов, кожен сантиметр тканини створюється швачкою вручну, адаптуючи крій під особливості вашої фігури.",
  benefit1Title: "Індивідуальне коригування лекал",
  benefit1Desc: "Не хвилюйтеся про стандартні розмірні сітки. Наші кравці безкоштовно перерахують лекала виробу під ваш зріст та пропорції для ідеальної посадки.",
  benefit2Title: "Екологічність та якість льону",
  benefit2Desc: "Ми використовуємо лише преміальний сертифікований льон та органічну бавовну. Тканини проходять процедуру пом'якшення, не сідають при пранні.",
  benefit3Title: "Супровід кравчині",
  benefit3Desc: "Після оформлення замовлення наш майстер-швець особисто контролює етапи підготовки та зв'яжеться з вами за потреби для підтвердження обхватів.",
  footerText: "Україна, м. Київ • Екологічний пошив одягу та предметів побуту за вашими власними мірками.",
  cardPaymentEnabled: false,
  cardPaymentTitle: "Онлайн-оплата карткою",
  cardPaymentDesc: "Швидкий платіж Visa/Mastercard (через LiqPay Sandbox).",
  codEnabled: true,
  codTitle: "Накладений платіж (при отриманні)",
  codDesc: "Оплата у відділенні Нової Пошти після огляду та примірки виробу.",
  ibanEnabled: true,
  ibanTitle: "Оплата за реквізитами (IBAN)",
  ibanDesc: "Наш менеджер надішле вам рахунок-фактуру ФОП у месенджер після перевірки мірок.",
  ibanDetails: "UA 89 300024 000002600123456789 ФОП Ковальчук М.І., ЄДРПОУ 12345678, призначення: Оплата за замовлення",
};

export async function getSettings(): Promise<SiteSettings> {
  if (firestoreDb) {
    try {
      const docSnap = await getDoc(doc(firestoreDb, "settings", "site"));
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        const merged = { ...DEFAULT_SETTINGS, ...data };
        localStorage.setItem("nytka_site_settings_cache", JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.error("Firestore getSettings error:", err);
    }
  }
  const saved = localStorage.getItem("nytka_site_settings") || localStorage.getItem("nytka_site_settings_cache");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      // ignore
    }
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: SiteSettings): Promise<SiteSettings> {
  if (firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, "settings", "site"), settings);
    } catch (err) {
      console.error("Firestore saveSettings error:", err);
    }
  }
  localStorage.setItem("nytka_site_settings", JSON.stringify(settings));
  localStorage.setItem("nytka_site_settings_cache", JSON.stringify(settings));
  return settings;
}
