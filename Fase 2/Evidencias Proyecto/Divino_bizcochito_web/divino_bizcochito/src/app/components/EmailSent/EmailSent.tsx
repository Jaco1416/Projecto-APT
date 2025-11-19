import Image from "next/image";
import styles from "./EmailSent.module.css";

export default function EmailSent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#ffffff] px-4">
      <div className="bg-[#C72C2F] border border-[#f8f1ed] rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-24 h-24 mx-auto mb-6 relative">
          <Image
            src="/assets/paper-plane_2.png"
            alt="Paper plane"
            fill
            className={`object-contain ${styles.float}`}
          />
        </div>
        <h1 className="text-2xl font-semibold text-[#ffffff] mb-4">
          ¡Correo enviado!
        </h1>
        <p className="text-[#ffffff]">
          Se ha enviado un correo a tu cuenta. Al verificar, puedes cerrar esta página.
        </p>
      </div>
    </div>
  );
}
