import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE_URL } from "../utils/api";

const Register = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.firstName || !form.lastName || !form.email || !form.password) {
            toast.error(t("auth.allFieldsRequired"));
            return;
        }

        try {
            setLoading(true);

            const registerResponse = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });
            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                throw new Error(registerData?.message || t("auth.registrationFail"));
            }

            const loginResponse = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const loginData = await loginResponse.json();

            if (!loginResponse.ok) {
                throw new Error(loginData?.message || t("auth.autoLoginFail"));
            }

            localStorage.setItem("accessToken", loginData?.data?.accessToken || "");
            localStorage.setItem("user", JSON.stringify(loginData?.data?.user || {}));

            toast.success(t("auth.registrationSuccess"));
            navigate("/app", { replace: true });
        } catch (error) {
            toast.error(error.message || t("auth.unableRegister"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-lime-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-semibold text-zinc-900">{t("auth.createAccount")}</h1>
                <p className="text-sm text-zinc-600 mt-1">{t("auth.startManaging")}</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            name="firstName"
                            placeholder={t("auth.firstName")}
                            value={form.firstName}
                            onChange={handleChange}
                            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder={t("auth.lastName")}
                            value={form.lastName}
                            onChange={handleChange}
                            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>
                    <input
                        type="email"
                        name="email"
                        placeholder={t("auth.email")}
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder={t("auth.password")}
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white py-2.5 rounded-lg hover:bg-zinc-800 transition disabled:opacity-60"
                    >
                        {loading ? t("auth.creatingAccount") : t("auth.register")}
                    </button>
                </form>

                <p className="text-sm text-zinc-600 mt-5">
                    {t("auth.alreadyRegistered")}{" "}
                    <Link to="/" className="text-orange-700 font-medium hover:underline">
                        {t("auth.login")}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
