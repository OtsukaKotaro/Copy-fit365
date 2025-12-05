"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, {
  UIEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SheetPage from "./SheetPage";

type NavItem = {
  label: string;
  href: string;
};

type SheetKey =
  | "qr"
  | "myQr"
  | "recordTraining"
  | "recordCondition"
  | "recordStore"
  | "storeHome"
  | "news"
  | "points"
  | "referral"
  | "digitalTicket"
  | "trainingVideos"
  | "lesmills"
  | "visits"
  | "guide"
  | "contract"
  | "procedures"
  | "billing"
  | "shop"
  | "settings"
  | "help"
  | "minefit"
  | "contact";

type SheetInfo = { title: string; message: string };

type OpenSheetOptions = { closable?: boolean };

const drawerItems: (NavItem & { sheet?: SheetKey })[] = [
  { label: "お知らせ", href: "#", sheet: "news" },
  { label: "ベアレージポイント", href: "#", sheet: "points" },
  { label: "友達紹介", href: "#", sheet: "referral" },
  { label: "デジタルチケット", href: "#", sheet: "digitalTicket" },
  { label: "トレーニング動画", href: "#", sheet: "trainingVideos" },
  { label: "レズミルズ動画", href: "#", sheet: "lesmills" },
  { label: "来館の記録", href: "#", sheet: "visits" },
  { label: "FIT365施設利用方法", href: "#", sheet: "guide" },
  { label: "契約情報", href: "#", sheet: "contract" },
  { label: "各種お手続き", href: "#", sheet: "procedures" },
  { label: "お支払い情報", href: "#", sheet: "billing" },
  { label: "オンラインショップ", href: "#", sheet: "shop" },
  { label: "アプリ設定", href: "#", sheet: "settings" },
  { label: "ヘルプ", href: "#", sheet: "help" },
  { label: "minefitのご紹介", href: "#", sheet: "minefit" },
  { label: "お問い合わせ", href: "#", sheet: "contact" },
];

const footerItems: NavItem[] = [
  { label: "ホーム", href: "/" },
  { label: "トレーニング", href: "/training" },
  { label: "コンディション", href: "/condition" },
  { label: "お気に入り店舗", href: "/stores" },
];

const recordTargets: Record<string, SheetKey> = {
  "/": "recordTraining",
  "/training": "recordTraining",
  "/condition": "recordCondition",
  "/stores": "recordStore",
};

const sheetMap: Record<SheetKey, SheetInfo> = {
  qr: { title: "QRコード", message: "QRコードシート" },
  myQr: { title: "マイQRコード", message: "マイQRコードシート" },
  recordTraining: { title: "トレーニング記録", message: "トレーニング記録シート" },
  recordCondition: { title: "コンディション記録", message: "コンディション記録シート" },
  recordStore: { title: "店舗検索", message: "店舗検索シート" },
  storeHome: { title: "店舗ホームページ", message: "店舗ホームページ / アプリダウンロード表示シート" },
  news: { title: "お知らせ", message: "お知らせシート" },
  points: { title: "ベアレージポイント", message: "ポイント確認シート" },
  referral: { title: "友達紹介", message: "友達紹介シート" },
  digitalTicket: { title: "デジタルチケット", message: "デジタルチケットシート" },
  trainingVideos: { title: "トレーニング動画", message: "トレーニング動画シート" },
  lesmills: { title: "レズミルズ動画", message: "レズミルズ動画シート" },
  visits: { title: "来館の記録", message: "来館記録シート" },
  guide: { title: "FIT365施設利用方法", message: "FIT365施設利用方法シート" },
  contract: { title: "契約情報", message: "契約情報シート" },
  procedures: { title: "各種お手続き", message: "各種お手続きシート" },
  billing: { title: "お支払い情報", message: "お支払い情報シート" },
  shop: { title: "オンラインショップ", message: "オンラインショップシート" },
  settings: { title: "アプリ設定", message: "アプリ設定シート" },
  help: { title: "ヘルプ", message: "ヘルプシート" },
  minefit: { title: "minefitのご紹介", message: "minefitのご紹介シート" },
  contact: { title: "お問い合わせ", message: "お問い合わせシート" },
};

const dimmedSheetKeys = new Set<SheetKey>(["qr", "myQr", "recordTraining", "recordCondition", "recordStore", "storeHome"]);
const bottomSlideKeys = new Set<SheetKey>(["qr", "myQr", "recordTraining", "recordCondition", "recordStore", "storeHome"]);

const SheetControlsContext = createContext<{ openCalendar: () => void; openSheet: (key: SheetKey, opts?: OpenSheetOptions) => void }>({
  openCalendar: () => {},
  openSheet: () => {},
});

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<{ key: SheetKey; closable: boolean } | null>(null);
  const [sheetCloseSignal, setSheetCloseSignal] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayActive, setOverlayActive] = useState(false);
  const [overlayDimmed, setOverlayDimmed] = useState(false);
  const pathname = usePathname();

  const shiftClass = drawerOpen ? "translate-x-72" : "translate-x-0";

  const openSheet = useCallback((key: SheetKey, opts?: OpenSheetOptions) => {
    setActiveSheet({ key, closable: opts?.closable ?? true });
  }, []);

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
  }, []);

  const sheetContent = activeSheet ? sheetMap[activeSheet.key] : null;
  const sheetIsOpen = Boolean(activeSheet && sheetContent);
  const shouldRenderOverlay = sheetIsOpen || overlayActive || overlayVisible;
  const currentDimmed = activeSheet ? dimmedSheetKeys.has(activeSheet.key) : overlayDimmed;

  useEffect(() => {
    if (activeSheet) {
      setOverlayDimmed(dimmedSheetKeys.has(activeSheet.key));
      setOverlayActive(true);
      setOverlayVisible(true);
    } else {
      setOverlayVisible(false);
    }
  }, [activeSheet]);

  useEffect(() => {
    if (!sheetIsOpen && !overlayVisible) {
      setOverlayActive(false);
      setOverlayDimmed(false);
    }
  }, [sheetIsOpen, overlayVisible]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [drawerOpen]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f7f2f5] text-[#3b2f32]">
      {calendarOpen ? (
        <button
          aria-label="カレンダーを閉じる"
          onClick={() => setCalendarOpen(false)}
          className="fixed inset-0 z-50 bg-transparent"
          style={{
            backgroundColor: "rgba(0,0,0,0.32)",
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(0,0,0,0.28) 0, rgba(0,0,0,0.28) 12px, rgba(0,0,0,0.12) 12px, rgba(0,0,0,0.12) 24px)",
          }}
        />
      ) : null}

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentPath={pathname}
        onOpenSheet={(key) => {
          openSheet(key, { closable: false });
          setDrawerOpen(false);
        }}
      />

      <Header
        onMenu={() => setDrawerOpen((prev) => !prev)}
        shiftClass={shiftClass}
        onOpenQr={() => openSheet("qr")}
        sheetState={activeSheet}
        onCloseSheet={() => {
          if (activeSheet) {
            setOverlayVisible(false);
            setSheetCloseSignal((c) => c + 1);
          }
        }}
      />

      <SheetControlsContext.Provider value={{ openCalendar: () => setCalendarOpen(true), openSheet }}>
        <main className={`relative z-10 min-h-screen pb-32 pt-16 transition-transform duration-300 ease-out ${shiftClass}`}>
          {children}
        </main>
      </SheetControlsContext.Provider>

      {shouldRenderOverlay ? (
        <SheetOverlay
          visible={overlayVisible || sheetIsOpen}
          visible={overlayVisible}
          dimmed={currentDimmed}
          onFadeComplete={() => {
            if (!sheetIsOpen) {
              setOverlayActive(false);
              setOverlayDimmed(false);
            }
          }}
          content={
            sheetIsOpen && activeSheet ? (
              <SheetPage
                title={sheetContent.title}
                message={sheetContent.message}
                onClose={closeSheet}
                onStartClose={() => setOverlayVisible(false)}
                onVisibilityChange={(next) => {
                  setOverlayVisible(next);
                  if (next) setOverlayActive(true);
                }}
                showClose={activeSheet.closable}
                closeSignal={sheetCloseSignal}
                slideFrom={bottomSlideKeys.has(activeSheet.key) ? "bottom" : "right"}
              />
            ) : null
          }
        />
      ) : null}

      <PageActions currentPath={pathname} shiftClass={shiftClass} onOpenRecord={openSheet} onOpenQr={() => openSheet("qr")} />
      <FooterNav currentPath={pathname} shiftClass={shiftClass} />

      {drawerOpen ? (
        <button
          aria-label="メニューを閉じる"
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      <CalendarSheet open={calendarOpen} onClose={() => setCalendarOpen(false)} />
    </div>
  );
}

function PageActions({
  currentPath,
  shiftClass,
  onOpenRecord,
  onOpenQr,
}: {
  currentPath: string | null;
  shiftClass: string;
  onOpenRecord: (key: SheetKey, opts?: OpenSheetOptions) => void;
  onOpenQr: () => void;
}) {
  const recordKey = currentPath ? recordTargets[currentPath] : undefined;
  if (!recordKey) return null;

  const [recordChoiceOpen, setRecordChoiceOpen] = useState(false);
  const isHome = currentPath === "/";

  const handleRecord = () => {
    if (isHome) {
      setRecordChoiceOpen(true);
      return;
    }
    onOpenRecord(recordKey, { closable: true });
  };

  const openTraining = () => {
    onOpenRecord("recordTraining", { closable: true });
    setRecordChoiceOpen(false);
  };

  const openCondition = () => {
    onOpenRecord("recordCondition", { closable: true });
    setRecordChoiceOpen(false);
  };

  return (
    <>
      <div className={`fixed bottom-24 right-4 z-30 flex flex-row gap-3 transition-transform duration-300 ease-out ${shiftClass}`}>
        <button
          onClick={handleRecord}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f06488] text-sm font-semibold text-white shadow-md ring-1 ring-[#f06488]/40 transition hover:-translate-y-[1px] hover:shadow-lg"
        >
          記録
        </button>
        <button
          onClick={onOpenQr}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#3b2f32] shadow-md ring-1 ring-[#f1e1e6] transition hover:-translate-y-[1px] hover:shadow-lg"
        >
          <span className="text-lg">
            <QrIcon />
          </span>
        </button>
      </div>

      {recordChoiceOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/30 px-4 pb-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-[#f1e1e6]">
            <div className="text-base font-semibold text-[#3b2f32]">どちらを記録しますか？</div>
            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={openTraining}
                className="w-full rounded-full bg-[#f06488] px-4 py-3 text-sm font-semibold text-white shadow hover:shadow-md transition"
              >
                トレーニング
              </button>
              <button
                onClick={openCondition}
                className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#f06488] ring-1 ring-[#f06488] transition hover:-translate-y-[1px]"
              >
                コンディション
              </button>
              <button
                onClick={() => setRecordChoiceOpen(false)}
                className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#3b2f32] ring-1 ring-[#e5d8dc] transition hover:bg-slate-50"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SheetOverlay({
  content,
  dimmed,
  visible,
  onFadeComplete,
}: {
  content: React.ReactNode;
  dimmed: boolean;
  visible: boolean;
  onFadeComplete?: () => void;
}) {
  const handleOverlayTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (!visible && onFadeComplete) onFadeComplete();
  };

  const pattern = dimmed
    ? {
        backgroundColor: "rgba(0,0,0,0.32)",
        backgroundImage:
          "repeating-linear-gradient(135deg, rgba(0,0,0,0.28) 0, rgba(0,0,0,0.28) 12px, rgba(0,0,0,0.12) 12px, rgba(0,0,0,0.12) 24px)",
      }
    : undefined;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}
        style={pattern}
        onTransitionEnd={handleOverlayTransitionEnd}
      />
      <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none">
        <div className="h-14 w-full" />
        <div className="pointer-events-auto h-[calc(100%-3.5rem)]">{content}</div>
      </div>
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
  const itemsWithIcon = footerItems.map((item) => ({
    ...item,
    icon:
      item.href === "/"
        ? <HomeIcon />
        : item.href === "/training"
          ? <BarbellIcon />
          : item.href === "/condition"
            ? <LineChartIcon />
            : <BuildingIcon />,
  }));

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
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition ${active ? "text-[#f8c1d3]" : "text-white/80 hover:text-white"}`}
              aria-current={active ? "page" : undefined}
            >
              <span className={`text-lg leading-none ${active ? "drop-shadow-[0_1px_4px_rgba(0,0,0,0.25)]" : ""}`}>
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
  shiftClass,
  onOpenQr,
  sheetState,
  onCloseSheet,
}: {
  onMenu: () => void;
  shiftClass: string;
  onOpenQr: () => void;
  sheetState: { key: SheetKey; closable: boolean } | null;
  onCloseSheet: () => void;
}) {
  const isMenuSheetOpen = sheetState && sheetState.closable === false;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 text-[#3b2f32] transition-transform duration-300 ease-out ${shiftClass}`}
    >
      {isMenuSheetOpen ? (
        <button
          onClick={onCloseSheet}
          aria-label="戻る"
          className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-white/60"
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
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenQr}
          className="flex items-center gap-1 rounded-full bg-[#f06488] px-3 py-1.5 text-xs font-semibold text-white shadow hover:shadow-md transition"
          aria-label="QRコードシートを開く"
        >
          <span className="text-base">
            <QrIcon />
          </span>
        </button>
      </div>
    </header>
  );
}

function SideDrawer({
  open,
  onClose,
  currentPath,
  onOpenSheet,
}: {
  open: boolean;
  onClose: () => void;
  currentPath: string | null;
  onOpenSheet: (key: SheetKey) => void;
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-white px-5 pt-5 shadow-xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="text-lg font-semibold text-slate-800">メニュー</div>
        <button
          onClick={onClose}
          aria-label="閉じる"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
        >
          <CloseIcon />
        </button>
      </div>
      <nav className="space-y-1">
        {drawerItems.map((item) => {
          const active = currentPath === item.href;
          const isMainPage = footerItems.some((f) => f.href === item.href);
          if (isMainPage) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium transition ${active ? "bg-[#fde9f1] text-[#f06488]" : "text-slate-800 hover:bg-slate-100"}`}
                onClick={onClose}
              >
                <span>{item.label}</span>
                <span className="text-xs text-slate-400">›</span>
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.sheet) onOpenSheet(item.sheet);
                onClose();
              }}
              className="group flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              <span>{item.label}</span>
              <span className="text-xs text-slate-400">›</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// Calendar and helpers

type MonthInfo = {
  year: number;
  month: number; // 0-indexed
  key: string;
  days: number;
  firstWeekday: number;
};

function CalendarSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const months = useMemo(() => buildMonthList(), []);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const initialIndex = useMemo(() => {
    const now = new Date();
    const targetKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const found = months.findIndex((m) => m.key === targetKey);
    return found >= 0 ? found : months.length - 1;
  }, [months]);

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [plannedDates, setPlannedDates] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const isProgrammatic = useRef(false);
  const [programmaticScroll, setProgrammaticScroll] = useState(false);

  const getColumnWidth = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return 1;
    const width = container.scrollWidth / months.length;
    return width || 1;
  }, [months.length]);

  useLayoutEffect(() => {
    if (!open) return;
    const container = scrollRef.current;
    if (!container) return;
    isProgrammatic.current = true;
    setProgrammaticScroll(true);
    const width = getColumnWidth();
    const targetIndex = initialIndex;
    setActiveIndex(targetIndex);
    requestAnimationFrame(() => {
      container.scrollTo({ left: width * targetIndex, behavior: "auto" });
      setTimeout(() => {
        isProgrammatic.current = false;
        setProgrammaticScroll(false);
      }, 120);
    });
  }, [open, initialIndex, getColumnWidth]);

  const scrollToIndex = useCallback(
    (nextIndex: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const width = getColumnWidth();
      const clamped = Math.max(0, Math.min(months.length - 1, nextIndex));
      setActiveIndex(clamped);
      isProgrammatic.current = true;
      setProgrammaticScroll(true);
      container.scrollTo({ left: width * clamped, behavior: "smooth" });
      setTimeout(() => {
        isProgrammatic.current = false;
        setProgrammaticScroll(false);
      }, 350);
    },
    [months.length, getColumnWidth],
  );

  const handleNav = (delta: number) => {
    scrollToIndex(activeIndex + delta);
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    if (isProgrammatic.current) return;
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    const container = e.currentTarget;
    scrollTimeout.current = setTimeout(() => {
      const width = getColumnWidth();
      const raw = container.scrollLeft / width;
      const index = Math.round(raw);
      const clamped = Math.max(0, Math.min(months.length - 1, index));
      if (clamped !== activeIndex) {
        setActiveIndex(clamped);
      }
    }, 100);
  };

  const handleDayClick = (day: number | null, month: MonthInfo) => {
    if (!day) return;
    const date = new Date(month.year, month.month, day);
    const key = formatDateKey(date);
    setSelectedDate(key);

    const isFutureOrToday = date >= today;
    if (!isFutureOrToday) return;

    const hasPlan = plannedDates.has(key);
    const message = `${formatDisplayDate(date)}\n来館予定を${hasPlan ? "削除しますか" : "登録しますか"}`;
    const ok = window.confirm(message);
    if (!ok) return;

    setPlannedDates((prev) => {
      const next = new Set(prev);
      if (hasPlan) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const activeMonth = months[activeIndex] ?? months[months.length - 1];

  return (
    <div
      className={`fixed inset-x-0 top-14 bottom-0 z-50 origin-bottom bg-transparent transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-[120%]"}`}
      aria-hidden={!open}
    >
      <div className="relative h-full bg-transparent">
        <div className="absolute inset-0 overflow-hidden">
          <div className="relative h-full w-full bg-white shadow-2xl">
            <div className="absolute inset-0 bg-[#f7f2f5]/80" />
            <div className="relative h-full overflow-x-hidden overflow-y-auto">
              <div className="sticky top-0 z-20 flex items-center justify-between bg-[#f06488] px-4 py-3 text-white shadow">
                <button
                  onClick={() => handleNav(-1)}
                  className="rounded-md p-1 text-white transition hover:bg-white/10"
                  aria-label="前の月へ"
                >
                  <BackIcon />
                </button>
                <div className="text-lg font-semibold tracking-wide">
                  {formatMonthLabel(activeMonth.year, activeMonth.month)}
                </div>
                <button
                  onClick={() => handleNav(1)}
                  className="rounded-md p-1 text-white transition hover:bg-white/10"
                  aria-label="次の月へ"
                >
                  <ForwardIcon />
                </button>
              </div>

              <div className="bg-white px-0 pb-20 pt-3">
                <div className="mb-3 flex justify-center gap-10 text-sm font-semibold text-[#3b2f32]">
                  <Stat label="来館" value={6} unit="回" />
                  <Stat label="トレーニング" value={4} unit="回" />
                </div>

                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="snap-x snap-mandatory overflow-x-auto scroll-smooth no-scrollbar"
                  style={{ scrollBehavior: programmaticScroll ? "auto" : "smooth" }}
                >
                  <div
                    className="grid snap-none grid-flow-col grid-cols-[repeat(auto-fit,minmax(320px,100%))]"
                    style={{ gridAutoColumns: "100%" }}
                  >
                    {months.map((month) => (
                      <div key={month.key} className="snap-start">
                        <MonthGrid
                          month={month}
                          selectedDate={selectedDate}
                          plannedDates={plannedDates}
                          onSelect={handleDayClick}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <DateDisplay selectedDate={selectedDate} />
              </div>

              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonthGrid({
  month,
  selectedDate,
  plannedDates,
  onSelect,
}: {
  month: MonthInfo;
  selectedDate: string | null;
  plannedDates: Set<string>;
  onSelect: (day: number | null, month: MonthInfo) => void;
}) {
  const totalCells = 42;
  const cells = Array.from({ length: totalCells }, (_, idx) => {
    const dayNumber = idx - month.firstWeekday + 1;
    if (dayNumber < 1) return null;
    if (dayNumber > month.days) return null;
    return dayNumber;
  });

  const legend = (
    <div className="mt-2 flex flex-wrap justify-end gap-3 pr-1 text-[11px] font-semibold text-[#3b2f32]">
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#f06488]" />
        来館予定日
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-3 w-3 rounded-[4px] bg-[#fde9f1] ring-1 ring-[#f6cedd]" />
        来館日
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="inline-block h-4 w-4 text-[#f06488]">
          <MuscleIcon />
        </span>
        トレーニング日
      </span>
    </div>
  );

  return (
    <div className="relative">
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-600">
        {weekdayLabels.map((day, idx) => (
          <div
            key={day}
            className={`pb-2 pt-1 ${idx === 0 ? "text-red-500" : idx === 6 ? "text-sky-500" : "text-slate-600"}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="grid grid-cols-7 grid-rows-6 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
          {cells.map((day, idx) => {
            const isAfterEnd = day === null && idx >= month.firstWeekday + month.days;
            const isChecker = idx < month.firstWeekday + month.days;
            const isGrey = idx % 2 === 0;
            const baseBg = isAfterEnd ? "bg-white" : isGrey ? "bg-[#f2f2f2]" : "bg-white";

            const date =
              day && day >= 1 && day <= month.days ? new Date(month.year, month.month, day) : null;
            const key = date ? formatDateKey(date) : "";
            const isSelected = selectedDate && key === selectedDate;
            const hasPlan = date ? plannedDates.has(key) : false;
            const isVisited = false;
            const isTraining = false;

            const weekday = date ? date.getDay() : -1;
            const weekdayColor =
              weekday === 0 ? "text-red-500" : weekday === 6 ? "text-sky-500" : "text-[#3b2f32]";

            return (
              <button
                key={idx}
                onClick={() => onSelect(day, month)}
                className={`relative aspect-square w-full p-1 text-left text-sm ${baseBg} ${day ? "hover:bg-[#fde9f1]" : ""}`}
              >
                {isChecker && day === null ? <span className="text-xs text-transparent">.</span> : null}
                {day ? <span className={`absolute left-1 top-1 text-xs font-semibold leading-none ${weekdayColor}`}>{day}</span> : null}
                {isSelected ? <span className="pointer-events-none absolute inset-[2px] rounded-sm ring-2 ring-[#f06488]" /> : null}
                {isVisited ? <span className="pointer-events-none absolute inset-[2px] rounded-lg bg-[#fde9f1] ring-1 ring-[#f6cedd]" /> : null}
                {hasPlan ? (
                  <span className="pointer-events-none absolute bottom-1 left-1 h-2.5 w-2.5 rounded-full bg-[#f06488]" />
                ) : null}
                {isTraining ? (
                  <span className="pointer-events-none absolute bottom-1 right-1 text-[#f06488]">
                    <MuscleIcon />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      {legend}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-bold">{label}</span>
      <span className="text-lg font-semibold leading-none">{value}</span>
      <span className="text-xs font-semibold leading-none">{unit}</span>
    </div>
  );
}

function DateDisplay({ selectedDate }: { selectedDate: string | null }) {
  const content = useMemo(() => {
    if (!selectedDate) return null;
    const [y, m, d] = selectedDate.split("-").map((p) => parseInt(p, 10));
    const date = new Date(y, m - 1, d);
    const weekday = weekdayLabels[date.getDay()];
    return `${y}/${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")} ${weekday}`;
  }, [selectedDate]);

  return (
    <div className="mt-2 w-full">
      <div className="flex min-h-[72px] w-full items-center justify-center bg-[#fddbe7] px-3 text-lg font-bold text-[#f06488]">
        {content ?? ""}
      </div>
      <div className="mx-auto w-0 border-x-[10px] border-t-[10px] border-x-transparent border-t-[#fddbe7]" />
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg width="12" height="22" viewBox="0 0 12 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2 2 11l8 9" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg width="12" height="22" viewBox="0 0 12 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 2 8 9-8 9" />
    </svg>
  );
}

function BarbellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m6 15 4-4 3 3 5-6" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 9-8 9 8" />
      <path d="M9 21V9h6v12" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <path d="M15 15h2v2h-2z" />
      <path d="M19 19h2v2h-2z" />
      <path d="M15 19h2" />
      <path d="M19 15h2" />
    </svg>
  );
}

function MuscleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.5 3c-.8 0-1.5.7-1.5 1.5V9h-2C4.1 9 3 10.1 3 11.5S4.1 14 5.5 14h2v5.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V9h4v4.5c0 .8.7 1.5 1.5 1.5S17 14.3 17 13.5V9h2c1.4 0 2.5-1.1 2.5-2.5S20.4 4 19 4h-2V4.5C17 3.7 16.3 3 15.5 3S14 3.7 14 4.5V7h-4V4.5C10 3.7 9.3 3 8.5 3Z" />
    </svg>
  );
}

const weekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function buildMonthList(): MonthInfo[] {
  const start = new Date(2020, 0, 1);
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 3, 1);

  const months: MonthInfo[] = [];
  let cursor = new Date(start);

  while (cursor <= end) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const key = `${year}-${String(month + 1).padStart(2, "0")}`;
    months.push({ year, month, key, days, firstWeekday });
    cursor = new Date(year, month + 1, 1);
  }

  return months;
}

function formatMonthLabel(year: number, month: number) {
  return `${year}/${String(month + 1).padStart(2, "0")}`;
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplayDate(date: Date) {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

export function useSheetControls() {
  return useContext(SheetControlsContext);
}

