import React, { useEffect, useState, useRef } from 'react';
import { User, MapPin, Building, Info, CheckCircle2, Loader2, RefreshCw, Map, AlertCircle, ExternalLink } from 'lucide-react';
import { locationDataService, type LocationIntelligence } from '../../../services/locationDataService';
import { geoService } from '../../../services/geoService';
import { useNavigate } from 'react-router-dom';

export interface PromoterData {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  socialCategory: 'general' | 'obc' | 'sc' | 'st' | 'minority';
  specialCategory: 'none' | 'divyang' | 'ner' | 'border' | 'hill';
  education: string;
  experienceYears: number;
  projectStage: 'new' | 'expansion' | 'modernization';
  state: string;
  district: string;
  block: string;
  village: string;
  areaType: 'rural' | 'urban';
}

interface Step1Props {
  data: PromoterData;
  onChange: (updated: Partial<PromoterData>) => void;
  onNext: () => void;
}

export const Step1Promoter: React.FC<Step1Props> = ({ data, onChange, onNext }) => {
  const navigate = useNavigate();
  const prevStateRef = useRef<string>(data.state);
  const prevDistrictRef = useRef<string>(data.district);

  // Geographic List States
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [villages, setVillages] = useState<any[]>([]);

  // Loading & Error States
  const [loadingStates, setLoadingStates] = useState<boolean>(true);
  const [loadingDistricts, setLoadingDistricts] = useState<boolean>(false);
  const [loadingBlocks, setLoadingBlocks] = useState<boolean>(false);
  const [loadingVillages, setLoadingVillages] = useState<boolean>(false);
  const [loadingIntel, setLoadingIntel] = useState<boolean>(false);

  const [stateError, setStateError] = useState<string | null>(null);
  const [locationIntel, setLocationIntel] = useState<LocationIntelligence | null>(null);

  // Load States on mount
  const loadStatesData = () => {
    setLoadingStates(true);
    setStateError(null);
    locationDataService.getStates()
      .then(stList => {
        setStates(stList);
        setLoadingStates(false);
        if (stList.length > 0 && !data.state) {
          const defaultSt = stList.includes('Gujarat') ? 'Gujarat' : stList[0];
          onChange({ state: defaultSt });
        }
      })
      .catch(err => {
        console.error('State load error:', err);
        setStateError('Failed to load dataset states.');
        setLoadingStates(false);
      });
  };

  useEffect(() => {
    loadStatesData();
  }, []);

  // Load Districts when State changes
  useEffect(() => {
    if (!data.state) return;

    const isStateChangedByUser = prevStateRef.current && prevStateRef.current !== data.state;
    prevStateRef.current = data.state;

    setLoadingDistricts(true);

    locationDataService.getDistricts(data.state).then(distList => {
      setDistricts(distList);
      setLoadingDistricts(false);

      if (distList.length > 0) {
        const hasMatch = distList.some(d => (d.name || '').toLowerCase().trim() === (data.district || '').toLowerCase().trim());
        if (isStateChangedByUser || !data.district || !hasMatch) {
          onChange({ district: distList[0].name, block: '', village: '' });
        }
      }
    });
  }, [data.state]);

  // Load Blocks when District changes
  useEffect(() => {
    if (!data.state || !data.district) return;

    const isDistrictChangedByUser = prevDistrictRef.current && prevDistrictRef.current !== data.district;
    prevDistrictRef.current = data.district;

    setLoadingBlocks(true);

    locationDataService.getBlocks(data.state, data.district).then(bList => {
      setBlocks(bList);
      setLoadingBlocks(false);

      if (bList.length > 0) {
        const hasMatch = bList.some(b => (b || '').toLowerCase().trim() === (data.block || '').toLowerCase().trim());
        if (isDistrictChangedByUser || !data.block || !hasMatch) {
          onChange({ block: bList[0], village: '' });
        }
      }

      setLoadingIntel(true);
      locationDataService.getLocationIntelligence(data.state, data.district, data.block, data.village).then(intel => {
        setLocationIntel(intel);
        setLoadingIntel(false);
      });
    });
  }, [data.state, data.district]);

  // Load Villages when Block changes
  useEffect(() => {
    if (!data.state || !data.district) return;

    setLoadingVillages(true);
    locationDataService.getVillages(data.state, data.district, data.block).then(vList => {
      setVillages(vList);
      setLoadingVillages(false);

      if (vList.length > 0) {
        const hasMatch = vList.some(v => (v.name || '').toLowerCase().trim() === (data.village || '').toLowerCase().trim());
        if (!data.village || !hasMatch) {
          onChange({ village: vList[0].name });
        }
      }

      setLoadingIntel(true);
      locationDataService.getLocationIntelligence(data.state, data.district, data.block, data.village).then(intel => {
        setLocationIntel(intel);
        setLoadingIntel(false);
      });
    });
  }, [data.state, data.district, data.block, data.village]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="text-emerald-500" size={22} />
          Step 1: Promoter Profile & Project Location
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Establish applicant details and target project location. Geographic selections dynamically load location intelligence from official datasets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Section: Promoter Profile & Location Hierarchy */}
        <div className="lg:col-span-2 space-y-5">
          {/* Promoter Profile Card */}
          <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
              <User size={16} className="text-emerald-500" />
              Promoter & Applicant Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  PROMOTER FULL NAME
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={e => onChange({ name: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  AGE (YEARS)
                </label>
                <input
                  type="number"
                  value={data.age || ''}
                  onChange={e => onChange({ age: Number(e.target.value) })}
                  placeholder="30"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  GENDER
                </label>
                <select
                  value={data.gender}
                  onChange={e => onChange({ gender: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  SOCIAL CATEGORY
                </label>
                <select
                  value={data.socialCategory}
                  onChange={e => onChange({ socialCategory: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="general">General (Standard Category)</option>
                  <option value="obc">OBC (Other Backward Classes)</option>
                  <option value="sc">SC (Scheduled Caste)</option>
                  <option value="st">ST (Scheduled Tribe)</option>
                  <option value="minority">Minority Category</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  SPECIAL CATEGORY
                </label>
                <select
                  value={data.specialCategory}
                  onChange={e => onChange({ specialCategory: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="none">None / Standard</option>
                  <option value="divyang">Divyangjan / Differently Abled</option>
                  <option value="ner">North Eastern Region (NER)</option>
                  <option value="border">Border / Hill District</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  EDUCATION LEVEL
                </label>
                <select
                  value={data.education}
                  onChange={e => onChange({ education: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="Below 8th">Below 8th Standard</option>
                  <option value="10th Pass">10th Pass / Secondary</option>
                  <option value="12th Pass">12th Pass / Higher Secondary</option>
                  <option value="Graduate">Graduate / Degree Holder</option>
                  <option value="Post Graduate">Post Graduate / Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  PROJECT STAGE
                </label>
                <select
                  value={data.projectStage}
                  onChange={e => onChange({ projectStage: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="new">New / Greenfield Enterprise</option>
                  <option value="expansion">Expansion of Existing Unit</option>
                  <option value="modernization">Technological Modernization</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project Location Card */}
          <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-2">
              <MapPin size={16} className="text-emerald-500" />
              Project Location Hierarchy (Dataset-Driven)
            </h3>

            {/* State & District Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  STATE {loadingStates && <Loader2 size={12} className="inline animate-spin text-emerald-500 ml-1" />}
                </label>
                {stateError ? (
                  <div className="flex items-center gap-2 text-xs text-rose-500 py-1">
                    <span>{stateError}</span>
                    <button type="button" onClick={loadStatesData} className="px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-[10px] font-bold">
                      Retry
                    </button>
                  </div>
                ) : (
                  <select
                    value={data.state}
                    onChange={e => onChange({ state: e.target.value })}
                    disabled={loadingStates}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                  >
                    {loadingStates ? (
                      <option value="">Loading states...</option>
                    ) : states.length > 0 ? (
                      states.map(st => <option key={st} value={st}>{st}</option>)
                    ) : (
                      <option value="">No states available</option>
                    )}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  DISTRICT {loadingDistricts && <Loader2 size={12} className="inline animate-spin text-emerald-500 ml-1" />}
                </label>
                <select
                  value={data.district}
                  onChange={e => onChange({ district: e.target.value })}
                  disabled={!data.state || loadingDistricts}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                >
                  {!data.state ? (
                    <option value="">Select a state first</option>
                  ) : loadingDistricts ? (
                    <option value="">Loading districts...</option>
                  ) : districts.length > 0 ? (
                    districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)
                  ) : (
                    <option value="">No districts available for this state</option>
                  )}
                </select>
              </div>
            </div>

            {/* Block/Taluka & Village Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  BLOCK / TALUKA {loadingBlocks && <Loader2 size={12} className="inline animate-spin text-emerald-500 ml-1" />}
                </label>
                <select
                  value={data.block}
                  onChange={e => onChange({ block: e.target.value })}
                  disabled={!data.district || loadingBlocks}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                >
                  {!data.district ? (
                    <option value="">Select a district first</option>
                  ) : loadingBlocks ? (
                    <option value="">Loading blocks...</option>
                  ) : blocks.length > 0 ? (
                    blocks.map(b => <option key={b} value={b}>{b}</option>)
                  ) : (
                    <option value="">Block data unavailable (using district)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                  VILLAGE / SETTLEMENT {loadingVillages && <Loader2 size={12} className="inline animate-spin text-emerald-500 ml-1" />}
                </label>
                <select
                  value={data.village}
                  onChange={e => onChange({ village: e.target.value })}
                  disabled={!data.district || loadingVillages}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                >
                  {!data.district ? (
                    <option value="">Select a district first</option>
                  ) : loadingVillages ? (
                    <option value="">Loading villages...</option>
                  ) : villages.length > 0 ? (
                    villages.map(v => <option key={v.code || v.name} value={v.name}>{v.name}</option>)
                  ) : (
                    <option value="">Village data unavailable (using district/block data)</option>
                  )}
                </select>
              </div>
            </div>

            {/* Area Classification */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                AREA CLASSIFICATION
              </label>
              <div className="flex gap-3 max-w-sm">
                <button
                  type="button"
                  onClick={() => onChange({ areaType: 'rural' })}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    data.areaType === 'rural'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                      : 'border-gray-200 dark:border-zinc-800 text-gray-500'
                  }`}
                >
                  🌾 Rural Area
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ areaType: 'urban' })}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    data.areaType === 'urban'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-zinc-800 text-gray-500'
                  }`}
                >
                  🏢 Urban Area
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Location Intelligence Panel & Selected Location Summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0c0d10] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <Info size={16} className="text-emerald-500" />
                Location Intelligence
              </h3>
              {locationIntel && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {locationIntel.granularityLevel}
                </span>
              )}
            </div>

            {loadingIntel ? (
              <div className="py-12 text-center text-xs text-gray-400 dark:text-zinc-500 flex flex-col items-center gap-2">
                <Loader2 size={20} className="animate-spin text-emerald-500" />
                Querying dataset indicators for {data.district || data.state}...
              </div>
            ) : locationIntel ? (
              <div className="space-y-3 text-xs">
                {/* Population */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Estimated Population</span>
                  <div className="text-base font-extrabold text-gray-900 dark:text-white font-mono mt-0.5">
                    {locationIntel.population ? `${locationIntel.population.toLocaleString('en-IN')}` : 'Data unavailable'}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Source: Population & Census Master</span>
                </div>

                {/* Enterprises */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Registered Micro-Enterprises</span>
                  <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {locationIntel.estimatedEnterprisesInState ? `${locationIntel.estimatedEnterprisesInState}+ Units` : 'Data unavailable'}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Source: ASUSE Enterprise Dataset</span>
                </div>

                {/* Rural Wages */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Agri Wage Indicator</span>
                  <div className="text-sm font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                    Men: ₹{locationIntel.avgDailyWageMenRs}/day · Women: ₹{locationIntel.avgDailyWageWomenRs}/day
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Source: Rural Wages Dataset</span>
                </div>

                {/* Groundwater */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Groundwater DTWL Level</span>
                  <div className="text-sm font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                    {locationIntel.groundwaterDtwlMeters ? `${locationIntel.groundwaterDtwlMeters} meters` : 'Data unavailable'}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Source: Groundwater Jan 2026 Dataset</span>
                </div>

                {/* Infrastructure Access */}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Infrastructure Accessibility</span>
                  <div className="text-xs text-gray-800 dark:text-zinc-200">
                    Highway: <strong>{locationIntel.nearestHighwayKm} km</strong> · Mandi: <strong>{locationIntel.nearestMandiKm} km</strong>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Source: Routing & INFRASTRUCTURE Datasets</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500">
                Select State & District to load location intelligence indicators.
              </div>
            )}
          </div>

          {/* Selected Location Summary & Map Link Card */}
          <div className="bg-white dark:bg-[#0c0d10] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider">
              Selected Location Path
            </h4>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/15">
              {data.state || 'State'} {data.district ? `> ${data.district}` : ''} {data.block ? `> ${data.block}` : ''} {data.village ? `> ${data.village}` : ''}
            </div>

            <button
              type="button"
              onClick={() => {
                // Pre-save promoter state into localStorage draft before navigating
                try {
                  const saved = localStorage.getItem('ruralnex_financial_plan_draft_v2');
                  const existing = saved ? JSON.parse(saved) : {};
                  const updatedPayload = {
                    ...existing,
                    promoter: { ...(existing.promoter || {}), ...data },
                    lastSavedTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                  };
                  localStorage.setItem('ruralnex_financial_plan_draft_v2', JSON.stringify(updatedPayload));
                } catch (e) {
                  console.warn('Pre-navigation save error:', e);
                }

                const stObj = geoService.getStates().find(s => s.name.toLowerCase() === (data.state || '').toLowerCase());
                const stateId = stObj ? stObj.id : 'AP';

                const dists = geoService.getDistricts(stateId);
                const distObj = dists.find(d => d.name.toLowerCase() === (data.district || '').toLowerCase());
                const districtId = distObj ? distObj.id : (dists[0]?.id || 'AP_VSKP');

                const vilObj = villages.find(v => v.name.toLowerCase() === (data.village || '').toLowerCase());
                const targetLat = vilObj?.lat || distObj?.lat || stObj?.lat || 17.6868;
                const targetLng = vilObj?.lng || distObj?.lng || stObj?.lng || 83.2185;

                const locName = data.village || data.block || data.district || 'Target Project Site';

                navigate(`/market?stateId=${stateId}&districtId=${districtId}&lat=${targetLat}&lng=${targetLng}&locName=${encodeURIComponent(locName)}&districtName=${encodeURIComponent(data.district || '')}`);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Map size={14} className="text-emerald-500" />
              View Location on GIS Map ➔
            </button>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all cursor-pointer"
        >
          Proceed to Business Selection ➔
        </button>
      </div>
    </div>
  );
};
