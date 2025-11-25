"use client";

export default function Home() {
  const cards = [
    {
      type: "calendar" as const,
      highlight: "2025/11/25 TUE",
    },
    {
      title: "同伴利用",
      description: "同伴利用対応のプランです",
    },
    {
      title: "ベアレージポイント",
      description: "貯まったポイントを確認",
      highlight: "2,875 BP",
    },
    {
      title: "お知らせ",
      description: "本日抽選申込日！FIT365 あんしんサポートに関するご案内",
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
      description: "メニューや記録を確認",
    },
    {
      title: "コンディション",
      description: "体調や睡眠、体重のログを確認",
    },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-16 pt-4">
      <div className="space-y-3">
        {cards.map((card) => {
          if (card.type === "calendar") {
            return (
              <div
                key="calendar"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-white p-5 text-center shadow-sm ring-1 ring-[#f1e1e6]"
              >
                <CalendarIcon />
                <div className="text-2xl font-bold text-[#3b2f32]">
                  {card.highlight}
                </div>
              </div>
            );
          }

          return (
            <div
              key={card.title}
              className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-[#f1e1e6]"
            >
              <div className="flex items-start gap-3">
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
            </div>
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
