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
    Sun,
    Moon,
    Landmark
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../features/settings/SettingsContext';

import LanguageSelector from './LanguageSelector';
import { RuralNexLogoMark } from './RuralNexLogo';

export default function DashboardLayout() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { toggleTheme, isDarkMode } = useSettings();
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
        { path: '/finance', label: t('nav_financial_plan', 'Financial Plan'), icon: Calculator },
        { path: '/schemes', label: t('nav_govt_schemes', 'Govt Schemes'), icon: Landmark },
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
        <div className="h-screen h-[100dvh] max-h-screen max-h-[100dvh] bg-white dark:bg-[#0a0a0c] text-gray-900 dark:text-white flex flex-col overflow-hidden transition-colors duration-150 font-sans">
            {/* Top Horizontal Navigation Bar */}
            <header className="bg-white dark:bg-[#0a0a0c] border-b border-gray-200 dark:border-zinc-800 shrink-0 h-16 z-50 shadow-xs">
                <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                    
                    {/* Left: Brand Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
                        <RuralNexLogoMark size={36} className="transition-transform group-hover:scale-105" />
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
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'}
                                `}
                            >
                                <item.icon size={18} className="shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}

                        {/* More Tools Dropdown */}
                        <div 
                            className="relative" 
                            ref={toolsDropdownRef}
                            onMouseEnter={() => setToolsMenuOpen(true)}
                            onMouseLeave={() => setToolsMenuOpen(false)}
                        >
                            <button
                                onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white transition-colors ${
                                    toolsMenuOpen ? 'bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white' : ''
                                }`}
                            >
                                <span>{t('nav_more_tools', 'More Tools')}</span>
                            </button>

                            {toolsMenuOpen && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1.5 z-50">
                                    <div className="w-56 bg-white dark:bg-[#0a0a0c] rounded-xl shadow-xl border border-gray-200 dark:border-zinc-800 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                                        {toolItems.map((item) => (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => setToolsMenuOpen(false)}
                                                className={({ isActive }) => `
                                                    flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold transition-colors
                                                    ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'}
                                                `}
                                            >
                                                <item.icon size={16} className="shrink-0" />
                                                <span>{item.label}</span>
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-3">
                        {/* Language Selector Dropdown Directly in Header */}
                        <LanguageSelector />

                        {/* Theme Toggle Button (Light/Dark) */}
                        <button
                            type="button"
                            onClick={toggleTheme}
                            title={isDarkMode ? 'Switch to Light Mode (Pure White)' : 'Switch to Dark Mode (Deep Black)'}
                            className="p-2 rounded-xl border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-all flex items-center justify-center group cursor-pointer"
                            aria-label="Toggle Light/Dark Theme"
                        >
                            {isDarkMode ? (
                                <Sun size={19} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                            ) : (
                                <Moon size={19} className="text-gray-700 group-hover:-rotate-12 transition-transform duration-300" />
                            )}
                        </button>

                        {/* Settings Link */}
                        <NavLink
                            to="/settings"
                            title="Settings"
                            className={({ isActive }) => `
                                p-2 rounded-xl transition-colors border border-transparent
                                ${isActive 
                                    ? 'bg-primary/10 dark:bg-primary/20 text-primary font-bold border-primary/20' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white'}
                            `}
                        >
                            <SettingsIcon size={20} />
                        </NavLink>

                        {/* User Profile & Menu */}
                        {user && (
                            <div 
                                className="relative" 
                                ref={userDropdownRef}
                                onMouseEnter={() => setUserMenuOpen(true)}
                                onMouseLeave={() => setUserMenuOpen(false)}
                            >
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                                >
                                    {user.profile?.avatar_url ? (
                                        <img 
                                            src={user.profile.avatar_url} 
                                            alt={user.first_name || user.username} 
                                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-zinc-700 shadow-2xs"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                                            {user.first_name ? user.first_name[0].toUpperCase() : (user.username ? user.username[0].toUpperCase() : 'U')}
                                        </div>
                                    )}
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 top-full pt-1.5 z-50">
                                        <div className="w-56 bg-white dark:bg-[#0a0a0c] rounded-xl shadow-xl border border-gray-200 dark:border-zinc-800 py-2 animate-in fade-in zoom-in-95 duration-100">
                                            <div className="px-4 py-2 border-b border-gray-100 dark:border-zinc-800">
                                                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                                    {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                                                </p>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                            </div>

                                            <NavLink
                                                to="/settings"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-white"
                                            >
                                                <SettingsIcon size={16} />
                                                <span>System Settings</span>
                                            </NavLink>

                                            <div className="border-t border-gray-100 dark:border-zinc-800 my-1"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 px-4 py-2 w-full text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                                            >
                                                <LogOut size={16} />
                                                <span>{t('nav_logout', 'Logout')}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Controls (Language, Theme toggle & Hamburger) */}
                    <div className="md:hidden flex items-center gap-1.5">
                        <LanguageSelector />
                        <button
                            type="button"
                            onClick={toggleTheme}
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            className="p-2 rounded-lg border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer"
                        >
                            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
                        </button>
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 cursor-pointer"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                </div>

                {/* Mobile Dropdown Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-zinc-800 px-4 pt-3 pb-6 space-y-3 shadow-xl">
                        {user && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                                {user.profile?.avatar_url ? (
                                    <img 
                                        src={user.profile.avatar_url} 
                                        alt={user.first_name || user.username} 
                                        className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-zinc-700" 
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center border border-primary/20">
                                        {user.first_name ? user.first_name[0].toUpperCase() : (user.username ? user.username[0].toUpperCase() : 'U')}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1 pt-1">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-3 py-1">{t('nav_main_navigation', 'Main Navigation')}</p>
                            {mainNavItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm
                                        ${isActive ? 'bg-primary text-white font-bold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900'}
                                    `}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>

                        <div className="space-y-1 border-t border-gray-100 dark:border-zinc-800 pt-2">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 px-3 py-1">{t('nav_more_tools', 'More Tools')}</p>
                            {toolItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm
                                        ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900'}
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
                                    ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-900'}
                                `}
                            >
                                <SettingsIcon size={18} />
                                <span>{t('nav_settings', 'Settings')}</span>
                            </NavLink>
                        </div>

                        <div className="border-t border-gray-100 dark:border-zinc-800 pt-2">
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                            >
                                <LogOut size={18} />
                                <span>{t('nav_logout', 'Logout')}</span>
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-black">
                <Outlet />
            </main>
        </div>
    );
}
