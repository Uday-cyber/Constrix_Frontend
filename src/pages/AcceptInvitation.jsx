import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { WORKSPACE_API_BASE } from "../utils/api";
import { fetchMyWorkspaces } from "../features/workspaceSlice";

const AcceptInvitation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

    useEffect(() => {
        if (!token) return;

        const processInvitation = async () => {
            try {
                setLoading(true);
                const authToken = localStorage.getItem("accessToken");

                const previewResponse = await fetch(
                    `${WORKSPACE_API_BASE}/invitations/preview?token=${encodeURIComponent(token)}`,
                    { method: "GET", credentials: "include" }
                );
                const previewData = await previewResponse.json().catch(() => ({}));
                if (!previewResponse.ok) {
                    throw new Error(previewData?.message || "Invalid or expired invitation");
                }

                const preview = previewData?.data || {};

                if (!authToken) {
                    const from = { pathname: "/accept-invitation", search: `?token=${encodeURIComponent(token)}` };
                    if (preview.isRegistered) {
                        navigate("/", { replace: true, state: { from } });
                    } else {
                        navigate(`/register?email=${encodeURIComponent(preview.email || "")}`, {
                            replace: true,
                            state: { from },
                        });
                    }
                    return;
                }

                const response = await fetch(`${WORKSPACE_API_BASE}/invitations/accept`, {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data?.message || "Failed to accept invitation");

                await dispatch(fetchMyWorkspaces());
                toast.success("Invitation accepted");
                navigate("/app", { replace: true });
            } catch (error) {
                toast.error(error?.message || "Failed to accept invitation");
            } finally {
                setLoading(false);
            }
        };

        processInvitation();
    }, [dispatch, navigate, token]);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">Invalid invitation link.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
                {loading ? "Accepting invitation..." : "Processing invitation..."}
            </p>
        </div>
    );
};

export default AcceptInvitation;
