import React, { createContext, useContext, useState, useEffect } from 'react';
import { datasetService } from '../services/datasetService';

export interface GlobalFilters {
  state: string;
  district: string;
  block: string;
  village: string;
  radiusKm: number;
  category: string;
}

interface GlobalFilterContextType {
  filters: GlobalFilters;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  availableStates: string[];
  availableDistricts: any[];
  availableVillages: any[];
  loadingHierarchy: boolean;
  updateFilter: (key: keyof GlobalFilters, value: any) => void;
}

const defaultFilters: GlobalFilters = {
  state: 'Gujarat',
  district: 'Rajkot',
  block: '',
  village: '',
  radiusKm: 25,
  category: 'Food Processing & Agribusiness'
};

const GlobalFilterContext = createContext<GlobalFilterContextType | undefined>(undefined);

export const GlobalFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<GlobalFilters>(defaultFilters);
  const [availableStates, setAvailableStates] = useState<string[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<any[]>([]);
  const [availableVillages, setAvailableVillages] = useState<any[]>([]);
  const [loadingHierarchy, setLoadingHierarchy] = useState<boolean>(false);

  // Load States dynamically from backend DataEngine
  useEffect(() => {
    datasetService.getStates().then(states => {
      if (states && states.length > 0) {
        setAvailableStates(states);
        if (!states.includes(filters.state)) {
          setFilters(prev => ({ ...prev, state: states[0] }));
        }
      }
    });
  }, []);

  // Load Districts when state changes
  useEffect(() => {
    if (!filters.state) return;
    setLoadingHierarchy(true);
    datasetService.getDistricts(filters.state).then(districts => {
      setAvailableDistricts(districts);
      if (districts.length > 0) {
        const firstDist = districts[0].name || districts[0];
        setFilters(prev => ({ ...prev, district: typeof firstDist === 'string' ? firstDist : firstDist.name }));
      }
      setLoadingHierarchy(false);
    });
  }, [filters.state]);

  // Load Villages when district changes
  useEffect(() => {
    if (!filters.state || !filters.district) return;
    datasetService.getVillages(filters.state, filters.district).then(villages => {
      setAvailableVillages(villages);
    });
  }, [filters.state, filters.district]);

  const updateFilter = (key: keyof GlobalFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <GlobalFilterContext.Provider value={{
      filters,
      setFilters,
      availableStates,
      availableDistricts,
      availableVillages,
      loadingHierarchy,
      updateFilter
    }}>
      {children}
    </GlobalFilterContext.Provider>
  );
};

export const useGlobalFilters = () => {
  const ctx = useContext(GlobalFilterContext);
  if (!ctx) {
    throw new Error('useGlobalFilters must be used within GlobalFilterProvider');
  }
  return ctx;
};
