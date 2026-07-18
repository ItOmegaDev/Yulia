import React, { useState } from "react";
import { Product, Measurements, CartItem } from "../types";
import { X, Info, Scissors, Sparkles, Check, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailsModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "M");
  const [showHowToMeasure, setShowHowToMeasure] = useState<boolean>(false);
  
  // Custom measurements state
  const [measurements, setMeasurements] = useState<Measurements>({
    height: "",
    chest: "",
    waist: "",
    hips: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCustom = selectedSize === "Індивідуальний" || selectedSize === "Індивідуальний пошив";

  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // only digits
    if (value && !/^\d*$/.test(value)) return;
    setMeasurements((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = (): boolean => {
    if (!isCustom) return true;
    const newErrors: Record<string, string> = {};
    
    const h = parseInt(measurements.height);
    if (!measurements.height || h < 100 || h > 220) {
      newErrors.height = "Вкажіть зріст від 100 до 220 см";
    }
    
    const c = parseInt(measurements.chest);
    if (!measurements.chest || c < 50 || c > 180) {
      newErrors.chest = "Вкажіть обхват від 50 до 180 см";
    }

    const w = parseInt(measurements.waist);
    if (!measurements.waist || w < 40 || w > 180) {
      newErrors.waist = "Вкажіть обхват від 40 до 180 см";
    }

    const hp = parseInt(measurements.hips);
    if (!measurements.hips || hp < 50 || hp > 200) {
      newErrors.hips = "Вкажіть обхват від 50 до 200 см";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;

    const cartItem: CartItem = {
      id: "item_" + Date.now(),
      product,
      quantity: 1,
      selectedSize,
      measurements: isCustom ? measurements : null,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-editorial-dark/60 backdrop-blur-xs">
      <div className="relative bg-editorial-bg w-full max-w-3xl rounded-none overflow-hidden shadow-2xl border border-editorial-border flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]">
        {/* Left Side: Product Image */}
        <div className="md:w-5/12 bg-editorial-cream relative min-h-[250px] md:min-h-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
          <div className="absolute bottom-4 left-4 text-white md:hidden">
            <h2 className="text-xl font-serif font-normal">{product.name}</h2>
            <p className="text-editorial-cream font-bold text-lg">{product.price.toLocaleString("uk-UA")} ₴</p>
          </div>
        </div>

        {/* Right Side: Details Form */}
        <div className="md:w-7/12 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-editorial-text p-2 rounded-none border border-editorial-border shadow-xs transition-colors z-10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </motion.button>

          <div>
            <div className="hidden md:block">
              <span className="text-[9px] bg-editorial-cream text-editorial-text border border-editorial-border/60 font-semibold px-2.5 py-1 rounded-none uppercase tracking-[0.2em]">
                {product.category}
              </span>
              <h2 className="text-2xl font-serif text-editorial-text font-normal mt-3 mb-1">{product.name}</h2>
              <p className="text-xl font-bold text-editorial-dark mb-4">{product.price.toLocaleString("uk-UA")} ₴</p>
            </div>

            <p className="text-editorial-dark-muted text-xs sm:text-sm leading-relaxed mb-6 font-sans">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 text-xs text-editorial-muted bg-editorial-cream/40 p-4 border border-editorial-border/40 rounded-none mb-6">
              <div>
                <span className="font-semibold text-editorial-text uppercase tracking-wider text-[9px] block mb-0.5">Матеріали:</span> {product.materials}
              </div>
              <div>
                <span className="font-semibold text-editorial-text uppercase tracking-wider text-[9px] block mb-0.5">Час пошиву:</span> {product.craftTime}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2.5">
                <label className="text-xs font-semibold text-editorial-text uppercase tracking-[0.15em] flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-editorial-dark" />
                  Оберіть розмір
                </label>
                <button
                  type="button"
                  onClick={() => setShowHowToMeasure(!showHowToMeasure)}
                  className="text-editorial-dark hover:text-editorial-muted text-xs font-medium flex items-center gap-1 underline cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Як зняти мірки?
                </button>
              </div>

              {/* How to Measure guide dropdown */}
              {showHowToMeasure && (
                <div className="bg-white border border-editorial-border p-4 rounded-none mb-4 text-xs text-editorial-dark-muted leading-relaxed animate-fade-in">
                  <h4 className="font-serif text-editorial-text font-normal text-sm mb-2.5 flex items-center gap-1">
                    <Info className="w-4 h-4 text-editorial-dark" />
                    Інструкція для зняття мірок:
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-editorial-dark-muted font-sans font-light">
                    <li><strong>Зріст:</strong> Виміряйте вертикально від маківки до підлоги, стоячи без взуття біля стіни.</li>
                    <li><strong>Обхват грудей:</strong> Горизонтально по найбільш виступаючих точках грудей навколо тіла.</li>
                    <li><strong>Обхват талії:</strong> Горизонтально по найвужчій лінії вашої талії (зазвичай трохи вище пупка).</li>
                    <li><strong>Обхват стегон:</strong> Горизонтально по найбільш опуклих точках сідниць навколо тіла.</li>
                  </ul>
                  <p className="mt-2 text-editorial-muted text-[11px] italic">Швачка врахує необхідні припуски на вільне облягання в залежності від фасону сукні чи сорочки.</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => {
                      setSelectedSize(sz);
                      setErrors({});
                    }}
                    className={`px-4 py-2.5 rounded-none text-xs font-medium border transition-all cursor-pointer ${
                      selectedSize === sz
                        ? "bg-editorial-dark text-white border-editorial-dark shadow-none"
                        : "bg-white text-editorial-text border-editorial-border hover:border-editorial-dark"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Measurements fields if selected */}
            {isCustom && (
              <div className="bg-editorial-cream/40 border border-editorial-border rounded-none p-4 mb-6 animate-fade-in">
                <div className="flex items-center gap-1.5 mb-3 text-editorial-text">
                  <Sparkles className="w-4 h-4 text-editorial-dark" />
                  <span className="font-semibold text-xs uppercase tracking-wider">Параметри індивідуального пошиву (в см):</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Зріст</label>
                    <input
                      type="text"
                      name="height"
                      value={measurements.height}
                      onChange={handleMeasurementChange}
                      placeholder="напр. 168"
                      className={`w-full bg-white border rounded-none px-3 py-2 text-sm outline-none transition-all focus:ring-2 ${
                        errors.height ? "border-red-500 focus:ring-red-200" : "border-editorial-border focus:border-editorial-dark focus:ring-editorial-cream"
                      }`}
                    />
                    {errors.height && <span className="text-[10px] text-red-500 block mt-0.5">{errors.height}</span>}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Обхват грудей</label>
                    <input
                      type="text"
                      name="chest"
                      value={measurements.chest}
                      onChange={handleMeasurementChange}
                      placeholder="напр. 92"
                      className={`w-full bg-white border rounded-none px-3 py-2 text-sm outline-none transition-all focus:ring-2 ${
                        errors.chest ? "border-red-500 focus:ring-red-200" : "border-editorial-border focus:border-editorial-dark focus:ring-editorial-cream"
                      }`}
                    />
                    {errors.chest && <span className="text-[10px] text-red-500 block mt-0.5">{errors.chest}</span>}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Обхват талії</label>
                    <input
                      type="text"
                      name="waist"
                      value={measurements.waist}
                      onChange={handleMeasurementChange}
                      placeholder="напр. 70"
                      className={`w-full bg-white border rounded-none px-3 py-2 text-sm outline-none transition-all focus:ring-2 ${
                        errors.waist ? "border-red-500 focus:ring-red-200" : "border-editorial-border focus:border-editorial-dark focus:ring-editorial-cream"
                      }`}
                    />
                    {errors.waist && <span className="text-[10px] text-red-500 block mt-0.5">{errors.waist}</span>}
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-semibold text-editorial-muted block mb-1">Обхват стегон</label>
                    <input
                      type="text"
                      name="hips"
                      value={measurements.hips}
                      onChange={handleMeasurementChange}
                      placeholder="напр. 98"
                      className={`w-full bg-white border rounded-none px-3 py-2 text-sm outline-none transition-all focus:ring-2 ${
                        errors.hips ? "border-red-500 focus:ring-red-200" : "border-editorial-border focus:border-editorial-dark focus:ring-editorial-cream"
                      }`}
                    />
                    {errors.hips && <span className="text-[10px] text-red-500 block mt-0.5">{errors.hips}</span>}
                  </div>
                </div>
                <p className="text-[10px] text-editorial-muted mt-3 font-sans leading-relaxed">
                  * Наші швеї розкроять виріб відповідно до ваших індивідуальних пропорцій. Корегування безкоштовне.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-editorial-border/40 pt-5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="w-full py-4 px-6 rounded-none font-bold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer bg-editorial-dark text-white hover:bg-[#2c2925]"
            >
              <Scissors className="w-4 h-4 text-editorial-cream" />
              Додати виріб у кошик • {product.price.toLocaleString("uk-UA")} ₴
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
