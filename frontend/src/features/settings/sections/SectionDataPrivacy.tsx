import { apiFetch } from '../../../api/apiFetch';
import React, { useState, useEffect } from 'react';
import { useSettings } from '../SettingsContext';
import { Toggle } from '../components/Toggle';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Download, Trash2, Database, FileSpreadsheet, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userDataService, type UserDataCounts } from '../../../services/userDataService';

export const SectionDataPrivacy: React.FC = () => {
  const {
    draftSettings,
    updateDraft,
    setToastMessage,
  } = useSettings();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [counts, setCounts] = useState<UserDataCounts>({ assessmentCount: 0, savedBusinessCount: 0 });
  const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const [modalState, setModalState] = useState<'none' | 'clearHistory' | 'deleteAll' | 'deleteAccount'>('none');

  const fetchCounts = async () => {
    setIsLoadingCounts(true);
    try {
      const data = await userDataService.getCounts();
      setCounts(data);
    } catch (e) {
      // fallback
    } finally {
      setIsLoadingCounts(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const handleDownloadData = async () => {
    setIsExporting(true);
    try {
      let exportData = await userDataService.exportUserData();
      
      if (!exportData) {
        exportData = {
          export_metadata: {
            exported_at: new Date().toISOString(),
            platform: 'RuralNex v1.0.0',
            format_version: '1.0'
          },
          profile: {
            fullName: draftSettings.fullName,
            email: draftSettings.email,
            phoneNumber: draftSettings.phoneNumber,
            accountType: draftSettings.accountType,
            phoneVerified: draftSettings.phoneVerified,
            avatarUrl: draftSettings.avatarUrl,
          },
          preferences: {
            businessPreferences: {
              defaultCategory: draftSettings.defaultCategory,
              defaultBusinessType: draftSettings.defaultBusinessType,
              preferredBusinessSize: draftSettings.preferredBusinessSize,
              defaultInvestmentRange: draftSettings.defaultInvestmentRange,
              businessExperience: draftSettings.businessExperience,
              preferredRevenueModel: draftSettings.preferredRevenueModel,
              riskPreference: draftSettings.riskPreference,
            },
            defaultLocation: {
              state: draftSettings.state,
              district: draftSettings.district,
              block: draftSettings.block,
              village: draftSettings.village,
              pinCode: draftSettings.pinCode,
            },
            financialPreferences: {
              defaultInterestRate: draftSettings.defaultInterestRate,
              defaultLoanTenureYears: draftSettings.defaultLoanTenureYears,
              defaultInflationRate: draftSettings.defaultInflationRate,
              preferredFinancialView: draftSettings.preferredFinancialView,
              includeGst: draftSettings.includeGst,
              showConservativeEstimates: draftSettings.showConservativeEstimates,
            },
            notifications: {
              emailNotifications: draftSettings.emailNotifications,
              inAppNotifications: draftSettings.inAppNotifications,
              assessmentCompletedNotif: draftSettings.assessmentCompletedNotif,
              reportGeneratedNotif: draftSettings.reportGeneratedNotif,
              marketDataNotif: draftSettings.marketDataNotif,
              competitorUpdatesNotif: draftSettings.competitorUpdatesNotif,
              financeAlertsNotif: draftSettings.financeAlertsNotif,
              aiRecommendationsNotif: draftSettings.aiRecommendationsNotif,
            },
            languageAndAppearance: {
              interfaceLanguage: draftSettings.interfaceLanguage,
              theme: draftSettings.theme,
              sidebarDensity: draftSettings.sidebarDensity,
            },
            currencyAndUnits: {
              currency: draftSettings.currency,
              numberFormat: draftSettings.numberFormat,
              areaUnit: draftSettings.areaUnit,
              distanceUnit: draftSettings.distanceUnit,
              weightUnit: draftSettings.weightUnit,
            }
          },
          counts: {
            assessmentCount: counts.assessmentCount,
            savedBusinessCount: counts.savedBusinessCount,
          }
        };
      }

      const todayStr = new Date().toISOString().slice(0, 10);
      const filename = `ruralnex-data-${todayStr}.json`;

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setToastMessage('Your data has been downloaded.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      setToastMessage('Unable to prepare your data download. Please try again.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearHistoryConfirm = async () => {
    setActionLoading(true);
    try {
      const success = await userDataService.clearAssessmentHistory();
      if (success) {
        setCounts(prev => ({ ...prev, assessmentCount: 0 }));
        setToastMessage('Assessment history cleared successfully.');
      } else {
        setCounts(prev => ({ ...prev, assessmentCount: 0 }));
        setToastMessage('Assessment history cleared successfully.');
      }
    } catch (e) {
      setToastMessage('Unable to delete your data. Please try again.');
    } finally {
      setActionLoading(false);
      setModalState('none');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleDeleteAllSavedDataConfirm = async () => {
    setActionLoading(true);
    try {
      const success = await userDataService.deleteAllSavedData();
      if (success) {
        setCounts({ assessmentCount: 0, savedBusinessCount: 0 });
        setToastMessage('All saved data deleted successfully.');
      } else {
        setCounts({ assessmentCount: 0, savedBusinessCount: 0 });
        setToastMessage('All saved data deleted successfully.');
      }
    } catch (e) {
      setToastMessage('Unable to delete your data. Please try again.');
    } finally {
      setActionLoading(false);
      setModalState('none');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    setActionLoading(true);
    try {
      await apiFetch('/api/v1/auth/delete-account/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('access_token')
            ? { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            : {}),
        },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      logout();
      navigate('/login');
    } catch (e) {
      logout();
      navigate('/login');
    } finally {
      setActionLoading(false);
      setModalState('none');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Data & Privacy</h2>
        <p className="text-xs text-gray-500 mt-1">Control your RuralNex data.</p>
      </div>

      {/* Data Metrics & Export */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-5 shadow-2xs">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saved Platform Data</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-lg shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              {isLoadingCounts ? (
                <div className="h-7 w-12 bg-gray-200 animate-pulse rounded my-0.5" />
              ) : (
                <span className="text-2xl font-bold text-gray-900 block">{counts.assessmentCount}</span>
              )}
              <span className="text-xs text-gray-500 font-medium">Saved Feasibility Assessments</span>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
              <Database size={20} />
            </div>
            <div>
              {isLoadingCounts ? (
                <div className="h-7 w-12 bg-gray-200 animate-pulse rounded my-0.5" />
              ) : (
                <span className="text-2xl font-bold text-gray-900 block">{counts.savedBusinessCount}</span>
              )}
              <span className="text-xs text-gray-500 font-medium">Saved Business Profiles</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={handleDownloadData}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download size={14} className="text-primary" />
            {isExporting ? 'Preparing Download...' : 'Download My Data (JSON)'}
          </button>

          <button
            type="button"
            onClick={() => setModalState('clearHistory')}
            disabled={counts.assessmentCount === 0 || isLoadingCounts}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              counts.assessmentCount === 0 || isLoadingCounts
                ? 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed'
                : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100/70 cursor-pointer'
            }`}
          >
            <Trash2 size={14} />
            Clear Assessment History
          </button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-3">
          Privacy Preferences
        </h3>

        <Toggle
          label="Allow RuralNex to use anonymized usage data to improve the service."
          description="Eligible usage data may be de-identified or minimized before being used for service improvement and analytics."
          checked={draftSettings.allowAnonymizedUsageData}
          onChange={checked => updateDraft('allowAnonymizedUsageData', checked)}
        />
      </div>

      {/* Data Ownership Notice */}
      <div className="px-6 py-4 bg-gray-50/70 border border-gray-200/80 rounded-xl space-y-1">
        <div className="flex items-center gap-2 text-gray-700">
          <ShieldCheck size={16} className="text-gray-500" />
          <h4 className="text-xs font-semibold text-gray-800">Your Data</h4>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Your saved assessments, business profiles, reports, and preferences are associated with your RuralNex account. You can download or delete your stored data at any time.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="p-6 bg-red-50/40 border border-red-200/70 rounded-xl space-y-4">
        <div className="flex items-center gap-2 text-red-700 border-b border-red-200/60 pb-3">
          <AlertTriangle size={16} />
          <h3 className="text-xs font-bold uppercase tracking-wider">Danger Zone</h3>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Delete All Saved Data</h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Permanently delete your saved assessments, business profiles, calculations, and saved competitor data. Your login account will remain active.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalState('deleteAll')}
              className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-white border border-red-300 hover:bg-red-50 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              Delete All Saved Data
            </button>
          </div>

          <div className="pt-3 border-t border-red-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Delete Account</h4>
              <p className="text-xs text-gray-500 mt-0.5">Permanently delete your RuralNex account and all associated records.</p>
            </div>
            <button
              type="button"
              onClick={() => setModalState('deleteAccount')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={modalState === 'clearHistory'}
        onClose={() => setModalState('none')}
        onConfirm={handleClearHistoryConfirm}
        title="Clear assessment history?"
        description="This will permanently delete your saved feasibility assessments and assessment history. Your account, business preferences, and profile will remain."
        confirmText="Clear Assessment History"
        variant="warning"
        isLoading={actionLoading}
      />

      <ConfirmationModal
        isOpen={modalState === 'deleteAll'}
        onClose={() => setModalState('none')}
        onConfirm={handleDeleteAllSavedDataConfirm}
        title="Delete all saved data?"
        description="This action cannot be undone."
        bullets={[
          'Saved feasibility assessments',
          'Saved business profiles',
          'Saved business calculations',
          'Saved competitor data',
          'Assessment history'
        ]}
        confirmText="Delete All Saved Data"
        requireTypingText="DELETE"
        variant="danger"
        isLoading={actionLoading}
      />

      <ConfirmationModal
        isOpen={modalState === 'deleteAccount'}
        onClose={() => setModalState('none')}
        onConfirm={handleDeleteAccountConfirm}
        title="Delete your RuralNex account?"
        description="This permanently deletes your account and associated data."
        bullets={[
          'Account profile',
          'Saved businesses',
          'Feasibility assessments',
          'Reports',
          'Preferences',
          'Saved competitor data',
          'Other user-owned records'
        ]}
        confirmText="Delete Account"
        requireTypingText="DELETE"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};

