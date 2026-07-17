import React, { useState } from "react";
import { CartItem, Customer, Measurements } from "../types";
import { X, ShieldCheck, CreditCard, Lock, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import * as dbService from "../lib/dbService";

interface CheckoutModalProps {
  cartItems: CartItem[];
  total: number;
  onClose: () => void;
  onOrderSuccess: (orderData: any) => void;
}

type Step = "details" | "payment" | "processing" | "success";

export default function CheckoutModal({
  cartItems,
  total,
  onClose,
  onOrderSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [loadingMsg, setLoadingMsg] = useState<string>("");
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Customer Details Form
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [notes, setNotes] = useState<string>("");
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({});

  // Payment Form
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");
  const [cardholder, setCardholder] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");

  // Card Brand Detection
  const getCardBrand = () => {
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (cleanNum.startsWith("4")) return "Visa";
    if (cleanNum.startsWith("5")) return "Mastercard";
    return "";
  };

  // Formatting Card Number: 0000 0000 0000 0000
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    
    // add spaces
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setCardNumber(parts.join(" "));
    setPaymentError("");
  };

  // Formatting Expiry: MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
    setPaymentError("");
  };

  // Formatting CVV: 3 digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setCardCvv(value);
    }
    setPaymentError("");
  };

  const validateDetails = (): boolean => {
    const errs: Record<string, string> = {};
    if (!customer.name.trim()) errs.name = "Вкажіть прізвище та ім'я";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer.email.trim() || !emailRegex.test(customer.email)) {
      errs.email = "Вкажіть коректний Email";
    }

    if (!customer.phone.trim() || customer.phone.length < 10) {
      errs.phone = "Вкажіть номер телефону (мінімум 10 цифр)";
    }

    if (!customer.address.trim()) {
      errs.address = "Вкажіть спосіб та адресу доставки (напр. відділення Нової Пошти)";
    }

    setDetailsErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDetails()) {
      setStep("payment");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = cardNumber.replace(/\s+/g, "");
    if (cleanNum.length !== 16) {
      setPaymentError("Номер картки повинен містити 16 цифр.");
      return;
    }
    if (cardExpiry.length !== 5) {
      setPaymentError("Вкажіть термін дії у форматі ММ/РР.");
      return;
    }
    if (cardCvv.length !== 3) {
      setPaymentError("Код CVV складається з 3 цифр.");
      return;
    }
    if (!cardholder.trim()) {
      setPaymentError("Вкажіть ім'я власника картки.");
      return;
    }

    // Step 3: Start loading simulation
    setStep("processing");
    
    const steps = [
      "З'єднання із захищеним шлюзом LiqPay...",
      "Авторизація платежу банком-емітентом...",
      "Отримання 3D-Secure підтвердження...",
      "Генерація квитанції про успішну оплату..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingMsg(steps[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      // Simulated client-side payment logic (works perfectly in static deployment!)
      const transactionId = "trn_" + Math.random().toString(36).substring(2, 10);
      const timestamp = new Date().toISOString();

      // Submit the order using client-side dbService (LocalStorage fallback or Firebase)
      const orderPayload = {
        customer,
        items: cartItems.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          measurements: item.measurements,
        })),
        total,
        paymentStatus: "Оплачено",
        paymentDetails: {
          provider: "LiqPay (Simulated)",
          transactionId,
          timestamp,
        },
        notes,
      };

      const orderResult = await dbService.createOrder(orderPayload);
      setCreatedOrder(orderResult);
      setStep("success");
    } catch (err) {
      setStep("payment");
      setPaymentError("Не вдалося зв'язатися з базою даних. Перевірте з'єднання.");
    }
  };

  const handleFinish = () => {
    if (createdOrder) {
      onOrderSuccess(createdOrder);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-editorial-dark/60 backdrop-blur-xs">
      <div className="relative bg-editorial-bg w-full max-w-xl rounded-none overflow-hidden shadow-2xl border border-editorial-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white border-b border-editorial-border px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-editorial-cream p-2 border border-editorial-border/60 rounded-none text-editorial-dark">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-serif text-editorial-text font-normal">Оформлення замовлення</h2>
              <p className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold flex items-center gap-1 font-sans">
                <Lock className="w-3 h-3" /> Безпечний платіж 256-bit SSL
              </p>
            </div>
          </div>
          {step !== "processing" && step !== "success" && (
            <button
              onClick={onClose}
              className="text-editorial-muted hover:text-editorial-text p-1.5 rounded-none border border-transparent hover:border-editorial-border transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === "details" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <h3 className="text-xs font-semibold text-editorial-text uppercase tracking-widest font-sans mb-3 block">
                1. Контактні дані та доставка
              </h3>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Прізвище та Ім'я отримувача *</label>
                <input
                  type="text"
                  required
                  value={customer.name}
                  onChange={(e) => {
                    setCustomer({ ...customer, name: e.target.value });
                    if (detailsErrors.name) setDetailsErrors({ ...detailsErrors, name: "" });
                  }}
                  placeholder="Ковальчук Марія Іванівна"
                  className={`w-full bg-white border rounded-none px-3.5 py-2.5 text-sm outline-none transition-all ${
                    detailsErrors.name ? "border-red-500 focus:ring-1 focus:ring-red-100" : "border-editorial-border focus:border-editorial-dark focus:ring-1 focus:ring-editorial-cream"
                  }`}
                />
                {detailsErrors.name && <span className="text-[10px] text-red-500 block mt-1">{detailsErrors.name}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Номер телефону *</label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => {
                      setCustomer({ ...customer, phone: e.target.value });
                      if (detailsErrors.phone) setDetailsErrors({ ...detailsErrors, phone: "" });
                    }}
                    placeholder="+380671234567"
                    className={`w-full bg-white border rounded-none px-3.5 py-2.5 text-sm outline-none transition-all ${
                      detailsErrors.phone ? "border-red-500 focus:ring-1 focus:ring-red-100" : "border-editorial-border focus:border-editorial-dark focus:ring-1 focus:ring-editorial-cream"
                    }`}
                  />
                  {detailsErrors.phone && <span className="text-[10px] text-red-500 block mt-1">{detailsErrors.phone}</span>}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Електронна пошта *</label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => {
                      setCustomer({ ...customer, email: e.target.value });
                      if (detailsErrors.email) setDetailsErrors({ ...detailsErrors, email: "" });
                    }}
                    placeholder="maria.koval@gmail.com"
                    className={`w-full bg-white border rounded-none px-3.5 py-2.5 text-sm outline-none transition-all ${
                      detailsErrors.email ? "border-red-500 focus:ring-1 focus:ring-red-100" : "border-editorial-border focus:border-editorial-dark focus:ring-1 focus:ring-editorial-cream"
                    }`}
                  />
                  {detailsErrors.email && <span className="text-[10px] text-red-500 block mt-1">{detailsErrors.email}</span>}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Адреса доставки (Нова Пошта / Укрпошта) *</label>
                <textarea
                  required
                  value={customer.address}
                  onChange={(e) => {
                    setCustomer({ ...customer, address: e.target.value });
                    if (detailsErrors.address) setDetailsErrors({ ...detailsErrors, address: "" });
                  }}
                  rows={2}
                  placeholder="м. Київ, відділення Нової Пошти №45 або ваша домашня адреса..."
                  className={`w-full bg-white border rounded-none px-3.5 py-2.5 text-sm outline-none transition-all ${
                    detailsErrors.address ? "border-red-500 focus:ring-1 focus:ring-red-100" : "border-editorial-border focus:border-editorial-dark focus:ring-1 focus:ring-editorial-cream"
                  }`}
                />
                {detailsErrors.address && <span className="text-[10px] text-red-500 block mt-1">{detailsErrors.address}</span>}
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Побажання для кравчині (необов'язково)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Наприклад: 'Зробити рукави трохи коротшими', чи 'упакувати як подарунок'..."
                  className="w-full bg-white border border-editorial-border focus:border-editorial-dark rounded-none px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-editorial-cream font-sans"
                />
              </div>

              <div className="border-t border-editorial-border/40 pt-5 flex items-center justify-between mt-6">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-editorial-muted block">Сума до сплати</span>
                  <span className="text-xl font-bold text-editorial-text font-sans">{total.toLocaleString("uk-UA")} ₴</span>
                </div>
                <button
                  type="submit"
                  className="bg-editorial-dark hover:bg-editorial-dark/95 text-white text-xs uppercase tracking-[0.15em] font-semibold px-6 py-3.5 rounded-none flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Перейти до оплати
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {step === "payment" && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-editorial-text uppercase tracking-widest font-sans">
                  2. Онлайн-оплата карткою
                </h3>
                <span className="text-[10px] text-editorial-muted font-sans uppercase">Крок 2 з 2</span>
              </div>

              {/* Secure badge */}
              <div className="bg-editorial-cream border border-editorial-border/80 text-editorial-text px-4 py-3 rounded-none text-xs flex gap-2.5 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-editorial-dark shrink-0 mt-0.5" />
                <div>
                  <strong className="font-serif font-normal text-sm block mb-0.5">Тестовий платіж (LiqPay Sandbox)</strong>
                  <p className="text-[11px] text-editorial-dark-muted font-sans font-light">Введіть будь-які тестові реквізити картки (16 цифр, термін дії, CVV), щоб симулювати транзакцію.</p>
                </div>
              </div>

              {/* Simulated Card GUI mockup */}
              <div className="bg-[#2A2420] text-editorial-cream p-5 rounded-none shadow-xl space-y-6 border border-[#3E352F] relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-44 h-44 rounded-full bg-white/5 blur-3xl" />
                
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#8C867E] font-semibold">Симулятор Оплати</span>
                  <CreditCard className="w-6 h-6 text-editorial-cream" />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-[#8C867E] block font-medium">Номер Картки</span>
                  <p className="font-mono text-lg tracking-widest text-white">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#8C867E] block font-medium">Власник</span>
                    <p className="font-mono text-sm uppercase tracking-wider max-w-[200px] truncate text-white">
                      {cardholder || "CARDHOLDER NAME"}
                    </p>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="text-[9px] uppercase tracking-wider text-[#8C867E] block font-medium">Дійсна до</span>
                    <p className="font-mono text-sm text-white">
                      {cardExpiry || "ММ/РР"}
                    </p>
                  </div>
                </div>

                <div className="absolute top-4 right-5 text-xs text-editorial-cream font-bold tracking-widest font-serif">
                  {getCardBrand()}
                </div>
              </div>

              {paymentError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3.5 py-2.5 rounded-none">
                  {paymentError}
                </div>
              )}

              {/* Form inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Номер картки *</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4111 2222 3333 4444"
                    className="w-full bg-white border border-editorial-border focus:border-editorial-dark rounded-none px-3.5 py-2.5 text-sm outline-none transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Термін дії *</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full bg-white border border-editorial-border focus:border-editorial-dark rounded-none px-3.5 py-2.5 text-sm outline-none transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Cvv2 код *</label>
                    <input
                      type="password"
                      required
                      value={cardCvv}
                      onChange={handleCvvChange}
                      placeholder="•••"
                      maxLength={3}
                      className="w-full bg-white border border-editorial-border focus:border-editorial-dark rounded-none px-3.5 py-2.5 text-sm outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Власник картки (англійською) *</label>
                  <input
                    type="text"
                    required
                    value={cardholder}
                    onChange={(e) => setCardholder(e.target.value)}
                    placeholder="IVAN KOVALCHUK"
                    className="w-full bg-white border border-editorial-border focus:border-editorial-dark rounded-none px-3.5 py-2.5 text-sm outline-none transition-all uppercase font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-editorial-border/40 pt-5 flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="bg-stone-200 hover:bg-stone-300 text-editorial-text font-bold px-4 py-3.5 rounded-none text-xs uppercase tracking-wider cursor-pointer font-sans"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  className="bg-editorial-dark hover:bg-editorial-dark/95 text-white text-xs uppercase tracking-[0.15em] font-bold py-3.5 px-6 rounded-none flex-1 flex items-center justify-center gap-2 transition-colors cursor-pointer font-sans"
                >
                  <Lock className="w-3.5 h-3.5 text-editorial-cream" />
                  Сплатити {(total).toLocaleString("uk-UA")} ₴
                </button>
              </div>
            </form>
          )}

          {step === "processing" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
              <Loader2 className="w-10 h-10 text-editorial-dark animate-spin" />
              <h3 className="text-lg font-serif text-editorial-text font-normal">Проведення транзакції...</h3>
              <p className="text-xs text-editorial-dark-muted max-w-xs font-sans font-light">{loadingMsg}</p>
            </div>
          )}

          {step === "success" && createdOrder && (
            <div className="py-2 flex flex-col items-center justify-center text-center space-y-5 animate-fade-in">
              <div className="bg-editorial-cream text-editorial-dark p-4 border border-editorial-border rounded-none">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <div>
                <h3 className="text-2xl font-serif text-editorial-text font-normal">Дякуємо за замовлення!</h3>
                <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mt-2.5">Оплата проведена успішно • {createdOrder.orderNumber}</p>
              </div>

              <div className="bg-white border border-editorial-border p-5 rounded-none w-full text-left text-xs space-y-3.5">
                <div className="flex justify-between border-b border-editorial-border/30 pb-2">
                  <span className="text-editorial-muted font-sans font-light">Отримувач:</span>
                  <span className="font-semibold text-editorial-text font-sans">{createdOrder.customer.name}</span>
                </div>
                <div className="flex justify-between border-b border-editorial-border/30 pb-2">
                  <span className="text-editorial-muted font-sans font-light">Телефон:</span>
                  <span className="font-semibold text-editorial-text font-sans">{createdOrder.customer.phone}</span>
                </div>
                <div className="flex justify-between border-b border-editorial-border/30 pb-2">
                  <span className="text-editorial-muted font-sans font-light">Доставка:</span>
                  <span className="font-semibold text-editorial-text font-sans">{createdOrder.customer.address}</span>
                </div>
                <div className="flex justify-between border-b border-editorial-border/30 pb-2">
                  <span className="text-editorial-muted font-sans font-light">Транзакція:</span>
                  <span className="font-mono font-medium text-editorial-dark-muted">{createdOrder.paymentDetails?.transactionId}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-semibold text-editorial-text uppercase tracking-wider text-[11px] font-sans">Всього Сплачено:</span>
                  <span className="font-bold text-editorial-dark text-sm font-sans">{createdOrder.total?.toLocaleString("uk-UA")} ₴</span>
                </div>
              </div>

              <div className="bg-editorial-cream/40 border border-editorial-border p-4 rounded-none text-xs text-editorial-text text-left leading-relaxed w-full">
                <strong>🧵 Наступні кроки майстерні:</strong>
                <p className="mt-1 text-editorial-dark-muted font-sans font-light">Наш майстер-швець вже отримав ваші параметри та розпочинає підготовку тканини. Ми зв'яжемося з вами найближчим часом для уточнення деталей, якщо знадобиться. Трекінг-код замовлення: <strong>{createdOrder.orderNumber}</strong>.</p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full bg-editorial-dark hover:bg-editorial-dark/95 text-white font-bold py-4 rounded-none text-xs uppercase tracking-[0.15em] transition-colors cursor-pointer"
              >
                Повернутися до каталогу
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
