import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface AtelierQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionUrl: string;
}

export const AtelierQrModal: React.FC<AtelierQrModalProps> = ({
  isOpen,
  onClose,
  companionUrl
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all animate-in fade-in duration-200">
      <div className="bg-[#fcfaf6] rounded-2xl border border-white shadow-2xl p-5 max-w-[290px] w-full flex flex-col items-center text-center relative">
        <button 
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-parchment-200 hover:bg-parchment-300 text-ink flex items-center justify-center absolute top-3 right-3 text-[14px] font-bold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>

        <div className="w-10 h-10 rounded-xl bg-terracotta-soft text-terracotta flex items-center justify-center mb-2">
          <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
        </div>

        <h4 className="font-serif font-bold text-[16px] text-ink">
          Handy synchronisieren
        </h4>
        <p className="text-[11px] font-editorial text-[#726456] mt-1 leading-snug">
          Kamera öffnen und Code scannen für Einkaufszettel &amp; Rezepte unterwegs.
        </p>

        <div className="bg-white p-3 rounded-xl border border-parchment-300 shadow-xs my-3 flex items-center justify-center">
          <QRCodeSVG 
            value={companionUrl || window.location.origin + '/companion'}
            size={140}
            level="M"
            fgColor="#1d1916"
          />
        </div>

        <span className="text-[10px] font-mono font-bold text-terracotta bg-terracotta-soft px-3 py-1 rounded-full truncate max-w-[240px]">
          {companionUrl ? companionUrl.replace(/^https?:\/\//, '') : 'kitchenwall.local/companion'}
        </span>
      </div>
    </div>
  );
};
