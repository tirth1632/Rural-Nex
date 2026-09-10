import React, { useState } from 'react';
import { X, Globe, MapPin, Compass, ExternalLink, Camera } from 'lucide-react';
import type { CandidateLocation } from '../../services/geoService';

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

  if (!isOpen || !location) return null;

  const directGoogleStreetViewUrl = `https://www.google.com/maps/@${location.lat},${location.lng},3a,75y,138.64h,81.55t/data=!3m4!1e1!3m2!1s!2e0`;
  const satelliteUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&t=k&z=18&ie=UTF8&iwloc=&output=embed`;
  const streetViewEmbedUrl = `https://maps.google.com/maps?q=${location.lat},${location.lng}&t=m&z=17&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0c1017] text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 bg-[#161f2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl shadow-inner">
              <Globe size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white tracking-tight">
                  Location Street View & 3D Intelligence
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Live View
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
                <MapPin size={12} className="text-emerald-400 shrink-0" />
                <span>{location.name} • {location.areaName || location.districtName}, {location.stateName}</span>
                <span className="text-slate-400 font-mono text-[11px] ml-1">({location.lat.toFixed(4)}°N, {location.lng.toFixed(4)}°E)</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* View Mode Switcher Bar */}
        <div className="px-6 py-2.5 bg-[#111827] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('streetview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'streetview'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass size={14} /> Street View Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('satellite')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'satellite'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe size={14} /> 3D Satellite Map
            </button>
          </div>

          {/* Open HD Google Street View Link */}
          <a
            href={directGoogleStreetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all text-xs cursor-pointer shadow-md"
          >
            <Camera size={14} />
            <span>Open 360° HD Google Street View ↗</span>
          </a>
        </div>

        {/* Full-Height Viewport Canvas (Clean Iframe) */}
        <div className="relative flex-1 bg-slate-950 w-full h-full">
          <iframe
            key={viewMode}
            title={viewMode === 'satellite' ? `3D Satellite View for ${location.name}` : `Street View for ${location.name}`}
            src={viewMode === 'satellite' ? satelliteUrl : streetViewEmbedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#111827] border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span className="font-mono text-slate-400">Lat: {location.lat.toFixed(5)}°N, Lng: {location.lng.toFixed(5)}°E</span>
          <div className="flex items-center gap-3">
            <a
              href={directGoogleStreetViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
            >
              <span>Launch 360° Google Street View</span>
              <ExternalLink size={12} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 font-bold text-white bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Close View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
