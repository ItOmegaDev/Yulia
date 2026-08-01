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
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("всі");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [settings, setSettings] = useState<SiteSettings | null>(null);

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
  const [legalModal, setLegalModal] = useState<"offer" | "guarantee" | "privacy" | null>(null);

  // Fetch products and settings directly from Firebase
  const loadProducts = async () => {
    setLoading(true);
    try {
      const [data, siteSettings] = await Promise.all([
        dbService.getProducts(),
        dbService.getSettings()
      ]);
      setProducts(data);
      setSettings(siteSettings);
    } catch (err) {
      console.error("Error fetching data from Firebase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "admin") {
      document.title = "Кабінет майстра Юлії | Майстерня «Шовк»";
    } else {
      document.title = "Шовк — Майстерня індивідуального пошиву одягу та текстилю";
    }
  }, [view]);

  useEffect(() => {
    loadProducts();
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

    return () => {
      window.removeEventListener("hashchange", handleUrlChange);
      window.removeEventListener("popstate", handleUrlChange);
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

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
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
        <div className="min-h-screen bg-[#F5F2EB] flex items-center justify-center p-6 text-editorial-text font-sans selection:bg-editorial-cream selection:text-editorial-dark">
          <div className="w-full max-w-md bg-white border border-editorial-border p-8 shadow-xs space-y-6 rounded-none">
            <div className="text-center space-y-2.5">
              <div className="bg-editorial-dark text-[#F5F2EB] p-3 border border-[#3E352F] inline-block mx-auto rounded-none">
                <Scissors className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif font-normal text-editorial-text tracking-tight">Вхід в панель керування</h2>
              <p className="text-[11px] text-editorial-muted leading-relaxed font-sans uppercase tracking-widest font-medium">
                Майстерня • Вхід для кравців та адміністратора
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-editorial-muted mb-1.5 tracking-wider">Пароль доступу</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Введіть ваш пароль"
                  className="w-full bg-[#F5F2EB] border border-editorial-border focus:border-editorial-dark rounded-none px-4 py-3 outline-none text-sm transition-all focus:ring-1 focus:ring-editorial-cream font-sans"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-700 text-[11px] mt-1.5 font-sans font-semibold">
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-editorial-dark hover:bg-editorial-dark/95 text-white text-xs uppercase tracking-widest font-bold py-4 rounded-none cursor-pointer transition-colors border border-[#3E352F]"
              >
                Увійти до панелі
              </button>
            </form>

            <div className="border-t border-editorial-border/60 pt-4 text-center">
              <button
                onClick={() => toggleView("shop")}
                className="text-editorial-muted hover:text-editorial-text text-xs uppercase tracking-wider font-semibold font-sans cursor-pointer transition-colors"
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
    <div className="min-h-screen bg-editorial-bg text-editorial-text font-sans flex flex-col selection:bg-editorial-cream selection:text-editorial-dark">
      
      {/* 2. NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-editorial-border px-6 py-4 flex items-center justify-between shadow-xs">
        {/* Brand logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleView("shop")}>
          <div className="bg-editorial-dark text-[#F5F2EB] p-2 border border-[#3E352F] rounded-none shadow-xs">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-normal tracking-tight text-editorial-text leading-none">
              Шовк
            </h1>
            <p className="text-[10px] text-editorial-muted font-sans uppercase tracking-[0.2em] font-medium mt-1">
              Швейна Майстерня
            </p>
          </div>
        </div>

        {/* Search bar inside header (desktop) */}
        <div className="hidden md:relative md:block w-96">
          <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-editorial-muted w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Пошук виробів чи тканин (напр. льон, сорочка)..."
            className="w-full bg-[#F5F2EB] border border-editorial-border focus:border-editorial-dark rounded-none pl-10 pr-4 py-2 text-xs outline-none transition-all font-sans"
          />
        </div>

        {/* Navigation actions */}
        <div className="flex items-center gap-3.5">
          {/* Cart Icon with count badge */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsCartOpen(true)}
            className="relative bg-editorial-dark hover:bg-stone-800 text-white p-2.5 px-4 rounded-none flex items-center gap-2 transition-all shadow-xs cursor-pointer text-xs font-semibold uppercase tracking-wider font-sans border border-[#3E352F]"
          >
            <ShoppingBag className="w-4 h-4 text-editorial-cream" />
            <span className="hidden sm:inline">Кошик</span>
            {cartCount > 0 && (
              <span className="bg-editorial-cream text-editorial-dark text-[10px] font-bold px-2 py-0.5 rounded-none border border-editorial-border">
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
      <section className="bg-editorial-dark text-[#F5F2EB] py-16 px-6 relative overflow-hidden flex flex-col items-center justify-center text-center border-b border-[#3E352F]">
        <div className="max-w-3xl relative space-y-6">
          <span className="bg-[#3E352F] text-editorial-cream text-[9px] font-semibold px-3.5 py-1.5 rounded-none uppercase tracking-[0.2em] inline-flex items-center gap-2 border border-stone-700">
            <Award className="w-3.5 h-3.5 text-editorial-cream" />
            100% Ручна Робота & Екологічні матеріали
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight leading-tight text-white">
            {settings?.heroTitle || "Одяг та Текстиль за Вашими Індивідуальними Мірками"}
          </h2>
          
          <p className="text-editorial-muted text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-sans font-light">
            {settings?.heroDescription || "Ми не віримо в стандартизовану індустрію. Кожен шов, кожен сантиметр тканини створюється швачкою вручну, адаптуючи крій під особливості вашої фігури."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-[#D4CFC7] text-xs font-sans">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-editorial-cream" /> Натуральний льон та бавовна
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-editorial-cream" /> Точна посадка на будь-який зріст
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-editorial-cream" /> Швидка доставка по Україні
            </span>
          </div>
        </div>
      </section>

      {/* 5. CATEGORY TABS & SEARCH */}
      <section className="bg-white border-b border-editorial-border py-4 px-6 sticky top-[69px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Tabs */}
          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto shrink-0 pb-1 lg:pb-0 scrollbar-none font-sans">
            {[
              { id: "всі", label: "Всі вироби" },
              { id: "одяг", label: "Одяг ручної роботи" },
              { id: "текстиль", label: "Домашній текстиль" },
              { id: "аксесуари", label: "Аксесуари та декор" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-4 py-2.5 text-xs font-semibold tracking-wider transition-all cursor-pointer whitespace-nowrap uppercase rounded-none ${
                  categoryFilter === tab.id
                    ? "bg-editorial-dark text-white shadow-none"
                    : "bg-white text-editorial-text border border-editorial-border hover:border-editorial-dark"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right column: Sorting & Mobile Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto font-sans">
            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted whitespace-nowrap">Сортування:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-editorial-border focus:border-editorial-dark rounded-none px-3.5 py-2 text-xs outline-none transition-all font-semibold text-editorial-text cursor-pointer w-full sm:w-52"
              >
                <option value="default">За замовчуванням</option>
                <option value="popularity">★ За популярністю</option>
                <option value="price-asc">₴ Ціна: від низької до високої</option>
                <option value="price-desc">₴ Ціна: від високої до низької</option>
              </select>
            </div>

            {/* Search bar (mobile-friendly) */}
            <div className="relative w-full md:hidden">
              <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-editorial-muted w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук виробу чи матеріалу..."
                className="w-full bg-[#F5F2EB] border border-editorial-border focus:border-editorial-dark rounded-none pl-9 pr-4 py-2 text-xs outline-none transition-all"
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
      <section className="bg-editorial-dark text-editorial-cream py-16 px-6 border-t border-[#3E352F]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-3">
            <div className="bg-[#3E352F] w-10 h-10 border border-stone-700 flex items-center justify-center text-editorial-cream">
              <Scissors className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-normal text-lg">{settings?.benefit1Title || "Індивідуальне коригування лекал"}</h4>
            <p className="text-editorial-muted text-xs leading-relaxed font-sans font-light">
              {settings?.benefit1Desc || "Не хвилюйтеся про стандартні розмірні сітки. Наші кравці безкоштовно перерахують лекала виробу під ваш зріст та пропорції для ідеальної посадки."}
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-[#3E352F] w-10 h-10 border border-stone-700 flex items-center justify-center text-editorial-cream">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-normal text-lg">{settings?.benefit2Title || "Екологічність та якість льону"}</h4>
            <p className="text-editorial-muted text-xs leading-relaxed font-sans font-light">
              {settings?.benefit2Desc || "Ми використовуємо лише преміальний сертифікований льон та органічну бавовну. Тканини проходять процедуру пом'якшення, не сідають при пранні."}
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-[#3E352F] w-10 h-10 border border-stone-700 flex items-center justify-center text-editorial-cream">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h4 className="font-serif font-normal text-lg">{settings?.benefit3Title || "Супровід кравчині"}</h4>
            <p className="text-editorial-muted text-xs leading-relaxed font-sans font-light">
              {settings?.benefit3Desc || "Після оформлення замовлення наш майстер-швець особисто контролює етапи підготовки та зв'яжеться з вами за потреби для підтвердження обхватів."}
            </p>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-[#1C1815] text-editorial-muted text-xs py-10 px-6 border-t border-[#3E352F] text-center space-y-4 font-sans">
        <div className="flex justify-center items-center gap-2 text-editorial-cream">
          <Scissors className="w-4 h-4 text-editorial-cream" />
          <span className="font-serif font-normal text-sm uppercase tracking-wider">Шовк • Майстерня ручної роботи</span>
        </div>
        <p className="max-w-md mx-auto text-editorial-muted font-light text-xs leading-relaxed">
          {settings?.footerText || "Україна, м. Київ • Екологічний пошив одягу та предметів побуту за вашими власними мірками."}
        </p>

        {/* Legal & Trust Links */}
        <div className="flex flex-wrap justify-center items-center gap-3 text-editorial-muted text-[11px] pt-1">
          <button onClick={() => setLegalModal("offer")} className="hover:text-editorial-cream transition-colors underline cursor-pointer">
            Публічна оферта
          </button>
          <span>•</span>
          <button onClick={() => setLegalModal("guarantee")} className="hover:text-editorial-cream transition-colors underline cursor-pointer">
            Гарантія та повернення
          </button>
          <span>•</span>
          <button onClick={() => setLegalModal("privacy")} className="hover:text-editorial-cream transition-colors underline cursor-pointer">
            Конфіденційність
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-editorial-muted text-[10px] pt-2 border-t border-white/5 max-w-xl mx-auto">
          <span>© {new Date().getFullYear()} Шовк. Усі права захищені.</span>
          <span className="hidden sm:inline">•</span>
          <button
            onClick={() => toggleView("admin")}
            className="text-editorial-cream hover:underline transition-colors cursor-pointer font-medium"
          >
            Кабінет майстра Юлії
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

      {/* Legal Information Modal */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-editorial-border w-full max-w-2xl max-h-[85vh] flex flex-col p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-editorial-border pb-3">
              <h3 className="font-serif text-lg text-editorial-text font-normal">
                {legalModal === "offer" && "Публічна оферта та умови продажу"}
                {legalModal === "guarantee" && "Гарантія якості, примірка та повернення"}
                {legalModal === "privacy" && "Політика конфіденційності та захисту даних"}
              </h3>
              <button
                onClick={() => setLegalModal(null)}
                className="p-1 hover:bg-stone-100 rounded-none text-editorial-muted hover:text-editorial-text cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs font-sans text-editorial-dark-muted leading-relaxed pr-2">
              {legalModal === "offer" && (
                <>
                  <p><strong>1. Загальні положення:</strong> Майстерня «Шовк» здійснює пошив текстильних виробів та одягу на замовлення покупця. Усі вироби виготовляються з натуральних екологічних матеріалів.</p>
                  <p><strong>2. Оформлення замовлення:</strong> Замовлення вважається прийнятим у роботу після підтвердження параметрів та мірок покупця майстринею Юлією.</p>
                  <p><strong>3. Розрахунки:</strong> Оплата здійснюється офіційно через банківську картку (SSL-захист), на розрахунковий рахунок IBAN ФОП або накладеним платежем у відділенні Нової Пошти.</p>
                  <p><strong>4. Доставка:</strong> Доставка по Україні здійснюється оператором «Нова Пошта». Терміни виготовлення вказуються для кожного виробу індивідуально (зазвичай 3-5 робочих днів).</p>
                </>
              )}

              {legalModal === "guarantee" && (
                <>
                  <p><strong>1. Безкоштовне коригування:</strong> Якщо виріб, пошитий за індивідуальними мірками, потребуватиме посадки — наша майстерня виконує повторне безоплатне коригування.</p>
                  <p><strong>2. Огляд при отриманні:</strong> При виборі накладеного платежу покупець має право оглянути виріб та приміряти його у відділенні перевізника до оплати.</p>
                  <p><strong>3. Повернення та обмін:</strong> Стандартні вироби підлягають обміну/поверненню протягом 14 днів відповідно до Закону України «Про захист прав споживачів» за умови збереження товарного вигляду.</p>
                </>
              )}

              {legalModal === "privacy" && (
                <>
                  <p><strong>1. Збір персональних даних:</strong> Персональні дані покупця (ім'я, телефон, адреса доставки, індивідуальні мірки) використовуються виключно для пошиву та доставки замовлення.</p>
                  <p><strong>2. Безпека:</strong> Дані покупця не передаються третім особам. Усі платіжні транзакції захищені сучасними банківськими стандартами шифрування 256-bit SSL.</p>
                  <p><strong>3. Фіскалізація:</strong> Кожне замовлення супроводжується фіскальним чеком згідно з вимогами законодавства України.</p>
                </>
              )}
            </div>

            <div className="border-t border-editorial-border pt-3 flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="bg-editorial-dark text-white px-5 py-2 text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Зрозуміло
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
