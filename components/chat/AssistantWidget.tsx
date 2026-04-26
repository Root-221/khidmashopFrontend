"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Loader2,
  MessageSquareMore,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type {
  AssistantMessage,
  AssistantProduct,
  AssistantReply,
  AssistantSuggestion,
} from "@/types/assistant";
import {
  assistantName,
  assistantQuickPrompts,
  assistantWelcomeMessage,
} from "@/constants/assistant";

const STORAGE_KEY = "khidma-shop.assistant.thread";

const WELCOME_MESSAGE: AssistantMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content: assistantWelcomeMessage,
  createdAt: 0,
  suggestions: assistantQuickPrompts,
};

function createMessageId(prefix: "user" | "assistant") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(value))} FCFA`;
}

function createFallbackReply(message: string): AssistantMessage {
  const normalized = message.trim().toLowerCase();
  let content =
    "Je n’ai pas pu charger la réponse complète pour le moment, mais je peux quand même t’aider à trouver un produit, voir ton panier ou suivre tes commandes.";

  if (normalized.includes("annuler")) {
    content =
      "Une commande peut être annulée seulement si elle n’a pas encore été préparée et si elle date de moins de 30 minutes.";
  } else if (normalized.includes("commande") || normalized.includes("checkout")) {
    content =
      "Pour commander, ajoute d’abord tes articles au panier, puis confirme ta commande. Si tu veux, je peux aussi t’aider à retrouver une commande.";
  }

  return {
    id: createMessageId("assistant"),
    role: "assistant",
    content,
    createdAt: Date.now(),
    suggestions: assistantQuickPrompts,
  };
}

function MessageProducts({ products }: { products: AssistantProduct[] }) {
  if (!products.length) {
    return null;
  }

  return (
    <div className="mt-3 grid w-full max-w-full gap-2">
      {products.map((product) => (
        <Link
          key={product.id}
          href={product.href}
          className="group flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-[1.2rem] border border-black/10 bg-white p-2.5 transition hover:border-black/20 hover:bg-black/[0.02]"
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1rem] bg-black/5">
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="56px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-black">{product.name}</p>
            <p className="truncate text-[11px] uppercase tracking-[0.22em] text-black/45">
              {product.brand}
              {product.categoryName ? ` · ${product.categoryName}` : ""}
            </p>
            <p className="mt-1 text-sm font-medium text-black/80">{formatCurrency(product.price)}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-black/35 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-black/70" />
        </Link>
      ))}
    </div>
  );
}

function SuggestionPills({
  suggestions,
  onPick,
}: {
  suggestions: AssistantSuggestion[];
  onPick: (label: string) => void;
}) {
  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {suggestions.map((suggestion) =>
        suggestion.href ? (
          <Link
            key={`${suggestion.label}-${suggestion.href}`}
            href={suggestion.href}
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/70 transition hover:border-black/20 hover:bg-black/5"
          >
            {suggestion.label}
          </Link>
        ) : (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => onPick(suggestion.label)}
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/70 transition hover:border-black/20 hover:bg-black/5"
          >
            {suggestion.label}
          </button>
        ),
      )}
    </div>
  );
}

export function AssistantWidget() {
  const [messages, setMessages] = useState<AssistantMessage[]>([WELCOME_MESSAGE]);
  const [draft, setDraft] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AssistantMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed.slice(-20));
        }
      }
    } catch {
      setMessages([WELCOME_MESSAGE]);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
  }, [isHydrated, messages]);

  useEffect(() => {
    if (!isOpen) return;

    const node = messagesEndRef.current;
    if (!node) return;

    node.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isOpen, messages]);

  const handleQuickPrompt = (label: string) => {
    setIsOpen(true);
    void submitMessage(label);
  };

  const submitMessage = async (value: string) => {
    const text = value.trim();
    if (!text || isSending) return;

    const userMessage: AssistantMessage = {
      id: createMessageId("user"),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setDraft("");
    setIsOpen(true);
    setIsSending(true);

    try {
      const response = await fetch("/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: conversation.slice(-6).map((entry) => ({
            role: entry.role,
            content: entry.content,
          })),
        }),
      });

      const payload = (await response.json().catch(() => null)) as Partial<AssistantReply> | null;

      if (!response.ok || !payload?.reply) {
        throw new Error((payload as { message?: string } | null)?.message || "Réponse indisponible");
      }

      const assistantMessage: AssistantMessage = {
        id: createMessageId("assistant"),
        role: "assistant",
        content: payload.reply,
        createdAt: Date.now(),
        suggestions: payload.suggestions ?? assistantQuickPrompts,
        products: payload.products ?? [],
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      setMessages((current) => [...current, createFallbackReply(text)]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage(draft);
  };

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full border border-black/10 bg-black px-4 py-3 text-sm font-semibold text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-black/90 md:bottom-6 md:right-6"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">{assistantName}</span>
          <span className="sm:hidden">{assistantName}</span>
        </button>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.aside
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-4 bottom-24 top-16 z-50 flex flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_32px_100px_rgba(15,15,20,0.22)] md:inset-x-auto md:bottom-6 md:right-6 md:top-auto md:h-[680px] md:w-[420px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-black/10 bg-[linear-gradient(135deg,rgba(11,12,18,0.98),rgba(24,28,38,0.95))] px-4 py-4 text-white">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <MessageSquareMore className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{assistantName}</p>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-xs leading-5 text-white/65">
                    Produits, panier et suivi des commandes
                    {isHydrated && messages.length > 1 ? " · session sauvegardée" : ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 bg-white/10 p-2 text-white/70 transition hover:bg-white/15 hover:text-white"
                aria-label="Fermer le chatbot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(11,12,18,0.03),transparent_35%)] px-4 py-4 sm:px-5">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] min-w-0 overflow-hidden rounded-[1.4rem] px-4 py-3 text-sm leading-6 shadow-sm",
                        message.role === "user"
                          ? "rounded-br-md bg-black text-white"
                          : "rounded-bl-md border border-black/10 bg-white text-black",
                      )}
                    >
                      {message.role === "assistant" ? (
                        <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-black/45">
                          <Bot className="h-3.5 w-3.5" />
                          {assistantName}
                        </div>
                      ) : null}
                      <p className="whitespace-pre-line">{message.content}</p>
                      {message.role === "assistant" ? (
                        <>
                          <SuggestionPills suggestions={message.suggestions ?? []} onPick={handleQuickPrompt} />
                          <MessageProducts products={message.products ?? []} />
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}

                {isSending ? (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-[1.4rem] rounded-bl-md border border-black/10 bg-white px-4 py-3 text-sm text-black/50 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Le bot prépare une réponse...</span>
                    </div>
                  </div>
                ) : null}

                {!isSending && messages.length <= 1 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-black/10 bg-black/[0.02] p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-black/45">Raccourcis</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {assistantQuickPrompts.map((prompt) =>
                        prompt.href ? (
                          <Link
                            key={`${prompt.label}-${prompt.href}`}
                            href={prompt.href}
                            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/70 transition hover:border-black/20 hover:bg-black/5"
                          >
                            {prompt.label}
                          </Link>
                        ) : (
                          <button
                            key={prompt.label}
                            type="button"
                            onClick={() => handleQuickPrompt(prompt.label)}
                            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-black/70 transition hover:border-black/20 hover:bg-black/5"
                          >
                            {prompt.label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ) : null}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-black/10 bg-white p-3 sm:p-4">
              <div className="flex items-end gap-2 rounded-[1.4rem] border border-black/10 bg-black/[0.02] p-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Écris ta question..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-black/35"
                />
                <button
                  type="submit"
                  disabled={isSending || !draft.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Envoyer
                </button>
              </div>
            </form>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}
