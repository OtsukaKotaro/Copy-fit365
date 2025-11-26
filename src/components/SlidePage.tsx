"use client";

import { useEffect, useState } from "react";

type SlidePageProps = {
  title: string;
  message: string;
};

export default function SlidePage({ title, message }: SlidePageProps) {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    const headerTimer = setTimeout(() => setHeaderVisible(true), 80);
    const contentTimer = setTimeout(() => setContentVisible(true), 220);

    return () => {
      clearTimeout(headerTimer);
      clearTimeout(contentTimer);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-14 bottom-0 z-40 overflow-y-auto bg-[#f7f2f5]">
      <div className="flex flex-col pb-16 pt-0 text-[#3b2f32]">
        <div
          className={`mb-6 w-full bg-[#f06488] px-4 py-3 text-center text-base font-bold text-white transition-transform duration-300 ease-out ${
            headerVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {title}
        </div>
        <div
          className={`px-4 text-sm leading-relaxed text-[#4f4347] transition-transform duration-300 ease-out ${
            contentVisible ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
