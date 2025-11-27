"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type NavItem = {
  label: string;
  href: string;
};

type SheetControls = {
  openCalendar: () => void;
  closeCalendar: () => void;
  calendarOpen: boolean;
};

const SheetContext = createContext<SheetControls | null>(null);

export function useSheetControls() {
  const ctx = useContext(SheetContext);
  if (!ctx) {
    throw new Error("useSheetControls must be used inside AppShell");
  }
  return ctx;
}

const navItems: NavItem[] = [
  { label: "お知らせ", href: "/news" },
  { label: "ベアレージポイント", href: "/points" },
  { label: "友達紹介", href: "/referral" },
  { label: "デジタルチケット", href: "/tickets" },
  { label: "トレーニング動画", href: "/training-videos" },
  { label: "レズミルズ動画", href: "/lesmills" },
  { label: "来館の記録", href: "/visits" },
  { label: "FIT365施設利用方法", href: "/guide" },
  { label: "契約情報", href: "/contract" },
  { label: "各種お手続き", href: "/procedures" },
  { label: "お支払い情報", href: "/billing" },
  { label: "オンラインショップ", href: "/shop" },
  { label: "アプリ設定", href: "/settings" },
  { label: "minefitのご紹介", href: "/minefit" },
  { label: "お問い合わせ", href: "/contact" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [infoSheet, setInfoSheet] = useState<{ title: string; message: string } | null>(null);
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const slideRoutes = new Set([
    "/news",
    "/points",
    "/referral",
    "/training-videos",
    "/lesmills",
    "/visits",
    "/guide",
    "/contract",
    "/procedures",
    "/billing",
    "/settings",
    "/contact",
  ]);
  const isSlidePage = (pathname ? slideRoutes.has(pathname) : false) || infoSheetOpen;

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
  const overlayOpen = drawerOpen || cameraOpen || calendarOpen || infoSheetOpen;

  const handleOpenCamera = () => {
    if (!safeToUseCamera) {
      setCameraError("カメラにアクセスできません（非対応ブラウザ）");
      setCameraOpen(true);
      return;
    }
    setCameraError(null);
    setCameraOpen(true);
  };

  useEffect(() => {
    if (overlayOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlayOpen]);

  return (
    <SheetContext.Provider
      value={{
        openCalendar: () => setCalendarOpen(true),
        closeCalendar: () => setCalendarOpen(false),
        calendarOpen,
      }}
    >
      <div className="relative min-h-screen overflow-x-hidden bg-[#f7f2f5] text-[#3b2f32]">
        <SideDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onSelect={(item) => {
            setInfoSheet({ title: item.label, message: `${item.label}ページ` });
            setInfoSheetOpen(true);
          }}
        />

        <Header
          onMenu={() => setDrawerOpen((prev) => !prev)}
          onQr={handleOpenCamera}
          shiftClass={shiftClass}
          isSlidePage={isSlidePage}
          onBack={() => {
            if (infoSheetOpen) {
              setInfoSheetOpen(false);
              setTimeout(() => setInfoSheet(null), 280);
              return;
            }
            const canGoBack =
              typeof window !== "undefined" && window.history.length > 1;
            if (canGoBack) {
              router.back();
            } else {
              router.push("/");
            }
          }}
        />

        <main
          className={`relative z-10 min-h-screen pb-32 pt-16 transition-transform duration-300 ease-out ${shiftClass}`}
        >
          {children}
        </main>

        {!isSlidePage ? (
          <>
            <FooterActions
              shiftClass={shiftClass}
              onRecord={() => alert("記録ボタンの動作を設定してください")}
              onQr={handleOpenCamera}
            />
            <FooterNav
              currentPath={pathname}
              shiftClass={shiftClass}
            />
          </>
        ) : null}

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
        <CalendarSheet open={calendarOpen} onClose={() => setCalendarOpen(false)} />
        {infoSheet ? (
          <InfoSheet
            open={infoSheetOpen}
            title={infoSheet.title}
            message={infoSheet.message}
            onClose={() => {
              setInfoSheetOpen(false);
              setTimeout(() => setInfoSheet(null), 280);
            }}
          />
        ) : null}
      </div>
    </SheetContext.Provider>
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
  const router = useRouter();

  const itemsWithIcon = [
    { label: "ホーム", href: "/", icon: <HomeIcon /> },
    { label: "トレーニング", href: "/training", icon: <BarbellIcon /> },
    { label: "コンディション", href: "/condition", icon: <LineChartIcon /> },
    { label: "お気に入り店舗", href: "/stores", icon: <BuildingIcon /> },
  ];

  return (
    <nav
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-[#3b2f32] bg-[#4b3f42] py-2 shadow-[0_-8px_18px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out ${shiftClass}`}
    >
      <div className="mx-auto flex max-w-5xl justify-evenly px-3">
        {itemsWithIcon.map((item) => {
          const active = currentPath === item.href;
          return (
            <button
              key={item.label}
              type="button"
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                active ? "text-[#f8c1d3]" : "text-white/80 hover:text-white"
              }`}
              aria-current={active ? "page" : undefined}
              onClick={() => router.push(item.href)}
            >
              <span
                className={`text-lg leading-none ${
                  active ? "drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]" : ""
                }`}
              >
                {item.icon}
              </span>
              <span className="leading-none">{item.label}</span>
            </button>
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
  isSlidePage,
  onBack,
}: {
  onMenu: () => void;
  onQr: () => void;
  shiftClass: string;
  isSlidePage: boolean;
  onBack: () => void;
}) {
  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 text-[#3b2f32] shadow-sm transition-transform duration-300 ease-out ${shiftClass}`}
    >
      {isSlidePage ? (
        <button
          onClick={onBack}
          aria-label="戻る"
          className="ml-0 flex items-center gap-1 rounded-lg px-1 py-1 transition-colors hover:bg-white/60"
        >
          <BackIcon />
        </button>
      ) : (
        <button
          onClick={onMenu}
          aria-label="メニューを開く"
          className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/60"
        >
          <HamburgerIcon />
        </button>
      )}
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
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (item: NavItem) => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white px-5 pt-5 shadow-xl transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="space-y-0">
        {navItems.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className={`group flex w-full items-center justify-between px-3 py-3 text-left text-sm font-medium text-slate-800 transition ${
              index % 2 === 0 ? "bg-slate-100" : "bg-white"
            }`}
            onClick={() => {
              onSelect(item);
              onClose();
            }}
          >
            <span>{item.label}</span>
            <span className="text-xs text-slate-400">›</span>
          </button>
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
      className={`fixed inset-0 z-[80] ${
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
          open ? "translate-y-0" : "translate-y-[calc(100%+3.5rem)]"
        }`}
        style={{ maxHeight: "calc(100dvh - 3.5rem)" }}
      >
        <div className="absolute left-4 -top-12 z-10">
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-full bg-white p-3 text-black shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="relative mx-auto max-w-xl max-h-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-100">
          <div className="sticky top-0 flex items-center bg-white px-4 pt-4 pb-2">
            <div className="text-base font-semibold text-slate-800">
              QRコードを読み取る
            </div>
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
              画面内の枠にコードが入るようにかざしてください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = `${year}/${month + 1}`;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weekdayLabels = ["日", "月", "火", "水", "木", "金", "土"];

  const goPrevMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNextMonth = () =>
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div
      className={`fixed inset-0 z-[80] ${
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
          open ? "translate-y-0" : "translate-y-[calc(100%+3.5rem)]"
        }`}
        style={{ maxHeight: "calc(100dvh - 3.5rem)" }}
      >
        <div className="absolute left-4 -top-12 z-10">
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-full bg-white p-3 text-black shadow-md transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="relative mx-auto max-w-xl max-h-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl ring-1 ring-slate-100">
          <div className="sticky top-0 flex items-center justify-between bg-white px-4 pt-4 pb-2">
            <button
              type="button"
              aria-label="前の月へ"
              onClick={goPrevMonth}
              className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#3b2f32] shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              ＜
            </button>
            <div className="text-base font-semibold text-slate-800">{monthLabel}</div>
            <button
              type="button"
              aria-label="次の月へ"
              onClick={goNextMonth}
              className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-[#3b2f32] shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              ＞
            </button>
          </div>
          <div className="px-4 pb-4">
            <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-slate-500">
              {weekdayLabels.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {cells.map((day, idx) => {
                const isToday =
                  day &&
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();
                return (
                  <div
                    key={day ? `${year}-${month + 1}-${day}` : `empty-${idx}`}
                    className={`flex aspect-square items-center justify-center rounded-lg border border-slate-100 ${
                      day && isToday
                        ? "bg-[#f9e3eb] font-semibold text-[#f06488] shadow-inner"
                        : "bg-white text-slate-700"
                    }`}
                  >
                    {day ?? ""}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoSheet({
  open,
  title,
  message,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [bodyVisible, setBodyVisible] = useState(false);

  useEffect(() => {
    if (open) {
      const h = setTimeout(() => setHeaderVisible(true), 40);
      const b = setTimeout(() => setBodyVisible(true), 140);
      return () => {
        clearTimeout(h);
        clearTimeout(b);
      };
    } else {
      setHeaderVisible(false);
      setBodyVisible(false);
    }
  }, [open]);

  return (
    <div
      className="fixed inset-0 z-20 pointer-events-none"
    >
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-14 bottom-0 bg-transparent ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div className="absolute inset-x-0 top-14 bottom-0">
        <div className="relative h-full w-full pointer-events-auto">
          <div
            className={`absolute inset-x-0 top-0 z-10 flex justify-center transition-transform duration-300 ease-out ${
              headerVisible ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <div className="w-full bg-[#f06488] px-4 py-2 text-center text-base font-bold text-white">
              {title}
            </div>
          </div>
          <div
            className={`absolute inset-0 bg-white shadow-2xl ring-1 ring-slate-100 transition-transform duration-300 ease-out ${
              bodyVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full overflow-y-auto px-4 pb-6 pt-12 text-sm text-[#4f4347]">
              {message}
            </div>
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
      <line x1="4" x2="20" y1="12" y2="12" />
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

function BackIcon() {
  return (
    <svg
      width="12"
      height="20"
      viewBox="0 0 12 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3 3 10l6 7" />
    </svg>
  );
}
