import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    ClipboardList, 
    Map, 
    Users, 
    PieChart, 
    MessageSquare, 
    FileText, 
    UserCircle,
    LogOut,
    Menu,
    Scale,
    Sliders,
    Leaf
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DashboardLayout() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard },
        { path: '/wizard', label: t('nav_assessment'), icon: ClipboardList },
        { path: '/market', label: t('nav_market'), icon: Map },
        { path: '/competitors', label: t('nav_competitors'), icon: Users },
        { path: '/finance', label: t('nav_finance'), icon: PieChart },
        { path: '/assistant', label: t('nav_assistant'), icon: MessageSquare },
        { path: '/simulator', label: t('nav_simulator', 'Simulator'), icon: Sliders },
        { path: '/compare', label: t('nav_compare', 'Compare'), icon: Scale },
        { path: '/reports', label: t('nav_reports'), icon: FileText },
        { path: '/profile', label: t('nav_profile'), icon: UserCircle },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="h-16 flex items-center px-6 border-b border-gray-200 gap-3">
                    <Leaf size={28} className="text-primary" />
                    <span className="text-xl font-bold text-primary tracking-tight">RuralNex</span>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors
                                ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                            `}
                        >
                            <item.icon size={20} className="shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            {t('language')}
                        </label>
                        <select 
                            value={i18n.language}
                            onChange={(e) => {
                                const newLang = e.target.value;
                                i18n.changeLanguage(newLang);
                                // Optional: PATCH /api/v1/auth/profile/ to save preference here
                            }}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिंदी (Hindi)</option>
                            <option value="gu">ગુજરાતી (Gujarati)</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full text-left rounded-md font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={20} className="shrink-0" />
                        {t('nav_logout')}
                    </button>
                </div>
            </aside>

            {/* Mobile View */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
                    <span className="text-xl font-bold text-primary tracking-tight">RuralNex</span>
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 text-gray-600"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-lg">
                        <nav className="px-4 py-2 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-3 rounded-md font-medium
                                        ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700'}
                                    `}
                                >
                                    <item.icon size={20} />
                                    {item.label}
                                </NavLink>
                            ))}
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-md font-medium text-red-600"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </nav>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
