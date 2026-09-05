import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  fetchStates,
  fetchDistricts,
  type GeoItem,
  type StateItem,
} from '../../../services/location.service';

export interface LocationValue {
  stateId: number | null;
  districtId: number | null;
  blockId: string | null;
  villageId: string | null;
}

interface Props {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
  errors?: {
    state?: string;
    district?: string;
    block?: string;
    village?: string;
  };
}

interface GeoSelectProps {
  id: string;
  label: string;
  placeholder: string;
  value: number | null;
  options: (GeoItem | StateItem)[];
  isLoading: boolean;
  disabled: boolean;
  error?: string;
  onChange: (id: number | null) => void;
}

const GeoSelect: React.FC<GeoSelectProps> = ({
  id, label, placeholder, value, options, isLoading, disabled, error, onChange,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      id={id}
      disabled={disabled || isLoading}
      value={value ?? ''}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      className={[
        'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 bg-white outline-none transition',
        'focus:ring-2 focus:ring-primary/40 focus:border-primary',
        disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : '',
        error ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-400' : 'border-gray-300',
      ].join(' ')}
    >
      <option value="">{isLoading ? 'Loading…' : placeholder}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);

export const LocationCascade: React.FC<Props> = ({ value, onChange, errors }) => {
  const { t } = useTranslation();
  const { stateId, districtId, blockId, villageId } = value;

  const { data: states = [], isLoading: loadingStates } = useQuery({
    queryKey: ['geo-states'],
    queryFn: fetchStates,
    staleTime: 10 * 60 * 1000,
  });

  const { data: districts = [], isLoading: loadingDistricts } = useQuery({
    queryKey: ['geo-districts', stateId],
    queryFn: () => fetchDistricts(stateId!),
    enabled: !!stateId,
    staleTime: 5 * 60 * 1000,
  });

  const handleStateChange = useCallback((id: number | null) => {
    onChange({ stateId: id, districtId: null, blockId: null, villageId: null });
  }, [onChange]);

  const handleDistrictChange = useCallback((id: number | null) => {
    onChange({ stateId, districtId: id, blockId: null, villageId: null });
  }, [onChange, stateId]);

  const handleBlockChange = useCallback((val: string | null) => {
    onChange({ stateId, districtId, blockId: val, villageId: null });
  }, [onChange, stateId, districtId]);

  const handleVillageChange = useCallback((val: string | null) => {
    onChange({ stateId, districtId, blockId, villageId: val });
  }, [onChange, stateId, districtId, blockId]);

  return (
    <fieldset className="space-y-4">
      <legend className="sr-only">Location details</legend>

      <GeoSelect
        id="reg-state"
        label={t('profile.state')}
        placeholder={t('profile.state.placeholder')}
        value={stateId}
        options={states}
        isLoading={loadingStates}
        disabled={false}
        error={errors?.state}
        onChange={handleStateChange}
      />

      <GeoSelect
        id="reg-district"
        label={t('profile.district')}
        placeholder={t('profile.district.placeholder')}
        value={districtId}
        options={districts}
        isLoading={loadingDistricts}
        disabled={!stateId}
        error={errors?.district}
        onChange={handleDistrictChange}
      />

      <div>
        <label htmlFor="reg-block" className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.block')}
        </label>
        <input
          id="reg-block"
          type="text"
          disabled={!districtId}
          placeholder="Enter Block / Taluka"
          value={blockId ?? ''}
          onChange={(e) => handleBlockChange(e.target.value || null)}
          className={[
            'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 bg-white outline-none transition',
            'focus:ring-2 focus:ring-primary/40 focus:border-primary',
            !districtId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : '',
            errors?.block ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-300',
          ].join(' ')}
        />
        {errors?.block && (
          <p className="mt-1 text-xs text-red-600">{errors.block}</p>
        )}
      </div>

      <div>
        <label htmlFor="reg-village" className="block text-sm font-medium text-gray-700 mb-1">
          {t('profile.village')}
        </label>
        <input
          id="reg-village"
          type="text"
          disabled={!blockId}
          placeholder="Enter Village / Gram Panchayat"
          value={villageId ?? ''}
          onChange={(e) => handleVillageChange(e.target.value || null)}
          className={[
            'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 bg-white outline-none transition',
            'focus:ring-2 focus:ring-primary/40 focus:border-primary',
            !blockId ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : '',
            errors?.village ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-gray-300',
          ].join(' ')}
        />
        {errors?.village && (
          <p className="mt-1 text-xs text-red-600">{errors.village}</p>
        )}
      </div>
    </fieldset>
  );
};
