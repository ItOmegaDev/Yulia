import React from "react";
import { CartItem } from "../types";
import { X, Trash2, Plus, Minus, Scissors, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  cartItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-editorial-dark/45 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md transform bg-editorial-bg shadow-2xl border-l border-editorial-border flex flex-col h-full animate-slide-in">
          {/* Header */}
          <div className="px-6 py-6 bg-white border-b border-editorial-border flex items-center justify-between">
            <h2 className="text-xl font-serif text-editorial-text font-normal flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-editorial-dark" />
              Кошик замовлень
              {cartItems.length > 0 && (
                <span className="bg-editorial-cream text-editorial-text border border-editorial-border/60 text-[10px] font-bold px-2 py-0.5 rounded-none">
                  {cartItems.reduce((count, item) => count + item.quantity, 0)}
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-editorial-muted hover:text-editorial-text p-1.5 rounded-none border border-transparent hover:border-editorial-border transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="bg-editorial-cream p-5 rounded-none border border-editorial-border text-editorial-dark">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-editorial-text font-normal">Ваш кошик порожній</h3>
                  <p className="text-xs text-editorial-dark-muted mt-2 max-w-[260px] mx-auto font-sans leading-relaxed">
                    Оберіть унікальний виріб ручної роботи в нашому каталозі, вкажіть свої мірки та додайте сюди!
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-editorial-dark hover:bg-editorial-dark/95 text-white text-[10px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-none transition-colors cursor-pointer"
                >
                  Перейти до каталогу
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-editorial-border rounded-none p-4 flex gap-4 transition-all relative group"
                >
                  {/* Product thumbnail */}
                  <div className="w-20 h-20 bg-editorial-cream rounded-none overflow-hidden shrink-0 border border-editorial-border/40">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-editorial-text text-sm truncate pr-4 group-hover:text-editorial-muted transition-colors">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-editorial-muted hover:text-red-600 p-1 rounded-none hover:bg-editorial-cream transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Selected Size / Measurements tag */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] bg-editorial-cream text-editorial-text border border-editorial-border/40 font-semibold px-2 py-0.5 rounded-none flex items-center gap-1 uppercase tracking-wider">
                          <Scissors className="w-3 h-3 text-editorial-dark" />
                          {item.selectedSize}
                        </span>

                        {item.measurements && (
                          <span className="text-[9px] bg-white text-editorial-dark border border-editorial-border/80 font-semibold px-2 py-0.5 rounded-none block">
                            Мірки: {item.measurements.height}/{item.measurements.chest}/{item.measurements.waist}/{item.measurements.hips} см
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-editorial-border rounded-none overflow-hidden bg-editorial-cream/50 shrink-0">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2.5 py-1 hover:bg-white text-editorial-text disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-editorial-text min-w-[20px] text-center font-sans">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2.5 py-1 hover:bg-white text-editorial-text transition-colors cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-bold text-editorial-text text-sm font-sans">
                        {(item.product.price * item.quantity).toLocaleString("uk-UA")} ₴
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Actions */}
          {cartItems.length > 0 && (
            <div className="px-6 py-5 bg-white border-t border-editorial-border space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-editorial-dark-muted font-sans">
                  <span>Проміжний підсумок</span>
                  <span>{total.toLocaleString("uk-UA")} ₴</span>
                </div>
                <div className="flex justify-between text-xs text-editorial-dark-muted font-sans">
                  <span>Екологічна упаковка</span>
                  <span className="text-emerald-700 font-medium">Безкоштовно</span>
                </div>
                <div className="flex justify-between text-xs text-editorial-dark-muted font-sans pb-2">
                  <span>Доставка по Україні</span>
                  <span className="italic">За тарифами пошти</span>
                </div>
                <div className="border-t border-editorial-border/60 pt-3 flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest font-semibold text-editorial-text font-sans">Загальна сума</span>
                  <span className="text-xl font-bold text-editorial-dark font-sans">
                    {total.toLocaleString("uk-UA")} ₴
                  </span>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full bg-editorial-dark hover:bg-editorial-dark/95 transition-all text-white text-xs uppercase tracking-[0.2em] font-bold py-4 rounded-none flex items-center justify-center gap-2 cursor-pointer"
              >
                Оформити замовлення
              </button>

              <p className="text-[10px] text-center text-editorial-muted font-sans uppercase tracking-wider">
                Кожен виріб шиється вручну з особливою турботою.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
