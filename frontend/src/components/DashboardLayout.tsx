import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
    LayoutDashboard, 
    MapPin, 
    Calculator, 
    MessageSquare, 
    FileText, 
    LogOut,
    Menu,
    X,
    Scale,
    Sliders,
    ClipboardList,
    Settings as SettingsIcon,
    ChevronDown
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const toolsDropdownRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(event.target as Node)) {
                setToolsMenuOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Primary Horizontal Bar Items requested by user
    const mainNavItems = [
        { path: '/dashboard', label: t('nav_dashboard', 'Dashboard'), icon: LayoutDashboard },
        { path: '/market', label: t('nav_geospatial', 'GeoSpatial'), icon: MapPin },
        { path: '/finance', label: t('nav_financial_calculator', 'Financial Calculator'), icon: Calculator },
    ];

    // Secondary Tools Dropdown Items
    const toolItems = [
        { path: '/assistant', label: t('nav_assistant', 'AI Advisor'), icon: MessageSquare },
        { path: '/simulator', label: t('nav_simulator', 'What-If Simulator'), icon: Sliders },
        { path: '/compare', label: t('nav_compare', 'Compare Businesses'), icon: Scale },
        { path: '/wizard', label: t('nav_assessment', 'Assessment Wizard'), icon: ClipboardList },
        { path: '/reports', label: t('nav_reports', 'Reports'), icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
            {/* Top Horizontal Navigation Bar */}
            <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-40 shadow-2xs">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    
                    {/* Left: Brand Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
                        <img src="/logo.png" alt="RuralNex Logo" className="h-9 w-auto object-contain transition-transform group-hover:scale-105" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Rural<span className="text-primary">Nex</span></span>
                    </Link>

                    {/* Center: Main Horizontal Navigation Bar (Desktop) */}
                    <nav className="hidden md:flex items-center justify-center gap-1.5 lg:gap-2 flex-1 max-w-3xl mx-auto">
                        {mainNavItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-sm transition-all
                                    ${isActive 
                                        ? 'bg-primary text-white shadow-xs font-bold' 
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}
                                `}
                            >
                                <item.icon size={18} className="shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}

                        {/* More Tools Dropdown */}
                        <div className="relative" ref={toolsDropdownRef}>
                            <button
                                onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors ${
                                    toolsMenuOpen ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white' : ''
                                }`}
                            >
                                <span>More Tools</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${toolsMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {toolsMenuOpen && (
                                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                                    {toolItems.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setToolsMenuOpen(false)}
                                            className={({ isActive }) => `
                                                flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-colors
                                                ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}
                                            `}
                                        >
                                            <item.icon size={16} className="shrink-0" />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Settings Link */}
                        <NavLink
                            to="/settings"
                            title="Settings"
                            className={({ isActive }) => `
                                p-2 rounded-xl transition-colors
                                ${isActive 
                                    ? 'bg-primary/10 dark:bg-primary/20 text-primary font-bold border border-primary/20' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'}
                            `}
                        >
                            <SettingsIcon size={20} />
                        </NavLink>

                        {/* User Profile & Menu */}
                        {user && (
                            <div className="relative" ref={userDropdownRef}>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {user.profile?.avatar_url ? (
                                        <img 
                                            src={user.profile.avatar_url} 
                                            alt={user.first_name || user.username} 
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-slate-700 shadow-2xs"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                                            {user.first_name ? user.first_name[0].toUpperCase() : (user.username ? user.username[0].toUpperCase() : 'U')}
                                        </div>
                                    )}
                                    <ChevronDown size={14} className="text-gray-500 dark:text-gray-400" />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                                        <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                        </div>

                                        <NavLink
                                            to="/settings"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                                        >
                                            <SettingsIcon size={16} />
                                            <span>System Settings</span>
                                        </NavLink>

                                        <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-2 px-4 py-2 w-full text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                                        >
                                            <LogOut size={16} />
                                            <span>{t('nav_logout', 'Logout')}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger Toggle */}
                    <div className="md:hidden flex items-center gap-2">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                </div>

                {/* Mobile Dropdown Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
                        {user && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                                {user.profile?.avatar_url ? (
                                    <img 
                                        src={user.profile.avatar_url} 
                                        alt={user.first_name || user.username} 
                                        className="w-9 h-9 rounded-full object-cover border border-gray-200" 
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-primary/20">
                                        {user.first_name ? user.first_name[0].toUpperCase() : (user.username ? user.username[0].toUpperCase() : 'U')}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1 pt-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">Main Navigation</p>
                            {mainNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm
                                        ${isActive ? 'bg-primary text-white font-bold' : 'text-gray-700 hover:bg-gray-100'}
                                    `}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>

                        <div className="space-y-1 border-t border-gray-100 pt-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">More Tools</p>
                            {toolItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm
                                        ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}
                                    `}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                            <NavLink
                                to="/settings"
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm
                                    ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}
                                `}
                            >
                                <SettingsIcon size={18} />
                                <span>Settings</span>
                            </NavLink>
                        </div>

                        <div className="border-t border-gray-100 pt-2">
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg font-medium text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut size={18} />
                                <span>{t('nav_logout', 'Logout')}</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
