import { Link, useLocation } from "react-router-dom";

const InvitationExpired = () => {
    const location = useLocation();
    const message = location.state?.message || "This invitation is invalid or has expired.";

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center px-4">
            <div className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white shadow-xl p-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-3xl">
                    !
                </div>
                <h1 className="text-3xl font-semibold text-zinc-900">Invitation Expired</h1>
                <p className="mt-3 text-sm text-zinc-600">{message}</p>
                <p className="mt-2 text-sm text-zinc-500">
                    Ask your workspace admin to send you a fresh invitation link.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition"
                    >
                        Go to Login
                    </Link>
                    <Link
                        to="/register"
                        className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 transition"
                    >
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default InvitationExpired;
