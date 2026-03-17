import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus, Building2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import InviteMemberDialog from "./InviteMemberDialog";

function WorkspaceDropdown() {
    const { t } = useLanguage();

    const { workspaces } = useSelector((state) => state.workspace);
    const currentWorkspace = useSelector((state) => state.workspace?.currentWorkspace || null);
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [workspaceForInvite, setWorkspaceForInvite] = useState(null);
    const dropdownRef = useRef(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (organizationId) => {
        dispatch(setCurrentWorkspace(organizationId))
        setIsOpen(false);
        navigate('/app')
    }

    const renderWorkspaceIcon = (workspace, sizeClass = "size-8") => {
        if (workspace?.image_url) {
            return <img src={workspace.image_url} alt={workspace?.name || "Workspace"} className={`${sizeClass} rounded-full object-cover`} />;
        }
        return (
            <div className={`${sizeClass} rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center`}>
                <Building2 className="size-4" />
            </div>
        );
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                <div className="flex items-center gap-3">
                    {renderWorkspaceIcon(currentWorkspace, "w-8 h-8")}
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                            {currentWorkspace?.name || t("workspace.selectWorkspace")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                            {workspaces.length} {workspaces.length !== 1 ? t("workspace.workspaces") : t("workspace.workspace")}
                        </p>
                    </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-400 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-lg top-full left-0">
                    <div className="p-2">
                        <p className="text-xs text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2 px-2">
                            {t("workspace.workspaces")}
                        </p>
                        {workspaces.map((ws) => (
                            <div key={ws._id || ws.id} onClick={() => onSelectWorkspace(ws._id || ws.id)} className="flex items-center gap-3 p-2 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-zinc-800" >
                                {renderWorkspaceIcon(ws, "w-6 h-6")}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                        {ws.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">
                                        {(ws.memberCount ?? (ws.members || []).length ?? 0)} {t("workspace.members")}
                                    </p>
                                </div>
                                {(currentWorkspace?._id || currentWorkspace?.id) === (ws._id || ws.id) && (
                                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="border-gray-200 dark:border-zinc-700" />

                    <div onClick={() => { setIsCreateOpen(true); setIsOpen(false); }} className="p-2 cursor-pointer rounded group hover:bg-gray-100 dark:hover:bg-zinc-800" >
                        <p className="flex items-center text-xs gap-2 my-1 w-full text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300">
                            <Plus className="w-4 h-4" /> {t("workspace.createWorkspace")}
                        </p>
                    </div>
                </div>
            )}

            <CreateWorkspaceDialog
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={(workspace) => {
                    setWorkspaceForInvite(workspace);
                    setIsInviteOpen(true);
                }}
            />

            <InviteMemberDialog
                isDialogOpen={isInviteOpen}
                setIsDialogOpen={setIsInviteOpen}
                workspaceOverride={workspaceForInvite}
                allowSkip
                onDone={() => {
                    setWorkspaceForInvite(null);
                    navigate("/app", { replace: true });
                }}
            />
        </div>
    );
}

export default WorkspaceDropdown;
