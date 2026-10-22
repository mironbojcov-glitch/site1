import Image from "next/image";

export default function HangerSweater() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-[7px] right-0 z-20 block w-20 md:top-[9px] md:right-0 md:w-28"
      style={{
        animation: "swing-hoodie 5.2s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        animationDelay: "-1.8s",
        transformOrigin: "50% 0%",
        willChange: "transform",
      }}
    >
      <Image
        src="/images/hanger-hoodie-v2.png"
        alt=""
        aria-hidden="true"
        width={1254}
        height={1254}
        className="pointer-events-none w-full h-auto select-none"
        draggable={false}
        quality={80}
        sizes="(min-width: 768px) 112px, 80px"
      />
    </div>
  );
}
