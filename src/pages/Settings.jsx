import { useLanguage } from "../context/LanguageContext";

const Settings = () => {
    const { t } = useLanguage();

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{t("settings.title")}</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{t("settings.subtitle")}</p>

            <div className="mt-6 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    {t("settings.placeholder")}
                </p>
            </div>
        </div>
    );
};

export default Settings;
