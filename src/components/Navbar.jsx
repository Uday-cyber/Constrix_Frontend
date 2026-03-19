import { SearchIcon, PanelLeft, ChevronDown } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleTheme } from '../features/themeSlice'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useLanguage } from '../context/LanguageContext'
import { API_BASE_URL } from '../utils/api'

const getInitials = (firstName = "", lastName = "") =>
    `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "U";

const isImageUrl = (value = "") =>
    /^(https?:\/\/|data:image\/|\/)/i.test(value);

const Navbar = ({ setIsSidebarOpen }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useSelector(state => state.theme);
    const { language, setLanguage, t, languages } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));
    const menuRef = useRef(null);

    const initials = getInitials(user?.firstName, user?.lastName);
    const showImage = isImageUrl(user?.image || "");

    useEffect(() => {
        const onOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", onOutsideClick);
        return () => document.removeEventListener("mousedown", onOutsideClick);
    }, []);

    useEffect(() => {
        const syncUser = () => setUser(JSON.parse(localStorage.getItem("user") || "{}"));
        window.addEventListener("storage", syncUser);
        window.addEventListener("user-updated", syncUser);

        return () => {
            window.removeEventListener("storage", syncUser);
            window.removeEventListener("user-updated", syncUser);
        };
    }, []);

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            await fetch(`${API_BASE_URL}/logout`, {
                method: "POST",
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
        } catch (_) {
            // Continue logout on client even if server logout fails.
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setIsMenuOpen(false);
            toast.success(t("common.logout"));
            navigate("/", { replace: true });
        }
    };

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-6 xl:px-16 py-3 flex-shrink-0">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                {/* Left section */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                    {/* Sidebar Trigger */}
                    <button onClick={() => setIsSidebarOpen((prev) => !prev)} className="sm:hidden p-2 rounded-lg transition-colors text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800" >
                        <PanelLeft size={20} />
                    </button>

                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-400 size-3.5" />
                        <input
                            type="text"
                            placeholder={t("common.searchProjectsTasks")}
                            className="pl-8 pr-4 py-2 w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-md text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="h-8 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-gray-700 dark:text-zinc-200 px-2 outline-none"
                        aria-label="Select language"
                    >
                        {languages.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.label}
                            </option>
                        ))}
                    </select>

                    {/* Theme Toggle */}
                    <button onClick={() => dispatch(toggleTheme())} className="size-8 flex items-center justify-center bg-white dark:bg-zinc-800 shadow rounded-lg transition hover:scale-105 active:scale-95">
                        {
                            theme === "light"
                                ? (<MoonIcon className="size-4 text-gray-800 dark:text-gray-200" />)
                                : (<SunIcon className="size-4 text-yellow-400" />)
                        }
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            className="flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            {
                                showImage ? (
                                    <img
                                        src={user.image}
                                        alt="User Avatar"
                                        className="size-7 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="size-7 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                                        {initials}
                                    </div>
                                )
                            }
                            <ChevronDown className="size-4 text-gray-500 dark:text-zinc-400" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg z-50 overflow-hidden">
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate("/app/profile");
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                >
                                    {t("common.profile")}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        navigate("/app/settings");
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-800"
                                >
                                    {t("common.settings")}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                    {t("common.logout")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar
