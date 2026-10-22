import Image from "next/image";

export default function HangingSneakers() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-2 z-20 block w-14 md:left-4 md:w-20"
      style={{
        animation: "swing-sneakers 4.6s cubic-bezier(0.45, 0, 0.55, 1) infinite",
        transformOrigin: "50% 0%",
        willChange: "transform",
      }}
    >
      <Image
        src="/images/cross.png"
        alt=""
        aria-hidden="true"
        width={1221}
        height={1288}
        className="pointer-events-none w-full h-auto select-none"
        draggable={false}
        quality={80}
        sizes="(min-width: 768px) 80px, 56px"
        style={{ filter: "none", clipPath: "inset(7% 0 0 0)" }}
      />
    </div>
  );
}
