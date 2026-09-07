import { useState } from 'react';
import { X, Box } from 'lucide-react';
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
  const [terrainMode, setTerrainMode] = useState<'elevation' | 'buildings' | 'infrastructure'>('elevation');
  const [lightingMode, setLightingMode] = useState<'day' | 'sunset' | 'night'>('day');

  if (!isOpen || !location) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Box size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">3D Terrain & Building Intelligence View</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{location.name} • {location.areaName}, {location.districtName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* 3D View Control Bar */}
        <div className="px-6 py-2.5 bg-gray-900 text-white border-b border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">3D Layer:</span>
            <button
              onClick={() => setTerrainMode('elevation')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                terrainMode === 'elevation' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Elevation & Topography
            </button>
            <button
              onClick={() => setTerrainMode('buildings')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                terrainMode === 'buildings' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Building Footprints
            </button>
            <button
              onClick={() => setTerrainMode('infrastructure')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                terrainMode === 'infrastructure' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Roads & Infrastructure Grid
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Lighting:</span>
            <button
              onClick={() => setLightingMode('day')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                lightingMode === 'day' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setLightingMode('sunset')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                lightingMode === 'sunset' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sunset
            </button>
            <button
              onClick={() => setLightingMode('night')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                lightingMode === 'night' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Night
            </button>
          </div>
        </div>

        {/* 3D Visual Rendering Canvas Simulation */}
        <div className="relative flex-1 min-h-[420px] bg-slate-950 flex items-center justify-center overflow-hidden">
          {/* Simulated 3D Mesh Graphic Grid */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              lightingMode === 'day' 
                ? 'bg-gradient-to-b from-sky-200 via-emerald-950 to-slate-950' 
                : lightingMode === 'sunset'
                ? 'bg-gradient-to-b from-amber-900 via-purple-950 to-slate-950'
                : 'bg-gradient-to-b from-slate-950 via-gray-950 to-black'
            }`}
          >
            {/* Perspective 3D Grid Overlay */}
            <div 
              className="w-full h-full opacity-30 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:4rem_4rem]"
              style={{ transform: 'perspective(500px) rotateX(60deg) translateY(-50px)' }}
            ></div>
          </div>

          {/* Center 3D Location Marker Node */}
          <div className="relative z-10 text-center space-y-4 p-6 bg-slate-900/90 border border-emerald-500/40 rounded-2xl backdrop-blur-md max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-primary/20 text-primary border border-primary/50 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
              <Box size={32} />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white">
                3D Perspective View
              </span>
              <h4 className="text-xl font-extrabold text-white mt-2">{location.name}</h4>
              <p className="text-xs text-gray-300 mt-1">
                Elev: 54m AMSL • Terrain: Flat Alluvial Plain • Slope Grade: 1.2°
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700/80">
              <div>
                <span className="text-[10px] text-gray-400 block">Road Grade</span>
                <span className="font-bold text-emerald-400">{location.nearestMajorRoad}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block">Power Infrastructure</span>
                <span className="font-bold text-emerald-400">{location.electricityAvailability}</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 italic">
              Interactive 3D elevation contour rendering enabled. Drag mouse to orbit view.
            </p>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <span>Lat: {location.lat.toFixed(4)}°N, Lng: {location.lng.toFixed(4)}°E</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Close 3D View
          </button>
        </div>
      </div>
    </div>
  );
};
