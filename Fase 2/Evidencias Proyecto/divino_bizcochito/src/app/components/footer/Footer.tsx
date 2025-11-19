"use client";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#EDE2D3] px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center">
      {/* Sección izquierda */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-2">
          <div className="w-25 h-25 rounded-full flex items-center justify-center">
            <Image
              src="/assets/Divino_bizcochito_2.png"
              alt="Divino Bizcochito"
              width={500}
              height={500}
            />
          </div>
        </div>

        {/* Íconos redes sociales */}
        <div className="flex gap-3 mt-2 text-[#C72C2F]">
          <Link href="https://facebook.com" target="_blank" aria-label="Facebook">
            <Facebook size={18} />
          </Link>
          <Link href="https://instagram.com" target="_blank" aria-label="Instagram">
            <Instagram size={18} />
          </Link>
          <Link href="https://linkedin.com" target="_blank" aria-label="LinkedIn">
            <Linkedin size={18} />
          </Link>
        </div>
      </div>

      {/* Sección derecha */}
      <div className="flex flex-col gap-2 text-[#C72C2F] text-sm mt-4 md:mt-0">
        <div className="flex items-center gap-2">
          <Mail size={16} />
          <span>Divinobizcochito@gmail.com</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={16} />
          <span>+56 9 8547 1673</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <span>Puerto Aysén 2136</span>
        </div>
      </div>
    </footer>
  );
}
