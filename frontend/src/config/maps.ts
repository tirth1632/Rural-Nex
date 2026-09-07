export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC0EMn8kBc9Hcji1n7qGcob4Ol2TnRZ4L8';

export const GOOGLE_MAPS_TILE_URLS = {
  roadmap: `https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`,
  satellite: `https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`,
  hybrid: `https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`,
  terrain: `https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`,
};

export const GOOGLE_MAPS_SUBDOMAINS = ['mt0', 'mt1', 'mt2', 'mt3'];
export const GOOGLE_MAPS_ATTRIBUTION =
  '&copy; <a href="https://www.google.com/maps" target="_blank" rel="noreferrer">Google Maps</a>';

import L from 'leaflet';

/**
 * Creates a custom pulsating User Logo / Avatar marker icon for Leaflet maps.
 */
export const createUserLocationIcon = (label: string = 'You Are Here') => {
  const html = `
    <div style="position: relative; width: 44px; height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; pointer-events: none; transform: translate3d(0,0,0);">
      <!-- Floating Label Pill -->
      <div style="
        position: absolute;
        bottom: 58px;
        left: 50%;
        transform: translateX(-50%);
        background: #0f172a;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        padding: 3px 10px;
        border-radius: 12px;
        white-space: nowrap;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: system-ui, -apple-system, sans-serif;
        border: 1.5px solid rgba(255,255,255,0.3);
        letter-spacing: 0.3px;
        pointer-events: auto;
      ">
        ${label}
      </div>

      <!-- Avatar Circle with Pulsing Ring -->
      <div style="
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: white;
        padding: 5px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.5), 0 0 0 6px rgba(37, 99, 235, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 38px;
        height: 38px;
        z-index: 2;
        pointer-events: auto;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>

      <!-- Pinpoint Needle Arrow pointing directly at exact coordinate tip -->
      <div style="
        width: 0;
        height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 10px solid #ffffff;
        margin-top: -2px;
        filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
        z-index: 1;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'user-location-marker-icon',
    iconSize: [44, 56],
    iconAnchor: [22, 56],
    popupAnchor: [0, -56],
  });
};

