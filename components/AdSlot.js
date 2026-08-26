import { useEffect, useRef } from 'react';

// Client ID y slots se cargan desde variables de entorno públicas (NEXT_PUBLIC_...)
// para poder activarlos desde el panel de Vercel sin tocar código cuando
// Google apruebe la cuenta de AdSense.
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function AdSlot({ slot, label = 'Espacio publicitario' }) {
  const ref = useRef(null);
  const configured = Boolean(ADSENSE_CLIENT && slot);

  useEffect(() => {
    if (!configured) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Si el script de AdSense todavía no cargó, no rompemos la página.
    }
  }, [configured]);

  if (!configured) {
    return (
      <div className="ad-slot ad-slot-placeholder">
        <span>{label} · próximamente</span>
      </div>
    );
  }

  return (
    <div className="ad-slot" ref={ref}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
