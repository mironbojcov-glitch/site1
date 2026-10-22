"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import HangerSweater from "./HangerSweater";
import HangingSneakers from "./HangingSneakers";
import NailFromImage from "./NailFromImage";
import { useEffect, useId, useState, type FormEvent, type Ref } from "react";

type OrderValues = {
  item: string;
  size: string;
  budget: string;
  address: string;
  payment: string;
  telegram: string;
};

type OrderErrors = Partial<Record<keyof OrderValues, string>>;

const initialValues: OrderValues = {
  item: "",
  size: "",
  budget: "",
  address: "",
  payment: "Перевод на карту",
  telegram: "",
};

const paymentOptions = ["Перевод на карту", "Наличные"];
const fieldMotion = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function OrderForm({
  initialItem = "",
  initialItemVersion = 0,
  itemRef,
}: {
  initialItem?: string;
  initialItemVersion?: number;
  itemRef?: Ref<HTMLTextAreaElement>;
}) {
  const mounted = useMounted();
  const formId = useId();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (!initialItem) return;
    setValues((current) => ({ ...current, item: initialItem }));
    setErrors((current) => ({ ...current, item: undefined }));
    setServerError("");
    setStatus("idle");
  }, [initialItem, initialItemVersion]);

  function updateField(field: keyof OrderValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status === "error") setStatus("idle");
  }

  function validate() {
    const nextErrors: OrderErrors = {};
    if (!values.item.trim()) nextErrors.item = "Укажите название или описание вещи";
    if (!values.size.trim()) nextErrors.size = "Укажите размер или параметры";
    if (values.address.trim().length < 2 || values.address.trim().length > 60) nextErrors.address = "Укажите город";
    if (!values.payment) nextErrors.payment = "Выберите способ оплаты";
    if (!/^@[A-Za-z0-9_]{5,32}$/.test(values.telegram.trim())) {
      nextErrors.telegram = "Введите Telegram в формате @username";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || status === "success" || !validate()) return;

    setLoading(true);
    setServerError("");
    setStatus("idle");

    try {
      const comment = [
        `🛍 Товар: ${values.item.trim()}`,
        values.budget.trim() ? `💰 Бюджет: ${values.budget.trim()}` : "",
        `🏙 Город: ${values.address.trim()}`,
        `Оплата: ${values.payment}`,
      ].filter(Boolean).join("\n");
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.telegram.trim(),
          contact: values.telegram.trim(),
          link: `https://www.google.com/search?q=${encodeURIComponent(values.item.trim())}`,
          size: values.size.trim(),
          comment,
        }),
      });
      if (!response.ok) {
        const message = response.status === 400
          ? "Проверьте заполнение обязательных полей."
          : response.status === 500
            ? "Сервис временно недоступен. Попробуйте позже."
            : response.status === 502
              ? "Не удалось передать заявку. Попробуйте позже."
              : "Не удалось отправить заявку. Попробуйте ещё раз.";
        throw new Error(message);
      }
      setStatus("success");
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Не удалось отправить заявку. Попробуйте ещё раз.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (invalid: boolean) =>
    `peer w-full rounded-xl border bg-black/20 px-4 pb-3 pt-6 text-sm text-white outline-none transition duration-300 placeholder:text-transparent focus-visible:ring-2 focus-visible:ring-[#8d77c7]/40 ${
      invalid
        ? "border-rose-300/50 focus:border-rose-200/70"
        : "border-white/10 focus:border-[#8d77c7]/60 focus:shadow-[0_0_24px_rgba(103,83,159,0.16)]"
    }`;

  const labelClass =
    "pointer-events-none absolute left-4 top-2.5 origin-left text-[10px] tracking-wide text-white/45 transition-all peer-placeholder-shown:top-[17px] peer-placeholder-shown:text-sm peer-focus:top-2.5 peer-focus:text-[10px] peer-focus:text-[#b7a7e6]";

  return (
    <motion.section
      key={mounted ? "mounted" : "server"}
      id="order"
      initial={mounted ? "hidden" : false}
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.075, delayChildren: 0.12 } } }}
      className="relative rounded-[26px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.11)] backdrop-blur-xl sm:rounded-[30px] sm:p-8"
    >
      <HangingSneakers />
      <HangerSweater />
      <NailFromImage className="left-3 top-2 md:left-4" />
      <NailFromImage className="right-3 top-2 md:right-4" />
      <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#b7a7e6]/50 to-transparent" />
      <div className="relative mb-6 flex justify-center sm:mb-7">
        <div className="w-full pr-24 text-center sm:pr-28">
          <p className="text-base font-medium tracking-[0.16em] text-[#a995df] sm:text-lg">Заявка на выкуп</p>
          <h2 className="mt-2 pl-14 text-xl font-light tracking-[-0.03em] text-white sm:text-2xl md:pl-20">Расскажите, что ищете</h2>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex min-h-[440px] flex-col items-center justify-center py-12 text-center"
            role="status"
            aria-live="polite"
          >
            <motion.span
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 190, damping: 13, delay: 0.12 }}
              className="grid h-16 w-16 place-items-center rounded-full border border-[#8d77c7]/40 bg-[#8d77c7]/10 text-[#c5b8ec] shadow-[0_0_40px_rgba(103,83,159,0.2)]"
            >
              <Check size={28} strokeWidth={1.7} aria-hidden="true" />
            </motion.span>
            <h3 className="mt-6 text-2xl font-light tracking-tight">Заявка принята</h3>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">
              Скоро напишем вам в Telegram и уточним детали заказа.
            </p>
            <button
              type="button"
              onClick={() => {
                setValues({ ...initialValues });
                setErrors({});
                setServerError("");
                setLoading(false);
                setStatus("idle");
              }}
              className="mt-8 rounded-full border border-white/15 px-5 py-2.5 text-xs text-white/70 transition hover:border-[#8d77c7]/55 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a995df]"
            >
              Оставить ещё одну заявку
            </button>
          </motion.div>
        ) : (
          <motion.form
            key={`form-${mounted ? "mounted" : "server"}`}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.075, delayChildren: 0.12 } },
            }}
            initial={mounted ? "hidden" : false}
            animate="visible"
            exit={{ opacity: 0, y: -8 }}
          >
            <motion.div variants={fieldMotion} transition={{ duration: 0.42 }}>
              <div className="relative">
                <textarea
                  ref={itemRef}
                  id={`${formId}-item`}
                  rows={2}
                  value={values.item}
                  onChange={(event) => updateField("item", event.target.value)}
                  placeholder=" "
                  aria-invalid={Boolean(errors.item)}
                  aria-describedby={errors.item ? `${formId}-item-error` : undefined}
                  className={`${inputClass(Boolean(errors.item))} min-h-[84px] resize-y`}
                />
                <label htmlFor={`${formId}-item`} className={labelClass}>Название товара или вещи *</label>
              </div>
              <AnimatePresence>{errors.item && <FieldError id={`${formId}-item-error`} message={errors.item} />}</AnimatePresence>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div variants={fieldMotion} transition={{ duration: 0.42 }}>
                <div className="relative">
                  <input
                    id={`${formId}-size`}
                    value={values.size}
                    onChange={(event) => updateField("size", event.target.value)}
                    placeholder=" "
                    aria-invalid={Boolean(errors.size)}
                    aria-describedby={errors.size ? `${formId}-size-error` : undefined}
                    className={inputClass(Boolean(errors.size))}
                  />
                  <label htmlFor={`${formId}-size`} className={labelClass}>Размер *</label>
                </div>
                <AnimatePresence>{errors.size && <FieldError id={`${formId}-size-error`} message={errors.size} />}</AnimatePresence>
              </motion.div>
              <motion.div variants={fieldMotion} transition={{ duration: 0.42 }}>
                <div className="relative">
                  <input
                    id={`${formId}-budget`}
                    value={values.budget}
                    onChange={(event) => updateField("budget", event.target.value)}
                    placeholder=" "
                    inputMode="decimal"
                    className={inputClass(false)}
                  />
                  <label htmlFor={`${formId}-budget`} className={labelClass}>Бюджет · необязательно</label>
                </div>
              </motion.div>
            </div>

            <motion.div variants={fieldMotion} transition={{ duration: 0.42 }}>
              <div className="relative">
                <input
                  id={`${formId}-address`}
                  value={values.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  placeholder="Город *"
                  autoComplete="address-level2"
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={errors.address ? `${formId}-address-error` : undefined}
                  className={inputClass(Boolean(errors.address))}
                />
                <label htmlFor={`${formId}-address`} className={labelClass}>Город *</label>
              </div>
              <AnimatePresence>{errors.address && <FieldError id={`${formId}-address-error`} message={errors.address} />}</AnimatePresence>
            </motion.div>

            <motion.fieldset variants={fieldMotion} transition={{ duration: 0.42 }}>
              <legend className="mb-2 text-[11px] tracking-wide text-white/55">Способ оплаты</legend>
              <div className="grid grid-cols-3 gap-2">
                {paymentOptions.map((option) => {
                  const selected = values.payment === option;
                  return (
                    <label
                      key={option}
                      className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 py-2 text-center text-[11px] transition duration-200 focus-within:ring-2 focus-within:ring-[#8d77c7]/45 sm:text-xs ${
                        selected
                          ? "border-[#8d77c7]/60 bg-[#8d77c7]/[0.13] text-[#ded6f8] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                          : "border-white/10 bg-black/15 text-white/55 hover:border-white/25 hover:text-white/80"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${formId}-payment`}
                        value={option}
                        checked={selected}
                        onChange={() => updateField("payment", option)}
                        className="sr-only"
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
              <AnimatePresence>{errors.payment && <FieldError id={`${formId}-payment-error`} message={errors.payment} />}</AnimatePresence>
            </motion.fieldset>

            <motion.div variants={fieldMotion} transition={{ duration: 0.42 }}>
              <div className="relative">
                <input
                  id={`${formId}-telegram`}
                  value={values.telegram}
                  onChange={(event) => updateField("telegram", event.target.value)}
                  placeholder=" "
                  autoComplete="username"
                  autoCapitalize="none"
                  aria-invalid={Boolean(errors.telegram)}
                  aria-describedby={errors.telegram ? `${formId}-telegram-error` : undefined}
                  className={inputClass(Boolean(errors.telegram))}
                />
                <label htmlFor={`${formId}-telegram`} className={labelClass}>Telegram для связи · @username *</label>
              </div>
              <AnimatePresence>{errors.telegram && <FieldError id={`${formId}-telegram-error`} message={errors.telegram} />}</AnimatePresence>
            </motion.div>

            <AnimatePresence>
              {status === "error" && serverError && (
                <motion.p
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg border border-rose-300/20 bg-rose-300/[0.07] px-3 py-2 text-xs text-rose-200"
                  role="alert"
                >
                  {serverError}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div variants={fieldMotion} transition={{ duration: 0.42 }} className="pt-1">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={loading ? undefined : { scale: 1.012 }}
                whileTap={loading ? undefined : { scale: 0.985 }}
                className="group relative flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#6955a8] via-[#58458f] to-[#48366f] px-5 py-3 text-sm font-medium text-white shadow-[0_10px_35px_rgba(67,49,111,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] transition-shadow hover:shadow-[0_12px_42px_rgba(103,83,159,0.32),inset_0_1px_0_rgba(255,255,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b7a7e6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121110] disabled:cursor-wait disabled:opacity-75"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center gap-2">
                  {loading ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : null}
                  {loading ? "Отправляем заявку" : "Отправить заявку"}
                  {!loading && <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />}
                </span>
              </motion.button>
            </motion.div>
            <motion.p variants={fieldMotion} transition={{ duration: 0.42 }} className="text-center text-[10px] leading-5 text-white/35">
              Нажимая кнопку, вы соглашаетесь на обработку данных MyShop для связи по заказу.
            </motion.p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <motion.p
      id={id}
      initial={{ opacity: 0, height: 0, y: -4 }}
      animate={{ opacity: 1, height: "auto", y: 0 }}
      exit={{ opacity: 0, height: 0, y: -3 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden pt-1.5 text-[11px] text-rose-200"
      role="alert"
    >
      {message}
    </motion.p>
  );
}
