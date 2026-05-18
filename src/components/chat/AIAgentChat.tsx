import { useState, useRef, useEffect, useMemo } from "react";
import { MessageCircle, X, Send, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSafaris } from "@/hooks/useSafaris";
import { useDestinations } from "@/hooks/useDestinations";
import { useBlogs } from "@/hooks/useBlogs";
import { useDestinationLodges } from "@/hooks/useDestinationLodges";
import { useLodgesServiceShowcaseCards } from "@/hooks/useLodgesServiceShowcase";
import OptimizedImage from "@/components/ui/optimized-image";
import { hasSupabaseEnv, supabase } from "@/integrations/supabase/client";
import {
  ASHLEY_DISPLAY_NAME,
  ASHLEY_TITLE,
  CONTACT_EMAIL,
  CONTACT_EMAILS_DISPLAY,
  SITE_ROUTES,
  TAMBUA_SERVICES,
  WHATSAPP_DISPLAY,
  pageLabelFromPath,
} from "@/lib/ashley-knowledge";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Topic = "ticketing" | "transfers" | "lodges" | "safaris" | "destinations" | "pricing" | null;

const ASHLEY_AVATAR = "/images/real images frm Tambua/Team/Ashley Marenya ~ Director (Marketing).jpeg";

const QUICK_PROMPTS = [
  "Safari ideas for me",
  "Flights & ticketing",
  "Transfers & drivers",
  "Lodge recommendations",
  "How do I book?",
];

export const AIAgentChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi, I’m ${ASHLEY_DISPLAY_NAME} from Tambua Africa 👋 Tell me what you’re planning and I’ll help you step by step with safari ideas, lodge/camp options, flights, road tickets, transfers, or budgeting.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  const { isAdmin } = useAuth();
  const { data: safaris = [] } = useSafaris();
  const { data: destinations = [] } = useDestinations();
  const { data: blogs = [] } = useBlogs();
  const { data: lodgeGroups = [] } = useDestinationLodges();
  const { cards: serviceLodgeCards = [] } = useLodgesServiceShowcaseCards();
  const location = useLocation();

  const pageLabel = useMemo(() => pageLabelFromPath(location.pathname), [location.pathname]);

  const catalog = useMemo(() => {
    const safariTitles = safaris.slice(0, 8).map((s) => s.title);
    const destNames = destinations.slice(0, 10).map((d) => d.name);
    return {
      safarisCount: safaris.length,
      destinationsCount: destinations.length,
      blogsCount: blogs.length,
      safariTitles,
      destNames,
    };
  }, [safaris, destinations, blogs]);

  const lodgeCatalogContext = useMemo(() => {
    const totalLodges = lodgeGroups.reduce((sum, group) => sum + group.lodges.length, 0);
    const parts: string[] = [];
    parts.push(`Live lodge and camp catalogue: ${lodgeGroups.length} destination groups, ${totalLodges} lodges/camps total.`);
    lodgeGroups.slice(0, 16).forEach((group) => {
      const names = group.lodges.slice(0, 5).map((lodge) => lodge.name).join(", ");
      parts.push(`- ${group.destinationName} (${group.lodges.length}): ${names}${group.lodges.length > 5 ? ", and more" : ""}`);
    });
    if (serviceLodgeCards.length > 0) {
      parts.push("Lodges service showcase:");
      serviceLodgeCards.slice(0, 10).forEach((card) => {
        parts.push(`- ${card.name} | ${card.area} | ${card.category}`);
      });
    }
    return parts.join("\n");
  }, [lodgeGroups, serviceLodgeCards]);

  const catalogContext = useMemo(() => {
    const parts: string[] = [];
    parts.push(
      `Catalogue: ${safaris.length} safari packages, ${destinations.length} destinations, ${blogs.length} blog posts.`,
    );
    if (safaris.length > 0) {
      parts.push("Safaris (title | duration | USD from | category | area):");
      safaris.slice(0, 18).forEach((s) => {
        parts.push(`- ${s.title} | ${s.duration} | $${s.price} | ${s.category} | ${s.location}`);
      });
    }
    if (destinations.length > 0) {
      parts.push("Destinations (name and country):");
      destinations.slice(0, 18).forEach((d) => parts.push(`- ${d.name}, ${d.country}`));
    }
    if (blogs.length > 0) {
      parts.push("Blog titles:");
      blogs.slice(0, 10).forEach((b) => parts.push(`- ${b.title}`));
    }
    if (lodgeCatalogContext) {
      parts.push(lodgeCatalogContext);
    }
    parts.push(`Services summary: ${TAMBUA_SERVICES.ticketing} ${TAMBUA_SERVICES.transfers} ${TAMBUA_SERVICES.lodges}`);
    parts.push(
      `Site paths: home ${SITE_ROUTES.home}; safaris ${SITE_ROUTES.safaris}; destinations ${SITE_ROUTES.destinations}; services hub ${SITE_ROUTES.services}; ticketing ${SITE_ROUTES.servicesTicketing}; transfers ${SITE_ROUTES.servicesTransfers}; lodges ${SITE_ROUTES.servicesLodges}; contact ${SITE_ROUTES.contact}; travel-info ${SITE_ROUTES.travelInfo}; blog ${SITE_ROUTES.blog}; booking ${SITE_ROUTES.booking}.`,
    );
    return parts.join("\n");
  }, [safaris, destinations, blogs, lodgeCatalogContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);
  const closeChat = () => setIsOpen(false);

  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim();
  const hasAny = (text: string, words: string[]) => words.some((word) => text.includes(word));

  const pathHint = () =>
    pageLabel ? `\n\n(You’re on the ${pageLabel} page, tell me if you want a shortcut to the right section.)` : "";

  const topicFromText = (q: string): Topic => {
    if (
      hasAny(q, [
        "ticket",
        "ticketing",
        "flight",
        "flights",
        "airline",
        "airport",
        "coach",
        "bus",
        "shuttle",
        "domestic flight",
        "international flight",
      ])
    ) {
      return "ticketing";
    }
    if (
      hasAny(q, [
        "transfer",
        "transfers",
        "pickup",
        "airport pickup",
        "driver",
        "road transfer",
        "ground transport",
      ])
    ) {
      return "transfers";
    }
    if (hasAny(q, ["lodge", "lodges", "camp", "hotel", "accommodation", "where to stay", "sleep"])) {
      return "lodges";
    }
    if (hasAny(q, ["destination", "where to go", "place to visit", "park", "country"])) {
      return "destinations";
    }
    if (hasAny(q, ["safari", "itinerary", "package", "trip"])) {
      return "safaris";
    }
    if (hasAny(q, ["price", "cost", "budget", "cheap", "afford", "expensive", "how much"])) {
      return "pricing";
    }
    return null;
  };

  const shortFollowUp = (q: string) => q.split(" ").length <= 4;

  const lastUserTopic = (thread: Message[]) => {
    for (let i = thread.length - 1; i >= 0; i -= 1) {
      if (thread[i].role !== "user") continue;
      const t = topicFromText(normalize(thread[i].content));
      if (t) return t;
    }
    return null;
  };

  const pickTopSafaris = (
    count: number,
    filter?: (title: string, category: string, description: string) => boolean,
  ) => {
    return safaris
      .filter((s) =>
        filter ? filter(s.title.toLowerCase(), s.category.toLowerCase(), s.description.toLowerCase()) : true,
      )
      .sort((a, b) => b.rating - a.rating || a.price - b.price)
      .slice(0, count);
  };

  const buildReply = (userText: string, thread: Message[]) => {
    const q = normalize(userText);
    const { safarisCount, destinationsCount, blogsCount, safariTitles, destNames } = catalog;
    const currentTopic = topicFromText(q);
    const previousTopic = lastUserTopic(thread.slice(0, -1));
    const activeTopic = currentTopic === "pricing" && shortFollowUp(q) ? previousTopic : currentTopic || previousTopic;

    if (hasAny(q, ["hello", "hi", "jambo", "hey", "good morning", "good afternoon", "evening"])) {
      return `Karibu! Great to meet you. Are you planning safari-only, or safari + tickets/lodges? Share month, number of people, and budget level, then I’ll suggest the best options.`;
    }

    if (
      hasAny(q, [
        "ticket",
        "ticketing",
        "flight",
        "flights",
        "airline",
        "airport",
        "coach",
        "bus",
        "shuttle",
        "domestic flight",
        "international flight",
      ])
    ) {
      return `Perfect, we can handle ticketing on your behalf.\n\nWe help with international arrivals, domestic Kenya flights (including Wilson routes), and long-distance coach tickets where road travel makes sense. Share your route + dates and I’ll guide what to book first.\n\nDetails: ${SITE_ROUTES.servicesTicketing}\nQuick quote: ${SITE_ROUTES.contact}?topic=ticketing or WhatsApp ${WHATSAPP_DISPLAY}`;
    }

    if (
      hasAny(q, [
        "transfer",
        "transfers",
        "pickup",
        "airport pickup",
        "driver",
        "shuttle",
        "charter",
        "road transfer",
        "ground transport",
      ])
    ) {
      return `Absolutely, we coordinate transfers end to end (airport, hotel, park gates, and airstrip pickups).\n\nIf you send flight details and first/last hotel, we can map the cleanest timing and avoid missed connections.\n\nDetails: ${SITE_ROUTES.servicesTransfers}\nQuote: ${SITE_ROUTES.contact}?topic=transfers · WhatsApp ${WHATSAPP_DISPLAY}`;
    }

    if (
      hasAny(q, [
        "lodge",
        "lodges",
        "camp",
        "hotel",
        "accommodation",
        "where to stay",
        "sleep",
        "booking a lodge",
      ])
    ) {
      return `Yes, we can book lodges and camps for you based on your exact preferences.\n\nTell me your parks, budget band (budget/mid/luxury), and style (lodge vs tented camp). We’ll shortlist options and handle reservations.\n\nKenya lodge/camp examples: ${SITE_ROUTES.servicesLodges}\nCurated destinations: ${SITE_ROUTES.destinations}\nQuote: ${SITE_ROUTES.contact}?topic=lodges`;
    }

    if (hasAny(q, ["who are you", "your name", "ashley", "human", "real person", "bot", "ai"])) {
      return `I’m ${ASHLEY_DISPLAY_NAME}, a guided assistant built for Tambua Africa so you get quick, accurate answers from our published packages and pages. For bespoke quotes or ticket rules, our team confirms details on WhatsApp (${WHATSAPP_DISPLAY}) or ${CONTACT_EMAIL}.${pathHint()}`;
    }

    if (hasAny(q, ["book", "booking", "reserve", "reservation"])) {
      return `For safari packages, open any trip on Safaris, use Book Now, and share dates and guests so we can follow up to confirm logistics. For tickets, transfers, or lodges only, read ${SITE_ROUTES.services} then use Contact with your itinerary sketch.\n\nSafaris: ${SITE_ROUTES.safaris} · Services: ${SITE_ROUTES.services} · Contact: ${SITE_ROUTES.contact}${pathHint()}`;
    }

    if (hasAny(q, ["pay", "payment", "mpesa", "m-pesa", "card", "checkout", "invoice"])) {
      return `Payments are usually completed during the booking flow (card where enabled, M-Pesa where set up). If checkout pauses, we continue on WhatsApp (${WHATSAPP_DISPLAY}) so nothing slips. I can still help you pick the right package first.${pathHint()}`;
    }

    if (hasAny(q, ["contact", "whatsapp", "phone", "email", "support", "reach you", "talk to"])) {
      return `Best ways to reach us: WhatsApp ${WHATSAPP_DISPLAY}, email ${CONTACT_EMAILS_DISPLAY}, or the form on the Contact page (${SITE_ROUTES.contact}). Tell us dates, party size, and whether you need flights or lodges too, and we reply quickly.${pathHint()}`;
    }

    if (hasAny(q, ["destination", "where should i", "where to go", "place to visit", "park", "country"])) {
      if (destinationsCount > 0 && destNames.length > 0) {
        return `We feature ${destinationsCount} destinations right now, including ${destNames.slice(0, 5).join(", ")}${destNames.length > 5 ? ", and more" : ""}. Tell me wildlife vs beach vs culture and how many days you have; I’ll narrow it down.\n\nExplore: ${SITE_ROUTES.destinations}${pathHint()}`;
      }
      return `We plan across Kenya, Tanzania, Uganda, Rwanda, and the coast. Once destinations load on the site, I can name exact listings; meanwhile open Destinations for the full map.${pathHint()}`;
    }

    if (hasAny(q, ["price", "cost", "budget", "cheap", "afford", "expensive", "how much"])) {
      if (activeTopic === "ticketing") {
        return `On ticketing, cost depends on route + month + luggage + how early we book.\n\nIf you share your exact route (for example home city → Nairobi → Mara) and dates, I can give you a realistic range before we quote formally.`;
      }
      if (activeTopic === "lodges") {
        return `For lodges/camps, price mostly depends on park, season, and comfort level.\n\nAs a quick guide in Kenya: budget camps are usually the lowest, mid-range lodges sit in the middle, and luxury tented camps are highest, especially in peak migration months. Tell me your park + nights and I’ll narrow this down properly.`;
      }
      if (activeTopic === "transfers") {
        return `Transfer pricing depends on distance, vehicle type, and whether it’s one-way or multi-day support.\n\nShare pickup and drop-off points (plus people/luggage count) and I’ll shape an accurate estimate for you.`;
      }
      const prices = safaris.map((s) => s.price).filter((n) => Number.isFinite(n));
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return `Great question. From what’s currently published, safari packages are roughly $${min} to $${max} per person (depends on nights, season, and lodge level).\n\nIf you want, tell me your budget and travel month and I’ll recommend 2 to 3 options that fit best.\nSee all packages: ${SITE_ROUTES.safaris}`;
      }
      return `Pricing depends on season, parks, and lodge level. Share dates + budget and I’ll help you narrow realistic options quickly.`;
    }

    if (hasAny(q, ["recommend", "suggest", "best safari", "which safari", "idea", "proposal"])) {
      const wantsBeach = hasAny(q, ["beach", "coast", "diani", "watamu", "chale", "mombasa", "zanzibar"]);
      const wantsAdventure = hasAny(q, ["hiking", "climbing", "adventure", "cycling", "trek"]);
      const wantsCulture = hasAny(q, ["culture", "cultural", "maasai", "lamu"]);

      let picks = pickTopSafaris(3);
      if (wantsBeach) {
        picks = pickTopSafaris(3, (title, category, description) =>
          [title, category, description].some((x) => x.includes("beach")),
        );
      } else if (wantsAdventure) {
        picks = pickTopSafaris(3, (title, category) =>
          [title, category].some((x) => x.includes("adventure")),
        );
      } else if (wantsCulture) {
        picks = pickTopSafaris(3, (title, category) =>
          [title, category].some((x) => x.includes("cultural")),
        );
      }

      if (picks.length > 0) {
        const lines = picks.map((s) => `• ${s.title}, ${s.duration}, from about $${s.price} pp`).join("\n");
        return `Here are a few strong picks from what’s live on the site today:\n${lines}\n\nTell me your month and group size and I’ll refine. Full list: ${SITE_ROUTES.safaris}${pathHint()}`;
      }
      return `I’d start with Mara / Amboseli classics or a coast add-on once I know your dates. Open Safaris when you’re ready to compare names side by side.${pathHint()}`;
    }

    if (safarisCount > 0 && hasAny(q, ["days", "duration", "long", "short", "weekend", "how many nights"])) {
      const shortTrips = safaris
        .filter((s) => {
          const d = s.duration.toLowerCase();
          return d.includes("2 day") || d.includes("3 day");
        })
        .slice(0, 3);
      if (shortTrips.length > 0) {
        const list = shortTrips.map((s) => `${s.title} (${s.duration})`).join(", ");
        return `For shorter getaways, have a look at: ${list}. If you want a longer circuit, say how many nights total and which country.${pathHint()}`;
      }
    }

    if (hasAny(q, ["blog", "article", "tips", "travel info", "advice", "packing", "visa"])) {
      return blogsCount > 0
        ? `We have ${blogsCount} articles in Blog right now with planning tips. For visas and health formalities, Travel info is a good companion read: ${SITE_ROUTES.travelInfo}${pathHint()}`
        : `Head to Travel info (${SITE_ROUTES.travelInfo}) and Blog (${SITE_ROUTES.blog}) for planning notes, and we add new posts as we publish them.${pathHint()}`;
    }

    if (isAdmin && hasAny(q, ["admin", "dashboard", "cms", "backend"])) {
      return `You’re signed in with team access. Use the admin menu for bookings, content, lodges, and carousel images. I stay on the public site knowledge here, and you can open the dashboard sections for operational tasks.${pathHint()}`;
    }

    const liveLine =
      safarisCount || destinationsCount || blogsCount
        ? `\n\nRight now the site shows ${safarisCount} safari packages, ${destinationsCount} destinations, and ${blogsCount} blog posts. I refresh these numbers as you browse.`
        : "";

    const sample =
      safariTitles.length > 0
        ? ` Examples you can open: ${safariTitles.slice(0, 3).join("; ")}.`
        : "";

    return `Got you. I can help with safari planning, lodges/camps, transfers, and ticketing.${liveLine}${sample}\n\nTell me your destination idea + month + budget level, and I’ll give you a tailored next step.`;
  };

  const completeAssistantTurn = async (threadAfterUser: Message[]) => {
    setIsTyping(true);
    const lastUser = [...threadAfterUser].reverse().find((m) => m.role === "user");
    const lastUserText = lastUser?.content ?? "";

    try {
      if (hasSupabaseEnv) {
        const payloadMessages = threadAfterUser
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content }));

        const { data, error } = await supabase.functions.invoke<{ reply?: string; error?: string }>("gemini-chat", {
          body: {
            messages: payloadMessages,
            catalogContext,
            pagePath: location.pathname,
          },
        });

        const reply = data && typeof data.reply === "string" ? data.reply.trim() : "";
        if (!error && reply) {
          setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: reply }]);
          return;
        }
      }
    } catch (err) {
      console.warn("gemini-chat unavailable, using offline replies", err);
    }

    const fallback = buildReply(lastUserText, threadAfterUser);
    setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: fallback }]);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    const currentInput = input.trim();
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: currentInput };
    const thread = [...messages, userMsg];
    setMessages(thread);
    setInput("");
    try {
      await completeAssistantTurn(thread);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isTyping) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: prompt };
    const thread = [...messages, userMsg];
    setMessages(thread);
    setInput("");
    try {
      await completeAssistantTurn(thread);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current == null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
    const deltaY = endY - touchStartY.current;
    touchStartY.current = null;

    if (deltaY > 90) {
      closeChat();
    }
  };

  if (location.pathname.startsWith("/admin") && !isAdmin) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={toggleChat}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center rounded-full bg-primary p-3.5 text-primary-foreground shadow-2xl ring-2 ring-background transition-transform hover:scale-105 sm:p-4"
        aria-label={`Message ${ASHLEY_DISPLAY_NAME}`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 left-3 right-3 z-50 flex h-[72vh] max-h-[640px] w-auto flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-in sm:left-6 sm:right-auto sm:h-[520px] sm:w-[420px]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative border-b border-border bg-gradient-to-r from-primary/10 via-card to-accent/5 px-4 pb-3 pt-6 sm:pt-4">
            <div className="absolute left-1/2 top-2 hidden h-1.5 w-12 -translate-x-1/2 rounded-full bg-muted sm:block" />
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 ring-border">
                <OptimizedImage src={ASHLEY_AVATAR} alt={ASHLEY_DISPLAY_NAME} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-foreground">{ASHLEY_DISPLAY_NAME}</h3>
                <p className="truncate text-xs text-muted-foreground">{ASHLEY_TITLE}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ${
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted ring-1 ring-border"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <OptimizedImage
                      src={ASHLEY_AVATAR}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted/80 text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border">
                  <OptimizedImage src={ASHLEY_AVATAR} alt="" className="h-full w-full object-cover opacity-80" />
                </div>
                <div className="flex max-w-[82%] items-center gap-2 rounded-2xl rounded-tl-sm bg-muted/80 px-4 py-2.5 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span>One moment…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="border-t border-border bg-card p-3">
            <div className="relative flex items-center">
              <Input
                placeholder={`Message ${ASHLEY_DISPLAY_NAME}…`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="rounded-full border-border bg-muted/40 pr-12 focus-visible:ring-1"
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className="absolute right-1 h-8 w-8 rounded-full text-primary hover:bg-transparent"
                disabled={!input.trim() || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
