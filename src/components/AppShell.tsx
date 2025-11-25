"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "お気に入り店舗", href: "/stores" },
  { label: "コンディション", href: "/condition" },
  { label: "トレーニング", href: "/training" },
  { label: "ホーム", href: "/" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pathname = usePathname();

  const safeToUseCamera =
    typeof navigator !== "undefined" && !!navigator.mediaDevices;

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!cameraOpen) {
      stopStream();
      return;
    }

    if (!safeToUseCamera) {
      return;
    }

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
        setCameraError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        setCameraError(error?.message || "カメラを起動できませんでした");
      });

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [cameraOpen, safeToUseCamera, stopStream]);

  const shiftClass = drawerOpen ? "translate-x-72" : "translate-x-0";

  const handleOpenCamera = () => {
    if (!safeToUseCamera) {
      setCameraError("カメラにアクセスできません（非対応ブラウザ）");
      setCameraOpen(true);
      return;
    }
    setCameraError(null);
    setCameraOpen(true);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f7f2f5] text-[#3b2f32]">
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <Header
        onMenu={() => setDrawerOpen((prev) => !prev)}
        onQr={handleOpenCamera}
        shiftClass={shiftClass}
      />

      <main
        className={`relative z-10 min-h-screen pb-32 pt-16 transition-transform duration-300 ease-out ${shiftClass}`}
      >
        {children}
      </main>

      <FooterActions
        shiftClass={shiftClass}
        onRecord={() => alert("記録ボタンの動作を設定してください")}
        onQr={handleOpenCamera}
      />
      <FooterNav currentPath={pathname} shiftClass={shiftClass} />

      {drawerOpen ? (
        <button
          aria-label="メニューを閉じる"
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <CameraSheet
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        videoRef={videoRef}
        error={cameraError}
      />
    </div>
  );
}

function FooterActions({
  shiftClass,
  onRecord,
  onQr,
}: {
  shiftClass: string;
  onRecord: () => void;
  onQr: () => void;
}) {
  return (
    <div
      className={`fixed right-4 z-40 flex flex-row gap-3 transition-transform duration-300 ease-out ${shiftClass}`}
      style={{ bottom: "6rem" }}
    >
      <button
        onClick={onRecord}
        aria-label="記録"
        className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#4b3f42] text-xs font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#3f3437]"
      >
        <PlusIcon />
        <span className="leading-tight">記録</span>
      </button>
      <button
        onClick={onQr}
        aria-label="QR"
        className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-[#4b3f42] text-xs font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#3f3437]"
      >
        <QrIcon />
        <span className="leading-tight">QR</span>
      </button>
    </div>
  );
}

function FooterNav({
  currentPath,
  shiftClass,
}: {
  currentPath: string | null;
  shiftClass: string;
}) {
  const itemsWithIcon = [
    { ...navItems[3], icon: <HomeIcon /> },
    { ...navItems[2], icon: <BarbellIcon /> },
    { ...navItems[1], icon: <LineChartIcon /> },
    { ...navItems[0], icon: <BuildingIcon /> },
  ];

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-[#3b2f32] bg-[#4b3f42] py-2 shadow-[0_-8px_18px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${shiftClass}`}
    >
      <div className="mx-auto flex max-w-5xl justify-evenly px-3">
        {itemsWithIcon.map((item) => {
          const active = currentPath === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                active ? "text-[#f8c1d3]" : "text-white/80 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={`text-lg leading-none ${
                  active ? "drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

function Header({
  onMenu,
  onQr,
  shiftClass,
}: {
  onMenu: () => void;
  onQr: () => void;
  shiftClass: string;
}) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 text-[#3b2f32] shadow-sm transition-transform duration-300 ease-out ${shiftClass}`}
    >
      <button
        onClick={onMenu}
        aria-label="メニューを開く"
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/60"
      >
        <HamburgerIcon />
      </button>
      <div className="flex items-center gap-3 text-sm font-semibold">
        <span className="text-[#f06488]">FIT365</span>
      </div>
      <button
        onClick={onQr}
        aria-label="QRコードを読み取る"
        className="flex items-center justify-center p-2 text-[#3b2f32] transition hover:-translate-y-0.5 hover:text-[#f06488]"
      >
        <QrIcon />
      </button>
    </header>
  );
}

function SideDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-white px-5 pt-5 shadow-xl transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="text-lg font-semibold text-slate-800">ナビゲーション</div>
        <button
          onClick={onClose}
          aria-label="閉じる"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
        >
          <CloseIcon />
        </button>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            onClick={onClose}
          >
            <span>{item.label}</span>
            <span className="text-xs text-slate-400">›</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function CameraSheet({
  open,
  onClose,
  videoRef,
  error,
}: {
  open: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  error: string | null;
}) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-14 z-[80] ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 transform transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="absolute -top-12 left-4">
          <button
            onClick={onClose}
            aria-label="??????????"
            className="rounded-full bg-white p-3 text-slate-700 shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="mx-auto max-w-xl rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-100">
          <div className="flex items-center justify-between px-4 pt-4">
            <div className="text-base font-semibold text-slate-800">
              QR????????
            </div>
            <span className="text-xs text-slate-400">????HTTPS?????</span>
          </div>
          <div className="p-4">
            <div className="relative overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <video
                ref={videoRef}
                className="aspect-[3/4] w-full bg-black object-cover"
                playsInline
                muted
              />
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 px-4 text-center text-sm font-medium text-rose-500">
                  {error}
                </div>
              ) : (
                <div className="pointer-events-none absolute inset-0 border border-white/20">
                  <div className="absolute inset-4 border-2 border-white/60" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-slate-500">
              ??????????????????????????????
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="16" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3z" />
      <path d="M20 14v3" />
      <path d="M14 20h3" />
      <path d="M17 17h3" />
      <path d="M20 17v3h-3" />
    </svg>
  );
}

function BarbellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9v6" />
      <path d="M22 9v6" />
      <path d="M6 6v12" />
      <path d="M18 6v12" />
      <path d="M2 12h20" />
    </svg>
  );
}

function LineChartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m6 15 4-4 3 3 5-6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 9-8 9 8" />
      <path d="M9 21V9h6v12" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="8" width="7" height="13" rx="1" />
      <path d="M7.5 8h-3" />
      <path d="M7.5 12h-3" />
      <path d="M7.5 16h-3" />
      <path d="M18.5 12h-3" />
      <path d="M18.5 16h-3" />
      <path d="M18.5 20h-3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
