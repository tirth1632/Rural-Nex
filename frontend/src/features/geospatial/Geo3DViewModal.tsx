import React, { useState, useEffect } from 'react';
import { X, Globe, MapPin, Compass, ExternalLink, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import type { CandidateLocation } from '../../services/geoService';
import { GOOGLE_MAPS_API_KEY } from '../../config/maps';

interface Geo3DViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: CandidateLocation | null;
}

export const Geo3DViewModal: React.FC<Geo3DViewModalProps> = ({
  isOpen,
  onClose,
  location,
}) => {
  const [viewMode, setViewMode] = useState<'satellite' | 'streetview'>('streetview');
  const [streetViewStatus, setStreetViewStatus] = useState<'loading' | 'available' | 'unavailable'>('loading');

  useEffect(() => {
    if (!isOpen || !location) return;
    setStreetViewStatus('loading');
    // Check Street View availability via Street View API metadata
    const checkStreetView = async () => {
      try {
        const metaUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${location.lat},${location.lng}&radius=500&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(metaUrl);
        const data = await res.json();
        if (data.status === 'OK') {
          setStreetViewStatus('available');
        } else {
          setStreetViewStatus('unavailable');
        }
      } catch {
        setStreetViewStatus('unavailable');
      }
    };
    checkStreetView();
  }, [isOpen, location]);

  if (!isOpen || !location) return null;

  // Proper Google Street View Static API embed (not a web map embed — actual panorama)
  // Uses the Street View embed API correctly
  const streetViewEmbedSrc = `https://www.google.com/maps/embed/v1/streetview?key=${GOOGLE_MAPS_API_KEY}&location=${location.lat},${location.lng}&heading=0&pitch=0&fov=90`;

  // Satellite / hybrid view embed
  const satelliteEmbedSrc = `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${location.lat},${location.lng}&zoom=18&maptype=satellite`;

  // Direct open in Google Maps Street View
  const directStreetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location.lat},${location.lng}&heading=0&pitch=0&fov=90`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0c1017] text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col h-[88vh]">

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-[#161f2e] to-[#0f1724] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl shadow-inner">
              <Globe size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white tracking-tight">
                  Location Intelligence View
                </h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                <MapPin size={11} className="text-emerald-400 shrink-0" />
                <span className="truncate max-w-[340px]">
                  {location.name} · {location.areaName || location.districtName}, {location.stateName}
                </span>
                <span className="text-slate-500 font-mono text-[10px]">
                  ({location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E)
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="px-5 py-2.5 bg-[#111827]/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('streetview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'streetview'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass size={13} />
              Street View
              {streetViewStatus === 'unavailable' && viewMode === 'streetview' && (
                <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Limited
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('satellite')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe size={13} />
              Satellite 3D
            </button>
          </div>

          <a
            href={directStreetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold transition-all text-xs cursor-pointer shadow-md"
          >
            <Camera size={13} />
            Open in Google Maps ↗
          </a>
        </div>

        {/* Map / Street View Frame */}
        <div className="relative flex-1 bg-slate-950 w-full overflow-hidden">
          {viewMode === 'streetview' && streetViewStatus === 'unavailable' && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-slate-950 text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                <AlertCircle size={28} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Street View Not Available Here</h4>
                <p className="text-sm text-slate-400 mt-1 max-w-xs leading-relaxed">
                  Google Street View hasn't captured imagery for this rural area yet. Use satellite view or open directly in Google Maps.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('satellite')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Globe size={14} />
                  Switch to Satellite
                </button>
                <a
                  href={directStreetViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all border border-slate-700"
                >
                  <ExternalLink size={14} />
                  Open in Maps
                </a>
              </div>
            </div>
          )}

          {streetViewStatus === 'loading' && viewMode === 'streetview' && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-4 py-2 rounded-full text-xs text-slate-300 font-bold backdrop-blur-md">
              <RefreshCw size={12} className="animate-spin text-emerald-400" />
              Checking Street View availability...
            </div>
          )}

          <iframe
            key={`${viewMode}-${location.lat}-${location.lng}`}
            title={viewMode === 'satellite' ? `Satellite View — ${location.name}` : `Street View — ${location.name}`}
            src={viewMode === 'satellite' ? satelliteEmbedSrc : streetViewEmbedSrc}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#111827]/80 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="font-mono text-[10px]">
              {location.lat.toFixed(5)}°N, {location.lng.toFixed(5)}°E
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{location.districtName}, {location.stateName}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
            >
              <ExternalLink size={12} />
              Open in Maps
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 font-bold text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
