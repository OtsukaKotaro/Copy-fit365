import { useSheetControls } from "@/components/AppShell";

export default function StoresPage() {
  const { openSheet } = useSheetControls();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          お気に入り店舗
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">計画中</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          最近利用した店舗や位置情報連動の候補をここに表示予定です。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => openSheet("recordStore", { closable: true })}
            className="inline-flex items-center justify-center rounded-full bg-[#f06488] px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md transition"
          >
            店舗検索シートを開く
          </button>
          <button
            onClick={() => openSheet("storeHome", { closable: true })}
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#f06488] shadow ring-1 ring-[#f06488] transition hover:-translate-y-[1px]"
          >
            店舗ホームページシートを開く
          </button>
        </div>
      </div>
    </div>
  );
}
