import { useSheetControls } from "@/components/AppShell";

export default function TrainingPage() {
  const { openSheet } = useSheetControls();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-4">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          トレーニング
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">計画中</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          メニュー一覧や記録入力などをここに追加予定です。
        </p>
        <div className="mt-4">
          <button
            onClick={() => openSheet("recordTraining", { closable: true })}
            className="inline-flex items-center justify-center rounded-full bg-[#f06488] px-4 py-2 text-sm font-semibold text-white shadow hover:shadow-md transition"
          >
            トレーニング記録シートを開く
          </button>
        </div>
      </div>
    </div>
  );
}
