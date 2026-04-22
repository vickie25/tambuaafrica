import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSafaris } from "@/hooks/useSafaris";
import { useDestinations } from "@/hooks/useDestinations";
import { useBlogs } from "@/hooks/useBlogs";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const QUICK_PROMPTS = [
  "Recommend me a safari",
  "Budget options",
  "Beach packages",
  "How to book",
];

export const AIAgentChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Jambo! I'm your Tambua Safari Assistant. Ask me about destinations, safari packages, pricing ranges, bookings, payments, or contact support.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  
  const { user } = useAuth();
  const { data: safaris } = useSafaris();
  const { data: destinations } = useDestinations();
  const { data: blogs } = useBlogs();
  const location = useLocation();

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

  const pickTopSafaris = (count: number, filter?: (title: string, category: string, description: string) => boolean) => {
    const list = (safaris || [])
      .filter((s) => (filter ? filter(s.title.toLowerCase(), s.category.toLowerCase(), s.description.toLowerCase()) : true))
      .sort((a, b) => b.rating - a.rating || a.price - b.price)
      .slice(0, count);
    return list;
  };

  const buildReply = (userText: string) => {
    const q = normalize(userText);
    const safarisCount = safaris?.length || 0;
    const destinationsCount = destinations?.length || 0;
    const publishedBlogsCount = blogs?.length || 0;

    if (hasAny(q, ["hello", "hi", "jambo", "hey"])) {
      return "Karibu! I can help you choose safaris by budget, duration, destination, or travel style (wildlife, beach, adventure, culture).";
    }

    if (hasAny(q, ["book", "booking", "reserve", "reservation"])) {
      return "You can book directly from any safari card using 'Book Now'. We collect your trip details, then support card/M-Pesa flow where available, and WhatsApp follow-up for quick confirmation.";
    }

    if (hasAny(q, ["pay", "payment", "mpesa", "m-pesa", "card", "checkout"])) {
      return "Payments are handled during booking. If checkout is unavailable, we guide clients to continue via WhatsApp and finalize with the Tambua team. I can help you pick a package before payment.";
    }

    if (hasAny(q, ["contact", "whatsapp", "phone", "email", "support"])) {
      return "You can reach Tambua quickly via WhatsApp: +254 704 548 878. The Contact page form also opens direct WhatsApp follow-up for faster assistance.";
    }

    if (hasAny(q, ["destination", "where", "place", "visit"])) {
      const featured = (destinations || []).slice(0, 6).map((d) => d.name).join(", ");
      return destinationsCount > 0
        ? `We currently feature ${destinationsCount} destinations, including: ${featured}. Tell me your style (wildlife, beach, culture, hiking) and I'll suggest the best match.`
        : "We offer Kenya and East Africa experiences including Maasai Mara, Tsavo, Amboseli, Naivasha/Nakuru, and coastal escapes like Diani.";
    }

    if (hasAny(q, ["price", "cost", "budget", "cheap", "afford"])) {
      const prices = (safaris || []).map((s) => s.price).filter((n) => Number.isFinite(n));
      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return `Current package range is about $${min} to $${max}, depending on duration and comfort level. Share your budget and preferred days, and I'll suggest fitting options.`;
      }
      return "Safari pricing depends on destination, days, and comfort level. Share your budget and travel dates and I can guide the best options.";
    }

    if (hasAny(q, ["recommend", "suggest", "best safari", "which safari"])) {
      const wantsBeach = hasAny(q, ["beach", "coast", "diani", "watamu", "chale", "mombasa"]);
      const wantsAdventure = hasAny(q, ["hiking", "climbing", "adventure", "cycling", "trek"]);
      const wantsCulture = hasAny(q, ["culture", "cultural", "maasai", "lamu"]);

      let picks = pickTopSafaris(3);
      if (wantsBeach) {
        picks = pickTopSafaris(3, (title, category, description) => title.includes("beach") || category.includes("beach") || description.includes("beach"));
      } else if (wantsAdventure) {
        picks = pickTopSafaris(3, (title, category) => title.includes("adventure") || category.includes("adventure"));
      } else if (wantsCulture) {
        picks = pickTopSafaris(3, (title, category) => title.includes("cultural") || category.includes("cultural"));
      }

      if (picks.length > 0) {
        const lines = picks.map((s) => `- ${s.title} (${s.duration}) from $${s.price}`).join("\n");
        return `Great choices based on current Tambua packages:\n${lines}\n\nTell me your travel month and group size and I’ll narrow this to the best fit.`;
      }
      return "I recommend starting with Maasai Mara, Amboseli, or Diani Beach options. Share your budget and days available so I can tailor the best match.";
    }

    if (safarisCount > 0 && hasAny(q, ["days", "duration", "long", "short", "weekend"])) {
      const shortTrips = (safaris || []).filter((s) => s.duration.toLowerCase().includes("2 days") || s.duration.toLowerCase().includes("3 days")).slice(0, 3);
      if (shortTrips.length > 0) {
        const list = shortTrips.map((s) => `${s.title} (${s.duration})`).join(", ");
        return `For shorter trips, popular choices are: ${list}. I can also suggest 5-10 day circuits if you want a deeper safari route.`;
      }
    }

    if (hasAny(q, ["blog", "article", "tips", "travel info", "advice"])) {
      return publishedBlogsCount > 0
        ? `We currently have ${publishedBlogsCount} published travel posts with planning tips and destination insights. You can browse them in the Blog section.`
        : "You can use our Blog section for travel planning tips, park insights, and booking advice.";
    }

    if (user?.role === "admin" && hasAny(q, ["analyze", "analytics", "report"])) {
      return `Quick snapshot: ${safarisCount} safaris loaded, ${destinationsCount} destinations loaded, ${publishedBlogsCount} published blogs. For deeper analytics, use the admin dashboard sections.`;
    }

    return "I can help with destinations, package recommendations, prices, duration planning, booking, and payment guidance. Tell me your budget, travel dates, and interests to get a tailored suggestion.";
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    const currentInput = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: currentInput };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Knowledge-based response builder for Tambua content
    setTimeout(() => {
      const response = buildReply(userMsg.content);

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isTyping) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = buildReply(prompt);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current == null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY.current;
    const deltaY = endY - touchStartY.current;
    touchStartY.current = null;

    // Close when user swipes down on mobile.
    if (deltaY > 90) {
      closeChat();
    }
  };

  if (location.pathname.startsWith("/admin") && user?.role !== "admin") {
    return null; // Don't show on admin routes unless actually admin
  }

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 left-6 p-4 rounded-full bg-accent text-accent-foreground shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-24 left-3 right-3 sm:left-6 sm:right-auto w-auto sm:w-[400px] h-[70vh] sm:h-[500px] max-h-[80vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className="bg-primary/5 p-4 border-b border-border flex items-center gap-3">
            <div className="absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-muted sm:hidden" />
            <div className="bg-accent/20 p-2 rounded-full mt-2 sm:mt-0">
              <Bot className="w-5 h-5 text-accent" />
            </div>
            <div className="mt-2 sm:mt-0">
              <h3 className="font-semibold text-sm">Tambua AI Assistant</h3>
              <p className="text-xs text-muted-foreground">{user?.role === "admin" ? "Admin Mode Active" : "Online and ready to help"}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="rounded-full border border-border bg-muted/60 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm bg-muted text-foreground rounded-tl-sm flex items-center gap-2">
                  <span className="animate-pulse">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-border bg-card">
            <div className="relative flex items-center">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="pr-12 rounded-full border-border bg-muted/50 focus-visible:ring-1"
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 w-8 h-8 rounded-full hover:bg-transparent text-accent"
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
