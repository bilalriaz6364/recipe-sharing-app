import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  // Helper function for fallback copying (reduces function complexity)
  const copyToClipboard = async (text) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const dummyInput = document.createElement('input');
    dummyInput.value = text;
    document.body.appendChild(dummyInput);
    dummyInput.select();
    document.execCommand('copy');
    document.body.removeChild(dummyInput);
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;

    // 1. Try Native Web Share API (Mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Check out this recipe!',
          text: `Check out this recipe: ${title || ''}`,
          url: currentUrl,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return; // User closed native sheet
      }
    }

    // 2. Clipboard Fallback (Desktop)
    try {
      await copyToClipboard(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition duration-200 border ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
          : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
      }`}
      title="Share Recipe Link"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Link Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 text-emerald-400" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}