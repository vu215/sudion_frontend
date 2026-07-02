"use client";

import { useEffect, useRef, useState } from "react";
import {
  getPhotographers,
  type Photographer,
} from "../services/photographer-api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  isHtml?: boolean;
  options?: string[];
};

type FlowState = {
  step: "idle" | "waiting_location" | "waiting_category" | "waiting_budget";
  location?: string;
  category?: string;
  budget?: string;
};

type AiChatResponse = {
  success: boolean;
  message: string;
  data?: {
    provider: string;
    reply: string;
    options?: string[];
  };
};

const STORAGE_KEY = "sudion-ai-chat-history";

const welcomeMessages: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "Xin chào! Tôi là Trợ lý ảo Sudion AI. Rất vui được hỗ trợ bạn.",
  },
  {
    id: "welcome-2",
    sender: "bot",
    text:
      "Tôi có thể giúp bạn tìm photographer phù hợp, tư vấn concept chụp, xem bảng giá, hỏi chính sách cọc/hủy lịch hoặc hướng dẫn đặt lịch.",
    options: [
      "Tìm photographer phù hợp",
      "Gợi ý Concept / Style chụp",
      "Bảng giá dịch vụ trung bình",
      "Đặt lịch như thế nào?",
      "Chính sách cọc & hủy lịch",
    ],
  },
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMoney(value?: number | string | null) {
  const numberValue = Number(value || 0);
  if (!numberValue) return "Liên hệ";
  return `${numberValue.toLocaleString("vi-VN")}đ`;
}

function getPhotographerProfileUrl(id: string | number) {
  return `/photographer-profile?id=${encodeURIComponent(String(id))}`;
}

function plainTextToHtml(text: string) {
  let html = escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");

  html = html.replace(
    /(\/photographer-profile\?id=[A-Za-z0-9_-]+)/g,
    `<a href="$1" class="font-black text-orange-600 underline underline-offset-2">$1</a>`
  );

  html = html.replace(
    /(https?:\/\/[^\s<]+)/g,
    `<a href="$1" target="_blank" rel="noreferrer" class="font-black text-orange-600 underline underline-offset-2">$1</a>`
  );

  return html;
}

function createPhotographerCardHtml(p: Photographer) {
  const avatar = escapeHtml(
    p.avatar_url ||
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80"
  );

  const name = escapeHtml(p.full_name || "Photographer");
  const area = escapeHtml(p.active_area || "Việt Nam");
  const categories = escapeHtml(p.categories || "Đa dạng");
  const rating = escapeHtml(String(p.avg_rating || "5.0"));
  const price = escapeHtml(formatMoney(p.min_price));
  const profileUrl = escapeHtml(getPhotographerProfileUrl(p.id));

  return `
    <div class="my-2 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
      <div class="flex items-center gap-3 p-3">
        <img src="${avatar}" alt="${name}" class="h-12 w-12 shrink-0 rounded-2xl object-cover" />
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-black text-slate-900">${name}</p>
          <p class="truncate text-[11px] font-bold text-slate-400">${area}</p>
          <p class="truncate text-[11px] text-slate-500">${categories}</p>
          <div class="mt-1 flex items-center gap-1.5">
            <span class="text-xs font-black text-amber-500">★ ${rating}</span>
            <span class="text-xs text-slate-300">|</span>
            <span class="text-xs font-bold text-slate-700">Giá từ: ${price}</span>
          </div>
        </div>
        <a href="${profileUrl}" class="shrink-0 rounded-xl bg-orange-500 px-3 py-2 text-[11px] font-black text-white shadow-sm transition hover:bg-orange-600">
          Xem
        </a>
      </div>
    </div>
  `;
}

export function AiConsultantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [flowState, setFlowState] = useState<FlowState>({ step: "idle" });
  const [lastProvider, setLastProvider] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowTooltip(false);
    }, 6000);

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (error) {
      console.error("Không thể đọc lịch sử chatbot:", error);
    }

    async function loadPhotographers() {
      try {
        const data = await getPhotographers();
        setPhotographers(data);
      } catch (error) {
        console.error("Lỗi tải photographer cho chatbot:", error);
      }
    }

    void loadPhotographers();

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages(welcomeMessages);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (messages.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function addBotMessage(text: string, options?: string[], isHtml = false) {
    setMessages((prev) => [
      ...prev,
      {
        id: makeId("bot"),
        sender: "bot",
        text,
        options,
        isHtml,
      },
    ]);
  }

  function addUserMessage(text: string) {
    setMessages((prev) => [
      ...prev,
      {
        id: makeId("user"),
        sender: "user",
        text,
      },
    ]);
  }

  function resetChat() {
    setMessages(welcomeMessages);
    setFlowState({ step: "idle" });
    setInputVal("");
    setLastProvider("");
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(welcomeMessages));
  }

  async function handleSendMessage(text: string) {
    const cleanText = text.trim();

    if (!cleanText || isTyping) return;

    addUserMessage(cleanText);
    setInputVal("");
    setIsTyping(true);

    window.setTimeout(async () => {
      try {
        await processResponse(cleanText);
      } catch (error) {
        console.error("Chatbot error:", error);
        addBotMessage(
          "Xin lỗi, tôi gặp sự cố khi xử lý tin nhắn. Bạn thử lại sau nhé!",
          ["Quay lại menu chính"]
        );
      } finally {
        setIsTyping(false);
      }
    }, 350);
  }

  async function callBackendAI(userInput: string) {
    const response = await fetch(`${API_URL}/ai-chat/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userInput,
        history: messages
          .filter((item) => !item.isHtml)
          .slice(-10)
          .map((item) => ({
            sender: item.sender,
            text: item.text,
          })),
      }),
    });

    const json: AiChatResponse = await response.json();

    if (!response.ok || !json.success || !json.data?.reply) {
      throw new Error(json.message || "Không thể gọi AI backend.");
    }

    setLastProvider(json.data.provider || "backend");
    addBotMessage(json.data.reply, json.data.options || []);
  }

  async function processResponse(userInput: string) {
    const trimmedInput = normalizeText(userInput);

    const isBookingGuideIntent =
      trimmedInput.includes("đặt lịch") ||
      trimmedInput.includes("làm sao để book") ||
      trimmedInput.includes("hướng dẫn book") ||
      trimmedInput.includes("cách book") ||
      trimmedInput.includes("booking như thế nào");

    const isPaymentIntent =
      trimmedInput.includes("thanh toán") ||
      trimmedInput.includes("tiền cọc") ||
      trimmedInput.includes("đặt cọc") ||
      trimmedInput.includes("cọc bao nhiêu") ||
      trimmedInput.includes("chuyển khoản") ||
      trimmedInput.includes("momo") ||
      trimmedInput.includes("vnpay");

    const isCancelIntent =
      trimmedInput.includes("hủy lịch") ||
      trimmedInput.includes("hủy book") ||
      trimmedInput.includes("hoàn tiền") ||
      trimmedInput.includes("đổi lịch") ||
      trimmedInput.includes("hoàn cọc");

    const isMenuIntent =
      trimmedInput.includes("quay lại menu") ||
      trimmedInput.includes("main menu") ||
      trimmedInput.includes("bắt đầu lại");

    const isChatIntent =
      trimmedInput.includes("chat") ||
      trimmedInput.includes("nhắn tin") ||
      trimmedInput.includes("nhắn với photographer") ||
      trimmedInput.includes("nói chuyện với photographer");

    const isImageLinkIntent =
      trimmedInput.includes("nhận ảnh") ||
      trimmedInput.includes("link ảnh") ||
      trimmedInput.includes("google drive") ||
      trimmedInput.includes("drive") ||
      trimmedInput.includes("xem ảnh");

    if (isMenuIntent) {
      setFlowState({ step: "idle" });

      addBotMessage("Tôi có thể hỗ trợ gì thêm cho bạn?", [
        "Tìm photographer phù hợp",
        "Gợi ý Concept / Style chụp",
        "Bảng giá dịch vụ trung bình",
        "Đặt lịch như thế nào?",
        "Chính sách cọc & hủy lịch",
      ]);

      return;
    }

    if (isBookingGuideIntent) {
      setFlowState({ step: "idle" });

      addBotMessage(
        `Để đặt lịch trên Sudion:\n\n` +
          `1. Vào trang **Photographer**.\n` +
          `2. Chọn photographer và gói dịch vụ phù hợp.\n` +
          `3. Bấm **Đặt lịch**.\n` +
          `4. Chọn ngày, giờ, địa điểm, concept.\n` +
          `5. Chờ photographer xác nhận.\n` +
          `6. Thanh toán cọc để giữ lịch.\n\n` +
          `Sau khi cọc xong, bạn có thể chat với photographer.`,
        ["Tìm photographer phù hợp", "Chính sách cọc & hủy lịch"]
      );

      return;
    }

    if (isPaymentIntent) {
      setFlowState({ step: "idle" });

      addBotMessage(
        `**Chính sách thanh toán:**\n\n` +
          `• Sau khi photographer xác nhận, khách thanh toán cọc để giữ lịch.\n` +
          `• Sau khi cọc thành công, chat giữa khách và photographer sẽ mở.\n` +
          `• Phần còn lại thanh toán sau khi buổi chụp hoàn thành.\n` +
          `• Khách chỉ xem được link ảnh sau khi thanh toán đủ.`,
        ["Chat mở khi nào?", "Khi nào được nhận ảnh?", "Quay lại menu chính"]
      );

      return;
    }

    if (isCancelIntent) {
      setFlowState({ step: "idle" });

      addBotMessage(
        `**Chính sách hủy lịch:**\n\n` +
          `• Hủy trước 48 giờ: có thể được hoàn cọc.\n` +
          `• Hủy quá sát giờ: có thể không được hoàn cọc vì photographer đã chuẩn bị lịch.\n` +
          `• Nếu muốn đổi lịch, nên trao đổi với photographer qua chat sau khi đã cọc.`,
        ["Đặt lịch như thế nào?", "Quay lại menu chính"]
      );

      return;
    }

    if (isChatIntent) {
      setFlowState({ step: "idle" });

      addBotMessage(
        `Chat với photographer sẽ mở sau khi khách thanh toán cọc thành công.\n\n` +
          `Các trạng thái có thể chat:\n` +
          `• **Đã cọc / confirmed**\n` +
          `• **Hoàn thành buổi chụp / completed**\n` +
          `• **Đã thanh toán đủ / fully_paid**`,
        ["Đặt lịch như thế nào?", "Chính sách cọc & hủy lịch"]
      );

      return;
    }

    if (isImageLinkIntent) {
      setFlowState({ step: "idle" });

      addBotMessage(
        `Link ảnh sẽ được photographer gửi bằng thư mục Google Drive sau khi hoàn thành buổi chụp.\n\n` +
          `Lưu ý:\n` +
          `• Photographer phải gửi link thư mục Google Drive.\n` +
          `• Link đúng dạng: **https://drive.google.com/drive/folders/...**\n` +
          `• Khách chỉ xem được link ảnh sau khi thanh toán đủ phần còn lại.\n` +
          `• Folder Drive cần bật quyền **Bất kỳ ai có đường liên kết**.`,
        ["Thanh toán còn lại như thế nào?", "Quay lại menu chính"]
      );

      return;
    }

    if (flowState.step === "waiting_location") {
      const location = userInput.trim();

      setFlowState((prev) => ({
        ...prev,
        step: "waiting_category",
        location,
      }));

      addBotMessage(
        `Đã ghi nhận khu vực **${location}**. Bạn muốn chụp thể loại nào?`,
        ["Cưới hỏi", "Kỷ yếu", "Cặp đôi", "Sự kiện", "Sản phẩm"]
      );

      return;
    }

    if (flowState.step === "waiting_category") {
      const category = userInput.trim();

      setFlowState((prev) => ({
        ...prev,
        step: "waiting_budget",
        category,
      }));

      addBotMessage(
        `Bạn muốn tìm photographer chụp **${category}**. Ngân sách tối đa khoảng bao nhiêu?`,
        [
          "Dưới 2.000.000đ",
          "2.000.000đ - 5.000.000đ",
          "Trên 5.000.000đ",
          "Không giới hạn",
        ]
      );

      return;
    }

    if (flowState.step === "waiting_budget") {
      const budget = userInput.trim();
      const location = flowState.location || "";
      const category = flowState.category || "";

      setFlowState({ step: "idle" });
      searchPhotographers(location, category, budget);

      return;
    }

    if (
      trimmedInput === "hello" ||
      trimmedInput === "hi" ||
      trimmedInput.startsWith("chào") ||
      trimmedInput.includes("xin chào")
    ) {
      addBotMessage(
        "Xin chào! Tôi là Trợ lý AI của Sudion. Bạn muốn tôi hỗ trợ gì hôm nay?",
        [
          "Tìm photographer phù hợp",
          "Gợi ý Concept / Style chụp",
          "Bảng giá dịch vụ trung bình",
          "Đặt lịch như thế nào?",
        ]
      );

      return;
    }

    if (
      trimmedInput.includes("tìm photographer") ||
      trimmedInput.includes("nhiếp ảnh gia") ||
      trimmedInput.includes("thợ chụp") ||
      trimmedInput.includes("tìm thợ")
    ) {
      setFlowState({ step: "waiting_location" });

      addBotMessage(
        "Tuyệt vời! Bạn muốn tìm photographer ở khu vực nào?",
        ["TP. Hồ Chí Minh", "Hà Nội", "Đà Lạt", "Đà Nẵng", "Cần Thơ"]
      );

      return;
    }

    if (
      trimmedInput.includes("concept") ||
      trimmedInput.includes("style") ||
      trimmedInput.includes("gợi ý") ||
      trimmedInput.includes("phong cách")
    ) {
      addBotMessage(
        "Bạn muốn tham khảo concept chụp cho thể loại nào?",
        ["Chụp Cưới hỏi", "Chụp Kỷ yếu", "Chụp Cặp đôi", "Sản phẩm & Food"]
      );

      return;
    }

    if (trimmedInput.includes("cưới hỏi") || trimmedInput.includes("đám cưới")) {
      addBotMessage(
        `**Concept gợi ý cho Cưới hỏi:**\n\n` +
          `1. **Studio Hàn Quốc tối giản**: phông trắng/xám, nhẹ nhàng, sang.\n` +
          `2. **Cinematic Vintage ngoại cảnh**: màu film ấm, hợp Đà Lạt/phố cổ.\n` +
          `3. **Phóng sự cưới**: bắt khoảnh khắc thật trong lễ cưới.\n\n` +
          `Bạn muốn tôi tìm photographer hợp concept này không?`,
        ["Tìm photographer phù hợp", "Quay lại menu chính"]
      );

      return;
    }

    if (trimmedInput.includes("kỷ yếu") || trimmedInput.includes("học sinh")) {
      addBotMessage(
        `**Concept gợi ý cho Kỷ yếu:**\n\n` +
          `1. **Thanh xuân vườn trường**: trong trẻo, tự nhiên.\n` +
          `2. **Cổ phục Việt Nam**: áo Nhật Bình/Tấc, hợp địa điểm cổ kính.\n` +
          `3. **Prom Night**: sang trọng, ánh đèn bokeh, váy/vest.\n\n` +
          `Bạn muốn tôi tìm photographer hợp concept này không?`,
        ["Tìm photographer phù hợp", "Quay lại menu chính"]
      );

      return;
    }

    if (
      trimmedInput.includes("cặp đôi") ||
      trimmedInput.includes("couple") ||
      trimmedInput.includes("hai người")
    ) {
      addBotMessage(
        `**Concept gợi ý cho Cặp đôi:**\n\n` +
          `1. **Street style tự nhiên**: quán cafe, phố quen, khoảnh khắc đời thường.\n` +
          `2. **Picnic dã ngoại**: bãi cỏ, hoa, ánh nắng chiều, tone pastel.\n` +
          `3. **Cinematic night**: chụp đêm, ánh đèn đường, cảm xúc điện ảnh.\n\n` +
          `Bạn muốn tôi tìm photographer hợp concept này không?`,
        ["Tìm photographer phù hợp", "Quay lại menu chính"]
      );

      return;
    }

    if (
      trimmedInput.includes("sản phẩm") ||
      trimmedInput.includes("food") ||
      trimmedInput.includes("đồ ăn")
    ) {
      addBotMessage(
        `**Concept gợi ý cho Sản phẩm & Food:**\n\n` +
          `1. **Flatlay tối giản**: chụp từ trên xuống, bố cục sạch.\n` +
          `2. **Rustic hoài cổ**: nền gỗ, ánh sáng nghiêng, màu trầm.\n` +
          `3. **Commercial clean**: nền sáng, sản phẩm rõ, hợp quảng cáo.\n\n` +
          `Bạn muốn tôi tìm photographer hợp concept này không?`,
        ["Tìm photographer phù hợp", "Quay lại menu chính"]
      );

      return;
    }

    if (
      trimmedInput.includes("bảng giá") ||
      trimmedInput.includes("giá cả") ||
      trimmedInput.includes("bao nhiêu tiền") ||
      trimmedInput.includes("chi phí") ||
      trimmedInput.includes("giá dịch vụ")
    ) {
      addBotMessage(
        `**Mức giá tham khảo trên Sudion:**\n\n` +
          `• **Chụp cưới hỏi**: 5.000.000đ - 18.000.000đ\n` +
          `• **Chụp kỷ yếu**: 2.000.000đ - 7.000.000đ\n` +
          `• **Chụp couple**: 1.500.000đ - 3.500.000đ\n` +
          `• **Chụp sự kiện**: từ 1.000.000đ / giờ\n` +
          `• **Chụp sản phẩm/Food**: từ 1.200.000đ / concept\n\n` +
          `Giá thực tế tùy photographer, địa điểm và concept.`,
        ["Tìm photographer phù hợp", "Gợi ý Concept / Style chụp"]
      );

      return;
    }

    try {
      await callBackendAI(userInput);
    } catch (error) {
      console.error("Backend AI lỗi, dùng fallback local:", error);

      addBotMessage(
        `Tôi có thể hỗ trợ bạn tìm photographer, tư vấn concept, báo giá tham khảo, chính sách cọc/hủy lịch và hướng dẫn đặt lịch. Bạn muốn hỏi phần nào?`,
        [
          "Tìm photographer phù hợp",
          "Gợi ý Concept / Style chụp",
          "Bảng giá dịch vụ trung bình",
          "Đặt lịch như thế nào?",
          "Chính sách cọc & hủy lịch",
        ]
      );
    }
  }

  function searchPhotographers(location: string, category: string, budget: string) {
    setIsTyping(true);

    window.setTimeout(() => {
      setIsTyping(false);

      const normalizedLocation = normalizeText(location);
      const normalizedCategory = normalizeText(category);

      const results = photographers.filter((p) => {
        const area = normalizeText(p.active_area || "");
        const categories = normalizeText(p.categories || "");

        const matchLocation =
          !normalizedLocation ||
          normalizedLocation.includes("tất cả") ||
          area.includes(normalizedLocation) ||
          normalizedLocation.includes(area);

        const matchCategory =
          !normalizedCategory ||
          categories.includes(normalizedCategory) ||
          normalizedCategory.includes(categories);

        const minPrice = Number(p.min_price || 0);

        let matchBudget = true;

        if (budget.includes("Dưới 2.000.000đ")) {
          matchBudget = minPrice > 0 && minPrice <= 2000000;
        } else if (budget.includes("2.000.000đ - 5.000.000đ")) {
          matchBudget = minPrice >= 2000000 && minPrice <= 5000000;
        } else if (budget.includes("Trên 5.000.000đ")) {
          matchBudget = minPrice >= 5000000;
        }

        return matchLocation && matchCategory && matchBudget;
      });

      const displayResults =
        results.length > 0 ? results : photographers.slice(0, 3);

      if (results.length > 0) {
        addBotMessage(
          `Dựa trên khu vực **${location}**, thể loại **${category}**, ngân sách **${budget}**, tôi tìm thấy **${results.length}** photographer phù hợp:`
        );
      } else {
        addBotMessage(
          `Hiện chưa có photographer khớp chính xác với bộ lọc đó. Tôi gợi ý vài photographer nổi bật để bạn tham khảo:`
        );
      }

      displayResults.slice(0, 3).forEach((p) => {
        addBotMessage(createPhotographerCardHtml(p), undefined, true);
      });

      addBotMessage("Bạn muốn tôi hỗ trợ thêm gì không?", [
        "Tìm photographer phù hợp",
        "Gợi ý Concept / Style chụp",
        "Quay lại menu chính",
      ]);
    }, 700);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end sm:bottom-6 sm:right-6">
      {showTooltip && !isOpen ? (
        <div className="relative mb-3 w-[270px] overflow-hidden rounded-3xl border border-orange-100 bg-white/95 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-xs font-black text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>

          <div className="mb-2 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-black text-white shadow-md">
              AI
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Sudion AI</p>
              <p className="text-[10px] font-bold text-emerald-500">
                Đang trực tuyến
              </p>
            </div>
          </div>

          <p className="pr-4 text-xs font-semibold leading-5 text-slate-600">
            Cần tìm photographer hoặc tư vấn concept? Chat với AI ngay nhé.
          </p>

          <div className="absolute bottom-[-6px] right-7 h-3 w-3 rotate-45 border-b border-r border-orange-100 bg-white" />
        </div>
      ) : null}

      {isOpen ? (
        <div className="fixed bottom-24 right-3 z-[90] flex h-[min(640px,calc(100vh-120px))] w-[min(430px,calc(100vw-24px))] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:right-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 px-4 py-4 text-white">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-sm" />
            <div className="absolute -bottom-14 left-10 h-28 w-28 rounded-full bg-white/10 blur-sm" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/20 text-sm font-black text-white shadow-inner backdrop-blur-md">
                  AI
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-orange-400 bg-emerald-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-black tracking-wide">
                    Sudion Trợ lý AI
                  </h3>
                  <p className="mt-0.5 text-[11px] font-bold text-white/85">
                    {lastProvider === "gemini"
                      ? "AI Gemini đang hoạt động"
                      : "Đang trực tuyến"}
                  </p>
                </div>
              </div>

              <div className="relative flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={resetChat}
                  className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-white/25"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                  title="Thu nhỏ"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-4 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[86%] break-words rounded-3xl px-4 py-3 text-[13px] leading-6 shadow-sm ${
                    m.sender === "user"
                      ? "rounded-br-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-200"
                      : "rounded-bl-lg border border-slate-100 bg-white text-slate-700 shadow-slate-200/70"
                  }`}
                >
                  {m.isHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: m.text }} />
                  ) : (
                    <div
                      className="whitespace-pre-line"
                      dangerouslySetInnerHTML={{
                        __html: plainTextToHtml(m.text),
                      }}
                    />
                  )}
                </div>

                {m.options && m.options.length > 0 ? (
                  <div
                    className={`mt-2.5 flex max-w-[92%] flex-wrap gap-2 ${
                      m.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => void handleSendMessage(option)}
                        disabled={isTyping}
                        className="rounded-full border border-orange-200 bg-white px-3.5 py-2 text-[11px] font-black text-orange-500 shadow-sm transition-all duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {isTyping ? (
              <div className="flex items-start">
                <div className="rounded-3xl rounded-bl-lg border border-slate-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-orange-500" />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-orange-500"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-orange-500"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSendMessage(inputVal);
            }}
            className="border-t border-slate-100 bg-white p-3"
          >
            <div className="flex items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-1.5 transition focus-within:border-orange-300 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.08)]">
              <input
                type="text"
                value={inputVal}
                onChange={(event) => setInputVal(event.target.value)}
                placeholder="Hỏi tôi bất kỳ điều gì..."
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                title="Gửi"
              >
                <svg
                  className="h-5 w-5 rotate-90"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="relative z-[95] grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_18px_45px_rgba(249,115,22,0.38)] transition-all hover:-translate-y-0.5 hover:scale-105"
        title="Trợ lý tư vấn AI"
      >
        {isOpen ? (
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <span className="absolute inset-0 rounded-full bg-orange-400 opacity-30 animate-ping" />
            <svg
              className="relative h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}