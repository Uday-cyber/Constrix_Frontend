import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE_URL } from "../utils/api";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.email || !form.password) {
            toast.error(t("auth.emailPasswordRequired"));
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || t("auth.loginFail"));
            }

            localStorage.setItem("accessToken", data?.data?.accessToken || "");
            localStorage.setItem("user", JSON.stringify(data?.data?.user || {}));

            toast.success(t("auth.loginSuccess"));
            const from = location.state?.from;
            const redirectPath = from ? `${from.pathname || ""}${from.search || ""}` : "/app";
            navigate(redirectPath || "/app", { replace: true });
        } catch (error) {
            toast.error(error.message || t("auth.unableLogin"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-semibold text-zinc-900">{t("auth.login")}</h1>
                <p className="text-sm text-zinc-600 mt-1">{t("auth.accessWorkspace")}</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder={t("auth.email")}
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder={t("auth.password")}
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-400"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white py-2.5 rounded-lg hover:bg-zinc-800 transition disabled:opacity-60"
                    >
                        {loading ? t("auth.loginLoading") : t("auth.login")}
                    </button>
                </form>

                <p className="text-sm text-zinc-600 mt-5">
                    {t("auth.newUser")}{" "}
                    <Link to="/register" className="text-sky-700 font-medium hover:underline">
                        {t("auth.createAccount")}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
