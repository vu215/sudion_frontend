"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { getPhotographers, type Photographer } from "../services/photographer-api";

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

  // Load configuration and photographers
  useEffect(() => {
    // Hide tooltip after 6 seconds
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 6000);

    // Fetch config from localStorage
    const saved = localStorage.getItem("studion-ai-settings");
    if (saved) {
      try {
        setAiSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Lỗi đọc cấu hình AI", e);
      }
    }

    // Fetch photographers from backend API
    async function loadPhotographers() {
      try {
        const data = await getPhotographers();
        setPhotographers(data);
      } catch (err) {
        console.error("Lỗi tải danh sách nhiếp ảnh gia cho chatbot:", err);
      }
    }
    loadPhotographers();

    return () => clearTimeout(timer);
  }, []);

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

    // Dynamically check localStorage config on every message to capture changes without reloading
    let currentSettings = aiSettings;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("studion-ai-settings");
      if (saved) {
        try {
          currentSettings = JSON.parse(saved);
        } catch (e) {
          console.error("Lỗi đọc cấu hình AI mới", e);
        }
      }
    }

    // Check if real API connection is configured in Admin Settings
    if (currentSettings && currentSettings.key && currentSettings.provider !== "Mock Simulator") {
      try {
        await callRealAI(userInput, currentSettings);
        return;
      } catch (error) {
        console.error("Lỗi gọi AI thật, chuyển hướng về chế độ giả lập thông minh:", error);
      }
    }

    // --- INTERACTIVE SMART SIMULATION FLOW ---

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
      addBotMessage(
        `**Mức giá tham khảo các dịch vụ trên Sudion:**\n\n` +
        `• **Chụp cưới hỏi**: Từ 5.000.000đ - 18.000.000đ (trọn gói album/makeup)\n` +
        `• **Chụp kỷ yếu**: Từ 2.000.000đ - 7.000.000đ (cho nhóm/lớp)\n` +
        `• **Chụp couple**: Từ 1.500.000đ - 3.500.000đ / gói\n` +
        `• **Chụp sự kiện**: Từ 1.000.000đ / giờ chụp\n` +
        `• **Chụp sản phẩm/Food**: Từ 1.200.000đ / concept\n\n` +
        `Để xem chi tiết đầy đủ hơn, vui lòng tham khảo trang dịch vụ của chúng tôi.`,
        ["Xem trang dịch vụ", "Tìm photographer phù hợp"]
      );
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
        `3. Chọn Ngày & Khung giờ chụp, điền yêu cầu (concept, địa điểm cụ thể), sau đó tiến hành thanh toán tiền cọc 30% để xác nhận đặt lịch thành công!\n\n` +
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
        `• Số tiền 70% còn lại bạn sẽ thanh toán trực tiếp cho Photographer bằng tiền mặt hoặc chuyển khoản sau khi buổi chụp hình hoàn thành và bạn nhận được ảnh.\n` +
        `• Các cổng thanh toán hỗ trợ: Chuyển khoản ngân hàng, MoMo, VNPay.\n\n` +
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
        `• **Hủy lịch miễn phí trước 48 giờ**: Nếu bạn hủy lịch trước thời điểm chụp từ 48 tiếng trở lên, bạn sẽ được hoàn trả **100% tiền đặt cọc** tự động.\n` +
        `• **Hủy lịch muộn (sau 48 giờ)**: Số tiền cọc sẽ được chuyển cho nhiếp ảnh gia như một khoản bồi thường chuẩn bị.\n` +
        `• **Đổi lịch**: Bạn có thể thỏa thuận đổi lịch trực tiếp với photographer thông qua hộp chat tin nhắn riêng để không mất phí.\n\n` +
        `Nếu bạn cần hỗ trợ hủy lịch cụ thể, hãy liên hệ CSKH nhé.`,
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
        `**Thông tin liên hệ hỗ trợ khách hàng của Sudion:**\n\n` +
        `• **Hotline hỗ trợ 24/7**: 1900 1234\n` +
        `• **Email CSKH**: support@studion.vn\n` +
        `• **Địa chỉ văn phòng**: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh\n\n` +
        `Tôi có thể giúp bạn các vấn đề khác liên quan đến đặt lịch không?`,
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
      `Chào bạn! Dù ở chế độ giả lập, tôi vẫn có thể tư vấn tốt cho bạn. Có phải bạn đang quan tâm đến việc chọn photographer phù hợp, chọn concept chụp hình hay các chính sách thanh toán/hủy lịch trên Sudion không?\n\nHãy chọn một trong các tùy chọn nhanh dưới đây hoặc hỏi cụ thể hơn nhé:`,
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
              <a href="/photographer-profile?id=${p.id}" class="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg shrink-0 transition-colors">
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
              <a href="/photographer-profile?id=${p.id}" class="px-2.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg shrink-0 transition-colors">
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

  // Call real AI (Gemini or OpenAI API directly from client)
  const callRealAI = async (userInput: string, settings?: AiSettings | null) => {
    const activeSettings = settings || aiSettings;
    if (!activeSettings) return;

    const { provider, model, key, endpoint, systemPrompt } = activeSettings;

    // Create summary of photographers for the AI context
    const summary = photographers
      .slice(0, 15) // Limit context size
      .map(
        (p) =>
          `- ID: ${p.id}, Họ tên: ${p.full_name}, Vùng hoạt động: ${p.active_area || "Chưa rõ"
          }, Thể loại: ${p.categories || "Đa dạng"}, Giá tối thiểu: ${p.min_price ? p.min_price.toLocaleString("vi-VN") + " VND" : "Thỏa thuận"
          }, Đánh giá: ${p.avg_rating} sao`
      )
      .join("\n");

    const systemPromptContext = `${systemPrompt}\n\nDanh sách nhiếp ảnh gia thật trên nền tảng Sudion để tư vấn:\n${summary}\n\nChú ý: Khi gợi ý một photographer cụ thể, hãy hướng dẫn khách hàng bấm vào đường dẫn theo cấu trúc '/photographer-profile?id=ID_CỦA_HỌ' để xem chi tiết và đặt lịch.`;

    const chatHistory = messages
      .slice(-10) // Send last 10 messages for context
      .map((m) => `${m.sender === "user" ? "Khách hàng" : "AI Trợ lý"}: ${m.text}`)
      .join("\n");

    if (provider === "Google Gemini") {
      // Calling Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPromptContext}\n\nLịch sử hội thoại:\n${chatHistory}\n\nKhách hàng: ${userInput}\n\nAI Trợ lý phản hồi ngắn gọn bằng tiếng Việt:`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi API Gemini");
      }

      const resJson = await response.json();
      const aiResponseText =
        resJson?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Tôi chưa nhận được phản hồi từ AI. Hãy thử lại sau.";
      addBotMessage(formatResponseHtml(aiResponseText), undefined, true);
    } else if (provider === "OpenAI") {
      // Calling OpenAI API
      const response = await fetch(endpoint || "https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPromptContext },
            {
              role: "user",
              content: `Lịch sử hội thoại:\n${chatHistory}\n\nKhách hàng: ${userInput}\n\nAI Trợ lý phản hồi:`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Lỗi API OpenAI");
      }

      const resJson = await response.json();
      const aiResponseText =
        resJson?.choices?.[0]?.message?.content ||
        "Tôi chưa nhận được phản hồi từ OpenAI. Hãy thử lại.";
      addBotMessage(formatResponseHtml(aiResponseText), undefined, true);
    }
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
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 hover:bg-white/10 text-white transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
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
              placeholder="Hỏi tôi bất kỳ điều gì..."
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
