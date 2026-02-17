import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000/api/users";

const Register = () => {
    const navigate = useNavigate();
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
            toast.error("All fields are required");
            return;
        }

        try {
            setLoading(true);

            const registerResponse = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(form),
            });
            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                throw new Error(registerData?.message || "Registration failed");
            }

            const loginResponse = await fetch(`${API_BASE}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email: form.email, password: form.password }),
            });
            const loginData = await loginResponse.json();

            if (!loginResponse.ok) {
                throw new Error(loginData?.message || "Auto-login failed after registration");
            }

            localStorage.setItem("accessToken", loginData?.data?.accessToken || "");
            localStorage.setItem("user", JSON.stringify(loginData?.data?.user || {}));

            toast.success("Registration successful");
            navigate("/app", { replace: true });
        } catch (error) {
            toast.error(error.message || "Unable to register");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-100 via-orange-50 to-lime-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-semibold text-zinc-900">Create Account</h1>
                <p className="text-sm text-zinc-600 mt-1">Start managing your projects.</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={form.firstName}
                            onChange={handleChange}
                            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={form.lastName}
                            onChange={handleChange}
                            className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
                        />
                    </div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full border border-zinc-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white py-2.5 rounded-lg hover:bg-zinc-800 transition disabled:opacity-60"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="text-sm text-zinc-600 mt-5">
                    Already registered?{" "}
                    <Link to="/" className="text-orange-700 font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
