import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import {
  User,
  MapPin,
  Briefcase,
  Wallet,
  Building,
  Target,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { mockUser } from '../mock/userMock';

interface BusinessInputProps {
  onAnalysisSubmitted: () => void;
}

export const BusinessInput: React.FC<BusinessInputProps> = ({ onAnalysisSubmitted }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    fullName: mockUser.name,
    phone: mockUser.phone,
    gender: 'Male',
    socialCategory: mockUser.category,
    education: mockUser.education,
    experienceYears: mockUser.experienceYears,
    // Step 2
    state: 'Haryana',
    district: 'Karnal',
    block: 'Gharaunda',
    village: 'Stundi',
    pincode: '132114',
    nearHighway: 'Yes',
    // Step 3
    businessCategory: 'Dairy Processing & Bulk Milk Chilling Unit',
    sectorType: 'Agro & Livestock Processing',
    targetScale: 'Micro Enterprise (Up to ₹1 Cr)',
    // Step 4
    ownCapital: 850000,
    expectedLoan: 500000,
    hasCollateral: 'Yes',
    collateralValue: 1200000,
    // Step 5
    landAreaSqFt: 2500,
    powerConnection: '3-Phase Commercial Grid',
    waterSource: 'Borewell & Panchayat Supply',
    transportVehicle: 'Pickup Van (1.5 Ton)',
    // Step 6
    targetMonthlyRevenue: 150000,
    targetEmployment: 4,
    launchTimeframeMonths: 3,
    // Step 7
    documentsUploaded: ['Aadhaar Card', 'Land 7/12 Extract', 'Bank Statement (6 Months)'],
  });

  const steps = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Location Details', icon: MapPin },
    { num: 3, title: 'Category & Sector', icon: Briefcase },
    { num: 4, title: 'Investment Capacity', icon: Wallet },
    { num: 5, title: 'Existing Assets', icon: Building },
    { num: 6, title: 'Business Goals', icon: Target },
    { num: 7, title: 'Review & Submit', icon: UploadCloud },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsCompleted(true);
      }, 1500);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (isCompleted) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-subtle text-center space-y-4 max-w-2xl mx-auto my-8">
        <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Analysis Dossier Submitted Successfully</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Your project proposal for <strong>{formData.businessCategory}</strong> in <strong>{formData.village}, {formData.district}</strong> has been evaluated against local demand datasets and scheme guidelines.
        </p>

        <div className="p-4 bg-slate-50 rounded border border-slate-200 text-left text-xs space-y-2">
          <div className="font-semibold text-slate-800 border-b border-slate-200 pb-1">Automated Feasibility Score Result</div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Calculated Opportunity Score:</span>
            <Badge variant="green" size="md">87 / 100 (High Feasibility)</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Eligible Government Subsidy:</span>
            <span className="font-bold text-slate-900">PMEGP 35% Capital Subsidy (₹2,97,500)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Est. Debt Service Ratio (DSCR):</span>
            <span className="font-bold text-emerald-700">3.8x (Healthy Bankability)</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onAnalysisSubmitted}
            className="px-4 py-2 bg-gov-800 hover:bg-gov-900 text-white font-semibold rounded text-xs shadow-sm"
          >
            View Dashboard Evaluation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Business Evaluation Wizard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step enterprise input dossier to compute local market demand, scheme eligibility, and bankability.
          </p>
        </div>
        <Badge variant="navy">Step {currentStep} of 7</Badge>
      </div>

      {/* Progress Bar & Steps Indicator */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-subtle">
        <div className="hidden lg:flex items-center justify-between">
          {steps.map((s, idx) => {
            const isDone = currentStep > s.num;
            const isCurr = currentStep === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurr
                        ? 'bg-gov-800 text-white ring-2 ring-gov-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isCurr ? 'text-slate-900' : isDone ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isDone ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Step Progress Indicator */}
        <div className="lg:hidden flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700">Step {currentStep}: {steps[currentStep - 1].title}</span>
          <span className="text-gov-800 font-bold">{Math.round((currentStep / 7) * 100)}% Complete</span>
        </div>
      </div>

      {/* Main Multi-step Form Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-subtle">
        <form onSubmit={handleNext} className="space-y-6">
          {/* STEP 1: Personal / Entrepreneur Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 1: Entrepreneur Profile & Category</h3>
                <p className="text-xs text-slate-500">Government subsidies vary based on social category, gender, and education.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Social Category (For Subsidy Eligibility)</label>
                  <select
                    value={formData.socialCategory}
                    onChange={(e) => setFormData({ ...formData, socialCategory: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option>General</option>
                    <option>OBC</option>
                    <option>SC</option>
                    <option>ST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Educational Qualification</label>
                  <select
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option>Below 10th Standard</option>
                    <option>10th Pass / Secondary</option>
                    <option>12th Pass / Higher Secondary</option>
                    <option>Diploma in Agriculture / ITI</option>
                    <option>Graduate / Post Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prior Business / Trade Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Business Location */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 2: Proposed Business Location</h3>
                <p className="text-xs text-slate-500">Location determines GIS competitor density and market access radii.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option>Haryana</option>
                    <option>Punjab</option>
                    <option>Uttar Pradesh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option>Karnal</option>
                    <option>Ambala</option>
                    <option>Kurukshetra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-district / Block</label>
                  <input
                    type="text"
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Gram Panchayat</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Proximity to National / State Highway</label>
                  <select
                    value={formData.nearHighway}
                    onChange={(e) => setFormData({ ...formData, nearHighway: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option>Yes (Within 2 km)</option>
                    <option>Moderate (2 - 5 km)</option>
                    <option>No (Above 5 km)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Category & Sector */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 3: Target Business Category</h3>
                <p className="text-xs text-slate-500">Select the SME business type you wish to set up.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target SME Business Type</label>
                  <select
                    value={formData.businessCategory}
                    onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded bg-white focus:border-gov-800"
                  >
                    <option>Dairy Processing & Bulk Milk Chilling Unit</option>
                    <option>Agri Equipment & Custom Hiring Center (CHC)</option>
                    <option>Food Processing & Spice Grinding Enterprise</option>
                    <option>Organic Bio-Fertilizer & Vermicompost Hub</option>
                    <option>Solar-Powered Micro Cold Storage Facility</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Sector</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.sectorType}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MSME Scale Category</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.targetScale}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Investment Capacity */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 4: Capital & Investment Capacity</h3>
                <p className="text-xs text-slate-500">Provide your equity contribution and bank credit requirements.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available Own Capital (Equity ₹)</label>
                  <input
                    type="number"
                    value={formData.ownCapital}
                    onChange={(e) => setFormData({ ...formData, ownCapital: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Required Bank Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.expectedLoan}
                    onChange={(e) => setFormData({ ...formData, expectedLoan: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Land / Property Collateral Available</label>
                  <select
                    value={formData.hasCollateral}
                    onChange={(e) => setFormData({ ...formData, hasCollateral: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option>Yes</option>
                    <option>No (Rely on MUDRA / CGTMSE Guarantee)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Collateral Market Value (₹)</label>
                  <input
                    type="number"
                    value={formData.collateralValue}
                    onChange={(e) => setFormData({ ...formData, collateralValue: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Existing Resources */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 5: Existing Assets & Infrastructure</h3>
                <p className="text-xs text-slate-500">Infrastructure availability impacts initial setup lead time.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Available Shed / Land Area (Sq. Ft.)</label>
                  <input
                    type="number"
                    value={formData.landAreaSqFt}
                    onChange={(e) => setFormData({ ...formData, landAreaSqFt: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Electricity Supply Connection</label>
                  <select
                    value={formData.powerConnection}
                    onChange={(e) => setFormData({ ...formData, powerConnection: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded bg-white"
                  >
                    <option>3-Phase Commercial Grid</option>
                    <option>Single Phase Domestic Grid</option>
                    <option>Off-Grid Solar Dedicated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Water Supply Availability</label>
                  <input
                    type="text"
                    value={formData.waterSource}
                    onChange={(e) => setFormData({ ...formData, waterSource: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transport Vehicle Access</label>
                  <input
                    type="text"
                    value={formData.transportVehicle}
                    onChange={(e) => setFormData({ ...formData, transportVehicle: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Goals & Employment */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 6: Business Goals & Employment Targets</h3>
                <p className="text-xs text-slate-500">Projected impact helps score social development metrics under PMEGP.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Monthly Revenue (₹)</label>
                  <input
                    type="number"
                    value={formData.targetMonthlyRevenue}
                    onChange={(e) => setFormData({ ...formData, targetMonthlyRevenue: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Rural Jobs Created</label>
                  <input
                    type="number"
                    value={formData.targetEmployment}
                    onChange={(e) => setFormData({ ...formData, targetEmployment: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Launch Timeframe (Months)</label>
                  <input
                    type="number"
                    value={formData.launchTimeframeMonths}
                    onChange={(e) => setFormData({ ...formData, launchTimeframeMonths: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-gov-800 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Review & Submit */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Step 7: Final Review & Document Checklist</h3>
                <p className="text-xs text-slate-500">Verify submitted details before running the AI Feasibility Engine.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">Dossier Summary</div>
                  <div><strong>Applicant:</strong> {formData.fullName} ({formData.socialCategory})</div>
                  <div><strong>Location:</strong> {formData.village}, {formData.block}, {formData.district}</div>
                  <div><strong>Proposed SME:</strong> {formData.businessCategory}</div>
                  <div><strong>Capital Plan:</strong> Equity ₹{(formData.ownCapital/100000).toFixed(1)}L + Loan ₹{(formData.expectedLoan/100000).toFixed(1)}L</div>
                </div>

                <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">Verified Document Checklist</div>
                  {formData.documentsUploaded.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-emerald-800 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {doc}
                    </div>
                  ))}
                  <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-gov-800" /> Documents will be submitted directly to DIC Portal if requested.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                currentStep === 1
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous Step
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-gov-800 hover:bg-gov-900 text-white rounded text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              {isSubmitting ? (
                <span>Running Feasibility Engine...</span>
              ) : currentStep === 7 ? (
                <>Submit Dossier For Analysis <CheckCircle2 className="w-4 h-4" /></>
              ) : (
                <>Next Step <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
