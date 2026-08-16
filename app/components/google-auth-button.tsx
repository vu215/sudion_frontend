"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useAuth } from "@/app/auth-context";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          prompt: (notification?: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  buttonText?: string;
  onError?: (msg: string) => void;
  onSuccess?: () => void;
}

export function GoogleAuthButton({
  buttonText = "Đăng nhập bằng Google",
  onError,
  onSuccess,
}: GoogleAuthButtonProps) {
  const { loginWithGoogleCredential, transitionTo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hasIframe, setHasIframe] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "774751713972-f6m6ce3l5hf10cvrd0dad381m78i7gne.apps.googleusercontent.com";

  const handleCredentialResponse = async (response: { credential?: string }) => {
    if (!response.credential) {
      onError?.("Không nhận được mã xác thực (credential) từ Google.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithGoogleCredential(response.credential);
      setLoading(false);

      if (result.ok) {
        onSuccess?.();
        transitionTo("/");
      } else {
        onError?.(result.error || "Đăng nhập bằng Google thất bại.");
      }
    } catch (err: any) {
      setLoading(false);
      onError?.(err?.message || "Đã xảy ra lỗi kết nối với server Google login.");
    }
  };

  const setupGsi = () => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        use_fedcm_for_prompt: false,
        itp_support: true,
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: buttonText.includes("Đăng ký") ? "signup_with" : "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 360,
          locale: "vi",
        });

        setTimeout(() => {
          if (containerRef.current && containerRef.current.children.length > 0) {
            setHasIframe(true);
          }
        }, 500);
      }
    } catch (err) {
      console.error("[GoogleAuthButton] GSI init error:", err);
    }
  };

  useEffect(() => {
    if (window.google?.accounts?.id) {
      setupGsi();
    }
  }, [clientId, buttonText]);

  const handleButtonClick = () => {
    if (loading) return;

    if (containerRef.current) {
      const btn = containerRef.current.querySelector('[role="button"]') as HTMLElement;
      const iframe = containerRef.current.querySelector("iframe");
      if (btn) {
        btn.click();
        return;
      }
      if (iframe) {
        iframe.click();
        return;
      }
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          use_fedcm_for_prompt: false,
        });
        window.google.accounts.id.prompt();
      } catch (err) {
        console.error("[GoogleAuthButton] Prompt error:", err);
      }
    } else {
      onError?.("Thư viện Google Identity chưa sẵn sàng. Vui lòng thử lại sau vài giây.");
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setupGsi();
        }}
      />

      <div className="w-full flex flex-col items-center justify-center relative">
        {/* Render container for standard Google button iframe */}
        <div
          ref={containerRef}
          className={`w-full flex justify-center min-h-[44px] overflow-hidden rounded-xl ${
            hasIframe ? "block" : "hidden"
          }`}
        />

        {/* Styled button matching theme */}
        {!hasIframe && (
          <button
            type="button"
            disabled={loading}
            onClick={handleButtonClick}
            className="flex items-center justify-center gap-2.5 w-full h-11 rounded-xl border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-sm font-semibold text-[#1e293b] shadow-sm transition duration-200 cursor-pointer disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {loading ? "Đang xác thực Google..." : buttonText}
          </button>
        )}
      </div>
    </>
  );
}
