import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Copy, Check, ExternalLink } from 'lucide-react';
import { sounds } from '../utils/audio';

interface QrSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionUrl: string;
}

export const QrSyncModal: React.FC<QrSyncModalProps> = ({ isOpen, onClose, companionUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    sounds.playTick();
    navigator.clipboard.writeText(companionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white border border-[#ece7de] rounded-[32px] p-6 shadow-clean-lg text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playTick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#f4efe8] hover:bg-[#ece7de] text-[#786f65] hover:text-[#221e1a] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#fef2eb] border border-[#fbdcd0] flex items-center justify-center text-[#e06236]">
          <Smartphone className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-[#221e1a] tracking-tight">
          Mit dem iPhone verbinden ✨
        </h2>
        <p className="text-xs text-[#786f65] mt-1 max-w-xs mx-auto">
          Scanne den QR-Code mit der iPhone-Kamera, um Einkäufe, Essen & Notizen in Echtzeit an die Wand zu senden.
        </p>

        {/* QR Code Container */}
        <div className="my-5 p-4 bg-white border border-[#ece7de] rounded-3xl inline-block shadow-sm">
          <QRCodeSVG
            value={companionUrl}
            size={190}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Instructions */}
        <div className="bg-[#faf8f4] rounded-2xl p-3.5 border border-[#ece7de] text-left text-xs space-y-2 mb-4">
          <div className="flex items-start space-x-2">
            <span className="w-4 h-4 rounded-full bg-[#e06236] text-white font-bold flex items-center justify-center text-[10px] mt-0.5 flex-shrink-0">
              1
            </span>
            <span className="text-[#221e1a]">Öffne die <b>Kamera-App</b> auf deinem iPhone.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-4 h-4 rounded-full bg-[#e06236] text-white font-bold flex items-center justify-center text-[10px] mt-0.5 flex-shrink-0">
              2
            </span>
            <span className="text-[#221e1a]">Richte sie auf diesen QR-Code und tippe auf den gelben Safari-Link.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="w-4 h-4 rounded-full bg-[#e06236] text-white font-bold flex items-center justify-center text-[10px] mt-0.5 flex-shrink-0">
              3
            </span>
            <span className="text-[#221e1a]">Fertig! Keine Installation nötig. Alles synchronisiert sich live.</span>
          </div>
        </div>

        {/* URL Box & Copy */}
        <div className="flex items-center space-x-2 bg-[#faf8f4] px-3.5 py-2.5 rounded-2xl border border-[#ece7de] text-left">
          <span className="text-xs text-[#786f65] truncate flex-1 font-mono">
            {companionUrl}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 text-[#786f65] hover:text-[#221e1a] hover:bg-white rounded-xl transition active:scale-95"
            title="Link kopieren"
          >
            {copied ? <Check className="w-4 h-4 text-[#15803d]" /> : <Copy className="w-4 h-4" />}
          </button>
          <a
            href={companionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-[#786f65] hover:text-[#221e1a] hover:bg-white rounded-xl transition active:scale-95"
            title="Hier im neuen Tab testen"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
