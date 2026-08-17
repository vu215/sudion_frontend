"use client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://sudion-backend-production-453b.up.railway.app/api";

const PLAN_CACHE_KEY = "sudion_campaign_ai_plan";
const PROMPT_CACHE_KEY = "sudion_campaign_ai_prompt";

type AnyObject = Record<string, any>;

function authHeaders() {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("sudion_token")
      : null;

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.error || `API lỗi ${response.status}`;
    const error = new Error(message) as Error & { status?: number; response?: any };
    error.status = response.status;
    error.response = data;
    throw error;
  }

  if (data && !data.error && data.message) {
    data.error = null;
  }
  return data;
}

function normalizeCampaignType(value: unknown) {
  const type = String(value || "service").toLowerCase();
  if (type === "product") return "product";
  if (type === "hybrid" || type === "mixed") return "hybrid";
  return "service";
}

function previewSchedules(plan: AnyObject) {
  const schedules: AnyObject[] = [];
  for (const content of plan.contents || []) {
    const type = String(content.contentType || content.content_type || "IN_APP_POST").toUpperCase();
    const publishAt = content.publishAt || content.publish_at || plan.startAt || plan.start_at;
    const removeAt = content.removeAt || content.remove_at || plan.endAt || plan.end_at;

    if (type === "BANNER") {
      schedules.push({ action_type: "PUBLISH_BANNER", scheduled_at: publishAt });
      if (removeAt) schedules.push({ action_type: "REMOVE_BANNER", scheduled_at: removeAt });
    } else if (type === "NOTIFICATION") {
      schedules.push({ action_type: "SEND_NOTIFICATION", scheduled_at: publishAt });
    } else if (type === "EMAIL") {
      schedules.push({ action_type: "SEND_EMAIL", scheduled_at: publishAt });
    } else {
      schedules.push({ action_type: "PUBLISH_CONTENT", scheduled_at: publishAt });
    }
  }

  for (const promotion of plan.promotions || []) {
    schedules.push({
      action_type: "ACTIVATE_DISCOUNT",
      scheduled_at: promotion.startAt || promotion.start_at || plan.startAt || plan.start_at,
    });
    schedules.push({
      action_type: "DEACTIVATE_DISCOUNT",
      scheduled_at: promotion.endAt || promotion.end_at || plan.endAt || plan.end_at,
    });
  }

  return schedules.filter((item) => item.scheduled_at);
}

function planToUi(plan: AnyObject) {
  const predictions = plan.predictions || {};
  const clicks = Number(predictions.clicks || 0);
  const conversions = Number(predictions.bookings || 0) + Number(predictions.orders || 0);
  const conversionRate = clicks > 0 ? Number(((conversions / clicks) * 100).toFixed(2)) : 0;
  const audience = plan.targetAudience || plan.target_audience || {};
  const promotion = Array.isArray(plan.promotions) ? plan.promotions[0] : null;

  return {
    ...plan,
    campaign_type: normalizeCampaignType(plan.campaignType || plan.campaign_type),
    start_at: plan.startAt || plan.start_at || "",
    end_at: plan.endAt || plan.end_at || "",
    discount_value: Number(promotion?.discountValue ?? promotion?.discount_value ?? 0),
    target_group: audience.name || audience.type || "Khách hàng Sudion",
    projection: {
      views: Number(predictions.reach || predictions.views || 0),
      clicks,
      bookings: Number(predictions.bookings || 0),
      orders: Number(predictions.orders || 0),
      revenue: Number(predictions.revenue || 0),
      conversion_rate: conversionRate,
    },
    contents: (plan.contents || []).map((item: AnyObject) => ({
      ...item,
      content_type: item.contentType || item.content_type || "IN_APP_POST",
      title: item.title || "",
      content: item.body || item.content || "",
      cta_text: item.ctaText || item.cta_text || "",
      cta_url: item.ctaUrl || item.cta_url || "",
      image_url: item.imageUrl || item.image_url || "",
      publish_at: item.publishAt || item.publish_at || plan.startAt || "",
      remove_at: item.removeAt || item.remove_at || plan.endAt || "",
    })),
    schedules: previewSchedules(plan),
  };
}

function savePlanCache(plan: AnyObject, prompt: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PLAN_CACHE_KEY, JSON.stringify(plan));
  window.sessionStorage.setItem(PROMPT_CACHE_KEY, prompt || "");
}

function readPlanCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PLAN_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearPlanCache() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PLAN_CACHE_KEY);
  window.sessionStorage.removeItem(PROMPT_CACHE_KEY);
}

function buildManualPlan(payload: AnyObject) {
  const startAt = payload.start_at || payload.startAt;
  const endAt = payload.end_at || payload.endAt;
  const campaignType = normalizeCampaignType(payload.campaign_type || payload.campaignType);
  const discountValue = Number(payload.discount_value || payload.discountValue || 0);

  return {
    name: String(payload.name || "").trim(),
    description: String(payload.description || "").trim(),
    objective: String(payload.description || "Tăng chuyển đổi cho Sudion Studio."),
    campaignType,
    startAt,
    endAt,
    timezone: "Asia/Ho_Chi_Minh",
    budget: Number(payload.budget || 0),
    targetAudience: {
      name: "Khách hàng Sudion",
      type: "CUSTOMERS",
      conditions: { roles: ["customer", "client"], status: "active" },
      estimatedReach: 0,
    },
    contents: [
      {
        contentType: "IN_APP_POST",
        channel: "sudion",
        title: String(payload.name || "Chiến dịch Sudion"),
        body: String(payload.description || payload.name || ""),
        ctaText: "Xem ngay",
        ctaUrl: campaignType === "product" ? "/products" : "/photographer",
        imageUrl: "",
        publishAt: startAt,
        removeAt: endAt,
        position: "home_campaign",
        metadata: {},
      },
    ],
    promotions:
      discountValue > 0
        ? [
            {
              name: String(payload.name || "Ưu đãi chiến dịch"),
              code: null,
              discountType: "percentage",
              discountValue,
              maxDiscountAmount: null,
              minOrderValue: 0,
              targetType:
                campaignType === "product"
                  ? "PRODUCT"
                  : campaignType === "hybrid"
                  ? "ALL"
                  : "SERVICE",
              targetIds: [],
              quantity: -1,
              startAt,
              endAt,
              metadata: {},
            },
          ]
        : [],
    predictions: { reach: 0, clicks: 0, bookings: 0, orders: 0, revenue: 0 },
  };
}

function mergeUiEditsIntoPlan(basePlan: AnyObject, payload: AnyObject) {
  const uiPlan = payload.plan || null;
  const startAt = payload.start_at || basePlan.startAt;
  const endAt = payload.end_at || basePlan.endAt;
  const campaignType = normalizeCampaignType(
    payload.campaign_type || uiPlan?.campaign_type || basePlan.campaignType
  );
  const discountValue = Number(payload.discount_value ?? uiPlan?.discount_value ?? 0);

  const plan: AnyObject = {
    ...basePlan,
    name: payload.name ?? basePlan.name,
    description: payload.description ?? basePlan.description,
    campaignType,
    startAt,
    endAt,
    contents: [...(basePlan.contents || [])],
    promotions: [...(basePlan.promotions || [])],
  };

  if (uiPlan?.contents?.length) {
    plan.contents = uiPlan.contents.map((item: AnyObject, index: number) => {
      const original = basePlan.contents?.[index] || {};
      return {
        ...original,
        contentType: item.content_type || original.contentType || "IN_APP_POST",
        title: item.title ?? original.title ?? "",
        body: item.content ?? original.body ?? "",
        ctaText: item.cta_text ?? original.ctaText ?? "",
        ctaUrl: item.cta_url ?? original.ctaUrl ?? "",
        imageUrl: item.image_url ?? original.imageUrl ?? "",
        publishAt: item.publish_at || original.publishAt || startAt,
        removeAt: item.remove_at || original.removeAt || endAt,
      };
    });
  }

  if (discountValue > 0) {
    if (plan.promotions.length) {
      plan.promotions[0] = {
        ...plan.promotions[0],
        discountValue,
        startAt: plan.promotions[0].startAt || startAt,
        endAt: plan.promotions[0].endAt || endAt,
      };
    } else {
      plan.promotions.push({
        name: plan.name || "Ưu đãi chiến dịch",
        code: null,
        discountType: "percentage",
        discountValue,
        maxDiscountAmount: null,
        minOrderValue: 0,
        targetType: campaignType === "product" ? "PRODUCT" : campaignType === "hybrid" ? "ALL" : "SERVICE",
        targetIds: [],
        quantity: -1,
        startAt,
        endAt,
        metadata: {},
      });
    }
  } else {
    plan.promotions = [];
  }

  return plan;
}

function aggregateMetrics(rows: AnyObject[]) {
  const result = { views: 0, clicks: 0, bookings: 0, orders: 0, revenue: 0 };
  for (const row of rows || []) {
    result.views += Number(row.views || 0);
    result.clicks += Number(row.clicks || 0);
    result.bookings += Number(row.bookings || 0);
    result.orders += Number(row.orders || 0);
    result.revenue += Number(row.revenue || 0);
  }
  return result;
}

function detailToUi(data: AnyObject) {
  const audience = data.audiences?.[0] || data.audience || {};
  const status = data.status === "RUNNING" ? "ACTIVE" : data.status;
  return {
    ...data,
    status,
    campaign_type: normalizeCampaignType(data.campaign_type),
    contents: (data.contents || []).map((item: AnyObject) => ({
      ...item,
      content: item.body || item.content || "",
      ai_generated: data.source_type === "AI",
    })),
    promotions: (data.promotions || []).map((item: AnyObject) => ({
      ...item,
      target_ids: Array.isArray(item.target_ids)
        ? item.target_ids.join(", ") || "Tất cả"
        : item.target_ids || "Tất cả",
    })),
    audience: {
      ...audience,
      conditions:
        typeof audience.conditions === "string"
          ? audience.conditions
          : JSON.stringify(audience.conditions || {}, null, 2),
    },
    metrics: aggregateMetrics(data.metrics || []),
  };
}

function reportToUi(report: AnyObject) {
  return {
    ...report,
    executive_summary: report.executive_summary || report.summary || "",
    strengths: Array.isArray(report.strengths) ? report.strengths : [],
    weaknesses: Array.isArray(report.weaknesses) ? report.weaknesses : [],
    recommendations: Array.isArray(report.recommendations)
      ? report.recommendations.join("\n")
      : report.recommendations || "",
  };
}

export const api = {
  campaigns: {
    async generate(prompt: string) {
      const res = await request("/admin/campaigns/generate", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      if (res?.success && res?.data) {
        savePlanCache(res.data, prompt);
        return { ...res, data: planToUi(res.data) };
      }
      return res;
    },

    async refine(params: AnyObject) {
      return request("/admin/campaigns/refine", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },

    async create(payload: AnyObject) {
      const sourceType = String(payload.sourceType || "AI").toUpperCase();
      const cached = sourceType === "AI" ? readPlanCache() : null;
      const basePlan = cached || buildManualPlan(payload);
      const plan = mergeUiEditsIntoPlan(basePlan, payload);
      const prompt =
        payload.prompt ||
        (typeof window !== "undefined"
          ? window.sessionStorage.getItem(PROMPT_CACHE_KEY)
          : null);

      const res = await request("/admin/campaigns/create", {
        method: "POST",
        body: JSON.stringify({
          plan,
          prompt: prompt || null,
          sourceType,
          saveAs: payload.status === "SCHEDULED" ? "SCHEDULED" : "DRAFT",
        }),
      });
      if (res?.success) clearPlanCache();
      return res;
    },

    async getAll(params: AnyObject = {}) {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
      }
      const res = await request(`/admin/campaigns${query.toString() ? `?${query}` : ""}`);
      if (Array.isArray(res?.data)) {
        res.data = res.data.map((item: AnyObject) => ({
          ...item,
          status: item.status === "RUNNING" ? "ACTIVE" : item.status,
          campaign_type: normalizeCampaignType(item.campaign_type),
        }));
      }
      return res;
    },

    async getById(id: string | number) {
      const res = await request(`/admin/campaigns/${id}`);
      return res?.data ? { ...res, data: detailToUi(res.data) } : res;
    },

    async approve(id: string | number) {
      const res = await request(`/admin/campaigns/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      return res?.data ? { ...res, data: detailToUi(res.data) } : res;
    },

    async delete(id: string | number) {
      return request(`/admin/campaigns/${id}`, { method: "DELETE" });
    },

    async getReport(id: string | number) {
      const res = await request(`/admin/campaigns/${id}/report`);
      return res?.data ? { ...res, data: reportToUi(res.data) } : res;
    },

    async runSchedulerOnce() {
      return request("/admin/campaigns/scheduler/run-once", {
        method: "POST",
        body: JSON.stringify({}),
      });
    },
  },
};
