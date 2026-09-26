import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface ClaudeQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionUrl: string;
}

export const ClaudeQrModal: React.FC<ClaudeQrModalProps> = ({
  isOpen,
  onClose,
  companionUrl
}) => {
  if (!isOpen) return null;

  const resolvedUrl =
    companionUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}/companion`
      : 'https://kueche.app/companion');

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[rgba(20,19,16,0.62)] backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--card)] text-[var(--ink)] rounded-[28px] p-7 md:p-[34px_38px] flex flex-col md:flex-row items-center gap-6 md:gap-8 max-w-[580px] w-full shadow-2xl border border-[var(--wash)] relative"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--wash)] text-[var(--muted)] hover:text-[var(--ink)] flex items-center justify-center font-bold text-base active:scale-95 transition-all cursor-pointer"
        >
          ✕
        </button>

        {/* QR Code Container */}
        <div className="w-[190px] h-[190px] md:w-[210px] md:h-[210px] shrink-0 bg-white rounded-[18px] p-3 flex items-center justify-center shadow-xs border border-black/5">
          <QRCodeSVG
            value={resolvedUrl}
            size={184}
            level="M"
            fgColor="#23231f"
            bgColor="#ffffff"
          />
        </div>

        {/* Text & Explanations */}
        <div className="flex flex-col gap-2.5 max-w-[290px] text-center md:text-left">
          <h3 className="font-serif text-[30px] md:text-[34px] leading-[1.1] text-[var(--ink)]">
            iPhone verbinden
          </h3>
          <p className="text-[13.5px] font-[500] leading-[1.5] text-[var(--muted)]">
            Mit der Kamera scannen – Einkaufsliste, Essensplan und Notizen unterwegs bearbeiten.
          </p>
          <span className="text-[12px] font-[700] text-[var(--blushInk)] break-all mt-1">
            {resolvedUrl}
          </span>
        </div>
      </div>
    </div>
  );
};
