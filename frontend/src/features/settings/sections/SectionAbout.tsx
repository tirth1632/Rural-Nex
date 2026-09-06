import React, { useState } from 'react';
import { Leaf, ExternalLink, Shield, FileText, HelpCircle, Mail } from 'lucide-react';

export const SectionAbout: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">About RuralNex</h2>
        <p className="text-xs text-gray-500 mt-1">Application information and support resources.</p>
      </div>

      <div className="p-6 bg-white border border-gray-200 rounded-xl space-y-6 shadow-2xs">
        {/* Logo & Platform Info */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="p-3.5 bg-primary/10 rounded-xl text-primary shrink-0 border border-primary/20">
            <Leaf size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">RuralNex</h3>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-gray-100 text-gray-700 rounded-md border border-gray-200">
                v1.0.0
              </span>
            </div>
            <p className="text-xs font-semibold text-primary mt-0.5">
              AI-Powered Rural Entrepreneurship & Feasibility Advisory Platform
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-xl">
              RuralNex evaluates financial eligibility, calculates local market opportunity, analyzes competitor density, and generates comprehensive risk-assessed feasibility reports for rural entrepreneurs.
            </p>
          </div>
        </div>

        {/* Links & Support */}
        <div>
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Resource & Legal Links</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveModal('terms')}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText size={16} className="text-gray-600" />
                <span className="text-xs font-semibold text-gray-900">Terms & Conditions</span>
              </div>
              <ExternalLink size={14} className="text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Shield size={16} className="text-gray-600" />
                <span className="text-xs font-semibold text-gray-900">Privacy Policy</span>
              </div>
              <ExternalLink size={14} className="text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('help')}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle size={16} className="text-gray-600" />
                <span className="text-xs font-semibold text-gray-900">Help & Support</span>
              </div>
              <ExternalLink size={14} className="text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('contact')}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-gray-600" />
                <span className="text-xs font-semibold text-gray-900">Contact Us</span>
              </div>
              <ExternalLink size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-900 capitalize">{activeModal.replace('-', ' ')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {activeModal === 'terms' && 'RuralNex terms of service govern the use of business feasibility tools, financial modeling algorithms, and AI recommendations.'}
              {activeModal === 'privacy' && 'Your privacy is paramount. RuralNex complies with standard data protection policies and keeps your location and financial inputs strictly confidential.'}
              {activeModal === 'help' && 'Need assistance with your business assessment? Reach out to our field officer support team or consult the documentation.'}
              {activeModal === 'contact' && 'Contact the RuralNex Team: support@ruralnex.org | Toll-free: 1800-123-RURAL'}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
