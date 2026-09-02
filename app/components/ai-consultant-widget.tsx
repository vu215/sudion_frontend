"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { getPhotographers, type Photographer } from "../services/photographer-api";
import { useAuth } from "@/app/auth-context";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  isHtml?: boolean;
  options?: string[];
};

type AiSettings = {
  provider: string;
  model: string;
  key: string;
  endpoint: string;
  systemPrompt: string;
};

export function AiConsultantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [aiSettings, setAiSettings] = useState<AiSettings | null>(null);

  // States for guided flow (interactive simulator)
  const [flowState, setFlowState] = useState<{
    step: "idle" | "waiting_location" | "waiting_category" | "waiting_budget";
    location?: string;
    category?: string;
    budget?: string;
  }>({ step: "idle" });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);
  const loadedChatKeyRef = useRef<string | null>(null);
  const [historyReady, setHistoryReady] = useState(false);
  const { session, isLoading: authLoading } = useAuth();

  // Bản cũ dùng một key chung nên lịch sử AI của tài khoản A có thể hiện khi
  // đăng nhập tài khoản B trên cùng trình duyệt. Tách key theo account để cô lập.
  const accountScope = useMemo(() => {
    if (authLoading) return "loading";
    if (!session) return "guest";
    const stableId = String(session.userId || session.email || "unknown").trim().toLowerCase();
    return `${session.role || "user"}:${stableId}`;
  }, [authLoading, session]);

  const CHAT_PERSIST_KEY = useMemo(
    () => `sudion_ai_chat_state:${encodeURIComponent(accountScope)}`,
    [accountScope]
  );

  useEffect(() => {
    if (typeof window === "undefined" || authLoading) return;

    setHistoryReady(false);
    loadedChatKeyRef.current = null;

    // Reset state trước khi đọc key của account mới để không ghi nhầm history cũ
    // sang account vừa đăng nhập.
    setMessages([]);
    setInputVal("");
    setFlowState({ step: "idle" });
    setIsTyping(false);
    setIsOpen(false);
    setShowTooltip(true);

    // Xóa key legacy dùng chung để chấm dứt tình trạng lộ history giữa account.
    window.localStorage.removeItem("sudion_ai_chat_state");

    const saved = window.localStorage.getItem(CHAT_PERSIST_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved) as {
          isOpen?: boolean;
          messages?: Message[];
          inputVal?: string;
          flowState?: typeof flowState;
          showTooltip?: boolean;
        };

        if (Array.isArray(data.messages)) setMessages(data.messages);
        if (typeof data.isOpen === "boolean") setIsOpen(data.isOpen);
        if (typeof data.inputVal === "string") setInputVal(data.inputVal);
        if (data.flowState) setFlowState(data.flowState);
        if (typeof data.showTooltip === "boolean") setShowTooltip(data.showTooltip);
      } catch (error) {
        console.error("Lỗi đọc trạng thái chat AI theo tài khoản:", error);
        window.localStorage.removeItem(CHAT_PERSIST_KEY);
      }
    }

    loadedChatKeyRef.current = CHAT_PERSIST_KEY;
    setHistoryReady(true);
  }, [CHAT_PERSIST_KEY, authLoading]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !historyReady ||
      loadedChatKeyRef.current !== CHAT_PERSIST_KEY
    ) {
      return;
    }

    const payload = {
      isOpen,
      messages,
      inputVal,
      flowState,
      showTooltip,
    };

    window.localStorage.setItem(CHAT_PERSIST_KEY, JSON.stringify(payload));
  }, [CHAT_PERSIST_KEY, historyReady, isOpen, messages, inputVal, flowState, showTooltip]);

  const clearAiChatHistory = () => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm("Xóa toàn bộ lịch sử trò chuyện AI của tài khoản này?");
    if (!confirmed) return;

    window.localStorage.removeItem(CHAT_PERSIST_KEY);
    setMessages([]);
    setInputVal("");
    setFlowState({ step: "idle" });
    setIsTyping(false);
  };

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (anchor && chatBodyRef.current && chatBodyRef.current.contains(anchor)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleLinkClick);
    return () => document.removeEventListener("click", handleLinkClick);
  }, []);

  // Load lightweight client-only configuration.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 6000);

    const saved = localStorage.getItem("studion-ai-settings");
    if (saved) {
      try {
        setAiSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi đọc cấu hình AI", e);
      }
    }

    return () => clearTimeout(timer);
  }, []);

  // Fetch photographers only when the user opens chat.
  useEffect(() => {
    if (!isOpen || photographers.length > 0) {
      return;
    }

    let cancelled = false;

    async function loadPhotographers() {
      try {
        const data = await getPhotographers();
        if (!cancelled) {
          setPhotographers(data);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách nhiếp ảnh gia cho chatbot:", err);
      }
    }

    loadPhotographers();

    return () => {
      cancelled = true;
    };
  }, [isOpen, photographers.length]);

  // Initialize chat history on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome-1",
          sender: "bot",
          text: "Xin chào! Tôi là Trợ lý ảo Sudion AI. Rất vui được hỗ trợ bạn.",
        },
        {
          id: "welcome-2",
          sender: "bot",
          text: "Tôi có thể giúp bạn tìm nhiếp ảnh gia phù hợp, tư vấn phong cách chụp (concept) độc đáo hoặc xem bảng giá dịch vụ. Hãy chọn một trong các chủ đề dưới đây hoặc nhắn tin trực tiếp cho tôi nhé!",
          options: [
            "Tìm photographer phù hợp",
            "Gợi ý Concept / Style chụp",
            "Bảng giá dịch vụ trung bình",
          ],
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, sender: "user", text }]);
    setInputVal("");
    setIsTyping(true);

    // Generate AI/Simulated response
    setTimeout(async () => {
      try {
        await processResponse(text);
      } catch (e) {
        console.error(e);
        addBotMessage("Xin lỗi, tôi gặp sự cố kết nối. Hãy thử lại sau nhé!");
      } finally {
        setIsTyping(false);
      }
    }, 800);
  };

  const addBotMessage = (text: string, options?: string[], isHtml = false) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}-${Math.random()}`,
        sender: "bot",
        text,
        options,
        isHtml,
      },
    ]);
  };

  // Logic processor for responses
  const processResponse = async (userInput: string) => {
    const trimmedInput = userInput.trim().toLowerCase();

    // Try calling the backend AI endpoint first
    try {
      const backendResponse = await callBackendAI(userInput);
      if (backendResponse) return; // Successfully got AI response from backend
    } catch (error) {
      console.error("Backend AI call failed, falling back to local simulator:", error);
    }

    // --- INTERACTIVE SMART SIMULATION FLOW (Fallback) ---

    // Check if we are in a guided flow step
    if (flowState.step === "waiting_location") {
      const location = userInput;
      setFlowState((prev) => ({ ...prev, step: "waiting_category", location }));
      addBotMessage(
        `Đã ghi nhận khu vực **${location}**. Bạn muốn chụp thể loại nào dưới đây?`,
        ["Cưới hỏi", "Kỷ yếu", "Cặp đôi", "Sự kiện", "Sản phẩm"]
      );
      return;
    }

    if (flowState.step === "waiting_category") {
      const category = userInput;
      setFlowState((prev) => ({ ...prev, step: "waiting_budget", category }));
      addBotMessage(
        `Bạn muốn tìm nhiếp ảnh gia chụp **${category}**. Ngân sách tối đa của bạn khoảng bao nhiêu?`,
        ["Dưới 2.000.000đ", "2.000.000đ - 5.000.000đ", "Trên 5.000.000đ", "Không giới hạn"]
      );
      return;
    }

    if (flowState.step === "waiting_budget") {
      const budget = userInput;
      // Reset state and search
      setFlowState({ step: "idle" });
      searchPhotographers(flowState.location || "", flowState.category || "", budget);
      return;
    }

    // Check for standard greetings
    if (
      trimmedInput === "hello" ||
      trimmedInput === "hi" ||
      trimmedInput.startsWith("chào") ||
      trimmedInput.includes("xin chào") ||
      trimmedInput.includes("hello bot") ||
      trimmedInput.includes("chào bot")
    ) {
      addBotMessage(
        "Xin chào! Tôi là Trợ lý AI của Sudion. Tôi có thể giúp gì cho bạn hôm nay? Hãy thử chọn các tác vụ nhanh bên dưới hoặc đặt câu hỏi tự do nhé!",
        [
          " Tìm photographer phù hợp",
          " Gợi ý Concept / Style chụp",
          " Bảng giá dịch vụ trung bình"
        ]
      );
      return;
    }

    // Direct actions matching options or keywords
    if (
      trimmedInput.includes("tìm photographer") ||
      trimmedInput.includes("nhiếp ảnh gia") ||
      trimmedInput.includes("thợ chụp") ||
      trimmedInput.includes("tìm thợ")
    ) {
      setFlowState({ step: "waiting_location" });
      addBotMessage(
        "Tuyệt vời! Hãy cho tôi biết bạn đang tìm kiếm photographer ở khu vực nào?",
        ["TP. Hồ Chí Minh", "Hà Nội", "Đà Lạt", "Đà Nẵng", "Cần Thơ"]
      );
      return;
    }

    if (trimmedInput.includes("concept") || trimmedInput.includes("style") || trimmedInput.includes("gợi ý") || trimmedInput.includes("phong cách")) {
      addBotMessage(
        "Bạn muốn tham khảo concept chụp hình cho thể loại nào?",
        ["Chụp Cưới hỏi", "Chụp Kỷ yếu", "Chụp Cặp đôi", "Sản phẩm & Food"]
      );
      return;
    }

    if (trimmedInput.includes("cưới hỏi") || trimmedInput.includes("đám cưới")) {
      addBotMessage(
        `**Concept Gợi ý cho Cưới hỏi:**\n\n` +
        `1. **Studio Hàn Quốc tối giản**: Chụp phông trơn trắng/xám, tôn lên vẻ đẹp tinh khiết của trang phục và nụ cười biểu cảm.\n` +
        `2. **Cinematic Vintage ngoại cảnh**: Màu ảnh film trầm ấm hoài niệm. Rất thích hợp chụp tại các phố cổ hoặc đồi thông Đà Lạt.\n` +
        `3. **Phóng sự cưới (Wedding Photojournalism)**: Lưu giữ chân thực khoảnh khắc vui mừng, xúc động bất chợt suốt lễ cưới.\n\n` +
        `Bạn muốn tìm nhiếp ảnh gia chuyên chụp phong cách này chứ?`,
        [" Tìm photographer phù hợp", "Quay lại menu chính"]
      );
      return;
    }

    if (trimmedInput.includes("kỷ yếu") || trimmedInput.includes("học sinh")) {
      addBotMessage(
        `**Concept Gợi ý cho Kỷ yếu:**\n\n` +
        `1. **Cổ phục Việt Nam (Nhật Bình/Tấc Áo)**: Chụp tại Hoàng Thành, Đền Chùa cổ kính mang nét tôn nghiêm truyền thống.\n` +
        `2. **Thanh xuân vườn trường Retro**: Chụp tại trường học với trang phục thanh xuân kiểu Nhật/Hàn, màu ảnh trong trẻo.\n` +
        `3. **Party Night / Prom sang chảnh**: Đầm tiệc tối sang trọng với hiệu ứng đèn bokeh lung linh.\n\n` +
        `Bạn muốn tìm nhiếp ảnh gia chuyên chụp phong cách này chứ?`,
        [" Tìm photographer phù hợp", "Quay lại menu chính"]
      );
      return;
    }

    if (trimmedInput.includes("cặp đôi") || trimmedInput.includes("couple") || trimmedInput.includes("hai người")) {
      addBotMessage(
        `**Concept Gợi ý cho Cặp đôi:**\n\n` +
        `1. **Street Style tự nhiên**: Các góc phố quen thuộc, quán cafe cũ, bắt trọn từng khoảnh khắc ôm, nắm tay tự nhiên của hai bạn.\n` +
        `2. **Picnic dã ngoại**: Bày biện đồ ăn ngọt, hoa quả, thảm trải trên bãi cỏ xanh mướt dưới ánh nắng ban chiều ấm áp.\n\n` +
        `Bạn muốn tìm nhiếp ảnh gia chuyên chụp phong cách này chứ?`,
        [" Tìm photographer phù hợp", "Quay lại menu chính"]
      );
      return;
    }

    if (trimmedInput.includes("sản phẩm") || trimmedInput.includes("food") || trimmedInput.includes("đồ ăn") || trimmedInput.includes("quảng cáo")) {
      addBotMessage(
        `**Concept Gợi ý cho Sản phẩm & Food:**\n\n` +
        `1. **Flatlay tối giản (Minimalist)**: Chụp từ trên xuống, sắp đặt gọn gàng cùng các phụ kiện màu pastel.\n` +
        `2. **Rustic hoài cổ**: Sử dụng khay gỗ, tấm vải thô, ánh sáng nghiêng từ cửa sổ tạo bóng đổ sâu lắng.\n\n` +
        `Bạn muốn tìm nhiếp ảnh gia chuyên chụp phong cách này chứ?`,
        [" Tìm photographer phù hợp", "Quay lại menu chính"]
      );
      return;
    }

    if (trimmedInput.includes("bảng giá") || trimmedInput.includes("giá cả") || trimmedInput.includes("bao nhiêu tiền") || trimmedInput.includes("chi phí") || trimmedInput.includes("giá dịch vụ")) {
      const livePrices = photographers
        .map((p) => Number(p.min_price || 0))
        .filter((price) => Number.isFinite(price) && price > 0)
        .sort((a, b) => a - b);

      if (livePrices.length > 0) {
        const min = livePrices[0];
        const max = livePrices[livePrices.length - 1];
        addBotMessage(
          `Theo dữ liệu photographer đang hiển thị trên Sudion, mức giá khởi điểm hiện khoảng **${min.toLocaleString("vi-VN")}đ - ${max.toLocaleString("vi-VN")}đ** tùy photographer và gói dịch vụ. Giá cụ thể phải lấy từ package hiện tại, mình không dùng bảng giá hard-code.`,
          ["Xem trang dịch vụ", "Tìm photographer phù hợp"]
        );
      } else {
        addBotMessage(
          "Mình chưa tải được dữ liệu giá hiện tại. Bạn mở trang dịch vụ hoặc hồ sơ photographer để xem đúng giá package đang có trên Sudion.",
          ["Xem trang dịch vụ", "Tìm photographer phù hợp"]
        );
      }
      return;
    }

    if (trimmedInput.includes("xem trang dịch vụ") || trimmedInput.includes("dịch vụ")) {
      addBotMessage(
        `Bạn có thể tham khảo trực tiếp trang danh sách dịch vụ của chúng tôi để chọn gói chụp phù hợp nhất: <a href="/services" class="text-orange-500 font-bold underline font-semibold">Xem danh sách dịch vụ tại đây</a>`,
        ["Quay lại menu chính"],
        true
      );
      return;
    }

    // Book guide query matching
    if (
      trimmedInput.includes("đặt lịch") ||
      trimmedInput.includes("làm sao để book") ||
      trimmedInput.includes("hướng dẫn book") ||
      trimmedInput.includes("đăng ký chụp") ||
      trimmedInput.includes("cách book")
    ) {
      addBotMessage(
        `Để đặt lịch chụp với nhiếp ảnh gia trên Sudion, bạn vui lòng làm theo hướng dẫn sau:\n\n` +
        `1. Chọn mục **Photographer** từ thanh menu để xem danh sách nhiếp ảnh gia.\n` +
        `2. Xem qua hồ sơ và chọn một **Gói dịch vụ (Package)** ưng ý, sau đó bấm nút **Đặt lịch**.\n` +
        `3. Chọn Ngày & Khung giờ chụp, điền yêu cầu và gửi booking. Sau khi photographer xác nhận, chat trong Sudion được mở; bạn thanh toán cọc 30% để giữ lịch.\n\n` +
        `Bạn có muốn tìm photographer ngay bây giờ không?`,
        [" Tìm photographer phù hợp", "Quay lại menu chính"]
      );
      return;
    }

    // Payment query matching
    if (
      trimmedInput.includes("thanh toán") ||
      trimmedInput.includes("tiền cọc") ||
      trimmedInput.includes("đặt cọc") ||
      trimmedInput.includes("cọc bao nhiêu") ||
      trimmedInput.includes("chuyển khoản")
    ) {
      addBotMessage(
        `**Chính sách thanh toán của Sudion:**\n\n` +
        `• Bạn cần thanh toán **đặt cọc trước 30%** ước tính giá trị gói chụp để xác nhận đặt lịch thành công.\n` +
        `• Số tiền 70% còn lại được thanh toán qua Sudion sau khi buổi chụp hoàn thành theo trạng thái booking.\n` +
        `• Luồng demo hiện có chuyển khoản ngân hàng đối soát qua SePay và MoMo Sandbox; backend xác minh giao dịch trước khi cập nhật booking.\n\n` +
        `Bạn có câu hỏi nào khác không?`,
        ["Quay lại menu chính"]
      );
      return;
    }

    // Cancellation query matching
    if (
      trimmedInput.includes("hủy lịch") ||
      trimmedInput.includes("hủy book") ||
      trimmedInput.includes("hoàn tiền") ||
      trimmedInput.includes("đổi lịch") ||
      trimmedInput.includes("hoàn cọc")
    ) {
      addBotMessage(
        `**Chính sách đổi trả và hủy lịch:**\n\n` +
        `• **Hủy trước ≥ 48 giờ**: hoàn **100% tiền cọc**.\n` +
        `• **Hủy từ 24 đến < 48 giờ**: hoàn **50% tiền cọc**.\n` +
        `• **Hủy dưới 24 giờ nhưng chưa tới giờ chụp**: hoàn **30% tiền cọc**.\n` +
        `• **Đã tới/qua giờ chụp**: không đi qua luồng hủy thông thường.\n` +
        `• Nếu có tiền hoàn, khách nhập ngân hàng/STK/tên chủ tài khoản; Admin duyệt và chuyển khoản hoàn thủ công rồi nhập mã giao dịch để xác nhận refunded.`,
        ["Quay lại menu chính"]
      );
      return;
    }

    // Location details matching
    if (
      trimmedInput.includes("khu vực") ||
      trimmedInput.includes("ở đâu") ||
      trimmedInput.includes("địa bàn") ||
      trimmedInput.includes("hoạt động")
    ) {
      addBotMessage(
        `Sudion hiện hỗ trợ kết nối nhiếp ảnh gia trên toàn quốc, tập trung đông đảo nhất tại:\n` +
        `• **TP. Hồ Chí Minh**\n` +
        `• **Hà Nội**\n` +
        `• **Đà Lạt**\n` +
        `• **Đà Nẵng & Huế**\n\n` +
        `Bạn có thể tìm thợ ảnh tại khu vực của bạn bằng tính năng tìm kiếm dưới đây:`,
        [" Tìm photographer phù hợp", "Quay lại menu chính"]
      );
      return;
    }

    // Support details matching
    if (
      trimmedInput.includes("liên hệ") ||
      trimmedInput.includes("số điện thoại") ||
      trimmedInput.includes("hotline") ||
      trimmedInput.includes("email") ||
      trimmedInput.includes("tổng đài") ||
      trimmedInput.includes("hỗ trợ")
    ) {
      addBotMessage(
        `Để tránh cung cấp thông tin liên hệ không có trong dữ liệu hệ thống, mình không tự tạo hotline/email/địa chỉ. Bạn có thể tiếp tục hỏi trực tiếp trong Sudion về booking, thanh toán, hoàn tiền hoặc photographer.`,
        ["Quay lại menu chính"]
      );
      return;
    }

    if (trimmedInput.includes("quay lại menu") || trimmedInput.includes("main menu") || trimmedInput.includes("bắt đầu lại")) {
      addBotMessage(
        "Tôi có thể hỗ trợ gì thêm cho bạn? Hãy chọn bên dưới:",
        [
          " Tìm photographer phù hợp",
          " Gợi ý Concept / Style chụp",
          " Bảng giá dịch vụ trung bình"
        ]
      );
      return;
    }

    // Intelligent default response in simulation mode
    addBotMessage(
      `Mình chỉ hỗ trợ các nội dung trong Sudion Studio như tìm photographer, dịch vụ, booking, thanh toán, hủy/hoàn tiền, chat, tài khoản và đánh giá. Bạn muốn mình hỗ trợ phần nào trên Sudion?`,
      [
        " Tìm photographer phù hợp",
        " Gợi ý Concept / Style chụp",
        " Bảng giá dịch vụ trung bình",
        "Đăng ký & Đặt lịch như thế nào?",
        "Chính sách cọc & hủy lịch"
      ]
    );
  };

  // Search logic for simulation
  const searchPhotographers = (location: string, category: string, budget: string) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // Filter list of real photographers
      const results = photographers.filter((p) => {
        // Match location
        const matchLoc = !location || location === "Tất cả địa điểm" ||
          p.active_area?.toLowerCase().includes(location.toLowerCase()) ||
          location.toLowerCase().includes(p.active_area?.toLowerCase() || "");

        // Match category
        const matchCat = !category ||
          p.categories?.toLowerCase().includes(category.toLowerCase());

        // Match budget
        let matchBudget = true;
        if (budget.includes("Dưới 2.000.000đ")) {
          matchBudget = p.min_price <= 2000000;
        } else if (budget.includes("2.000.000đ - 5.000.000đ")) {
          matchBudget = p.min_price >= 2000000 && p.min_price <= 5000000;
        } else if (budget.includes("Trên 5.000.000đ")) {
          matchBudget = p.min_price >= 5000000;
        }

        return matchLoc && matchCat && matchBudget;
      });

      if (results.length > 0) {
        addBotMessage(
          `Dựa trên tìm kiếm tại **${location}**, dịch vụ **${category}**, phân khúc **${budget}**, tôi đã tìm thấy **${results.length}** nhiếp ảnh gia phù hợp nhất:`
        );

        // Render card results inside chat
        results.slice(0, 3).forEach((p) => {
          const htmlContent = `
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl my-2 flex items-center gap-3">
              <img src="${p.avatar_url || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80'}" alt="${p.full_name}" class="w-12 h-12 rounded-full object-cover shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-slate-800 truncate">${p.full_name}</p>
                <p class="text-[11px] text-slate-400 truncate">${p.active_area || 'Không rõ địa điểm'}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-yellow-500 font-bold text-xs">★ ${p.avg_rating || '5.0'}</span>
                  <span class="text-slate-300 text-xs">|</span>
                  <span class="text-slate-600 font-medium text-xs">Giá từ: ${p.min_price ? p.min_price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</span>
                </div>
              </div>
              <a href="/photographer-profile/${p.id}" class="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg shrink-0 transition-colors">
                Xem
              </a>
            </div>
          `;
          addBotMessage(htmlContent, undefined, true);
        });

        if (results.length > 3) {
          addBotMessage(
            `Ngoài ra vẫn còn nhiều photographer khác phù hợp. Bạn có thể bấm vào đây để xem tất cả: <a href="/photographer?location=${encodeURIComponent(location)}&category=${encodeURIComponent(category)}" class="text-orange-500 font-bold underline">Xem toàn bộ</a>`,
            ["Quay lại menu chính"],
            true
          );
        } else {
          addBotMessage("Bạn muốn tìm hiểu thêm về chủ đề khác chứ?", ["Quay lại menu chính"]);
        }
      } else {
        // Fallback recommendations if no matches
        addBotMessage(
          `Hiện tại chưa có photographer nào khớp chính xác bộ lọc tại **${location}** mức giá **${budget}**. Dưới đây là các photographer nổi bật được đề xuất cho bạn:`
        );

        photographers.slice(0, 2).forEach((p) => {
          const htmlContent = `
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl my-2 flex items-center gap-3">
              <img src="${p.avatar_url || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80'}" alt="${p.full_name}" class="w-12 h-12 rounded-full object-cover shrink-0" />
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-slate-800 truncate">${p.full_name}</p>
                <p class="text-[11px] text-slate-400 truncate">${p.active_area || 'Việt Nam'}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-yellow-500 font-bold text-xs">★ ${p.avg_rating || '4.9'}</span>
                  <span class="text-slate-300 text-xs">|</span>
                  <span class="text-slate-600 font-medium text-xs">Giá từ: ${p.min_price ? p.min_price.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'}</span>
                </div>
              </div>
              <a href="/photographer-profile/${p.id}" class="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg shrink-0 transition-colors">
                Xem
              </a>
            </div>
          `;
          addBotMessage(htmlContent, undefined, true);
        });

        addBotMessage("Bạn có muốn điều chỉnh lại địa điểm hoặc ngân sách chụp không?", [
          " Tìm photographer phù hợp",
          "Quay lại menu chính"
        ]);
      }
    }, 1200);
  };

  // Call AI via secure backend endpoint (API key stored in database, not exposed to browser)
  const callBackendAI = async (userInput: string): Promise<boolean> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    const chatHistory = messages
      .slice(-10) // Send last 10 messages for context
      .map((m) => ({ sender: m.sender === "user" ? "user" : "bot", text: m.text }));

    const response = await fetch(`${API_URL}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userInput,
        history: chatHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend AI error: ${response.status}`);
    }

    const resJson = await response.json();

    // If backend says to use simulator (no API key configured), return false to fall through
    if (resJson.useSimulator) {
      return false;
    }

    if (resJson.success && resJson.text) {
      addBotMessage(formatResponseHtml(resJson.text), undefined, true);
      return true;
    }

    return false;
  };

  // Format response formatting, transforming markdown list/links to HTML
  const formatResponseHtml = (text: string) => {
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br />");

    // Replace Markdown-like links [Text](URL) with HTML links
    formatted = formatted.replace(
      /\[(.*?)\]\(((?:\/|https?:\/\/)[^\s)]+)\)/g,
      '<a href="$2" class="text-orange-500 font-bold underline">$1</a>'
    );

    // Rewrite any old photographer-profile query URLs to route-based dynamic profile pages.
    formatted = formatted.replace(/photographer-profile\?id=([0-9a-zA-Z_-]+)/g, "/photographer-profile/$1");
    formatted = formatted.replace(/photographer-profile%3Fid%3D([0-9a-zA-Z_-]+)/g, "/photographer-profile/$1");

    return formatted;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
      {/* Tooltip greeting */}
      {showTooltip && !isOpen && (
        <div className="relative mb-3 flex max-w-[260px] items-start gap-2 rounded-2xl border border-[#ffe3cc] bg-white p-3.5 shadow-[0_12px_28px_rgba(255,141,40,0.14)] animate-bounce duration-1000">
          <p className="text-xs font-semibold leading-5 text-slate-800">
            Bạn cần tìm photographer phù hợp hoặc tư vấn concept chụp? Chat với AI ngay nhé!
          </p>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-slate-600 text-xs font-black shrink-0"
          >
            ×
          </button>
          <div className="absolute bottom-[-6px] right-6 h-3 w-3 rotate-45 border-r border-b border-[#ffe3cc] bg-white"></div>
        </div>
      )}

      {/* Floating Action Button Trigger */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#ff8d28] text-white shadow-lg hover:scale-105 transition-all hover:bg-[#e67d1e] focus:outline-none"
        title="Trợ lý tư vấn AI"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <span className="relative flex h-full w-full items-center justify-center">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        )}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 flex h-[540px] w-[370px] max-w-[calc(100vw-32px)] flex-col rounded-3xl border border-[#edf0f5] bg-white shadow-[0_16px_48px_rgba(15,23,42,0.15)] overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#ff8d28] to-[#ffaa5c] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white text-lg font-black shadow-inner">

                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#ff8d28] bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="text-sm font-black tracking-wide leading-tight">Sudion Trợ lý AI</h3>
                <span className="text-[10px] text-orange-50/80 font-bold">Đang trực tuyến</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearAiChatHistory}
                className="rounded-full p-1.5 hover:bg-white/10 text-white transition-colors"
                title="Xóa lịch sử AI của tài khoản này"
                aria-label="Xóa lịch sử AI"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 hover:bg-white/10 text-white transition-colors"
                title="Thu gọn"
                aria-label="Thu gọn chatbot"
              >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-5 shadow-sm ${m.sender === "user"
                    ? "bg-[#ff8d28] text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                    }`}
                >
                  {m.isHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: m.text }} />
                  ) : (
                    <p className="whitespace-pre-line">{m.text}</p>
                  )}
                </div>

                {/* Option quick select chips */}
                {m.options && m.options.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {m.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSendMessage(option)}
                        className="rounded-full border border-orange-200 bg-orange-50/60 px-3.5 py-1.5 text-[11px] font-bold text-[#ff8d28] hover:bg-[#ff8d28] hover:text-white hover:border-[#ff8d28] transition-all duration-200"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="rounded-2xl rounded-bl-none border border-slate-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#ff8d28]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#ff8d28]" style={{ animationDelay: "0.2s" }}></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#ff8d28]" style={{ animationDelay: "0.4s" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Message Send Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputVal);
            }}
            className="flex items-center gap-2 border-t border-slate-100 bg-white p-3"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Hỏi về Sudion, photographer, booking..."
              className="h-10 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50/50 px-4 text-xs text-slate-800 outline-none focus:border-[#ff8d28] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff8d28] text-white shadow-md hover:bg-[#e67d1e] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none transition-all"
            >
              <svg className="h-4.5 w-4.5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
