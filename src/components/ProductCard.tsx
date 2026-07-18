import React from "react";
import { Product } from "../types";
import { Clock, Star, Sparkles, Scissors } from "lucide-react";
import { motion } from "motion/react";

interface ProductCardProps {
  key?: any;
  product: Product;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-none overflow-hidden border border-editorial-border hover:border-editorial-dark transition-colors duration-300 flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden bg-editorial-cream">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Category tag */}
        <span className="absolute top-3 left-3 bg-white/90 text-editorial-text text-[9px] font-semibold px-3 py-1.5 rounded-none uppercase tracking-[0.2em] shadow-none border border-editorial-border/60 flex items-center gap-1 backdrop-blur-md">
          <Scissors className="w-3 h-3 text-editorial-dark" />
          {product.category}
        </span>

        {/* Craft time badge */}
        <span className="absolute bottom-3 right-3 bg-editorial-dark/90 text-white text-[9px] font-medium px-3 py-1.5 rounded-none flex items-center gap-1.5 backdrop-blur-md tracking-wider uppercase">
          <Clock className="w-3.5 h-3.5 text-editorial-cream" />
          {product.craftTime}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex text-editorial-dark">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs font-medium text-editorial-text font-sans">{product.rating.toFixed(1)}</span>
          <span className="text-[10px] text-editorial-muted font-sans">({product.reviews} відгуків)</span>
        </div>

        <h3 className="text-xl font-serif text-editorial-text mb-2 line-clamp-1 group-hover:text-editorial-muted transition-colors font-normal">
          {product.name}
        </h3>

        <p className="text-xs text-editorial-dark-muted line-clamp-2 mb-4 flex-1 leading-relaxed font-sans">
          {product.description}
        </p>

        <div className="border-t border-editorial-border/40 pt-4 mt-auto">
          <div className="text-[10px] text-editorial-muted mb-3 flex items-center gap-1 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-editorial-dark" />
            <span className="font-semibold uppercase tracking-wider">Матеріал:</span> {product.materials}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-[9px] text-editorial-muted block uppercase tracking-[0.15em] font-medium">Ціна за мірками</span>
              <span className="text-lg font-bold text-editorial-text font-sans">{product.price.toLocaleString("uk-UA")} ₴</span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewDetails(product)}
              className="bg-editorial-dark hover:bg-stone-800 text-white text-[10px] uppercase tracking-[0.2em] px-5 py-3 rounded-none transition-colors duration-200 flex items-center gap-1 cursor-pointer font-sans font-semibold shadow-xs"
            >
              Замовити
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
