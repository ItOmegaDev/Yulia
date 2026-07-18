import React, { useState, useEffect } from "react";
import { Order, Product, SiteSettings } from "../types";
import {
  TrendingUp,
  ShoppingBag,
  Scissors,
  CheckCircle,
  Truck,
  Plus,
  Trash2,
  Edit3,
  Search,
  ChevronDown,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  Info,
  X,
  RefreshCw,
  Lock,
} from "lucide-react";
import CustomSalesChart from "./CustomSalesChart";
import * as dbService from "../lib/dbService";

interface AdminPanelProps {
  onBackToStore: () => void;
  onSettingsUpdate?: (settings: SiteSettings) => void;
}

export default function AdminPanel({ onBackToStore, onSettingsUpdate }: AdminPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "catalog" | "firebase" | "settings">("dashboard");
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("Всі");

  // Firebase integration states
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(dbService.isFirebaseConnected());
  const [fbConfig, setFbConfig] = useState<dbService.FirebaseConfig>(() => {
    const saved = dbService.getStoredFirebaseConfig();
    return saved || {
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
    };
  });
  const [saveSuccess, setSaveSuccess] = useState<string>("");
  const [seedSuccess, setSeedSuccess] = useState<string>("");

  // Site settings state
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState<SiteSettings>({
    announcement: "",
    heroTitle: "",
    heroDescription: "",
    benefit1Title: "",
    benefit1Desc: "",
    benefit2Title: "",
    benefit2Desc: "",
    benefit3Title: "",
    benefit3Desc: "",
    footerText: "",
  });
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState<string>("");
  const [settingsSaveError, setSettingsSaveError] = useState<string>("");

  // Product form states
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "одяг",
    image: "",
    materials: "",
    craftTime: "3-5 днів",
    sizes: "S, M, L, XL, Індивідуальний",
  });

  const [formError, setFormError] = useState<string>("");

  // Fetch initial data
  const fetchData = async () => {
    // Instant cache load for lightning fast rendering
    const cachedProducts = localStorage.getItem("nytka_products_cache") || localStorage.getItem("nytka_local_products");
    const cachedSettings = localStorage.getItem("nytka_site_settings_cache") || localStorage.getItem("nytka_site_settings");
    const cachedOrders = localStorage.getItem("nytka_local_orders");

    if (cachedProducts) {
      try { setProducts(JSON.parse(cachedProducts)); } catch (e) {}
    }
    if (cachedSettings) {
      try {
        const parsed = JSON.parse(cachedSettings);
        setSettings(parsed);
        setSettingsForm(parsed);
      } catch (e) {}
    }
    if (cachedOrders) {
      try { setOrders(JSON.parse(cachedOrders)); } catch (e) {}
    }

    if (cachedProducts || cachedSettings || cachedOrders) {
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      // Parallel loading for maximum speed
      const [ordersData, productsData, settingsData] = await Promise.all([
        dbService.getOrders(),
        dbService.getProducts(),
        dbService.getSettings()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setSettings(settingsData);
      setSettingsForm(settingsData);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaveSuccess("");
    setSettingsSaveError("");
    try {
      const saved = await dbService.saveSettings(settingsForm);
      setSettings(saved);
      if (onSettingsUpdate) {
        onSettingsUpdate(saved);
      }
      setSettingsSaveSuccess("✓ Налаштування сайту успішно збережено!");
      setTimeout(() => setSettingsSaveSuccess(""), 5000);
    } catch (err: any) {
      console.error("Error saving site settings:", err);
      setSettingsSaveError("⚠ Помилка при збереженні налаштувань. Спробуйте ще раз.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updated = await dbService.updateOrder(orderId, { status: newStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Toggle order payment status
  const handleUpdateOrderPayment = async (orderId: string, newPaymentStatus: string) => {
    try {
      const updated = await dbService.updateOrder(orderId, { paymentStatus: newPaymentStatus });
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      console.error("Error updating payment status:", err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей виріб з каталогу?")) return;
    try {
      const success = await dbService.deleteProduct(prodId);
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== prodId));
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Open product form for edit or add
  const openProductModal = (prod: Product | null = null) => {
    setEditingProduct(prod);
    if (prod) {
      setProductForm({
        name: prod.name,
        description: prod.description,
        price: prod.price.toString(),
        category: prod.category,
        image: prod.image,
        materials: prod.materials,
        craftTime: prod.craftTime,
        sizes: prod.sizes.join(", "),
      });
    } else {
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "одяг",
        image: "",
        materials: "",
        craftTime: "3-5 днів",
        sizes: "S, M, L, XL, Індивідуальний",
      });
    }
    setFormError("");
    setIsProductModalOpen(true);
  };

  // Submit product form
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!productForm.name || !productForm.description || !productForm.price || !productForm.image || !productForm.materials) {
      setFormError("Будь ласка, заповніть усі обов'язкові поля.");
      return;
    }

    const priceNum = parseFloat(productForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError("Вкажіть коректну ціну.");
      return;
    }

    const payload: Omit<Product, "id"> = {
      name: productForm.name,
      description: productForm.description,
      price: priceNum,
      category: productForm.category,
      image: productForm.image,
      materials: productForm.materials,
      craftTime: productForm.craftTime,
      sizes: productForm.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      featured: editingProduct ? (editingProduct.featured ?? false) : false,
      rating: editingProduct ? (editingProduct.rating ?? 5.0) : 5.0,
      reviews: editingProduct ? (editingProduct.reviews ?? 0) : 0,
    };

    try {
      if (editingProduct) {
        const updated = await dbService.updateProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
        setIsProductModalOpen(false);
      } else {
        const created = await dbService.createProduct(payload);
        setProducts((prev) => [...prev, created]);
        setIsProductModalOpen(false);
      }
    } catch (err) {
      setFormError("Помилка збереження даних на сервері.");
    }
  };

  // Calculations for dashboard
  const totalSales = orders
    .filter((o) => o.paymentStatus === "Оплачено")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter((o) => o.status === "Новий" || o.status === "В роботі").length;
  const completedOrdersCount = orders.filter((o) => o.status === "Завершено").length;

  // Chart data from orders
  const getChartData = () => {
    // Group sales by day of month (or simple timeline list)
    const days: Record<string, number> = {};
    const sortedOrders = [...orders].reverse();
    sortedOrders.forEach((o) => {
      if (o.paymentStatus === "Оплачено") {
        const dateStr = new Date(o.date).toLocaleDateString("uk-UA", {
          day: "numeric",
          month: "short",
        });
        days[dateStr] = (days[dateStr] || 0) + o.total;
      }
    });

    const chartData = Object.entries(days).map(([date, sales]) => ({
      date,
      "Продажі (₴)": sales,
    }));

    // Fallback if empty to show clean actual zeros
    if (chartData.length === 0) {
      const result = [];
      for (let i = 4; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString("uk-UA", {
          day: "numeric",
          month: "short",
        });
        result.push({
          date: dateStr,
          "Продажі (₴)": 0,
        });
      }
      return result;
    }
    return chartData;
  };

  // Filtering orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);

    const matchesStatus = statusFilter === "Всі" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col font-sans text-editorial-text selection:bg-editorial-cream selection:text-editorial-dark">
      {/* Top Header */}
      <header className="bg-editorial-dark text-editorial-cream px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#3E352F] shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="bg-editorial-cream text-editorial-dark p-2 rounded-none border border-editorial-border/60">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-white font-normal tracking-tight">Панель Адміністратора</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#8C867E] font-medium font-sans mt-0.5">Майстерня та управління крамницею</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Оновити дані з сервера"
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-none transition-colors cursor-pointer border border-editorial-border/20"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onBackToStore}
            className="bg-editorial-cream hover:bg-white text-editorial-dark text-xs uppercase tracking-widest font-bold px-5 py-3 rounded-none transition-colors cursor-pointer border border-editorial-border"
          >
            До крамниці
          </button>
        </div>
      </header>

      {/* Tabs bar */}
      <div className="bg-white border-b border-editorial-border px-8 py-3 flex gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-5 py-2.5 rounded-none text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === "dashboard"
              ? "bg-editorial-dark text-white border border-editorial-dark"
              : "text-editorial-muted hover:text-editorial-text border border-transparent hover:border-editorial-border/40"
          }`}
        >
          Дашборд
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-5 py-2.5 rounded-none text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === "orders"
              ? "bg-editorial-dark text-white border border-editorial-dark"
              : "text-editorial-muted hover:text-editorial-text border border-transparent hover:border-editorial-border/40"
          }`}
        >
          Замовлення клієнтів ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-5 py-2.5 rounded-none text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer shrink-0 ${
            activeTab === "catalog"
              ? "bg-editorial-dark text-white border border-editorial-dark"
              : "text-editorial-muted hover:text-editorial-text border border-transparent hover:border-editorial-border/40"
          }`}
        >
          Каталог товарів ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("firebase")}
          className={`px-5 py-2.5 rounded-none text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === "firebase"
              ? "bg-amber-700 text-white border border-amber-700"
              : "text-editorial-muted hover:text-editorial-text border border-transparent hover:border-amber-700/40"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${firebaseConnected ? "bg-emerald-500" : "bg-red-500"}`}></span>
          Хмара Firebase (Сервер)
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-5 py-2.5 rounded-none text-xs uppercase tracking-widest font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
            activeTab === "settings"
              ? "bg-editorial-dark text-white border border-editorial-dark"
              : "text-editorial-muted hover:text-editorial-text border border-transparent hover:border-editorial-border/40"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Редагування сайту
        </button>
      </div>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-editorial-dark animate-spin" />
            <p className="text-xs text-editorial-muted uppercase tracking-widest font-sans font-semibold">Завантаження бази даних...</p>
          </div>
        ) : (
          <>
            {/* 1. DASHBOARD VIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-8">
                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-editorial-border rounded-none p-6 flex items-center gap-4">
                    <div className="bg-editorial-cream text-editorial-dark p-3 border border-editorial-border/60 rounded-none shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-editorial-muted uppercase tracking-widest block font-sans">Виручка майстерні</span>
                      <span className="text-2xl font-bold text-editorial-text font-serif">{totalSales.toLocaleString("uk-UA")} ₴</span>
                    </div>
                  </div>

                  <div className="bg-white border border-editorial-border rounded-none p-6 flex items-center gap-4">
                    <div className="bg-editorial-cream text-editorial-dark p-3 border border-editorial-border/60 rounded-none shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-editorial-muted uppercase tracking-widest block font-sans">Нові та в процесі</span>
                      <span className="text-2xl font-bold text-editorial-text font-serif">{pendingOrdersCount} замовл.</span>
                    </div>
                  </div>

                  <div className="bg-white border border-editorial-border rounded-none p-6 flex items-center gap-4">
                    <div className="bg-editorial-cream text-editorial-dark p-3 border border-editorial-border/60 rounded-none shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-editorial-muted uppercase tracking-widest block font-sans">Виконано замовлень</span>
                      <span className="text-2xl font-bold text-editorial-text font-serif">{completedOrdersCount} замовл.</span>
                    </div>
                  </div>

                  <div className="bg-white border border-editorial-border rounded-none p-6 flex items-center gap-4">
                    <div className="bg-editorial-cream text-editorial-dark p-3 border border-editorial-border/60 rounded-none shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-editorial-muted uppercase tracking-widest block font-sans">Активні моделі</span>
                      <span className="text-2xl font-bold text-editorial-text font-serif">{products.length} виробів</span>
                    </div>
                  </div>
                </div>

                {/* Sales Chart block */}
                <div className="bg-white border border-editorial-border rounded-none p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-editorial-text text-base font-normal">Динаміка продажів</h3>
                      <p className="text-xs text-editorial-muted font-sans font-light">Аналітика успішно завершених онлайн-оплат</p>
                    </div>
                    <span className="text-[10px] text-editorial-text font-semibold bg-editorial-cream border border-editorial-border/40 px-3 py-1.5 rounded-none flex items-center gap-1 uppercase tracking-wider font-sans">
                      <TrendingUp className="w-3.5 h-3.5 text-editorial-dark" />
                      За поточний тиждень
                    </span>
                  </div>

                  <div className="h-72 w-full">
                    <CustomSalesChart data={getChartData()} />
                  </div>
                </div>

                {/* Tailor/Workshop Info Banner */}
                <div className="bg-editorial-cream border border-editorial-border p-6 rounded-none flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
                  <div className="space-y-1">
                    <h4 className="font-serif text-editorial-text text-base font-normal flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-editorial-dark" />
                      Секрет успішного індивідуального пошиву
                    </h4>
                    <p className="text-editorial-dark-muted text-xs max-w-2xl leading-relaxed font-sans font-light">
                      У розділі «Замовлення» ви знайдете точні антропометричні параметри клієнтів (зріст, обхват грудей, талії та стегон), які вони вказали при виборі опції індивідуального пошиву. Використовуйте ці мірки під час розкрою тканин, щоб досягти бездоганної посадки кожного виробу ручної роботи.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="bg-editorial-dark hover:bg-editorial-dark/95 text-white text-[10px] uppercase tracking-widest font-bold px-5 py-3 rounded-none transition-colors cursor-pointer shrink-0 font-sans"
                  >
                    Переглянути мірки
                  </button>
                </div>
              </div>
            )}

            {/* 2. ORDERS MANAGEMENT VIEW */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                {/* Editorial Search & Filters block */}
                <div className="bg-white border border-editorial-border rounded-none p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#8C867E] w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Пошук за ПІБ, телефоном чи номером SH-..."
                      className="w-full bg-[#F5F2EB] border border-editorial-border rounded-none pl-10 pr-4 py-3 text-xs outline-none transition-all focus:border-editorial-dark"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto shrink-0 font-sans">
                    <span className="text-[10px] font-bold text-editorial-muted uppercase tracking-wider whitespace-nowrap">Статус:</span>
                    {["Всі", "Новий", "В роботі", "Відправлено", "Завершено"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-none text-[10px] uppercase tracking-wider font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                          statusFilter === status
                            ? "bg-editorial-dark text-white border-editorial-dark"
                            : "bg-[#F5F2EB] text-editorial-text border-editorial-border hover:border-editorial-dark"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-6">
                  {filteredOrders.length === 0 ? (
                    <div className="bg-white border border-editorial-border rounded-none p-12 text-center text-editorial-muted shadow-none font-serif">
                      За вашим запитом замовлень не знайдено.
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border border-editorial-border rounded-none p-6 space-y-6 transition-colors duration-200"
                      >
                        {/* Order Header info */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-editorial-border/60 pb-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-lg font-serif text-editorial-text">Замовлення {order.orderNumber}</span>
                            <span className="text-xs text-editorial-muted font-sans font-light">
                              від {new Date(order.date).toLocaleDateString("uk-UA")} {new Date(order.date).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2.5 py-1 rounded-none uppercase tracking-widest font-sans ${
                                order.status === "Новий"
                                  ? "bg-editorial-cream text-editorial-dark border border-editorial-border"
                                  : order.status === "В роботі"
                                  ? "bg-editorial-dark text-white border border-editorial-dark"
                                  : order.status === "Відправлено"
                                  ? "bg-editorial-text text-white border border-editorial-text"
                                  : "bg-white text-editorial-muted border border-editorial-border"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Actions to update order status */}
                            {order.status === "Новий" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "В роботі")}
                                className="bg-editorial-dark hover:bg-editorial-dark/95 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-none transition-colors flex items-center gap-1.5 cursor-pointer font-sans"
                              >
                                <Scissors className="w-3 h-3" />
                                Почати пошив
                              </button>
                            )}

                            {order.status === "В роботі" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "Відправлено")}
                                className="bg-editorial-dark hover:bg-editorial-dark/95 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-none transition-colors flex items-center gap-1.5 cursor-pointer font-sans"
                              >
                                <Truck className="w-3 h-3 text-editorial-cream" />
                                Відправити поштою
                              </button>
                            )}

                            {order.status === "Відправлено" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "Завершено")}
                                className="bg-editorial-dark hover:bg-editorial-dark/95 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-none transition-colors flex items-center gap-1.5 cursor-pointer font-sans"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Завершити замовл.
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Customer & Items grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          {/* Left: Customer & Shipping Details */}
                          <div className="md:col-span-5 space-y-4 bg-editorial-cream border border-editorial-border p-5 rounded-none text-xs">
                            <h4 className="font-bold text-editorial-text uppercase tracking-wider flex items-center gap-1.5 font-sans">
                              <Users className="w-3.5 h-3.5 text-editorial-dark" />
                              Дані покупця
                            </h4>
                            <div className="space-y-2 text-editorial-dark font-sans font-light">
                              <p><strong className="font-bold">ПІБ:</strong> {order.customer.name}</p>
                              <p><strong className="font-bold">Телефон:</strong> {order.customer.phone}</p>
                              <p><strong className="font-bold">Email:</strong> {order.customer.email}</p>
                              <p><strong className="font-bold">Доставка:</strong> {order.customer.address}</p>
                              {order.notes && (
                                <p className="bg-white text-editorial-text p-3 rounded-none border border-editorial-border/60 mt-3 italic">
                                  <strong className="font-sans font-bold not-italic block mb-1 text-[10px] uppercase tracking-wider">Побажання:</strong> {order.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Ordered Products & Measurements */}
                          <div className="md:col-span-7 space-y-4">
                            <h4 className="font-bold text-editorial-text text-xs uppercase tracking-wider flex items-center gap-1.5 font-sans">
                              <ShoppingBag className="w-3.5 h-3.5 text-editorial-dark" />
                              Замовлені вироби ({order.items.length})
                            </h4>

                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="bg-white border border-editorial-border rounded-none p-4 text-xs space-y-3">
                                  <div className="flex justify-between items-center font-serif text-sm">
                                    <span className="text-editorial-text">{item.name} (x{item.quantity})</span>
                                    <span className="text-editorial-dark font-bold">{item.price.toLocaleString("uk-UA")} ₴</span>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-2 font-sans">
                                    <span className="bg-editorial-cream text-editorial-text border border-editorial-border/40 px-2 py-0.5 rounded-none text-[10px] uppercase tracking-wider font-semibold">
                                      Розмір: {item.selectedSize}
                                    </span>
                                    {item.measurements && (
                                      <span className="bg-editorial-dark text-white px-2 py-0.5 rounded-none text-[10px] uppercase tracking-widest font-bold">
                                        Мірки: Зріст {item.measurements.height}см • Груд. {item.measurements.chest}см • Тал. {item.measurements.waist}см • Стег. {item.measurements.hips}см
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Total and Payment detail */}
                            <div className="flex items-center justify-between border-t border-editorial-border/60 pt-4 text-xs">
                              <div>
                                <span className="text-editorial-muted uppercase tracking-wider mr-2 font-sans text-[10px] font-bold">Оплата:</span>
                                <button
                                  onClick={() => handleUpdateOrderPayment(order.id, order.paymentStatus === "Оплачено" ? "Очікує оплати" : "Оплачено")}
                                  className={`font-semibold font-sans text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-none border cursor-pointer transition-colors ${
                                    order.paymentStatus === "Оплачено"
                                      ? "bg-editorial-cream text-editorial-dark border-editorial-border hover:bg-white"
                                      : "bg-red-50 text-red-800 border-red-200 hover:bg-white"
                                  }`}
                                  title="Натисніть для зміни статусу оплати"
                                >
                                  {order.paymentStatus}
                                </button>
                                {order.paymentDetails && (
                                  <span className="text-editorial-muted block mt-1.5 font-mono text-[9px] uppercase tracking-wider">
                                    Транз: {order.paymentDetails.transactionId} ({order.paymentDetails.provider})
                                  </span>
                                )}
                              </div>

                              <div className="text-right">
                                <span className="text-editorial-muted uppercase tracking-wider block font-sans text-[10px] font-bold">Всього до сплати</span>
                                <span className="font-bold text-lg text-editorial-text font-serif">{order.total.toLocaleString("uk-UA")} ₴</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. CATALOG MANAGER VIEW */}
            {activeTab === "catalog" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-editorial-text text-base font-normal">Керування каталогом виробів</h3>
                    <p className="text-xs text-editorial-muted font-sans font-light">Додавання, редагування та видалення виробів у магазині</p>
                  </div>
                  <button
                    onClick={() => openProductModal(null)}
                    className="bg-editorial-dark hover:bg-editorial-dark/95 text-white text-[10px] uppercase tracking-widest font-bold px-5 py-3 rounded-none transition-colors flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Plus className="w-4 h-4" />
                    Додати новий виріб
                  </button>
                </div>

                {/* Catalog Table / Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-editorial-border rounded-none p-4 flex gap-4 shadow-none items-center justify-between"
                    >
                      <div className="flex gap-4 items-center min-w-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-16 h-16 rounded-none object-cover shrink-0 bg-[#F5F2EB] border border-editorial-border/60"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] bg-editorial-cream text-editorial-dark px-2.5 py-0.5 border border-editorial-border/40 rounded-none uppercase font-semibold font-sans tracking-wider">
                            {product.category}
                          </span>
                          <h4 className="font-serif text-editorial-text text-sm mt-1.5 truncate pr-4">
                            {product.name}
                          </h4>
                          <span className="text-editorial-text font-serif font-bold text-xs">
                            {product.price.toLocaleString("uk-UA")} ₴
                          </span>
                          <span className="text-[10px] text-editorial-muted font-sans font-light ml-2">
                            ({product.craftTime})
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0 font-sans">
                        <button
                          onClick={() => openProductModal(product)}
                          title="Редагувати виріб"
                          className="p-2 bg-editorial-cream border border-editorial-border/40 text-editorial-text rounded-none hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Видалити з бази"
                          className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-none hover:bg-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. FIREBASE CONFIGURATION VIEW */}
            {activeTab === "firebase" && (
              <div className="bg-white border border-editorial-border p-8 space-y-6 text-xs">
                <div>
                  <h3 className="text-lg font-serif text-editorial-text mb-1">Інтеграція з хмарною базою даних Firebase</h3>
                  <p className="text-xs text-editorial-muted leading-relaxed">
                    Цей застосунок може працювати у двох режимах: автономно (локально у вашому браузері за допомогою <code className="bg-stone-100 px-1 py-0.5 font-mono text-[11px]">LocalStorage</code>) або синхронізуватися з віддаленою базою даних <code className="bg-stone-100 px-1 py-0.5 font-mono text-[11px]">Google Firebase Firestore</code>.
                  </p>
                  <p className="text-xs text-editorial-muted leading-relaxed mt-2">
                    Якщо ви хочете запустити цей проєкт на <strong>GitHub Pages</strong>, підключіть Firebase нижче, щоб усі додані товари, замовлення та зміни синхронізувалися на сервері в режимі реального часу!
                  </p>
                </div>

                <div className="p-4 border border-stone-200 bg-stone-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full ${firebaseConnected ? "bg-emerald-500 animate-pulse" : "bg-stone-300"}`}></div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block">Статус підключення:</span>
                      <span className="text-xs text-stone-600">
                        {firebaseConnected 
                          ? "✓ Успішно підключено до вашого хмарного Firestore" 
                          : "⚠ Локальний режим (LocalStorage). Firebase не налаштовано."}
                      </span>
                    </div>
                  </div>
                  {firebaseConnected && (
                    <button
                      onClick={() => {
                        localStorage.removeItem("nytka_firebase_config");
                        dbService.initializeFirebaseService();
                        setFirebaseConnected(false);
                        setSaveSuccess("Конфігурацію видалено. Повернуто локальний режим.");
                        setTimeout(() => setSaveSuccess(""), 4000);
                        fetchData();
                      }}
                      className="text-xs text-red-700 hover:underline cursor-pointer"
                    >
                      Вимкнути Firebase
                    </button>
                  )}
                </div>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-sans">
                    {saveSuccess}
                  </div>
                )}

                {seedSuccess && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-sans">
                    {seedSuccess}
                  </div>
                )}

                <div className="border-t border-stone-100 pt-6">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-editorial-muted mb-4 font-sans">Введіть ваші дані Firebase Web App Config</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">API Key</label>
                      <input
                        type="password"
                        value={fbConfig.apiKey}
                        onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                        placeholder="AIzaSy..."
                        className="w-full bg-white border border-stone-200 px-3 py-2 outline-none focus:border-editorial-dark font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Project ID</label>
                      <input
                        type="text"
                        value={fbConfig.projectId}
                        onChange={(e) => setFbConfig({ ...fbConfig, projectId: e.target.value })}
                        placeholder="my-shop-project"
                        className="w-full bg-white border border-stone-200 px-3 py-2 outline-none focus:border-editorial-dark font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Auth Domain (optional)</label>
                      <input
                        type="text"
                        value={fbConfig.authDomain}
                        onChange={(e) => setFbConfig({ ...fbConfig, authDomain: e.target.value })}
                        placeholder="my-shop-project.firebaseapp.com"
                        className="w-full bg-white border border-stone-200 px-3 py-2 outline-none focus:border-editorial-dark font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Storage Bucket (optional)</label>
                      <input
                        type="text"
                        value={fbConfig.storageBucket}
                        onChange={(e) => setFbConfig({ ...fbConfig, storageBucket: e.target.value })}
                        placeholder="my-shop-project.appspot.com"
                        className="w-full bg-white border border-stone-200 px-3 py-2 outline-none focus:border-editorial-dark font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">Messaging Sender ID (optional)</label>
                      <input
                        type="text"
                        value={fbConfig.messagingSenderId}
                        onChange={(e) => setFbConfig({ ...fbConfig, messagingSenderId: e.target.value })}
                        placeholder="123456789"
                        className="w-full bg-white border border-stone-200 px-3 py-2 outline-none focus:border-editorial-dark font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-500 mb-1">App ID</label>
                      <input
                        type="text"
                        value={fbConfig.appId}
                        onChange={(e) => setFbConfig({ ...fbConfig, appId: e.target.value })}
                        placeholder="1:123456:web:abcd"
                        className="w-full bg-white border border-stone-200 px-3 py-2 outline-none focus:border-editorial-dark font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-6">
                    <button
                      onClick={() => {
                        if (!fbConfig.apiKey || !fbConfig.projectId) {
                          alert("Будь ласка, введіть принаймні API Key та Project ID.");
                          return;
                        }
                        localStorage.setItem("nytka_firebase_config", JSON.stringify(fbConfig));
                        const isOk = dbService.initializeFirebaseService();
                        if (isOk) {
                          setFirebaseConnected(true);
                          setSaveSuccess("✓ Налаштування успішно збережено та активовано! З'єднання з Firebase встановлено.");
                          fetchData();
                        } else {
                          setSaveSuccess("⚠ Помилка ініціалізації Firebase. Перевірте вказані дані.");
                          setFirebaseConnected(false);
                        }
                        setTimeout(() => setSaveSuccess(""), 5000);
                      }}
                      className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors"
                    >
                      Зберегти та підключити
                    </button>

                    {firebaseConnected && (
                      <button
                        onClick={async () => {
                          setSeedSuccess("Надсилання початкових даних до Firestore...");
                          const ok = await dbService.seedFirebaseWithInitialData();
                          if (ok) {
                            setSeedSuccess("✓ Початкові вироби та демо-замовлення успішно завантажені у ваш Firestore!");
                            fetchData();
                          } else {
                            setSeedSuccess("⚠ Помилка завантаження даних. Перевірте консоль розробника або Firestore Security Rules.");
                          }
                          setTimeout(() => setSeedSuccess(""), 6000);
                        }}
                        className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors"
                      >
                        Завантажити початкові товари у Firebase
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-6 space-y-2">
                  <h5 className="text-xs font-bold text-editorial-text">Як отримати ці налаштування безкоштовно за 3 хвилини:</h5>
                  <ol className="list-decimal pl-5 text-xs text-editorial-muted space-y-1.5">
                    <li>Перейдіть на консоль <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline font-bold">Firebase Console</a> та створіть новий проєкт (це безкоштовно).</li>
                    <li>У вашому проєкті створіть <strong>Firestore Database</strong> у вільному (test) режимі.</li>
                    <li>На головній сторінці проєкту натисніть іконку <code className="bg-stone-100 px-1 py-0.5">&lt;/&gt;</code> (Web App), щоб зареєструвати веб-застосунок.</li>
                    <li>Скопіюйте згенерований об'єкт <code className="bg-stone-100 px-1 py-0.5">firebaseConfig</code> та вставте його поля вище!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* 5. SITE SETTINGS VIEW */}
            {activeTab === "settings" && settingsForm && (
              <div className="bg-white border border-editorial-border p-8 space-y-6 text-xs animate-fade-in">
                <div>
                  <h3 className="font-serif text-editorial-text text-lg font-normal mb-1">Редагування вмісту сайту</h3>
                  <p className="text-xs text-editorial-muted">Тут ви можете змінити абсолютно весь текст та заголовки на вашому головному сайті. Зміни зберігаються в реальному часі у підключену базу даних Firebase або локально.</p>
                </div>

                {settingsSaveSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-none">
                    {settingsSaveSuccess}
                  </div>
                )}

                {settingsSaveError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-medium rounded-none">
                    {settingsSaveError}
                  </div>
                )}

                <form onSubmit={handleSettingsSubmit} className="space-y-6">
                  {/* Hero banner text */}
                  <div className="border-b border-stone-100 pb-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 font-sans">Головний екран (Hero Section)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1">Головний заголовок</label>
                        <input
                          type="text"
                          value={settingsForm.heroTitle}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                          className="w-full bg-stone-50 border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark focus:bg-white"
                          placeholder="Одяг та Текстиль за Вашими Індивідуальними Мірками"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1">Опис під заголовком</label>
                        <textarea
                          rows={3}
                          value={settingsForm.heroDescription}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroDescription: e.target.value })}
                          className="w-full bg-stone-50 border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark focus:bg-white"
                          placeholder="Ми не віримо в стандартизовану індустрію. Кожен шов, кожен сантиметр тканини створюється швачкою вручну..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Benefit items text */}
                  <div className="border-b border-stone-100 pb-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 font-sans">Наші переваги (Блок Чому ми)</h4>
                    
                    <div className="space-y-4">
                      {/* Benefit 1 */}
                      <div className="p-4 bg-stone-50/50 border border-stone-100 space-y-3">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted">Перевага 1</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1">Заголовок</label>
                            <input
                              type="text"
                              value={settingsForm.benefit1Title}
                              onChange={(e) => setSettingsForm({ ...settingsForm, benefit1Title: e.target.value })}
                              className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2 text-xs outline-none transition-all focus:border-editorial-dark"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1">Опис переваги</label>
                            <input
                              type="text"
                              value={settingsForm.benefit1Desc}
                              onChange={(e) => setSettingsForm({ ...settingsForm, benefit1Desc: e.target.value })}
                              className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2 text-xs outline-none transition-all focus:border-editorial-dark"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Benefit 2 */}
                      <div className="p-4 bg-stone-50/50 border border-stone-100 space-y-3">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted">Перевага 2</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1">Заголовок</label>
                            <input
                              type="text"
                              value={settingsForm.benefit2Title}
                              onChange={(e) => setSettingsForm({ ...settingsForm, benefit2Title: e.target.value })}
                              className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2 text-xs outline-none transition-all focus:border-editorial-dark"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1">Опис переваги</label>
                            <input
                              type="text"
                              value={settingsForm.benefit2Desc}
                              onChange={(e) => setSettingsForm({ ...settingsForm, benefit2Desc: e.target.value })}
                              className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2 text-xs outline-none transition-all focus:border-editorial-dark"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Benefit 3 */}
                      <div className="p-4 bg-stone-50/50 border border-stone-100 space-y-3">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted">Перевага 3</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1">Заголовок</label>
                            <input
                              type="text"
                              value={settingsForm.benefit3Title}
                              onChange={(e) => setSettingsForm({ ...settingsForm, benefit3Title: e.target.value })}
                              className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2 text-xs outline-none transition-all focus:border-editorial-dark"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1">Опис переваги</label>
                            <input
                              type="text"
                              value={settingsForm.benefit3Desc}
                              onChange={(e) => setSettingsForm({ ...settingsForm, benefit3Desc: e.target.value })}
                              className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2 text-xs outline-none transition-all focus:border-editorial-dark"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer section text */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 font-sans">Низ сайту (Footer)</h4>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1">Адреса та опис у футері</label>
                      <input
                        type="text"
                        value={settingsForm.footerText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, footerText: e.target.value })}
                        className="w-full bg-stone-50 border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark focus:bg-white"
                        placeholder="Україна, м. Київ • Екологічний пошив одягу та предметів побуту за вашими власними мірками."
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-editorial-dark hover:bg-stone-800 text-white text-xs uppercase tracking-wider font-bold cursor-pointer transition-colors"
                    >
                      Зберегти зміни вмісту сайту
                    </button>
                  </div>
                </form>

                {/* Database Tools */}
                <div className="border-t border-editorial-border/40 pt-6 mt-8 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-800 font-sans">Небезпечна зона (Danger Zone)</h4>
                  <div className="p-4 bg-red-50/50 border border-red-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-xs text-red-900">Очистити всю базу даних</h5>
                      <p className="text-[11px] text-red-700/80 leading-relaxed">Видаляє всі товари та замовлення (виручка стане 0) як у локальному кеші, так і у хмарі Firestore.</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm("УВАГА! Ви дійсно хочете повністю очистити базу даних? Цю дію неможливо скасувати. Всі товари та історія замовлень (виручка) будуть видалені!")) {
                          await dbService.clearAllDatabase();
                          alert("Базу даних успішно очищено! Сторінка буде автоматично перезавантажена.");
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Очистити все
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 4. PRODUCT EDIT/ADD MODAL DIALOG */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-editorial-dark/60 backdrop-blur-xs">
          <div className="relative bg-[#F5F2EB] w-full max-w-xl rounded-none overflow-hidden shadow-none border border-editorial-border flex flex-col max-h-[90vh]">
            <div className="bg-white border-b border-editorial-border px-6 py-4 flex items-center justify-between">
              <h3 className="font-serif text-editorial-text text-base font-normal">
                {editingProduct ? "Редагування виробу" : "Додавання нового виробу"}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-editorial-muted hover:text-editorial-text p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {formError && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-none font-sans">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1.5 font-sans">Назва виробу *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="напр. Лляна сукня «Дика ружа»"
                  className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1.5 font-sans">Категорія</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark"
                  >
                    <option value="одяг">Одяг</option>
                    <option value="текстиль">Текстиль</option>
                    <option value="аксесуари">Аксесуари</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1.5 font-sans">Ціна (₴) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="2450"
                    className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark font-serif"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1.5 font-sans">Детальний опис виробу *</label>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  placeholder="Опишіть фасон, крій та унікальні особливості..."
                  className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1.5 font-sans">Матеріали та фурнітура *</label>
                <input
                  type="text"
                  required
                  value={productForm.materials}
                  onChange={(e) => setProductForm({ ...productForm, materials: e.target.value })}
                  placeholder="напр. 100% пом'якшений льон, гудзики з кокоса"
                  className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1.5 font-sans">Орієнтовний час пошиву</label>
                  <input
                    type="text"
                    value={productForm.craftTime}
                    onChange={(e) => setProductForm({ ...productForm, craftTime: e.target.value })}
                    placeholder="напр. 5-7 днів"
                    className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1.5 font-sans">Доступні розміри (через кому)</label>
                  <input
                    type="text"
                    value={productForm.sizes}
                    onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                    placeholder="S, M, L, XL, Індивідуальний"
                    className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-bold text-editorial-muted block mb-1.5 font-sans">Адреса зображення виробу (URL) *</label>
                <input
                  type="text"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  placeholder="напр. https://images.unsplash.com/..."
                  className="w-full bg-white border border-editorial-border rounded-none px-3.5 py-2.5 text-xs outline-none transition-all focus:border-editorial-dark"
                />
                <p className="text-[10px] text-editorial-muted mt-1 font-sans font-light">
                  Ви можете знайти красиве посилання на Unsplash або використати будь-яке зображення.
                </p>
              </div>

              <div className="border-t border-editorial-border/60 pt-5 flex gap-3 mt-6 font-sans">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="bg-white hover:bg-[#F5F2EB] border border-editorial-border text-editorial-text font-bold px-4 py-3 rounded-none text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="bg-editorial-dark hover:bg-editorial-dark/95 text-white text-[10px] uppercase tracking-widest font-bold py-3 px-6 rounded-none flex-1 cursor-pointer transition-colors"
                >
                  Зберегти зміни
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
