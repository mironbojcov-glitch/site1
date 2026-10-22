"use client";

import Image from "next/image";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import OrderForm from "./components/OrderForm";
import PopularItems from "./components/PopularItems";
import { smoothScrollTo } from "./lib/smoothScroll";
import type { Product } from "@/lib/products";

type Item = {
  type: "photo" | "logo" | "cutout";
  src: string;
  text?: string;
  x: number;
  y: number;
  size: { width: number; height: number };
  rotate: number;
  duration: number;
  delay: number;
  top: string;
  left: string;
};

const items: Item[] = [
  { type: "logo", src: "/images/collage/collage-1.jpg", text: "BALENCIAGA", top: "8%", left: "20%", x: -4, y: 4, size: { width: 132, height: 52 }, rotate: -3, duration: 11, delay: 1.2 },
  { type: "cutout", src: "/images/collage/collage-5.jpg", top: "13%", left: "78%", x: 4, y: -4, size: { width: 82, height: 86 }, rotate: 3, duration: 15, delay: 0.7 },
  { type: "logo", src: "/images/collage/collage-3.jpg", text: "BURBERRY", top: "25%", left: "72%", x: 4, y: 4, size: { width: 120, height: 68 }, rotate: 3, duration: 14, delay: 0.2 },
  { type: "cutout", src: "/images/collage/cutout-1.png", top: "31%", left: "27%", x: -4, y: -4, size: { width: 80, height: 86 }, rotate: -3, duration: 13, delay: 1.5 },
  { type: "logo", src: "/images/collage/collage-4.jpg", text: "VETEMENTS", top: "45%", left: "17%", x: 4, y: 4, size: { width: 128, height: 52 }, rotate: 3, duration: 16, delay: 2.1 },
  { type: "cutout", src: "/images/collage/collage-2.jpg", top: "42%", left: "82%", x: -4, y: 4, size: { width: 78, height: 84 }, rotate: -3, duration: 10, delay: 1.8 },
  { type: "logo", src: "/images/collage/collage-8.jpg", text: "MAISON MARGIELA", top: "57%", left: "74%", x: -4, y: -4, size: { width: 132, height: 68 }, rotate: -2, duration: 15, delay: 0.9 },
  { type: "cutout", src: "/images/collage/collage-6.jpg", top: "61%", left: "24%", x: 4, y: -4, size: { width: 84, height: 86 }, rotate: 3, duration: 12, delay: 2.5 },
  { type: "logo", src: "/images/collage/collage-12.jpg", text: "SUPREME", top: "73%", left: "18%", x: 4, y: 4, size: { width: 126, height: 64 }, rotate: -2, duration: 13, delay: 1.3 },
  { type: "cutout", src: "/images/collage/collage-7.jpg", top: "70%", left: "80%", x: -4, y: 4, size: { width: 88, height: 86 }, rotate: -3, duration: 14, delay: 0.5 },
  { type: "logo", src: "/images/collage/collage-13.jpg", text: "CHROME HEARTS", top: "85%", left: "76%", x: 4, y: -4, size: { width: 86, height: 86 }, rotate: 3, duration: 16, delay: 1.7 },
  { type: "cutout", src: "/images/collage/collage-9.jpg", top: "82%", left: "29%", x: -4, y: 4, size: { width: 92, height: 76 }, rotate: 3, duration: 11, delay: 0.6 },
  { type: "cutout", src: "/images/collage/collage-11.jpg", top: "94%", left: "17%", x: 4, y: 4, size: { width: 76, height: 84 }, rotate: 3, duration: 15, delay: 1.1 },
  { type: "cutout", src: "/images/collage/cutout-2.png", top: "95%", left: "83%", x: -4, y: -4, size: { width: 78, height: 84 }, rotate: -3, duration: 12, delay: 2 },
];

type CutoutCache = Map<string, Promise<string | null>>;

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function createCutout(src: string, backgroundTone: "white" | "black"): Promise<string | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = async () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) {
        resolve(null);
        return;
      }

      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      const count = width * height;
      const background = new Uint8Array(count);
      const queue = new Int32Array(count);
      let head = 0;
      let tail = 0;

      const isBackgroundCandidate = (index: number) => {
        const offset = index * 4;
        if (pixels[offset + 3] < 8) return true;
        const red = backgroundTone === "white" ? 255 - pixels[offset] : pixels[offset];
        const green = backgroundTone === "white" ? 255 - pixels[offset + 1] : pixels[offset + 1];
        const blue = backgroundTone === "white" ? 255 - pixels[offset + 2] : pixels[offset + 2];
        return red * red + green * green + blue * blue <= 28 * 28;
      };

      const enqueue = (index: number) => {
        if (background[index] || !isBackgroundCandidate(index)) return;
        background[index] = 1;
        queue[tail++] = index;
      };

      for (let x = 0; x < width; x += 1) {
        enqueue(x);
        enqueue((height - 1) * width + x);
      }
      for (let y = 1; y < height - 1; y += 1) {
        enqueue(y * width);
        enqueue(y * width + width - 1);
      }

      while (head < tail) {
        const index = queue[head++];
        const x = index % width;
        const y = (index - x) / width;
        if (x > 0) enqueue(index - 1);
        if (x + 1 < width) enqueue(index + 1);
        if (y > 0) enqueue(index - width);
        if (y + 1 < height) enqueue(index + width);
        if (head % 90000 === 0) {
          await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
        }
      }

      const softened = new Uint8Array(count);
      const softenNeighbor = (neighbor: number) => {
        if (neighbor < 0 || background[neighbor] || softened[neighbor]) return;
        const offset = neighbor * 4;
        const red = backgroundTone === "white" ? 255 - pixels[offset] : pixels[offset];
        const green = backgroundTone === "white" ? 255 - pixels[offset + 1] : pixels[offset + 1];
        const blue = backgroundTone === "white" ? 255 - pixels[offset + 2] : pixels[offset + 2];
        const distance = Math.sqrt(red * red + green * green + blue * blue);
        if (distance < 70) {
          pixels[offset + 3] = Math.round(pixels[offset + 3] * Math.max(0, Math.min(1, (distance - 28) / 42)));
          softened[neighbor] = 1;
        }
      };
      for (let queued = 0; queued < tail; queued += 1) {
        const index = queue[queued];
        pixels[index * 4 + 3] = 0;
        const x = index % width;
        const y = (index - x) / width;
        if (x > 0) softenNeighbor(index - 1);
        if (x + 1 < width) softenNeighbor(index + 1);
        if (y > 0) softenNeighbor(index - width);
        if (y + 1 < height) softenNeighbor(index + width);
        if (queued > 0 && queued % 90000 === 0) {
          await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
        }
      }

      context.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : null), "image/png");
    };
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function ProcessedImage({
  src,
  itemIndex,
  cache,
  backgroundTone,
  className,
}: {
  src: string;
  itemIndex: number;
  cache: CutoutCache;
  backgroundTone: "white" | "black";
  className: string;
}) {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const cacheKey = `${backgroundTone}:${src}`;

  useEffect(() => {
    let active = true;
    let requested = false;
    const load = () => {
      if (requested || (itemIndex >= 4 && window.matchMedia("(max-width: 767px)").matches)) return;
      requested = true;
      let task = cache.get(cacheKey);
      if (!task) {
        task = createCutout(src, backgroundTone);
        cache.set(cacheKey, task);
      }
      task.then((url) => {
        if (active) setProcessedSrc(url);
      });
    };
    load();
    window.addEventListener("resize", load, { passive: true });
    return () => {
      active = false;
      window.removeEventListener("resize", load);
    };
  }, [backgroundTone, cache, cacheKey, itemIndex, src]);

  if (!processedSrc) return null;
  return (
    <Image
      src={processedSrc}
      alt=""
      fill
      unoptimized
      quality={70}
      loading="lazy"
      sizes="(max-width: 767px) 30vw, 17vw"
      className={className}
    />
  );
}

function CollageItem({
  item,
  index,
  pointerX,
  pointerY,
  scrollY,
  scrollRotation,
  reduceMotion,
  cutoutCache,
}: {
  item: Item;
  index: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scrollY: MotionValue<number>;
  scrollRotation: MotionValue<number>;
  reduceMotion: boolean;
  cutoutCache: CutoutCache;
}) {
  const [useCssFallback, setUseCssFallback] = useState(false);
  const animationStarted = useRef(false);
  const parallaxX = useTransform(pointerX, [-1, 1], [item.rotate > 0 ? -12 : 12, item.rotate > 0 ? 12 : -12]);
  const parallaxY = useTransform(pointerY, [-1, 1], [item.rotate > 0 ? -10 : 10, item.rotate > 0 ? 10 : -10]);
  const scrollParallaxY = useTransform(scrollY, (value) => value * (0.1 + (index % 5) * 0.1));
  const itemScrollRotation = useTransform(scrollRotation, (value) => value * (index % 2 === 0 ? 1 : -1));
  const isPhoto = item.type === "photo";
  const isLogo = item.type === "logo";
  const amplitude = reduceMotion ? 0.5 : 1;
  const duration = reduceMotion ? Math.max(16, item.duration) : item.duration;
  const mobileHidden = index >= 4 ? "hidden md:block" : "";

  useEffect(() => {
    if (reduceMotion) {
      setUseCssFallback(false);
      return;
    }
    const timer = window.setTimeout(() => {
      if (!animationStarted.current) setUseCssFallback(true);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <motion.div
      className={`collage-item-${index} pointer-events-none absolute top-0 left-0 transform-gpu ${mobileHidden}`}
      style={{
        top: item.top,
        left: item.left,
        width: item.size.width,
        height: item.size.height,
        marginLeft: -item.size.width / 2,
        marginTop: -item.size.height / 2,
      }}
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.15, delay: index * 0.09, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 transform-gpu"
        style={{
          x: reduceMotion ? 0 : parallaxX,
          y: reduceMotion ? 0 : parallaxY,
        }}
      >
      <motion.div
        className="absolute inset-0 transform-gpu"
        style={{
          y: reduceMotion ? 0 : scrollParallaxY,
          rotate: reduceMotion ? 0 : itemScrollRotation,
        }}
      >
        <motion.div
          className={`relative h-full w-full transform-gpu ${
            isPhoto ? "overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#211d2b] via-[#131217] to-[#282039] shadow-[0_18px_55px_rgba(0,0,0,0.38),0_0_40px_rgba(105,88,145,0.12),inset_0_1px_0_rgba(255,255,255,0.12)]" : ""
          } ${useCssFallback ? `motion-fallback-float float-${String.fromCharCode(97 + (index % 3))}` : ""}`}
          style={{
            willChange: "transform",
            ...(useCssFallback ? { animationDuration: `${duration}s` } : {}),
          }}
          animate={reduceMotion ? { opacity: 1 } : {
          x: [0, item.x * amplitude, 0],
          y: [0, item.y * amplitude, 0],
          rotate: [item.rotate, item.rotate + 2 * amplitude, item.rotate],
          ...(isLogo ? {} : { opacity: [0.82, 1, 0.82] }),
          }}
          transition={reduceMotion ? { duration: 0.6 } : {
            duration,
            delay: item.delay,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
          onAnimationStart={() => {
            animationStarted.current = true;
            setUseCssFallback(false);
          }}
        >
        {isPhoto && (
          <>
            <Image
              src={item.src}
              alt=""
              fill
              sizes="(max-width: 767px) 30vw, 18vw"
              quality={70}
              priority={index < 2}
              loading={index < 2 ? undefined : "lazy"}
              className="object-cover opacity-90 brightness-110 [filter:blur(0.25px)]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/5" />
          </>
        )}
        {isLogo && (
          <ProcessedImage
            src={item.src}
            itemIndex={index}
            cache={cutoutCache}
            backgroundTone="black"
            className="object-contain opacity-35 [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.12))]"
          />
        )}
        {item.type === "cutout" && (
          <ProcessedImage
            src={item.src}
            itemIndex={index}
            cache={cutoutCache}
            backgroundTone="white"
            className="object-contain [filter:drop-shadow(0_10px_18px_rgba(0,0,0,0.3))]"
          />
        )}
        </motion.div>
      </motion.div>
      </motion.div>
    </motion.div>
  );
}

const BackgroundCollage = memo(function BackgroundCollage({
  scrollY,
  scrollRotation,
  reduceMotion,
}: {
  scrollY: MotionValue<number>;
  scrollRotation: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const reduced = reduceMotion;
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 45, damping: 22, mass: 0.8 });
  const springY = useSpring(pointerY, { stiffness: 45, damping: 22, mass: 0.8 });
  const cutoutCache = useMemo<CutoutCache>(() => new Map(), []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const handleMouseMove = (event: MouseEvent) => {
      pointerX.set((event.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [pointerX, pointerY]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0a0a0b]" aria-hidden="true">
      <style>{`
        @keyframes float-a { 0%, 100% { transform: translate3d(0, 0, 0) rotate(-1deg); } 50% { transform: translate3d(8px, -11px, 0) rotate(1deg); } }
        @keyframes float-b { 0%, 100% { transform: translate3d(0, 0, 0) rotate(1deg); } 50% { transform: translate3d(-10px, 9px, 0) rotate(-1deg); } }
        @keyframes float-c { 0%, 100% { transform: translate3d(0, 0, 0) rotate(-0.5deg); } 50% { transform: translate3d(7px, 12px, 0) rotate(1.5deg); } }
        .motion-fallback-float { animation-timing-function: ease-in-out; animation-iteration-count: infinite; animation-direction: alternate; }
        .float-a { animation-name: float-a; }
        .float-b { animation-name: float-b; }
        .float-c { animation-name: float-c; }
        @media (max-width: 767px) {
          .collage-item-0 { top: 9% !important; left: 12% !important; width: 84px !important; height: 34px !important; margin: 0 !important; }
          .collage-item-1 { top: 26% !important; left: calc(88% - 72px) !important; width: 72px !important; height: 84px !important; margin: 0 !important; }
          .collage-item-2 { top: 43% !important; left: 14% !important; width: 86px !important; height: 52px !important; margin: 0 !important; }
          .collage-item-3 { top: 72% !important; left: calc(88% - 72px) !important; width: 72px !important; height: 82px !important; margin: 0 !important; }
          .collage-item-4 { top: 91% !important; left: 14% !important; width: 84px !important; height: 34px !important; margin: 0 !important; }
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(103,83,159,0.14),transparent_48%)]" />
      {items.slice(0, 8).map((item, index) => (
        <CollageItem
          key={item.src}
          item={item}
          index={index}
          pointerX={springX}
          pointerY={springY}
          scrollY={scrollY}
          scrollRotation={scrollRotation}
          reduceMotion={reduced}
          cutoutCache={cutoutCache}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#0a0a0b_0%,rgba(10,10,11,0.5)_18%,rgba(10,10,11,0.36)_50%,rgba(10,10,11,0.5)_82%,#0a0a0b_100%),linear-gradient(180deg,rgba(10,10,11,0.18),rgba(10,10,11,0.6)_27%,rgba(10,10,11,0.64)_72%,rgba(10,10,11,0.22))]" />
    </div>
  );
});

export default function HomeClient({ products, isAdmin }: { products: Product[]; isAdmin: boolean }) {
  const [selectedItem, setSelectedItem] = useState<{ name: string; version: number } | null>(null);
  const [formFlash, setFormFlash] = useState(0);
  const [currentYear, setCurrentYear] = useState(2026);
  const formRef = useRef<HTMLDivElement>(null);
  const itemInputRef = useRef<HTMLTextAreaElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroHeight = useMotionValue(1);
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const reduceMotion = mounted && prefersReducedMotion;
  const { scrollY, scrollYProgress: pageProgress } = useScroll();
  const smoothedScrollY = useSpring(scrollY, { stiffness: 80, damping: 20 });
  const scrollVelocity = useVelocity(scrollY);
  const velocityRotation = useTransform(scrollVelocity, [-1000, 1000], [-6, 6]);
  const scrollRotation = useSpring(velocityRotation, { stiffness: 60, damping: 25 });
  const heroProgress = useTransform([scrollY, heroHeight], ([position, height]) =>
    Math.max(0, Math.min(1, Number(position) / Math.max(1, Number(height)))),
  );
  const titleY = useTransform(heroProgress, [0, 1], [0, -90]);
  const titleScale = useTransform(heroProgress, [0, 1], [1, 0.92]);
  const formY = useTransform(heroProgress, [0, 1], [0, -60]);
  const formScale = useTransform(heroProgress, [0, 1], [1, 0.97]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const measure = () => heroHeight.set(hero.offsetHeight);
    const observer = new ResizeObserver(measure);
    observer.observe(hero);
    measure();
    return () => observer.disconnect();
  }, [heroHeight]);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  async function orderPopularItem(name: string) {
    setSelectedItem((current) => ({ name, version: (current?.version ?? 0) + 1 }));
    if (!formRef.current) return;
    await smoothScrollTo(formRef.current, 80, reduceMotion);
    setFormFlash((current) => current + 1);
    itemInputRef.current?.focus({ preventScroll: true });
  }

  return (
    <main className="relative min-h-screen bg-[#0a0a0b] text-white selection:bg-[#8d77c7]/30">
      <BackgroundCollage scrollY={smoothedScrollY} scrollRotation={scrollRotation} reduceMotion={reduceMotion} />
      {isAdmin && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[#17151d]/95 px-4 py-2 text-xs text-white shadow-lg">
          <span>Режим редактирования</span>
          <button type="button" onClick={async () => { try { await fetch("/api/admin/logout", { method: "POST" }); } finally { window.location.assign("/admin/login"); } }} className="rounded-full border border-white/15 px-3 py-1 text-white/70 transition hover:border-[#a995df]/60 hover:text-white">Выйти</button>
        </div>
      )}
      <section ref={heroRef} className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-16">
        <header className="mb-8 text-center sm:mb-10">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-5 inline-flex max-w-full items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2"
          >
            <span className="relative block h-[70px] w-[70px] shrink-0 overflow-hidden rounded-full border border-[#9d8bd5]/45 bg-[#3f2b83] shadow-[0_0_26px_rgba(103,83,159,0.22)] sm:h-20 sm:w-20">
              <Image
                src="/images/myshop-avatar.png"
                alt="Аватар MyShop"
                fill
                sizes="80px"
                quality={70}
                className="object-cover object-center"
                priority
              />
            </span>
            <p className="whitespace-nowrap text-3xl font-semibold tracking-[0.18em] md:text-4xl" style={{ textShadow: "0 0 24px rgba(167,139,250,0.45)" }}>
              <span className="text-white">My</span><span className="bg-gradient-to-r from-violet-300 to-violet-500 bg-clip-text text-transparent">Shop</span>
            </p>
          </motion.div>
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.42em] text-[#a995df] sm:text-xs">Заказ вещей</p>
          <motion.div
            style={{ y: reduceMotion ? 0 : titleY, scale: reduceMotion ? 1 : titleScale, willChange: "transform" }}
          >
            <h1 className="font-[family-name:var(--font-geist-sans)] text-4xl font-light leading-[1.08] tracking-[-0.055em] text-white sm:text-5xl md:text-6xl">
              Вещи, которые <span className="font-normal text-[#b7a7e6]">выбрали вы</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
              Найдём, выкупим и доставим. Оставьте заявку — мы вернёмся с расчётом и сроками.
            </p>
          </motion.div>
        </header>

        <div ref={formRef} className="relative z-10 w-full max-w-[620px] scroll-mt-20">
          <motion.div
            className="relative"
            style={{ y: reduceMotion ? 0 : formY, scale: reduceMotion ? 1 : formScale, opacity: 1, willChange: "transform" }}
          >
            <OrderForm initialItem={selectedItem?.name} initialItemVersion={selectedItem?.version ?? 0} itemRef={itemInputRef} />
            {formFlash > 0 && (
              <motion.div
                key={formFlash}
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[26px] border border-[#b7a7e6]/80 shadow-[0_0_0_1px_rgba(183,167,230,0.2),0_0_24px_rgba(141,119,199,0.18)] sm:rounded-[30px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.9, times: [0, 0.22, 1], ease: "easeOut" }}
              />
            )}
          </motion.div>
        </div>

        <motion.div
          aria-hidden="true"
          className="mt-auto flex flex-col items-center gap-2 pt-8"
          animate={reduceMotion ? { opacity: [0.4, 0.9, 0.4] } : { opacity: [0.4, 0.9, 0.4], y: [0, 5, 0] }}
          transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
        >
          <span className="text-[9px] uppercase tracking-[0.28em] text-white/35">Листайте ниже</span>
          <span className="h-8 w-px bg-gradient-to-b from-[#a995df]/70 to-transparent" />
        </motion.div>
      </section>

      <PopularItems onOrder={orderPopularItem} scrollProgress={pageProgress} products={products} isAdmin={isAdmin} />

      <footer className="relative z-10 border-t border-white/10 bg-[#0a0a0b]/75">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-4 py-7 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <p className="text-sm font-medium tracking-[0.18em] text-[#d8d0ef]">MyShop</p>
          <nav aria-label="Социальные сети и чат" className="flex w-full flex-wrap justify-center gap-3 sm:flex-1">
            <motion.a
              href="https://t.me/myshopkz"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65 transition-colors duration-200 hover:border-[#a995df]/50 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b7a7e6]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M21.8 4.6 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6 13.5l-5-1.6c-1.1-.3-1.1-1.1.2-1.6L20.6 3c1-.4 1.8.2 1.2 1.6Z" /></svg>
              Telegram
            </motion.a>
            <motion.a
              href="https://www.instagram.com/myshop.wrld?igsh=MWFtenkwdW9seGc5bQ%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65 transition-colors duration-200 hover:border-[#a995df]/50 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b7a7e6]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>
              Instagram
            </motion.a>
            <motion.a
              href="https://t.me/+OOJaXK70ELwxYzUy"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65 transition-colors duration-200 hover:border-[#a995df]/50 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b7a7e6]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.5a7.5 7.5 0 0 1-11.2 6.5L4 19l1.1-3.6A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8.5 11.5h7" /></svg>
              Наш чат
            </motion.a>
          </nav>
          <p className="text-[10px] tracking-wide text-white/35">© {currentYear} MyShop. Все права защищены.</p>
        </div>
      </footer>
    </main>
  );
}
