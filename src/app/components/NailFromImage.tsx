"use client";

import Image from "next/image";

export default function NailFromImage({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-30 block w-14 md:w-20 ${className}`}
      style={{ clipPath: "inset(0 0 92% 0)" }}
    >
      <Image
        src="/images/cross.png"
        alt=""
        aria-hidden="true"
        width={1221}
        height={1288}
        className="w-full h-auto select-none"
        draggable={false}
        quality={80}
        sizes="(min-width: 768px) 80px, 56px"
      />
    </span>
  );
}
