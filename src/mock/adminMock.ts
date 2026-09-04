import type { AuditLog } from '../types';

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'LOG-8801',
    timestamp: '2026-09-04 09:12:44',
    user: 'Ramesh Kumar (USR-89214)',
    action: 'Submitted Business Feasibility Form',
    module: 'Business Analysis',
    ipAddress: '103.24.18.91',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-8802',
    timestamp: '2026-09-04 08:45:10',
    user: 'Sunita Devi (USR-44102)',
    action: 'Ran Financial Loan EMI Calculation',
    module: 'Financial Calculator',
    ipAddress: '103.24.18.42',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-8803',
    timestamp: '2026-09-04 07:30:19',
    user: 'Dr. Anita Sharma (USR-90011)',
    action: 'Updated PMEGP Subsidy Rule Parameters',
    module: 'Scheme Master',
    ipAddress: '14.97.210.15',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-8804',
    timestamp: '2026-09-04 06:15:00',
    user: 'SYSTEM_CRON',
    action: 'GIS GeoJSON Boundary Cache Refresh',
    module: 'GIS System',
    ipAddress: '127.0.0.1',
    status: 'SUCCESS',
  },
  {
    id: 'LOG-8805',
    timestamp: '2026-09-03 18:22:11',
    user: 'Vikram Singh (USR-10928)',
    action: 'Exported District Feasibility PDF Dossier',
    module: 'Reports',
    ipAddress: '103.24.19.102',
    status: 'SUCCESS',
  }
];
