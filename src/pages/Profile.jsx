import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:3000/api/users";

const isImageUrl = (value = "") =>
    /^(https?:\/\/|data:image\/|\/)/i.test(value);

const Profile = () => {
    const [currentUser, setCurrentUser] = useState(
        () => JSON.parse(localStorage.getItem("user") || "{}")
    );

    const [form, setForm] = useState({
        firstName: currentUser?.firstName || "",
        lastName: currentUser?.lastName || "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [savingInfo, setSavingInfo] = useState(false);
    const [savingImage, setSavingImage] = useState(false);

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
            toast.error("First and last name are required");
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
            if (!response.ok) throw new Error(data?.message || "Failed to update profile");

            persistUser(data?.data || currentUser);
            toast.success("Profile details updated");
        } catch (error) {
            toast.error(error.message || "Unable to update details");
        } finally {
            setSavingInfo(false);
        }
    };

    const handleSaveImage = async () => {
        if (!selectedFile) {
            toast.error("Select an image first");
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
            if (!response.ok) throw new Error(data?.message || "Failed to update image");

            persistUser(data?.data || currentUser);
            setSelectedFile(null);
            toast.success("Profile image updated");
        } catch (error) {
            toast.error(error.message || "Unable to update image");
        } finally {
            setSavingImage(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Profile</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage your account details and image.</p>

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
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-zinc-700 dark:text-zinc-300"
                        />
                        <button
                            type="button"
                            onClick={handleSaveImage}
                            disabled={savingImage || !selectedFile}
                            className="mt-2 px-4 py-2 text-sm rounded bg-zinc-900 text-white disabled:opacity-60"
                        >
                            {savingImage ? "Uploading..." : "Update Image"}
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSaveInfo} className="mt-6 grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">First Name</label>
                        <input
                            name="firstName"
                            value={form.firstName}
                            onChange={handleInfoChange}
                            className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-white dark:bg-zinc-950"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Last Name</label>
                        <input
                            name="lastName"
                            value={form.lastName}
                            onChange={handleInfoChange}
                            className="w-full border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-white dark:bg-zinc-950"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">Email</label>
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
                            {savingInfo ? "Saving..." : "Save Details"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
