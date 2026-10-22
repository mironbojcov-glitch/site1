"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import type { Product } from "@/lib/products";

const headingWordVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.55 } } };
const reducedHeadingWordVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.45 } } };

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

const AnimatedPrice = memo(function AnimatedPrice({ price, active, reduceMotion }: { price: number; active: boolean; reduceMotion: boolean }) {
  const count = useMotionValue(0);
  const formatted = useTransform(count, (value) => `${Math.round(value).toLocaleString("ru-RU")} ₸`);
  useEffect(() => {
    if (!active) return;
    const controls = animate(count, price, { duration: reduceMotion ? 0 : 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [active, count, price, reduceMotion]);
  return <motion.span className="text-sm font-medium tracking-wide text-[#c5b8ec]">{formatted}</motion.span>;
});

const PopularCard = memo(function PopularCard({ item, index, count, mounted, reduceMotion, scrollProgress, isAdmin, onOrder, onEdit, onMove }: {
  item: Product;
  index: number;
  count: number;
  mounted: boolean;
  reduceMotion: boolean;
  scrollProgress: MotionValue<number>;
  isAdmin: boolean;
  onOrder: (name: string) => void;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });
  const imageY = useTransform(scrollProgress, [0, 1], ["-8%", "8%"]);
  const imageScale = useTransform(scrollProgress, [0, 0.28], [1.15, 1]);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { stiffness: 180, damping: 22 });
  const springTiltY = useSpring(tiltY, { stiffness: 180, damping: 22 });
  const direction = index % 2 === 0 ? -60 : 60;

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    if (!reduceMotion) {
      tiltX.set((0.5 - y) * 14);
      tiltY.set((x - 0.5) * 14);
    }
    event.currentTarget.style.setProperty("--mx", `${Math.max(0, Math.min(1, x)) * 100}%`);
    event.currentTarget.style.setProperty("--my", `${Math.max(0, Math.min(1, y)) * 100}%`);
  }

  function resetTilt(event: MouseEvent<HTMLDivElement>) {
    tiltX.set(0);
    tiltY.set(0);
    event.currentTarget.style.setProperty("--mx", "50%");
    event.currentTarget.style.setProperty("--my", "50%");
  }

  return (
    <motion.div
      ref={cardRef}
      key={`${item.id}-${mounted ? "mounted" : "server"}`}
      initial={mounted ? { opacity: 0, x: reduceMotion ? 0 : direction, rotate: reduceMotion ? 0 : index % 2 === 0 ? 4 : -4, scale: reduceMotion ? 1 : 0.92 } : false}
      whileInView={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reduceMotion ? { duration: 0.45, delay: index * 0.06 } : { type: "spring", stiffness: 120, damping: 18, delay: index * 0.08 }}
      style={{ willChange: "transform" }}
    >
      <motion.div
        className="group relative z-10 rounded-[22px] border border-white/10 bg-white/[0.045] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[border-color] duration-300 group-hover:border-violet-400/50 sm:p-4"
        whileHover={{ y: reduceMotion ? -4 : -10, scale: reduceMotion ? 1.005 : 1.02, transition: { type: "spring", stiffness: 260, damping: 22 } }}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        style={{ "--mx": "50%", "--my": "50%", willChange: "transform" } as CSSProperties}
      >
        <motion.div className="popular-card-tilt" style={{ rotateX: reduceMotion ? 0 : springTiltX, rotateY: reduceMotion ? 0 : springTiltY, transformPerspective: 900 }}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-gradient-to-br from-[#282039] via-[#17151d] to-[#31274a]">
            {!imageFailed && item.image && (
              <motion.div className="absolute -inset-y-[8%] inset-x-0" style={{ y: reduceMotion ? 0 : imageY, scale: reduceMotion ? 1 : imageScale }}>
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.08]">
                  <Image src={item.image} alt={item.name} fill sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, (max-width: 1279px) 30vw, 24vw" quality={70} loading="lazy" className="object-cover" onError={() => setImageFailed(true)} />
                </div>
              </motion.div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0b]/30 via-transparent to-white/[0.025]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[16px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.14), transparent 72%)" }} />
            {isAdmin && <div className="absolute right-2 top-2 z-10 flex gap-1">
              <button type="button" aria-label="Переместить товар влево" disabled={index === 0} onClick={() => onMove(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 disabled:opacity-35"><ArrowLeft size={16} /></button>
              <button type="button" aria-label="Переместить товар вправо" disabled={index === count - 1} onClick={() => onMove(1)} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80 disabled:opacity-35"><ArrowRight size={16} /></button>
              <button type="button" aria-label="Редактировать товар" onClick={onEdit} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-black/60 text-white hover:bg-black/80"><Pencil size={15} /></button>
            </div>}
          </div>
          <div className="px-1 pb-1 pt-4">
            <h3 className="min-h-12 text-sm font-light leading-6 text-white/85">{item.name}</h3>
            <p className="mt-2"><AnimatedPrice price={item.price} active={isInView} reduceMotion={reduceMotion} /></p>
            <motion.button type="button" onClick={(event) => { event.preventDefault(); onOrder(item.name); }} whileTap={{ scale: 0.97 }} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 text-xs text-white/75 transition-[border-color] duration-300 hover:border-[#a995df]/45 hover:bg-[#8d77c7]/[0.12] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b7a7e6]">
              Заказать <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});

export default function PopularItems({ onOrder, scrollProgress, products: initialProducts, isAdmin }: {
  onOrder: (name: string) => void;
  scrollProgress: MotionValue<number>;
  products: Product[];
  isAdmin: boolean;
}) {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const reduceMotion = mounted && prefersReducedMotion;
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef("");
  const wordVariants = reduceMotion ? reducedHeadingWordVariants : headingWordVariants;

  useEffect(() => () => { if (previewRef.current) URL.revokeObjectURL(previewRef.current); }, []);
  useEffect(() => {
    if (!editing && previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
    }
  }, [editing]);

  async function persist(next: Product[], previous: Product[]) {
    setProducts(next);
    setSaving(true);
    setNotice("");
    try {
      const response = await fetch("/api/admin/products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось сохранить товары.");
      setNotice("Сохранено");
      return true;
    } catch (error) {
      setProducts(previous);
      setNotice(error instanceof Error ? error.message : "Ошибка сохранения.");
      return false;
    } finally {
      setSaving(false);
      window.setTimeout(() => setNotice(""), 2600);
    }
  }

  async function uploadImage(file: File) {
    if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Выберите JPG, PNG или WebP размером до 5 МБ.");
    const localUrl = URL.createObjectURL(file);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = localUrl;
    setPreview(localUrl);
    setUploading(true);
    try {
      const image = new window.Image();
      image.src = localUrl;
      await image.decode();
      const scale = Math.min(1, 1200 / image.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Не удалось обработать изображение.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Не удалось сжать изображение.")), "image/webp", 0.8));
      const data = new FormData();
      data.set("file", new File([blob], "product.webp", { type: "image/webp" }));
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось загрузить изображение.");
      setEditing((current) => current ? { ...current, image: result.url } : current);
      setNotice("Фото загружено");
    } finally {
      setUploading(false);
    }
  }

  function openEdit(product: Product) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = "";
    setPreview("");
    setIsNew(false);
    setEditing({ ...product });
  }

  function openAdd() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = "";
    setPreview("");
    setIsNew(true);
    setEditing({ id: crypto.randomUUID(), name: "", price: 0, image: "" });
  }

  async function saveDraft() {
    if (!editing || uploading || saving) return;
    const nextDraft = { ...editing, name: editing.name.trim(), price: Number(editing.price) };
    if (!nextDraft.name || nextDraft.name.length > 80 || !Number.isInteger(nextDraft.price) || nextDraft.price < 0 || nextDraft.price > 10000000) {
      setNotice("Проверьте название (до 80 символов) и цену товара.");
      return;
    }
    const previous = products;
    const next = isNew ? [...products, nextDraft] : products.map((product) => product.id === nextDraft.id ? nextDraft : product);
    if (await persist(next, previous)) setEditing(null);
  }

  async function deleteDraft() {
    if (!editing || isNew || !window.confirm("Удалить эту карточку товара?")) return;
    const previous = products;
    const next = products.filter((product) => product.id !== editing.id);
    if (await persist(next, previous)) setEditing(null);
  }

  async function moveProduct(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= products.length) return;
    const next = [...products];
    [next[index], next[target]] = [next[target], next[index]];
    await persist(next, products);
  }

  return (
    <section id="popular" className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-24 lg:px-8">
      <style jsx global>{`@media (hover: none) and (pointer: coarse) { .popular-card-tilt { transform: none !important; } }`}</style>
      {notice && <div role="status" className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-white/10 bg-[#19171f] px-5 py-3 text-sm text-white shadow-xl">{notice}</div>}
      <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
        <motion.p key={`eyebrow-${mounted}`} initial={mounted ? { opacity: 0 } : false} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.45 }} className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#a995df] sm:text-xs">КАТАЛОГ</motion.p>
        <motion.h2 key={`heading-${mounted}`} initial={mounted ? "hidden" : false} whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }} className="mx-auto mt-3 mb-4 block max-w-[250px] text-center text-3xl font-light leading-[1.1] tracking-[-0.045em] text-white sm:max-w-none sm:text-4xl md:mb-6 md:text-5xl">
          <motion.span variants={wordVariants} className="mr-[0.25em] inline-block">Есть</motion.span><motion.span variants={wordVariants} className="mr-[0.25em] inline-block">в</motion.span><motion.span variants={wordVariants} className="mr-[0.25em] inline-block">наличии</motion.span>
        </motion.h2>
        <motion.p key={`description-${mounted}`} initial={mounted ? { opacity: 0 } : false} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, delay: 0.1 }} className="relative mx-auto mt-0 block max-w-xl text-sm leading-6 text-white/55 sm:text-base">Вещи, которые уже есть у нас. Выберите понравившуюся и оставьте заявку.</motion.p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => <PopularCard key={product.id} item={product} index={index} count={products.length} mounted={mounted} reduceMotion={reduceMotion} scrollProgress={scrollProgress} isAdmin={isAdmin} onOrder={onOrder} onEdit={() => openEdit(product)} onMove={(direction) => moveProduct(index, direction)} />)}
        {isAdmin && <button type="button" onClick={openAdd} className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed border-white/20 bg-white/[0.025] text-sm text-white/60 transition hover:border-[#a995df]/60 hover:bg-white/[0.05] hover:text-white"><Plus size={26} />Добавить товар</button>}
      </div>
      <AnimatePresence>
        {editing && isAdmin && <motion.div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/75 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget && !saving && !uploading) setEditing(null); }}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="product-editor-title" className="relative my-auto w-full max-w-lg rounded-[26px] border border-white/10 bg-[#15141a] p-5 shadow-2xl sm:p-7" initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }}>
            <button type="button" onClick={() => setEditing(null)} aria-label="Закрыть" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-white/10 text-white/70 hover:bg-white/10"><X size={17} /></button>
            <h3 id="product-editor-title" className="mb-5 pr-10 text-xl font-light">{isNew ? "Новый товар" : "Редактировать товар"}</h3>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file).catch((error) => setNotice(error instanceof Error ? error.message : "Ошибка загрузки.")); event.currentTarget.value = ""; }} />
            <button type="button" onClick={() => fileRef.current?.click()} className="relative mb-5 block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#282039] via-[#17151d] to-[#31274a] text-sm text-white/60">
              {(preview || editing.image) && <Image src={preview || editing.image} alt="Предпросмотр товара" fill unoptimized={preview.startsWith("blob:")} sizes="(max-width: 640px) 90vw, 480px" className="object-cover" />}
              <span className="absolute inset-x-0 bottom-0 bg-black/55 py-3">{uploading ? "Загрузка фото…" : "Нажмите, чтобы выбрать фото"}</span>
            </button>
            <label className="mb-4 block text-xs text-white/60">Название<input autoFocus value={editing.name} maxLength={80} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-[#a995df]/60" /></label>
            <label className="mb-6 block text-xs text-white/60">Цена, ₸<input type="number" min={0} max={10000000} step={1} value={editing.price} onChange={(event) => setEditing({ ...editing, price: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none focus:border-[#a995df]/60" /></label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              {!isNew ? <button type="button" disabled={saving} onClick={() => void deleteDraft()} className="flex items-center gap-2 rounded-full border border-rose-300/20 px-4 py-2.5 text-sm text-rose-200/80 hover:bg-rose-300/10 disabled:opacity-50"><Trash2 size={15} />Удалить</button> : <span />}
              <button type="button" disabled={saving || uploading} onClick={() => void saveDraft()} className="flex min-w-36 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-violet-400 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">{saving ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}Сохранить</button>
            </div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </section>
  );
}
