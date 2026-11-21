import { DEFAULT_WA_MESSAGE, whatsappLink } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <a
      href={whatsappLink(DEFAULT_WA_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a BenRed por WhatsApp"
      className="fixed bottom-4 right-4 z-40 flex h-14 items-center gap-2 btn-secondary-fab px-5 font-semibold shadow-[inset_0_0_0_1.5px_var(--paper),0_6px_0_0_var(--ink)] transition-[transform,background-color] hover:-translate-y-0.5 sm:bottom-6 sm:right-6"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.27-1.38A9.9 9.9 0 1 0 12.04 2Zm0 18.1c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.13.82.84-3.05-.2-.31a8.1 8.1 0 1 1 7.04 3.88Zm4.45-6.06c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06a6.6 6.6 0 0 1-3.28-2.87c-.25-.43.25-.4.71-1.32.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.47-.4-.4-.55-.41h-.47a.9.9 0 0 0-.65.3c-.22.24-.85.83-.85 2.03s.87 2.36.99 2.52c.12.16 1.71 2.6 4.13 3.65 1.54.66 2.14.72 2.91.6.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
      </svg>
      <span className="hidden sm:inline">Hablemos</span>
    </a>
  );
}
