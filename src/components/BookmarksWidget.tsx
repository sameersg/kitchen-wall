import React from 'react';
import { Bookmark, ExternalLink } from 'lucide-react';
import { QuickBookmark } from '../types';

interface BookmarksWidgetProps {
  bookmarks: QuickBookmark[];
}

export const BookmarksWidget: React.FC<BookmarksWidgetProps> = ({ bookmarks }) => {
  return (
    <div className="bg-white rounded-[28px] border border-[#ece7de] shadow-clean p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ece7de]">
        <div className="flex items-center space-x-2">
          <Bookmark className="w-4 h-4 text-[#e06236]" />
          <h2 className="font-semibold text-sm tracking-tight text-[#221e1a]">Rezept-Inspiration</h2>
        </div>
        <span className="text-[10px] text-[#786f65] font-mono">1-Touch Links</span>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-2 gap-2 my-auto py-2">
        {bookmarks.map((bm) => (
          <a
            key={bm.id}
            href={bm.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl bg-[#faf8f4] hover:bg-[#fef2eb] border border-[#ece7de] hover:border-[#fbdcd0] transition group"
          >
            <div className="min-w-0 pr-1">
              <span className="text-[10px] text-[#e06236] font-medium block">
                {bm.category || 'Rezepte'}
              </span>
              <span className="text-xs font-bold text-[#221e1a] group-hover:text-[#e06236] truncate block transition">
                {bm.title}
              </span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[#786f65] group-hover:text-[#e06236] transition flex-shrink-0" />
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-2.5 border-t border-[#ece7de] text-[10px] text-[#786f65] flex items-center justify-between">
        <span>Öffnet Rezepte im Browser-Tab ✨</span>
      </div>
    </div>
  );
};
