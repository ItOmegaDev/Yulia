import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Firestore,
} from "firebase/firestore";
import { Product, Order, SiteSettings } from "../types";
import firebaseAppletConfig from "../../firebase-applet-config.json";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  firestoreDatabaseId?: string;
}

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod_polissya_dress",
    name: "Лляна сукня «Полісся»",
    description: "Міді-сукня з натурального пом'якшеного льону вільного крою. Потайні кишені у бокових швах, витончена горловина з перламутровим ґудзиком.",
    price: 2850,
    category: "Одяг",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
    sizes: ["S", "M", "L", "XL", "За мірками"],
    materials: "100% органічний пом'якшений льон (200 г/м²)",
    craftTime: "3-5 робочих днів",
    featured: true,
    rating: 5.0,
    reviews: 24,
  },
  {
    id: "prod_etno_shirt",
    name: "Сорочка лляна «Етно»",
    description: "Універсальна сорочка прямого силуету з рукавом 3/4 та кокосовими ґудзиками. Підходить як для повсякденного носіння, так і для урочистих подій.",
    price: 2200,
    category: "Одяг",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=800",
    sizes: ["S", "M", "L", "XL", "За мірками"],
    materials: "100% білоруський пом'якшений льон",
    craftTime: "2-4 робочих дні",
    featured: true,
    rating: 4.9,
    reviews: 18,
  },
  {
    id: "prod_zatyshok_bedding",
    name: "Комплект постілі «Затишок»",
    description: "Натуральна лляна постільна білизна. Тканина забезпечує оптимальний термобаланс: охолоджує влітку та зігріває взимку.",
    price: 4600,
    category: "Предмети побуту",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&q=80&w=800",
    sizes: ["Полуторний", "Євро", "За мірками"],
    materials: "100% праний льон Stonewash",
    craftTime: "4-6 робочих днів",
    featured: true,
    rating: 5.0,
    reviews: 31,
  },
  {
    id: "prod_mavka_dress",
    name: "Сукня-халат «Мавка»",
    description: "Вишукана сукня на запах з широким паском та спущеним плечем. Ідеальна посадка забезпечується завдяки коригуванню під індивідуальні обхвати.",
    price: 3100,
    category: "Одяг",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800",
    sizes: ["S", "M", "L", "XL", "За мірками"],
    materials: "100% пом'якшений льон преміум якості",
    craftTime: "3-5 робочих днів",
    featured: false,
    rating: 4.8,
    reviews: 12,
  },
  {
    id: "prod_bryz_pants",
    name: "Лляні штани «Бриз»",
    description: "Легкі широкі штани з еластичним поясом та шнурком. Зручні бокові кишені. Вільний крій не обмежує рухів.",
    price: 2100,
    category: "Одяг",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
    sizes: ["S", "M", "L", "XL", "За мірками"],
    materials: "100% бавовна та льон",
    craftTime: "2-3 робочих дні",
    featured: false,
    rating: 4.9,
    reviews: 15,
  },
  {
    id: "prod_apron_master",
    name: "Кухонний фартух «Майстер»",
    description: "Функціональний фартух з регульованою лямкою та місткою кишенею для приладдя. Захищає одяг та виглядає естетично.",
    price: 890,
    category: "Предмети побуту",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    sizes: ["Універсальний", "За мірками"],
    materials: "Цупкий льон з водовідштовхувальним просоченням",
    craftTime: "1-2 робочих дні",
    featured: false,
    rating: 5.0,
    reviews: 9,
  },
  {
    id: "prod_napkins_set",
    name: "Комплект лляних серветок (4 шт)",
    description: "Набір декоративних серветок з бахромою для святкового та щоденного сервування столу. Додають особливого затишку кожному обіду.",
    price: 650,
    category: "Предмети побуту",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
    sizes: ["40x40 см"],
    materials: "100% натуральний незабарвлений льон",
    craftTime: "1 робочий день",
    featured: false,
    rating: 4.9,
    reviews: 14,
  },
  {
    id: "prod_vintage_vest",
    name: "Лляний жилет «Вінтаж»",
    description: "Класичний жилет на ґудзиках з регульованим хлястиком позаду. Стильний акцент для багатошарових образів.",
    price: 1950,
    category: "Одяг",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
    sizes: ["S", "M", "L", "XL", "За мірками"],
    materials: "100% цупкий пом'якшений льон",
    craftTime: "3 робочих дні",
    featured: false,
    rating: 4.7,
    reviews: 8,
  }
];

export const DEFAULT_ORDERS: Order[] = [
  {
    id: "ord_1720000001",
    orderNumber: "SH-8492",
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "Шиється",
    paymentStatus: "Оплачено",
    total: 2850,
    customer: {
      name: "Олена Бондаренко",
      phone: "+380 67 123 45 67",
      email: "olena.b@gmail.com",
      address: "м. Київ, Нова Пошта Відділення №15 (вул. Хрещатик, 22)"
    },
    items: [
      {
        id: DEFAULT_PRODUCTS[0].id,
        name: DEFAULT_PRODUCTS[0].name,
        price: DEFAULT_PRODUCTS[0].price,
        quantity: 1,
        selectedSize: "За мірками",
        measurements: {
          chest: "92",
          waist: "70",
          hips: "98",
          height: "168"
        }
      }
    ],
    notes: "Будь ласка, зробіть рукав на 2 см довшим за стандартний."
  }
];

export const DEFAULT_SETTINGS: SiteSettings = {
  announcement: "Безкоштовне коригування лекал під ваші індивідуальні мірки для кожного замовлення",
  heroTitle: "Одяг та Текстиль за Вашими Індивідуальними Мірками",
  heroDescription: "Наші майстри не вірять в стандартизовану індустрію. Кожен шов, кожен сантиметр тканини створюється швачкою вручну, адаптуючи крій під особливості вашої фігури.",
  benefit1Title: "Індивідуальне коригування лекал",
  benefit1Desc: "Не хвилюйтеся про стандартні розмірні сітки. Наша майстриня Юлія безкоштовно перерахує лекала виробу під ваш зріст та пропорції для ідеальної посадки.",
  benefit2Title: "Екологічність та якість льону",
  benefit2Desc: "Ми використовуємо лише преміальний сертифікований льон та органічну бавовну. Тканини проходять процедуру пом'якшення, не сідають при пранні.",
  benefit3Title: "Персональний супровід кравчині",
  benefit3Desc: "Після оформлення замовлення наша майстриня особисто перевіряє зазначені обхвати і зв'яжеться з вами у разі будь-яких уточнень до початку пошиву.",
  footerText: "Україна, м. Київ • Екологічний пошив одягу та предметів побуту за вашими власними мірками.",
  cardPaymentEnabled: true,
  cardPaymentTitle: "Онлайн-оплата карткою Visa / Mastercard",
  cardPaymentDesc: "Швидка та 100% безпечна миттєва оплата карткою будь-якого банку через захищений 256-bit SSL платіжний шлюз.",
  codEnabled: true,
  codTitle: "Накладений платіж (при отриманні на Новій Пошті)",
  codDesc: "Оплата у відділенні після огляду та примірки виробу. Жодного ризику для покупця.",
  ibanEnabled: true,
  ibanTitle: "Офіційна оплата за IBAN реквізитами ФОП",
  ibanDesc: "Офіційна оплата на банківський розрахунковий рахунок ФОП із фіскальним чеком.",
  ibanDetails: "ФОП Юлія Майстерня «Шовк» | IBAN: UA893052990000026001234567890 | ЄДРПОУ: 3123456789 | Призначення платежу: Оплата за пошив одягу",
};

export function getStoredFirebaseConfig(): FirebaseConfig | null {
  if (firebaseAppletConfig && firebaseAppletConfig.apiKey && firebaseAppletConfig.projectId) {
    return firebaseAppletConfig as FirebaseConfig;
  }

  const metaEnv = (import.meta as any).env || {};
  const envConfig = {
    apiKey: (metaEnv.VITE_FIREBASE_API_KEY || "") as string,
    authDomain: (metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "") as string,
    projectId: (metaEnv.VITE_FIREBASE_PROJECT_ID || "") as string,
    storageBucket: (metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "") as string,
    messagingSenderId: (metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "") as string,
    appId: (metaEnv.VITE_FIREBASE_APP_ID || "") as string,
    firestoreDatabaseId: (metaEnv.VITE_FIREBASE_DATABASE_ID || "") as string,
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
    
    const dbId = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)"
      ? config.firestoreDatabaseId
      : undefined;

    firestoreDb = dbId ? getFirestore(firebaseApp, dbId) : getFirestore(firebaseApp);
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

// PRODUCT OPERATIONS (ONLINE ONLY)
export async function getProducts(): Promise<Product[]> {
  if (!firestoreDb) {
    initializeFirebaseService();
  }

  if (firestoreDb) {
    try {
      const q = collection(firestoreDb, "products");
      const querySnapshot = await getDocs(q);
      const list: Product[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });

      return list;
    } catch (err) {
      console.error("Firestore getProducts error:", err);
    }
  }

  return [];
}

export async function createProduct(prodData: Omit<Product, "id">): Promise<Product> {
  if (!firestoreDb) initializeFirebaseService();
  const newId = "prod_" + Date.now();
  const newProd: Product = {
    id: newId,
    ...prodData,
    rating: prodData.rating || 5.0,
    reviews: prodData.reviews || 0,
  };

  if (firestoreDb) {
    try {
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

  return newProd;
}

export async function updateProduct(id: string, prodData: Partial<Product>): Promise<Product> {
  if (!firestoreDb) initializeFirebaseService();

  if (firestoreDb) {
    try {
      const docRef = doc(firestoreDb, "products", id);
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

  return { id, ...prodData } as Product;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!firestoreDb) initializeFirebaseService();

  if (firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, "products", id));
      return true;
    } catch (err) {
      console.error("Firestore deleteProduct error:", err);
    }
  }

  return false;
}

// ORDER OPERATIONS (ONLINE ONLY)
export async function getOrders(): Promise<Order[]> {
  if (!firestoreDb) initializeFirebaseService();

  if (firestoreDb) {
    try {
      const q = collection(firestoreDb, "orders");
      const querySnapshot = await getDocs(q);
      const list: Order[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });

      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return list;
    } catch (err) {
      console.error("Firestore getOrders error:", err);
    }
  }

  return [];
}

export async function createOrder(orderData: any): Promise<Order> {
  if (!firestoreDb) initializeFirebaseService();

  const newId = "ord_" + Date.now();
  const trackingNum = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
  const docPayload: any = {
    id: newId,
    orderNumber: trackingNum,
    date: new Date().toISOString(),
    status: "Новий",
    paymentStatus: orderData.paymentStatus || "Очікує оплати",
    customer: orderData.customer,
    items: orderData.items,
    total: Number(orderData.total),
    notes: orderData.notes || "",
  };

  if (orderData.paymentDetails) {
    docPayload.paymentDetails = orderData.paymentDetails;
  }

  const newOrder: Order = docPayload as Order;

  if (firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, "orders", newId), docPayload);
    } catch (err) {
      console.error("Firestore createOrder error:", err);
    }
  }

  return newOrder;
}

export async function updateOrder(id: string, orderData: Partial<Order>): Promise<Order> {
  if (!firestoreDb) initializeFirebaseService();

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
      return { id, ...orderData } as Order;
    } catch (err) {
      console.error("Firestore updateOrder error:", err);
    }
  }

  return { id, ...orderData } as Order;
}

export async function deleteOrder(id: string): Promise<boolean> {
  if (!firestoreDb) initializeFirebaseService();

  if (firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, "orders", id));
      return true;
    } catch (err) {
      console.error("Firestore deleteOrder error:", err);
    }
  }

  return false;
}

// SITE SETTINGS OPERATIONS (ONLINE ONLY)
export async function getSettings(): Promise<SiteSettings> {
  if (!firestoreDb) initializeFirebaseService();

  if (firestoreDb) {
    try {
      const docSnap = await getDoc(doc(firestoreDb, "settings", "site"));
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteSettings;
        return { ...DEFAULT_SETTINGS, ...data };
      } else {
        await setDoc(doc(firestoreDb, "settings", "site"), DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      }
    } catch (err) {
      console.error("Firestore getSettings error:", err);
    }
  }

  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: SiteSettings): Promise<SiteSettings> {
  if (!firestoreDb) initializeFirebaseService();

  if (firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, "settings", "site"), settings);
    } catch (err) {
      console.error("Firestore saveSettings error:", err);
    }
  }

  return settings;
}

// SEED DATA TO FIRESTORE
export async function seedFirebaseWithInitialData(): Promise<boolean> {
  if (!firestoreDb) initializeFirebaseService();
  if (!firestoreDb) return false;
  try {
    for (const prod of DEFAULT_PRODUCTS) {
      await setDoc(doc(firestoreDb, "products", prod.id), prod);
    }
    for (const ord of DEFAULT_ORDERS) {
      await setDoc(doc(firestoreDb, "orders", ord.id), ord);
    }
    return true;
  } catch (err) {
    console.error("Failed to seed Firebase data:", err);
    return false;
  }
}

// CLEAR ALL ONLINE DATA IN FIRESTORE
export async function clearAllDatabase(): Promise<boolean> {
  if (!firestoreDb) initializeFirebaseService();

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

      // Ensure site settings doc exists so getProducts/getOrders know site is initialized and won't auto-reseed
      const settingsSnap = await getDoc(doc(firestoreDb, "settings", "site"));
      if (!settingsSnap.exists()) {
        await setDoc(doc(firestoreDb, "settings", "site"), DEFAULT_SETTINGS);
      }
    } catch (err) {
      console.error("Error clearing Firestore database:", err);
      return false;
    }
  }

  return true;
}
