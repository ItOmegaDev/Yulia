import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Product, CartItem, SiteSettings } from "./types";
import ProductCard from "./components/ProductCard";
import ProductDetailsModal from "./components/ProductDetailsModal";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import AdminPanel from "./components/AdminPanel";
import {
  ShoppingBag,
  Scissors,
  Settings,
  Sparkles,
  Search,
  Heart,
  Award,
  ChevronRight,
  Menu,
  X,
  PhoneCall,
  Check,
  CheckCircle,
} from "lucide-react";
import * as dbService from "./lib/dbService";

export default function App() {
  const [view, setView] = useState<"shop" | "admin">("shop");
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = localStorage.getItem("nytka_products_cache");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    const local = localStorage.getItem("nytka_local_products");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {}
    }
    return [];
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = localStorage.getItem("nytka_products_cache") || localStorage.getItem("nytka_local_products");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) {
          return false;
        }
      } catch (e) {}
    }
    return true;
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("всі");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    const cached = localStorage.getItem("nytka_site_settings_cache") || localStorage.getItem("nytka_site_settings");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  });

  // Admin authorization state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem("nytka_admin_auth") === "true";
  });
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  // Modal & Drawer States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Fetch products and settings from dbService on load
  const loadProducts = async () => {
    // Instant cache load for lightning-fast (0ms) visual rendering
    const cachedProducts = localStorage.getItem("nytka_products_cache") || localStorage.getItem("nytka_local_products");
    const cachedSettings = localStorage.getItem("nytka_site_settings_cache") || localStorage.getItem("nytka_site_settings");
    
    if (cachedProducts) {
      try { setProducts(JSON.parse(cachedProducts)); } catch (e) {}
    }
    if (cachedSettings) {
      try {
        const parsed = JSON.parse(cachedSettings);
        setSettings({ ...dbService.DEFAULT_SETTINGS, ...parsed });
      } catch (e) {}
    }
    
    if (cachedProducts || cachedSettings) {
      setLoading(false);
    }

    try {
      // Parallelized data fetching
      const [data, siteSettings] = await Promise.all([
        dbService.getProducts(),
        dbService.getSettings()
      ]);
      setProducts(data);
      setSettings(siteSettings);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // Load cart from localStorage if present
    const savedCart = localStorage.getItem("nytka_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error("Error loading cart", err);
      }
    }
  }, []);

  // Router listener to detect /admin, #admin or ?admin=true
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      if (path.endsWith("/admin") || hash === "#admin" || search.includes("admin")) {
        setView("admin");
      } else {
        setView("shop");
      }
    };

    handleUrlChange();

    window.addEventListener("hashchange", handleUrlChange);
    window.addEventListener("popstate", handleUrlChange);
    const interval = setInterval(handleUrlChange, 1000); // Check fallback for custom navigation

    return () => {
      window.removeEventListener("hashchange", handleUrlChange);
      window.removeEventListener("popstate", handleUrlChange);
      clearInterval(interval);
    };
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "Yulia2026") {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem("nytka_admin_auth", "true");
      setPasswordError("");
    } else {
      setPasswordError("Невірний пароль. Спробуйте ще раз.");
    }
  };

  // Save cart to localStorage whenever it changes
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("nytka_cart", JSON.stringify(newCart));
  };

  // Add item to cart
  const handleAddToCart = (item: CartItem) => {
    const existingIndex = cart.findIndex(
      (c) =>
        c.product.id === item.product.id &&
        c.selectedSize === item.selectedSize &&
        JSON.stringify(c.measurements) === JSON.stringify(item.measurements)
    );

    if (existingIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      saveCart(updatedCart);
    } else {
      saveCart([...cart, item]);
    }
    
    // Open cart drawer instantly so the user has immediate feedback and visibility
    setIsCartOpen(true);
  };

  // Update quantity in cart
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id === itemId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      });
    saveCart(updatedCart);
  };

  // Remove item from cart
  const handleRemoveItem = (itemId: string) => {
    const updatedCart = cart.filter((item) => item.id !== itemId);
    saveCart(updatedCart);
  };

  // On successful checkout
  const handleOrderSuccess = (orderData: any) => {
    setSuccessOrder(orderData);
    saveCart([]); // clear cart
    setIsCartOpen(false);
    // Auto clear success banner after 10 seconds
    setTimeout(() => {
      setSuccessOrder(null);
    }, 10000);
  };

  // Calculate cart count
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Filter products by category and search
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      categoryFilter === "всі" || product.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.materials.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products based on user selection
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") {
      return a.price - b.price;
    }
    if (sortBy === "price-desc") {
      return b.price - a.price;
    }
    if (sortBy === "popularity") {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return b.reviews - a.reviews;
    }
    return 0; // default (from database)
  });

  // Switch to admin view and refresh products afterwards
  const toggleView = (targetView: "shop" | "admin") => {
    setView(targetView);
    if (targetView === "shop") {
      loadProducts();
      // Remove /admin, #admin or query param admin from URL
      if (window.location.hash === "#admin") {
        window.history.pushState(null, "", window.location.pathname + window.location.search);
      } else if (window.location.pathname.endsWith("/admin")) {
        const newPath = window.location.pathname.replace(/\/admin$/, "") || "/";
        window.history.pushState(null, "", newPath + window.location.search);
      } else if (window.location.search.includes("admin")) {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete("admin");
        const newSearch = searchParams.toString();
        const searchSuffix = newSearch ? `?${newSearch}` : "";
        window.history.pushState(null, "", window.location.pathname + searchSuffix + window.location.hash);
      }
    } else {
      // Navigate to #admin so the user has visual feedback and it's bookmarkable / shareable
      if (!window.location.hash.includes("admin") && !window.location.pathname.endsWith("/admin")) {
        window.location.hash = "admin";
      }
    }
  };

  if (view === "admin") {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
          <div className="w-full max-w-md bg-white border border-stone-200 p-8 shadow-xl space-y-6 rounded-3xl">
            <div className="text-center space-y-2">
              <div className="bg-amber-800 text-white p-3.5 rounded-full inline-block mx-auto shadow-xs">
                <Scissors className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-serif font-bold text-stone-800">Вхід в адмін-панель</h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Майстерня Шовк. Будь ласка, введіть пароль для керування каталогом та замовленнями.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1.5 tracking-wider">Пароль доступу</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Введіть пароль"
                  className="w-full bg-stone-50 border border-stone-200 focus:border-amber-700 rounded-xl px-4 py-2.5 outline-none text-sm transition-all focus:ring-2 focus:ring-amber-100 font-sans"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-600 text-[11px] mt-1.5 font-semibold">
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-stone-900 hover:bg-amber-900 text-white text-xs uppercase tracking-widest font-bold py-3.5 rounded-xl cursor-pointer transition-colors shadow-xs hover:shadow-md"
              >
                Увійти
              </button>
            </form>

            <div className="border-t border-stone-100 pt-4 text-center">
              <button
                onClick={() => toggleView("shop")}
                className="text-stone-500 hover:text-stone-800 text-xs hover:underline cursor-pointer"
              >
                ← Повернутися до магазину
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <AdminPanel 
        onBackToStore={() => toggleView("shop")} 
        onSettingsUpdate={(newSettings) => setSettings(newSettings)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-900">
      
      {/* 2. NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 px-6 py-4 flex items-center justify-between shadow-xs">
        {/* Brand logo */}
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-800 text-white p-2 rounded-xl shadow-xs">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-stone-900">
              Шовк
            </h1>
            <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-widest">
              Швейна Майстерня
            </p>
          </div>
        </div>

        {/* Search bar inside header (desktop) */}
        <div className="hidden md:relative md:block w-96">
          <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук виробів чи тканин (напр. льон, шопер)..."
            className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:ring-amber-100 rounded-xl pl-10 pr-4 py-2 text-xs outline-none transition-all focus:ring-2"
          />
        </div>

        {/* Navigation actions */}
        <div className="flex items-center gap-3.5">
          {/* Cart Icon with count badge */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="relative bg-stone-900 hover:bg-stone-800 text-white p-2.5 px-4 rounded-xl flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer text-xs font-bold"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Кошик</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                {cartCount}
              </span>
            )}
          </motion.button>
        </div>
      </header>

      {/* 3. ORDER SUCCESS FLOATING NOTIFICATION BANNER */}
      {successOrder && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 text-emerald-950 flex justify-between items-center animate-fade-in shadow-xs">
          <div className="flex items-center gap-3.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Замовлення {successOrder.orderNumber} успішно створено та оплачено!</p>
              <p className="text-emerald-700 mt-0.5">Сума платежу: {successOrder.total.toLocaleString("uk-UA")} ₴. Майстер зв'яжеться з вами за номером {successOrder.customer.phone}.</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessOrder(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-full cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. HERO SECTION */}
      <section className="bg-radial from-stone-900 via-stone-900 to-stone-950 text-white py-16 px-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
        {/* Ambient shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl translate-x-20 -translate-y-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-800/15 rounded-full blur-3xl -translate-x-20 translate-y-20 pointer-events-none" />

        <div className="max-w-2xl relative space-y-5">
          <span className="bg-amber-800/80 text-amber-200 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 border border-amber-700/50">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            100% Ручна Робота & Екологічні матеріали
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {settings?.heroTitle || "Одяг та Текстиль за Вашими Індивідуальними Мірками"}
          </h2>
          
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-light">
            {settings?.heroDescription || "Ми не віримо в стандартизовану індустрію. Кожен шов, кожен сантиметр тканини створюється швачкою вручну, адаптуючи крій під особливості вашої фігури."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-stone-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-500" /> Натуральний льон та бавовна
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-500" /> Точна посадка на будь-який зріст
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-amber-500" /> Швидка доставка по Україні
            </span>
          </div>
        </div>
      </section>

      {/* 5. CATEGORY TABS & SEARCH */}
      <section className="bg-white border-b border-stone-200 py-4 px-6 sticky top-[72px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Tabs */}
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto shrink-0 pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: "всі", label: "Всі вироби" },
              { id: "одяг", label: "Одяг ручної роботи" },
              { id: "текстиль", label: "Домашній текстиль" },
              { id: "аксесуари", label: "Аксесуари та декор" },
            ].map((tab) => (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer whitespace-nowrap uppercase ${
                  categoryFilter === tab.id
                    ? "bg-amber-900 text-white shadow-xs"
                    : "bg-stone-50 text-stone-600 border border-stone-200/60 hover:bg-stone-100"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Right column: Sorting & Mobile Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 whitespace-nowrap">Сортування:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-stone-50 border border-stone-200 focus:border-amber-500 focus:ring-amber-100 rounded-xl px-3.5 py-2 text-xs outline-none transition-all focus:ring-2 font-bold text-stone-700 cursor-pointer w-full sm:w-52"
              >
                <option value="default">За замовчуванням</option>
                <option value="popularity">★ За популярністю</option>
                <option value="price-asc">₴ Ціна: від низької до високої</option>
                <option value="price-desc">₴ Ціна: від високої до низької</option>
              </select>
            </div>

            {/* Search bar (mobile-friendly) */}
            <div className="relative w-full md:hidden">
              <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук виробу чи матеріалу..."
                className="w-full bg-stone-50 border border-stone-200 focus:border-amber-500 focus:ring-amber-100 rounded-xl pl-9 pr-4 py-2 text-xs outline-none transition-all focus:ring-2"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 6. PRODUCTS CATALOG GRID */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-400 space-y-4">
            <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Завантажуємо унікальні вироби майстерні...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  {categoryFilter === "всі" ? "Всі вироби" : `Категорія: ${categoryFilter}`}
                </h3>
                <p className="text-xs text-stone-500">Знайдено {sortedProducts.length} авторських моделей</p>
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center text-stone-400">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="font-semibold text-stone-600">Наразі немає виробів у цій категорії</p>
                <p className="text-xs text-stone-400 mt-1">Будь ласка, оберіть іншу категорію або змініть критерії пошуку.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={(prod) => setSelectedProduct(prod)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 7. WHY CHOOSE US BENEFITS */}
      <section className="bg-stone-900 text-stone-100 py-16 px-6 border-t border-stone-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <div className="bg-amber-800/50 w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-700/30">
              <Scissors className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base">{settings?.benefit1Title || "Індивідуальне коригування лекал"}</h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              {settings?.benefit1Desc || "Не хвилюйтеся про стандартні розмірні сітки. Наші кравці безкоштовно перерахують лекала виробу під ваш зріст та пропорції для ідеальної посадки."}
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-amber-800/50 w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-700/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base">{settings?.benefit2Title || "Екологічність та якість льону"}</h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              {settings?.benefit2Desc || "Ми використовуємо лише преміальний сертифікований льон та органічну бавовну. Тканини проходять процедуру пом'якшення, не сідають при пранні."}
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-amber-800/50 w-10 h-10 rounded-xl flex items-center justify-center text-amber-400 border border-amber-700/30">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-base">{settings?.benefit3Title || "Супровід кравчині"}</h4>
            <p className="text-stone-400 text-xs leading-relaxed">
              {settings?.benefit3Desc || "Після оформлення замовлення наш майстер-швець особисто контролює етапи підготовки та зв'яжеться з вами за потреби для підтвердження обхватів."}
            </p>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-stone-950 text-stone-400 text-xs py-8 px-6 border-t border-stone-900 text-center space-y-3.5">
        <div className="flex justify-center items-center gap-1.5 text-stone-200">
          <Scissors className="w-4 h-4 text-amber-500" />
          <span className="font-bold uppercase tracking-wider text-[11px]">Шовк • Майстерня ручної роботи</span>
        </div>
        <p className="max-w-md mx-auto text-stone-500">
          {settings?.footerText || "Україна, м. Київ • Екологічний пошив одягу та предметів побуту за вашими власними мірками."}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-stone-600 text-[10px]">
          <span>© {new Date().getFullYear()} Шовк. Усі права захищені. Симулятор оплати LiqPay Sandbox.</span>
          <span className="hidden sm:inline">•</span>
          <button
            onClick={() => toggleView("admin")}
            className="text-stone-500 hover:text-amber-500 transition-colors cursor-pointer underline"
          >
            Вхід для майстра
          </button>
        </div>
      </footer>

      {/* 9. MODALS & DRAWERS RENDER */}
      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        cartItems={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {isCheckoutOpen && (
        <CheckoutModal
          cartItems={cart}
          total={cartTotal}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
          settings={settings}
        />
      )}
    </div>
  );
}
