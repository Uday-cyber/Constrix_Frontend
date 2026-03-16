import { useEffect, useMemo, useState } from "react";
import { Building2, ImagePlus, Upload, X } from "lucide-react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { createWorkspaceApi } from "../features/workspaceSlice";

const slugify = (value = "") =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const CreateWorkspaceDialog = ({ open, onClose, onCreated }) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        slug: "",
        image_url: "",
        workspaceImage: null,
        description: "",
    });
    const [previewUrl, setPreviewUrl] = useState("");

    const computedSlug = useMemo(
        () => (form.slug?.trim() ? slugify(form.slug) : slugify(form.name)),
        [form.slug, form.name]
    );

    const handleClose = () => {
        if (isSubmitting) return;
        onClose?.();
    };

    useEffect(() => {
        if (!form.workspaceImage) {
            setPreviewUrl("");
            return;
        }
        const url = URL.createObjectURL(form.workspaceImage);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [form.workspaceImage]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error("Workspace name is required");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = new FormData();
            payload.append("name", form.name.trim());
            payload.append("slug", computedSlug);
            payload.append("description", form.description?.trim() || "");
            if (form.workspaceImage) {
                payload.append("workspaceImage", form.workspaceImage);
            } else if (form.image_url?.trim()) {
                payload.append("image_url", form.image_url.trim());
            }

            const result = await dispatch(createWorkspaceApi(payload));
            if (!createWorkspaceApi.fulfilled.match(result)) {
                throw new Error(result.payload || "Failed to create workspace");
            }

            toast.success("Workspace created");
            const workspace = result.payload;
            onCreated?.(workspace);
            onClose?.();
            setForm({ name: "", slug: "", image_url: "", workspaceImage: null, description: "" });
        } catch (error) {
            toast.error(error?.message || "Failed to create workspace");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Create Workspace</h2>
                    <button onClick={handleClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900">
                        <X className="size-5 text-zinc-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-2">Workspace Icon</p>
                        <div className="flex items-center gap-3">
                            <div className="size-14 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden">
                                {previewUrl || form.image_url ? (
                                    <img src={previewUrl || form.image_url} alt="Workspace Icon" className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="size-7 text-zinc-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                                    <ImagePlus className="size-4" />
                                    Upload icon from computer
                                </label>
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/70">
                                    <Upload className="size-4" />
                                    Choose image
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                workspaceImage: e.target.files?.[0] || null,
                                            }))
                                        }
                                    />
                                </label>
                                <p className="text-[11px] text-zinc-500 mt-1">Optional. Max recommended 10MB.</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Name</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Organization name"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Slug</label>
                        <input
                            value={form.slug}
                            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                            placeholder={computedSlug || "my-org"}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:border-blue-500"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Final slug: {computedSlug || "-"}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Optional"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:border-blue-500 h-20"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {isSubmitting ? "Creating..." : "Create Workspace"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWorkspaceDialog;
