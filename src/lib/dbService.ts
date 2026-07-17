import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Firestore,
} from "firebase/firestore";
import { Product, Order } from "../types";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod_1",
    name: "Лляна сукня «Дика ружа»",
    description: "Ніжна сукня вільного крою, виготовлена зі 100% пом'якшеного льону. Має пишні рукави з витонченими зборками та практичні кишені у бокових швах. Кожен виріб шиється індивідуально за вашими мірками.",
    price: 2450,
    category: "одяг",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80",
    sizes: ["XS", "S", "M", "L", "XL", "Індивідуальний"],
    materials: "100% натуральний пом'якшений льон",
    craftTime: "5-7 днів",
    featured: true,
    rating: 4.9,
    reviews: 14,
  },
  {
    id: "prod_2",
    name: "Лляна чоловіча сорочка з вишивкою",
    description: "Сучасна інтерпретація традиційної української вишиванки. Лаконічний орнамент, виконаний якісними шовковими нитками на білому білоруському льоні. Ідеально підходить як для урочистих подій, так і на щодень.",
    price: 2800,
    category: "одяг",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL", "XXL", "Індивідуальний"],
    materials: "100% білий льон, вишивальна нитка віскоза",
    craftTime: "7-10 днів",
    featured: true,
    rating: 5.0,
    reviews: 21,
  },
  {
    id: "prod_3",
    name: "Комплект лляної постільної білизни «Оливковий гай»",
    description: "Екологічний комплект постільної білизни з органічного льону. Тканина має легкий масажний ефект, чудово регулює температуру в будь-яку пору року. Наволочки та підковдра застібаються на кокосові ґудзики.",
    price: 4800,
    category: "текстиль",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    sizes: ["Полуторний", "Двоспальний", "Євро", "Сімейний", "Індивідуальний"],
    materials: "100% органічний льон, кокосова фурнітура",
    craftTime: "4-6 днів",
    featured: false,
    rating: 4.8,
    reviews: 9,
  },
  {
    id: "prod_4",
    name: "Еко-сумка шопер з вишитим колоском",
    description: "Міцна та стильна сумка-шопер із щільної бавовняної двонитки. Прикрашена авторською ручною вишивкою у вигляді пшеничного колоска. Має внутрішню кишеню для дрібниць та посилені ручки.",
    price: 650,
    category: "аксесуари",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    sizes: ["Універсальний"],
    materials: "Щільна бавовна (двонитка), нитки муліне",
    craftTime: "2-3 дні",
    featured: true,
    rating: 4.7,
    reviews: 32,
  },
  {
    id: "prod_5",
    name: "Лляна скатертина з мереживом «Поліське літо»",
    description: "Прямокутна скатертина з натурального сірого льону, оздоблена витонченим мереживом ручної роботи по периметру. Створить неповторну атмосферу затишку у вашому домі або стане чудовим подарунком.",
    price: 1600,
    category: "текстиль",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80",
    sizes: ["140x180 см", "140x220 см", "Індивідуальний"],
    materials: "Натуральний льон, бавовняне мереживо",
    craftTime: "3-5 днів",
    featured: false,
    rating: 4.9,
    reviews: 11,
  },
  {
    id: "prod_6",
    name: "Набір бавовняних кухонних серветок",
    description: "Набір із 4 серветок з яскравим квітковим принтом та ручною підрубкою куточків конвертом. Тканина чудово поглинає вологу та стійка до частого прання.",
    price: 450,
    category: "текстиль",
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80",
    sizes: ["40x40 см (4 шт)"],
    materials: "100% щільна бавовна",
    craftTime: "1-2 дні",
    featured: false,
    rating: 4.6,
    reviews: 18,
  },
];

const INITIAL_ORDERS: Order[] = [
  {
    id: "ord_1",
    orderNumber: "SH-1024",
    date: "2026-07-15T14:32:00.000Z",
    customer: {
      name: "Марія Ковальчук",
      email: "maria.koval@gmail.com",
      phone: "+380671234567",
      address: "м. Київ, Нова Пошта №45",
    },
    items: [
      {
        id: "prod_1",
        name: "Лляна сукня «Дика ружа»",
        price: 2450,
        quantity: 1,
        selectedSize: "M",
        measurements: {
          height: "168",
          chest: "92",
          waist: "74",
          hips: "100",
        },
      },
    ],
    total: 2450,
    status: "В роботі",
    paymentStatus: "Оплачено",
    paymentDetails: {
      provider: "LiqPay (Simulated)",
      transactionId: "trn_7721839a",
      timestamp: "2026-07-15T14:35:12.000Z",
    },
    notes: "Будь ласка, зробіть довжину сукні на 5 см довшою за стандартну.",
  },
  {
    id: "ord_2",
    orderNumber: "SH-1025",
    date: "2026-07-16T09:15:00.000Z",
    customer: {
      name: "Олександр Дмитрук",
      email: "o.dmytruk@ukr.net",
      phone: "+380509876543",
      address: "м. Львів, вул. Шевченка 12, кв. 4",
    },
    items: [
      {
        id: "prod_4",
        name: "Еко-сумка шопер з вишитим колоском",
        price: 650,
        quantity: 2,
        selectedSize: "Універсальний",
        measurements: null,
      },
    ],
    total: 1300,
    status: "Новий",
    paymentStatus: "Оплачено",
    paymentDetails: {
      provider: "LiqPay (Simulated)",
      transactionId: "trn_8819203b",
      timestamp: "2026-07-16T09:17:45.000Z",
    },
    notes: "Один шопер упакуйте, будь ласка, як подарунок.",
  },
];

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
export async function getProducts(): Promise<Product[]> {
  if (firestoreDb) {
    try {
      const q = collection(firestoreDb, "products");
      const querySnapshot = await getDocs(q);
      const list: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });
      if (list.length === 0) {
        // If Firebase is connected but empty, return seed products so it's not blank
        return INITIAL_PRODUCTS;
      }
      return list;
    } catch (err) {
      console.error("Firestore getProducts error, falling back to local:", err);
    }
  }
  return getLocalProducts();
}

export async function createProduct(prodData: Omit<Product, "id">): Promise<Product> {
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
      return newProd;
    } catch (err) {
      console.error("Firestore createProduct error:", err);
    }
  }

  const local = getLocalProducts();
  local.push(newProd);
  saveLocalProducts(local);
  return newProd;
}

export async function updateProduct(id: string, prodData: Partial<Product>): Promise<Product> {
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
      
      // Get the complete product from local state or merge
      const localProds = getLocalProducts();
      const existing = localProds.find((p) => p.id === id);
      return { ...existing, ...prodData, id } as Product;
    } catch (err) {
      console.error("Firestore updateProduct error:", err);
    }
  }

  const local = getLocalProducts();
  const index = local.findIndex((p) => p.id === id);
  if (index !== -1) {
    local[index] = { ...local[index], ...prodData };
    saveLocalProducts(local);
    return local[index];
  }
  throw new Error("Product not found");
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, "products", id));
      return true;
    } catch (err) {
      console.error("Firestore deleteProduct error:", err);
    }
  }

  const local = getLocalProducts();
  const filtered = local.filter((p) => p.id !== id);
  if (filtered.length < local.length) {
    saveLocalProducts(filtered);
    return true;
  }
  return false;
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
