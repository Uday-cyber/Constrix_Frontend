import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { WORKSPACE_API_BASE } from "../utils/api";

const getWorkspaceId = (workspace) => workspace?._id || workspace?.id;

export const fetchMyWorkspaces = createAsyncThunk(
    "workspace/fetchMyWorkspaces",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return [];
            const response = await fetch(WORKSPACE_API_BASE, {
                method: "GET",
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data?.message || "Failed to fetch workspaces");

            return data?.data?.workspaces || [];
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to fetch workspaces");
        }
    }
);

export const createWorkspaceApi = createAsyncThunk(
    "workspace/createWorkspaceApi",
    async (payload, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("accessToken");
            const isFormData = payload instanceof FormData;
            const response = await fetch(WORKSPACE_API_BASE, {
                method: "POST",
                credentials: "include",
                headers: {
                    ...(isFormData ? {} : { "Content-Type": "application/json" }),
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: isFormData ? payload : JSON.stringify(payload),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data?.message || "Failed to create workspace");

            return data?.data?.workspace || null;
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to create workspace");
        }
    }
);

export const fetchWorkspaceMembers = createAsyncThunk(
    "workspace/fetchWorkspaceMembers",
    async (workspaceId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await fetch(`${WORKSPACE_API_BASE}/${workspaceId}/members`, {
                method: "GET",
                credentials: "include",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) return rejectWithValue(data?.message || "Failed to fetch members");

            return {
                workspaceId,
                members: data?.data?.members || [],
            };
        } catch (error) {
            return rejectWithValue(error?.message || "Failed to fetch members");
        }
    }
);

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    loading: false,
    error: null,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action) => {
            const selectedId = action.payload;
            if (!selectedId) return;

            localStorage.setItem("currentWorkspaceId", selectedId);
            state.currentWorkspace =
                state.workspaces.find((w) => getWorkspaceId(w) === selectedId) || null;
        },
        addProject: (state, action) => {
            if (!state.currentWorkspace) return;

            const projects = state.currentWorkspace.projects || [];
            state.currentWorkspace.projects = projects.concat(action.payload);

            state.workspaces = state.workspaces.map((w) =>
                getWorkspaceId(w) === getWorkspaceId(state.currentWorkspace)
                    ? { ...w, projects: (w.projects || []).concat(action.payload) }
                    : w
            );
        },
        addTask: (state, action) => {
            if (!state.currentWorkspace?.projects) return;
            const { projectId } = action.payload;

            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
                String(p.id || p._id) === String(projectId)
                    ? { ...p, tasks: [...(p.tasks || []), action.payload] }
                    : p
            );
        },
        updateTask: (state, action) => {
            if (!state.currentWorkspace?.projects) return;
            const { projectId } = action.payload;

            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
                String(p.id || p._id) === String(projectId)
                    ? {
                        ...p,
                        tasks: (p.tasks || []).map((t) =>
                            String(t.id || t._id) === String(action.payload.id || action.payload._id)
                                ? action.payload
                                : t
                        ),
                    }
                    : p
            );
        },
        deleteTask: (state, action) => {
            if (!state.currentWorkspace?.projects) return;

            const taskIds = Array.isArray(action.payload) ? action.payload : [action.payload];
            state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => ({
                ...p,
                tasks: (p.tasks || []).filter(
                    (t) => !taskIds.includes(String(t.id || t._id))
                ),
            }));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyWorkspaces.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyWorkspaces.fulfilled, (state, action) => {
                state.loading = false;
                state.workspaces = action.payload || [];

                const storedId = localStorage.getItem("currentWorkspaceId");
                const selected =
                    state.workspaces.find((w) => getWorkspaceId(w) === storedId) ||
                    state.workspaces[0] ||
                    null;

                state.currentWorkspace = selected;
            })
            .addCase(fetchMyWorkspaces.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to fetch workspaces";
            })
            .addCase(createWorkspaceApi.fulfilled, (state, action) => {
                const workspace = action.payload;
                if (!workspace) return;

                const normalizedWorkspace = {
                    ...workspace,
                    memberCount: workspace.memberCount ?? 1,
                };

                state.workspaces.push(normalizedWorkspace);
                state.currentWorkspace = normalizedWorkspace;
                localStorage.setItem("currentWorkspaceId", getWorkspaceId(workspace));
            })
            .addCase(fetchWorkspaceMembers.fulfilled, (state, action) => {
                const { workspaceId, members } = action.payload;
                state.workspaces = state.workspaces.map((w) =>
                    getWorkspaceId(w) === workspaceId
                        ? { ...w, members, memberCount: members.length }
                        : w
                );

                if (getWorkspaceId(state.currentWorkspace) === workspaceId) {
                    state.currentWorkspace = {
                        ...state.currentWorkspace,
                        members,
                        memberCount: members.length,
                    };
                }
            });
    },
});

export const { setCurrentWorkspace, addProject, addTask, updateTask, deleteTask } = workspaceSlice.actions;
export default workspaceSlice.reducer;
