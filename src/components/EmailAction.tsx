'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/lib/site';
import Icon from './Icon';

const SUBJECT = 'Hello from your portfolio';

const GMAIL = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
  site.email,
)}&su=${encodeURIComponent(SUBJECT)}`;
const OUTLOOK = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
  site.email,
)}&subject=${encodeURIComponent(SUBJECT)}`;
const MAILTO = `mailto:${site.email}?subject=${encodeURIComponent(SUBJECT)}`;

/**
 * A plain `mailto:` link does nothing at all on a machine with no mail client
 * configured — which is most machines now. This offers the webmail compose
 * windows as well, and can always fall back to copying the address.
 */
export default function EmailAction({
  variant = 'primary',
  label = 'Email me',
  className = '',
}: {
  variant?: 'primary' | 'secondary' | 'quiet';
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btn.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      // clipboard blocked — select-and-copy still works from the visible text
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const base =
    'inline-flex items-center gap-2.5 rounded-full text-[16px] font-bold transition-transform';
  const styles = {
    primary: `${base} bg-accent px-7 py-4 text-on-accent shadow-[var(--btn-glow)]`,
    secondary: `${base} border border-line-2 bg-card px-7 py-4 text-ink shadow-[var(--shadow)]`,
    quiet: 'inline-flex items-center gap-2 px-2.5 py-4 text-[15.5px] font-medium text-ink-2 transition-colors hover:text-ink',
  }[variant];

  return (
    <div ref={wrap} className={`relative inline-block ${className}`}>
      <button
        ref={btn}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={styles}
      >
        <Icon name="mail" className="h-4 w-4" />
        {label}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+10px)] z-50 w-[280px] overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow-lg)]"
        >
          <div className="border-b border-line bg-accent-wash px-4 py-3">
            <p className="font-mono text-[12.5px] font-medium text-ink">{site.email}</p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={copy}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[14.5px] font-medium text-ink transition-colors hover:bg-accent-wash"
          >
            <span
              aria-hidden
              className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-line bg-bg text-accent"
            >
              {copied ? '✓' : '⧉'}
            </span>
            {copied ? 'Address copied' : 'Copy address'}
          </button>

          <a
            role="menuitem"
            href={GMAIL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[14.5px] font-medium text-ink transition-colors hover:bg-accent-wash"
          >
            <span
              aria-hidden
              className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-line bg-bg"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="#EA4335"
                  d="M1.5 5.6v12.8c0 .6.4 1 1 1h3V9.9l6.5 4.9 6.5-4.9v9.5h3c.6 0 1-.4 1-1V5.6c0-1.3-1.5-2-2.5-1.2L12 10 4 4.4C3 3.6 1.5 4.3 1.5 5.6Z"
                />
              </svg>
            </span>
            Compose in Gmail
          </a>

          <a
            role="menuitem"
            href={OUTLOOK}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-[14.5px] font-medium text-ink transition-colors hover:bg-accent-wash"
          >
            <span
              aria-hidden
              className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-line bg-bg"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="#0078D4"
                  d="M13.5 4h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8V4ZM2 6.2 12 4.3v15.4L2 17.8V6.2Zm5 3.1c-1.5 0-2.4 1.2-2.4 2.8s.9 2.7 2.4 2.7 2.4-1.1 2.4-2.7-.9-2.8-2.4-2.8Z"
                />
              </svg>
            </span>
            Compose in Outlook
          </a>

          <a
            role="menuitem"
            href={MAILTO}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 border-t border-line px-4 py-3 text-[14.5px] font-medium text-ink-2 transition-colors hover:bg-accent-wash hover:text-ink"
          >
            <span
              aria-hidden
              className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-line bg-bg text-ink-3"
            >
              <Icon name="mail" className="h-4 w-4" />
            </span>
            Open my mail app
          </a>
        </div>
      )}
    </div>
  );
}
