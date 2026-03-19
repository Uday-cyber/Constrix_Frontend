import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useSelector } from "react-redux";
import { useLanguage } from "../context/LanguageContext";
import toast from "react-hot-toast";
import { WORKSPACE_API_BASE } from "../utils/api";
import { authFetch } from "../utils/authFetch";

const InviteMemberDialog = ({
    isDialogOpen,
    setIsDialogOpen,
    workspaceOverride = null,
    onDone = null,
    allowSkip = false,
}) => {
    const { t } = useLanguage();

    const currentWorkspaceFromStore = useSelector((state) => state.workspace?.currentWorkspace || null);
    const currentWorkspace = workspaceOverride || currentWorkspaceFromStore;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        role: "org:member",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const workspaceId = currentWorkspace?._id || currentWorkspace?.id;
        if (!workspaceId) {
            toast.error("Select a workspace first");
            return;
        }

        try {
            setIsSubmitting(true);
            const role = formData.role === "org:admin" ? "ADMIN" : "MEMBER";
            const emails = formData.email
                .split(/[,\n]/)
                .map((e) => e.trim().toLowerCase())
                .filter(Boolean);

            if (emails.length === 0) {
                throw new Error("Enter at least one email");
            }

            const results = await Promise.allSettled(
                emails.map((email) =>
                    authFetch(`${WORKSPACE_API_BASE}/${workspaceId}/invitations`, {
                        method: "POST",
                        timeoutMs: 15000,
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, role }),
                    })).then(async (res) => {
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                            if (res.status === 409) {
                                throw new Error(`${email}: Invitation already sent`);
                            }
                            if (res.status === 401) {
                                throw new Error("Session expired. Please login again.");
                            }
                            throw new Error(data?.message || `Failed for ${email}`);
                        }
                        return data;
                    })
                )
            );

            const successCount = results.filter((r) => r.status === "fulfilled").length;
            const failCount = results.length - successCount;

            if (successCount > 0) {
                toast.success(`Invitation sent (${successCount})`);
            }
            if (failCount > 0) {
                const firstError = results.find((r) => r.status === "rejected")?.reason?.message;
                toast.error(firstError || `Failed to send ${failCount} invitation(s)`);
            }

            if (successCount > 0) {
                setFormData({ email: "", role: "org:member" });
                setIsDialogOpen(false);
                onDone?.();
            }
        } catch (error) {
            const message =
                error?.name === "AbortError"
                    ? "Request timed out. Please try again."
                    : error?.message || "Failed to send invitation";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }

    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-900 dark:text-zinc-200">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="size-5 text-zinc-900 dark:text-zinc-200" /> {t("team.inviteMember")}
                    </h2>
                    {currentWorkspace && (
                        <p className="text-sm text-zinc-700 dark:text-zinc-400">
                            {t("createProject.inWorkspace")}: <span className="text-blue-600 dark:text-blue-400">{currentWorkspace.name}</span>
                        </p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-200">
                            {t("auth.email")}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
                            <textarea value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="example@email.com, example2@email.com" className="pl-10 mt-1 w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 py-2 focus:outline-none focus:border-blue-500 h-24 resize-none" required />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{t("team.role")}</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 py-2 px-3 mt-1 focus:outline-none focus:border-blue-500 text-sm" >
                            <option value="org:member">{t("invite.member")}</option>
                            <option value="org:admin">{t("invite.admin")}</option>
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        {allowSkip && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    onDone?.();
                                }}
                                className="px-5 py-2 rounded text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                            >
                                Skip
                            </button>
                        )}
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-5 py-2 rounded text-sm border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" >
                            {t("createTask.cancel")}
                        </button>
                        <button type="submit" disabled={isSubmitting || !currentWorkspace} className="px-5 py-2 rounded text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white disabled:opacity-50 hover:opacity-90 transition" >
                            {isSubmitting ? t("invite.sending") : t("invite.sendInvitation")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberDialog;

