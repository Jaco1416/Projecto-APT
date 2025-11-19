"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "/assets/pastel_carousel_1.png",
  "/assets/pastel_carousel_2.png",
  "/assets/pastel_carousel_3.png",
  "/assets/pastel_carousel_4.png",
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent(current === 0 ? images.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === images.length - 1 ? 0 : current + 1);
  };

  // 🔄 Auto-slide cada 5 segundos
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Contenedor de imágenes */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((src, index) => (
          <div key={index} className="relative w-full flex-shrink-0 aspect-[16/6] sm:aspect-[16/7] lg:aspect-[16/5]">
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Flecha izquierda */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Flecha derecha */}
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full p-2 shadow-md transition"
      >
        <ChevronRight size={22} />
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              current === index ? "bg-[#C72C2F]" : "bg-[#E5C8BB]"
            } transition-all`}
          />
        ))}
      </div>
    </div>
  );
}
