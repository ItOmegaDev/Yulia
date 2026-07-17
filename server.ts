import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to data file
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Seed data
const INITIAL_PRODUCTS = [
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
    reviews: 14
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
    reviews: 21
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
    reviews: 9
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
    reviews: 32
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
    reviews: 11
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
    reviews: 18
  }
];

const INITIAL_ORDERS = [
  {
    id: "ord_1",
    orderNumber: "SH-1024",
    date: "2026-07-15T14:32:00.000Z",
    customer: {
      name: "Марія Ковальчук",
      email: "maria.koval@gmail.com",
      phone: "+380671234567",
      address: "м. Київ, Нова Пошта №45"
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
          hips: "100"
        }
      }
    ],
    total: 2450,
    status: "В роботі",
    paymentStatus: "Оплачено",
    paymentDetails: {
      provider: "LiqPay (Simulated)",
      transactionId: "trn_7721839a",
      timestamp: "2026-07-15T14:35:12.000Z"
    },
    notes: "Будь ласка, зробіть довжину сукні на 5 см довшою за стандартну."
  },
  {
    id: "ord_2",
    orderNumber: "SH-1025",
    date: "2026-07-16T09:15:00.000Z",
    customer: {
      name: "Олександр Дмитрук",
      email: "o.dmytruk@ukr.net",
      phone: "+380509876543",
      address: "м. Львів, вул. Шевченка 12, кв. 4"
    },
    items: [
      {
        id: "prod_4",
        name: "Еко-сумка шопер з вишитим колоском",
        price: 650,
        quantity: 2,
        selectedSize: "Універсальний",
        measurements: null
      }
    ],
    total: 1300,
    status: "Новий",
    paymentStatus: "Оплачено",
    paymentDetails: {
      provider: "LiqPay (Simulated)",
      transactionId: "trn_8819203b",
      timestamp: "2026-07-16T09:17:45.000Z"
    },
    notes: "Один шопер упакуйте, будь ласка, як подарунок."
  }
];

// Load Database
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const data = { products: INITIAL_PRODUCTS, orders: INITIAL_ORDERS };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    return data;
  }
  try {
    const content = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading database, resetting...", err);
    const data = { products: INITIAL_PRODUCTS, orders: INITIAL_ORDERS };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    return data;
  }
}

// Save Database
function saveDB(data: { products: any[]; orders: any[] }) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// API Routes

// Get all products
app.get("/api/products", (req, res) => {
  const db = loadDB();
  res.json(db.products);
});

// Create product
app.post("/api/products", (req, res) => {
  const db = loadDB();
  const newProduct = {
    id: "prod_" + Date.now(),
    ...req.body,
    rating: req.body.rating || 5.0,
    reviews: req.body.reviews || 0
  };
  db.products.push(newProduct);
  saveDB(db);
  res.status(201).json(newProduct);
});

// Update product
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const index = db.products.findIndex((p: any) => p.id === id);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    saveDB(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const initialLength = db.products.length;
  db.products = db.products.filter((p: any) => p.id !== id);
  if (db.products.length < initialLength) {
    saveDB(db);
    res.json({ success: true, message: "Product deleted" });
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// Get all orders
app.get("/api/orders", (req, res) => {
  const db = loadDB();
  res.json(db.orders);
});

// Create order
app.post("/api/orders", (req, res) => {
  const db = loadDB();
  const trackingNum = `SH-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    id: "ord_" + Date.now(),
    orderNumber: trackingNum,
    date: new Date().toISOString(),
    status: "Новий",
    paymentStatus: req.body.paymentStatus || "Очікує оплати",
    ...req.body
  };
  db.orders.unshift(newOrder); // Add new orders to the top
  saveDB(db);
  res.status(201).json(newOrder);
});

// Update order
app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const index = db.orders.findIndex((o: any) => o.id === id);
  if (index !== -1) {
    db.orders[index] = { ...db.orders[index], ...req.body };
    saveDB(db);
    res.json(db.orders[index]);
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// Payment Simulator API
app.post("/api/payment-simulate", (req, res) => {
  const { cardNumber, expiry, cvv, amount, cardholder } = req.body;
  if (!cardNumber || !expiry || !cvv || !amount) {
    return res.status(400).json({ error: "Необхідно вказати всі платіжні реквізити." });
  }
  
  // Clean card number
  const cleanCard = cardNumber.replace(/\s+/g, "");
  if (cleanCard.length < 16) {
    return res.status(400).json({ error: "Некоректний номер картки. Потрібно 16 цифр." });
  }

  // Simulate process
  const transactionId = "trn_" + Math.random().toString(36).substring(2, 10);
  res.json({
    success: true,
    transactionId,
    message: "Оплата успішно авторизована та проведена через симулятор LiqPay.",
    timestamp: new Date().toISOString()
  });
});

// Vite middleware for development or serving production build
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
