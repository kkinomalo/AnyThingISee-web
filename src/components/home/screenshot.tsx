"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef, useState } from "react";
import { Close } from "@/components/icons";

// 앱 화면: 테두리 · 그림자로 감싸고, 누르면 원본 크기로 크게 본다 (#49)
export function Screenshot({
  src,
  alt,
  sizes,
  priority = false,
  zoomLabel,
  closeLabel,
  className = "",
}: {
  src: StaticImageData;
  alt: string;
  sizes: string;
  priority?: boolean;
  zoomLabel: string;
  closeLabel: string;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  // 큰 이미지는 처음 열 때 받아 온다 (닫힌 dialog 안의 lazy 이미지는 열어도 바로 불러오지 않음)
  const [opened, setOpened] = useState(false);
  const open = () => {
    setOpened(true);
    dialog.current?.showModal();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={`${zoomLabel}: ${alt}`}
        className={`block w-full cursor-zoom-in overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgb(31_27_22/0.06),0_24px_48px_-12px_rgb(31_27_22/0.18)] ${className}`}
      >
        <Image src={src} alt={alt} sizes={sizes} priority={priority} placeholder="blur" className="h-auto w-full" />
      </button>

      <dialog
        ref={dialog}
        aria-label={alt}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-auto max-h-[94dvh] max-w-[96vw] overflow-auto rounded-xl bg-surface p-0 backdrop:bg-ink/60"
      >
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          aria-label={closeLabel}
          className="sticky left-full top-2 z-10 m-2 rounded-full bg-surface/90 p-2 shadow-float hover:bg-surface"
        >
          <Close />
        </button>
        {opened && (
          <Image src={src} alt="" sizes="2000px" loading="eager" className="-mt-14 h-auto w-[min(2000px,96vw)] max-w-none" />
        )}
      </dialog>
    </>
  );
}
