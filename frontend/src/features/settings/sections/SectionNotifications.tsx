import React from 'react';
import { useSettings } from '../SettingsContext';
import { Toggle } from '../components/Toggle';
import { Mail, Bell } from 'lucide-react';

export const SectionNotifications: React.FC = () => {
  const { draftSettings, updateDraft } = useSettings();

  const notificationItems = [
    {
      key: 'assessmentCompletedNotif' as const,
      title: 'Assessment completed',
      description: 'Receive a notification when a business feasibility assessment is completed.',
    },
    {
      key: 'reportGeneratedNotif' as const,
      title: 'Report generated',
      description: 'Notify when a report is ready.',
    },
    {
      key: 'marketDataNotif' as const,
      title: 'Market data updates',
      description: 'Receive important market-data updates.',
    },
    {
      key: 'competitorUpdatesNotif' as const,
      title: 'Competitor updates',
      description: 'Receive updates relevant to saved competitors.',
    },
    {
      key: 'financeAlertsNotif' as const,
      title: 'Finance alerts',
      description: 'Receive important financial or feasibility alerts.',
    },
    {
      key: 'aiRecommendationsNotif' as const,
      title: 'AI recommendations',
      description: 'Receive useful recommendations from RuralNex AI Advisor.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
        <p className="text-xs text-gray-500 mt-1">Choose which RuralNex updates you receive.</p>
      </div>

      {/* Primary Communication Channels */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-4 shadow-2xs">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notification Channels</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="flex items-center justify-between p-3.5 border border-gray-200 rounded-lg bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-primary shrink-0" />
              <div>
                <span className="text-sm font-semibold text-gray-900 block">Email Notifications</span>
                <span className="text-[11px] text-gray-500 block">Send updates to email</span>
              </div>
            </div>
            <Toggle
              checked={draftSettings.emailNotifications}
              onChange={checked => updateDraft('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3.5 border border-gray-200 rounded-lg bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-primary shrink-0" />
              <div>
                <span className="text-sm font-semibold text-gray-900 block">In-app Notifications</span>
                <span className="text-[11px] text-gray-500 block">Show badges in RuralNex</span>
              </div>
            </div>
            <Toggle
              checked={draftSettings.inAppNotifications}
              onChange={checked => updateDraft('inAppNotifications', checked)}
            />
          </div>
        </div>
      </div>

      {/* Specific Alert Categories */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-5 shadow-2xs">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-3">
          Activity & Alert Preferences
        </h3>

        <div className="divide-y divide-gray-100">
          {notificationItems.map(item => (
            <div key={item.key} className="py-3.5 first:pt-0 last:pb-0">
              <Toggle
                label={item.title}
                description={item.description}
                checked={draftSettings[item.key]}
                onChange={checked => updateDraft(item.key, checked)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
