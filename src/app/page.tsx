"use client";

import { useSheetControls } from "@/components/AppShell";
import { useRouter } from "next/navigation";

export default function Home() {
  const { openCalendar, openSheet } = useSheetControls();
  const router = useRouter();

  const cards = [
    { type: "calendar" as const, highlight: "2025/11/25 TUE" },
    { title: "同伴利用", description: "同伴利用対応プランで入館できます" },
    {
      title: "ベアレージポイント",
      description: "貯まったポイントを確認",
      highlight: "2,875 BP",
    },
    {
      title: "お知らせ",
      description: "FIT365 あんしんサポートに関するご案内",
    },
    {
      title: "店舗",
      description: "最近利用した店舗が表示されます（位置情報が利用可能な場合）",
    },
    {
      title: "会員情報",
      description: "プレミアム / レディースルーム",
    },
    {
      title: "トレーニング",
      description: "メニューの記録を確認",
    },
    {
      title: "コンディション",
      description: "体調や睡眠、体重のログを確認",
    },
  ];

  const actionableTitles = new Set(["トレーニング", "コンディション"]);
  const hoverOnlyTitles = new Set(["ベアレージポイント", "店舗", "会員情報", "お知らせ"]);
  const arrowTitles = new Set([
    "ベアレージポイント",
    "店舗",
    "会員情報",
    "トレーニング",
    "コンディション",
    "お知らせ",
  ]);
  const arrowClass =
    "absolute right-2 top-1/2 -translate-y-1/2 text-base leading-none text-[#c1b3b8]";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-16 pt-4">
      <div className="space-y-3">
        {cards.map((card) => {
          if (card.type === "calendar") {
            return (
              <button
                key="calendar"
                type="button"
                onClick={openCalendar}
                className="relative flex w-full items-center justify-center gap-3 rounded-xl bg-white p-5 pr-12 text-center shadow-sm ring-1 ring-[#f1e1e6] transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <CalendarIcon />
                <div className="text-2xl font-bold text-[#3b2f32]">
                  {card.highlight}
                </div>
                <span className={arrowClass} aria-hidden="true">
                  <RightCaretIcon />
                </span>
              </button>
            );
          }

          const isActionable = actionableTitles.has(card.title ?? "");
          const showArrow =
            card.type === "calendar" || arrowTitles.has(card.title ?? "");
          const shouldHover =
            isActionable || hoverOnlyTitles.has(card.title ?? "") || card.type === "calendar";
          const handleClick =
            card.title === "トレーニング"
              ? () => router.push("/training")
              : card.title === "コンディション"
                ? () => router.push("/condition")
              : card.title === "店舗"
                ? () => router.push("/stores")
              : card.title === "お知らせ"
                ? () => openSheet("news", { closable: false })
              : card.title === "ベアレージポイント"
                ? () => openSheet("points", { closable: false })
              : card.type === "calendar"
                ? () => openCalendar()
                : undefined;

          const CardTag = isActionable ? "button" : "div";

          return (
            <CardTag
              key={card.title}
              type={isActionable ? "button" : undefined}
              className={`relative w-full rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-[#f1e1e6] ${
                shouldHover
                  ? "transition hover:-translate-y-0.5 hover:shadow-md"
                  : ""
              } ${showArrow ? "pr-8" : ""}`}
              onClick={handleClick}
            >
              <div className="flex items-start gap-3 pr-8">
                <div>
                  <div className="text-sm font-semibold text-[#3b2f32]">
                    {card.title}
                  </div>
                  <p className="mt-1 text-sm text-[#62555a]">{card.description}</p>
                </div>
              </div>
              {card.highlight ? (
                <div className="mt-3 text-2xl font-bold text-[#3b2f32]">
                  {card.highlight}
                </div>
              ) : null}
              {showArrow ? (
                <span className={arrowClass} aria-hidden="true">
                  <RightCaretIcon />
                </span>
              ) : null}
            </CardTag>
          );
        })}
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f06488"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <line x1="8" x2="8" y1="3" y2="7" />
      <line x1="16" x2="16" y1="3" y2="7" />
    </svg>
  );
}

function RightCaretIcon() {
  return (
    <svg
      width="12"
      height="20"
      viewBox="0 0 12 20"
      fill="none"
      stroke="#c1b3b8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 3 6 7-6 7" />
    </svg>
  );
}
