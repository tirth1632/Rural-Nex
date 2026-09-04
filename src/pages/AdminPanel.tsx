import { useState } from 'react';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import {
  ShieldCheck,
  Users,
  Landmark,
  Database,
  FileSpreadsheet,
  Activity,
  Search,
} from 'lucide-react';
import { mockUsersList } from '../mock/userMock';
import { mockGovSchemes } from '../mock/schemeMock';
import { mockAuditLogs } from '../mock/adminMock';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'schemes' | 'audit'>('users');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gov-800" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">State & District Nodal Administration Panel</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage registered entrepreneurs, scheme eligibility master matrices, and system audit logs.
          </p>
        </div>

        <Badge variant="navy">Role: Nodal Officer (Admin)</Badge>
      </div>

      {/* Admin KPI Summary Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Entrepreneurs"
          value="1,420"
          subtitle="Across 6 Blocks in Karnal"
          change="+34 This Week"
          changeType="positive"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Applications Processed"
          value="890 Units"
          subtitle="DPR Sanction Status"
          change="84% Approval Rate"
          changeType="positive"
          icon={<FileSpreadsheet className="w-5 h-5" />}
        />
        <StatCard
          title="Aggregate Credit Disbursed"
          value="₹42.8 Cr"
          subtitle="SBI & Canara Bank Lending"
          icon={<Landmark className="w-5 h-5" />}
        />
        <StatCard
          title="Active Scheme Matrices"
          value="14 Rules"
          subtitle="PMEGP, PMFME, MUDRA, AIF"
          icon={<Database className="w-5 h-5" />}
        />
      </div>

      {/* Admin Tab Navigation */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'users', label: 'User Directory', icon: Users },
              { id: 'schemes', label: 'Scheme Master List', icon: Landmark },
              { id: 'audit', label: 'System Audit Logs', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSel = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isSel
                      ? 'bg-gov-800 text-white shadow-subtle'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white"
            />
          </div>
        </div>

        {/* Tab 1: User Directory */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">User ID</th>
                  <th className="px-3 py-2.5">Full Name</th>
                  <th className="px-3 py-2.5">Role</th>
                  <th className="px-3 py-2.5">District / Village</th>
                  <th className="px-3 py-2.5">Category</th>
                  <th className="px-3 py-2.5">Capital Capacity</th>
                  <th className="px-3 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mockUsersList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5 font-mono font-semibold text-slate-900">{user.id}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900">{user.name}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={user.role === 'admin' ? 'navy' : user.role === 'analyst' ? 'blue' : 'green'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{user.district}, {user.village}</td>
                    <td className="px-3 py-2.5 text-slate-700">{user.category}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900">₹{(user.availableCapital / 100000).toFixed(1)} Lakh</td>
                    <td className="px-3 py-2.5">
                      <button className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold">
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Scheme Master */}
        {activeTab === 'schemes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Code</th>
                  <th className="px-3 py-2.5">Scheme Title</th>
                  <th className="px-3 py-2.5">Department</th>
                  <th className="px-3 py-2.5">Max Subsidy %</th>
                  <th className="px-3 py-2.5">Max Loan Cap</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mockGovSchemes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5 font-extrabold text-gov-800">{s.code}</td>
                    <td className="px-3 py-2.5 font-bold text-slate-900">{s.name}</td>
                    <td className="px-3 py-2.5 text-slate-600">{s.department}</td>
                    <td className="px-3 py-2.5 font-bold text-emerald-800">{s.maxSubsidyPercent}%</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">₹{(s.maxLoanAmountRupees / 100000).toFixed(1)} Lakh</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="green">Active Registry</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: System Audit Logs */}
        {activeTab === 'audit' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Log ID</th>
                  <th className="px-3 py-2.5">Timestamp</th>
                  <th className="px-3 py-2.5">User / System</th>
                  <th className="px-3 py-2.5">Action Executed</th>
                  <th className="px-3 py-2.5">Module</th>
                  <th className="px-3 py-2.5">IP Address</th>
                  <th className="px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mockAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2.5 font-mono text-slate-500">{log.id}</td>
                    <td className="px-3 py-2.5 text-slate-600 font-mono text-[11px]">{log.timestamp}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">{log.user}</td>
                    <td className="px-3 py-2.5 text-slate-800 font-medium">{log.action}</td>
                    <td className="px-3 py-2.5 text-slate-600">{log.module}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-500 text-[11px]">{log.ipAddress}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={log.status === 'SUCCESS' ? 'green' : 'amber'}>{log.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
