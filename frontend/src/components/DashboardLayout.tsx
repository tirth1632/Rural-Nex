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
    Leaf,
    Settings as SettingsIcon
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
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
        { path: '/settings', label: t('nav_settings', 'Settings'), icon: SettingsIcon },
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
                                ${isActive ? 'bg-primary text-white font-bold shadow-xs' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                            `}
                        >
                            <item.icon size={20} className="shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 space-y-3">
                    {/* User Profile Card */}
                    {user && (
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                            {user.profile?.avatar_url ? (
                                <img 
                                    src={user.profile.avatar_url} 
                                    alt={user.first_name || user.username} 
                                    className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
                                    referrerPolicy="no-referrer" 
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20">
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
                    <div className="flex items-center gap-2">
                        <Leaf size={24} className="text-primary" />
                        <span className="text-xl font-bold text-primary tracking-tight">RuralNex</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {user && (
                            user.profile?.avatar_url ? (
                                <img 
                                    src={user.profile.avatar_url} 
                                    alt={user.first_name || user.username} 
                                    className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm"
                                    referrerPolicy="no-referrer" 
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                                    {user.first_name ? user.first_name[0].toUpperCase() : (user.username ? user.username[0].toUpperCase() : 'U')}
                                </div>
                            )
                        )}
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-gray-600"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-lg">
                        <nav className="px-4 py-2 space-y-1">
                            {user && (
                                <div className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-gray-50 border border-gray-100">
                                    {user.profile?.avatar_url ? (
                                        <img 
                                            src={user.profile.avatar_url} 
                                            alt={user.first_name || user.username} 
                                            className="w-9 h-9 rounded-full object-cover border border-gray-200 shadow-sm shrink-0" 
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20">
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
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-3 py-3 rounded-md font-medium
                                        ${isActive ? 'bg-primary text-white font-bold' : 'text-gray-700'}
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
