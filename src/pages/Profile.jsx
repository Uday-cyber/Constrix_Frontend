import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const API_BASE = "http://localhost:3000/api/users";

const isImageUrl = (value = "") =>
    /^(https?:\/\/|data:image\/|\/)/i.test(value);

const Profile = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [currentUser, setCurrentUser] = useState(
        () => JSON.parse(localStorage.getItem("user") || "{}")
    );

    const [form, setForm] = useState({
        firstName: currentUser?.firstName || "",
        lastName: currentUser?.lastName || "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [savingInfo, setSavingInfo] = useState(false);
    const [savingImage, setSavingImage] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    const previewImage = useMemo(() => {
        if (selectedFile) return URL.createObjectURL(selectedFile);
        return currentUser?.image || "";
    }, [selectedFile, currentUser?.image]);

    useEffect(() => {
        if (!selectedFile || !previewImage.startsWith("blob:")) return;
        return () => URL.revokeObjectURL(previewImage);
    }, [selectedFile, previewImage]);

    const persistUser = (updatedUser) => {
        setCurrentUser(updatedUser || {});
        localStorage.setItem("user", JSON.stringify(updatedUser || {}));
        window.dispatchEvent(new Event("user-updated"));
    };

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveInfo = async (e) => {
        e.preventDefault();
        if (!form.firstName.trim() || !form.lastName.trim()) {
            toast.error(t("profile.requiredNames"));
            return;
        }

        try {
            setSavingInfo(true);
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${API_BASE}/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: "include",
                body: JSON.stringify({
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data?.message || t("profile.detailsUpdateFail"));

            const updatedUser = data?.data?.user || data?.data || currentUser;
            persistUser(updatedUser);
            toast.success(t("profile.detailsUpdated"));
        } catch (error) {
            toast.error(error.message || t("profile.detailsUpdateFail"));
        } finally {
            setSavingInfo(false);
        }
    };

    const handleSaveImage = async () => {
        if (!selectedFile) {
            toast.error(t("profile.selectImageFirst"));
            return;
        }

        if (!selectedFile.type.startsWith("image/")) {
            toast.error(t("profile.imageOnly"));
            return;
        }

        try {
            setSavingImage(true);
            const token = localStorage.getItem("accessToken");
            const formData = new FormData();
            formData.append("profile", selectedFile);

            const response = await fetch(`${API_BASE}/update-profile`, {
                method: "PATCH",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: "include",
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data?.message || t("profile.imageUpdateFail"));

            const updatedUser = data?.data?.user || data?.data || currentUser;
            persistUser(updatedUser);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            toast.success(t("profile.imageUpdated"));
        } catch (error) {
            toast.error(error.message || t("profile.imageUpdateFail"));
        } finally {
            setSavingImage(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(t("profile.confirmDelete"));
        if (!confirmed) return;

        try {
            setDeletingAccount(true);
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${API_BASE}/delete`, {
                method: "DELETE",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: "include",
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data?.message || "Failed to delete account");

            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("user-updated"));

            toast.success(t("profile.deleteSuccess"));
            navigate("/", { replace: true });
        } catch (error) {
            toast.error(error.message || t("profile.deleteFail"));
        } finally {
            setDeletingAccount(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{t("profile.title")}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{t("profile.subtitle")}</p>

            <div className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900">
                <div className="flex items-center gap-4">
                    {isImageUrl(previewImage) ? (
                        <img src={previewImage} alt="Profile" className="size-16 rounded-full object-cover" />
                    ) : (
                        <div className="size-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
                            {(form.firstName?.[0] || "") + (form.lastName?.[0] || "")}
                        </div>
                    )}
                    <div className="flex-1">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-zinc-700 dark:text-zinc-300"
                        />
                        <button
                            type="button"
                            onClick={handleSaveImage}
                            disabled={savingImage}
                            className="mt-2 px-4 py-2 text-sm rounded bg-zinc-900 text-white disabled:opacity-60"
                        >
                            {savingImage ? t("profile.uploading") : t("profile.updateImage")}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSaveInfo} className="mt-6 grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">{t("auth.firstName")}</label>
                        <input
                            name="firstName"
                            value={form.firstName}
                            onChange={handleInfoChange}
                            className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-white dark:bg-zinc-950"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">{t("auth.lastName")}</label>
                        <input
                            name="lastName"
                            value={form.lastName}
                            onChange={handleInfoChange}
                            className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-white dark:bg-zinc-950"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">{t("auth.email")}</label>
                        <input
                            value={currentUser?.email || ""}
                            disabled
                            className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            disabled={savingInfo}
                            className="px-5 py-2 text-sm rounded bg-zinc-900 text-white disabled:opacity-60"
                        >
                            {savingInfo ? t("profile.saving") : t("profile.saveDetails")}
                        </button>
                    </div>
                </form>

                <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-5">
                    {/* <p className="text-sm font-medium text-red-600 dark:text-red-400">Danger Zone</p> */}
                    <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount}
                        className="mt-3 px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                        {deletingAccount ? t("profile.deleting") : t("profile.deleteAccount")}
                    </button>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        {t("profile.dangerText")}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
