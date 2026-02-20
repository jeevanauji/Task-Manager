import { useState, useEffect } from "react";
import { api } from "../api";

const STATUS_CONFIG = {
    TODO: { badge: "secondary", icon: "circle", label: "To Do" },
    WIP: { badge: "primary", icon: "arrow-repeat", label: "In Progress" },
    DONE: { badge: "success", icon: "check-circle-fill", label: "Done" },
    OVERDUE: { badge: "danger", icon: "exclamation-triangle-fill", label: "Overdue" },
};

const PRIORITY_CONFIG = {
    LOW: { badge: "success", icon: "arrow-down-circle", label: "Low" },
    MEDIUM: { badge: "warning", icon: "dash-circle", label: "Medium" },
    HIGH: { badge: "danger", icon: "arrow-up-circle", label: "High" },
};

const MyTasksPage = ({ token, user, onLogout }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [updating, setUpdating] = useState(null); // track which task is updating

    const fetchTasks = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await api.get("/my-tasks", token);
            // handle both array and {data: [...]} formats
            setTasks(Array.isArray(data) ? data : data.data || []);
        } catch {
            setError("Failed to load tasks. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleStatusChange = async (taskId, newStatus) => {
        setUpdating(taskId);
        try {
            const res = await api.put(`/tasks/${taskId}`, { status: newStatus }, token);
            if (res.message && res.message.toLowerCase().includes("overdue")) {
                alert(res.message);
            }
            await fetchTasks();
        } catch {
            alert("Failed to update task status.");
        } finally {
            setUpdating(null);
        }
    };

    const getAvailableStatuses = (task) => {
        if (task.status === "OVERDUE") return ["OVERDUE"]; // user cannot close overdue
        if (task.status === "DONE") return ["DONE"]; // cannot go back from DONE
        if (task.status === "WIP") return ["WIP", "DONE"]; // can only move forward to DONE
        if (task.status === "TODO") return ["TODO", "WIP", "DONE"]; // can move to WIP or DONE
        return ["TODO", "WIP", "DONE"]; // default fallback
    };

    const filteredTasks = filterStatus === "ALL"
        ? tasks
        : tasks.filter(t => t.status === filterStatus);

    const counts = {
        ALL: tasks.length,
        TODO: tasks.filter(t => t.status === "TODO").length,
        WIP: tasks.filter(t => t.status === "WIP").length,
        DONE: tasks.filter(t => t.status === "DONE").length,
        OVERDUE: tasks.filter(t => t.status === "OVERDUE").length,
    };
    return (
        <>
            <style>{`
        body { background: #f5f6fa; }
        .task-card {
          border: none;
          border-radius: 12px;
          border-left: 5px solid transparent;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .task-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1) !important; }
        .task-card.TODO    { border-left-color: #6c757d; }
        .task-card.WIP     { border-left-color: #0d6efd; }
        .task-card.DONE    { border-left-color: #198754; }
        .task-card.OVERDUE { border-left-color: #dc3545; background: #fff9f9; }
        .filter-btn { border-radius: 20px; font-size: 0.8rem; }
        .filter-btn.active { font-weight: 600; }
        .stat-card { border: none; border-radius: 12px; border-left: 4px solid; }
        .navbar-brand { font-weight: 700; }
        .due-soon { color: #fd7e14; font-weight: 600; }
        .due-overdue { color: #dc3545; font-weight: 600; }
      `}</style>
                {/* Navbar */}

            <div style={{ minHeight: "100vh", background: "#f5f6fa" }}>

                <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                    <div className="container-xl">
                        <span className="navbar-brand">
                            <i className="bi bi-lightning-charge-fill me-2"></i>TaskFlow
                        </span>
                        <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-white text-dark px-3 py-2">
                                <i className="bi bi-person-circle me-1"></i>{user.name}
                            </span>
                            <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
                                <i className="bi bi-box-arrow-right me-1"></i>Logout
                            </button>
                        </div>
                    </div>
                </nav>
                    {/* Welcome Header */}

                <div className="container-xl py-4">

                    <div className="mb-4">
                        <h4 className="fw-bold mb-1">
                            Welcome back, {user.name}! 👋
                        </h4>
                    {/* Stat Cards */}
                        <p className="text-muted mb-0">Here are all your assigned tasks</p>
                    </div>

                    <div className="row g-3 mb-4">
                        {[
                            { key: "ALL", label: "Total Tasks", color: "dark", icon: "list-check" },
                            { key: "TODO", label: "To Do", color: "secondary", icon: "circle" },
                            { key: "WIP", label: "In Progress", color: "primary", icon: "arrow-repeat" },
                            { key: "DONE", label: "Completed", color: "success", icon: "check-circle-fill" },
                            { key: "OVERDUE", label: "Overdue", color: "danger", icon: "exclamation-triangle-fill" },
                        ].map(stat => (
                            <div className="col-6 col-md-4 col-lg" key={stat.key}>
                                <div
                                    className={`card stat-card shadow-sm border-${stat.color} h-100`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setFilterStatus(stat.key)}
                                >
                                    <div className="card-body py-3 px-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className={`bg-${stat.color} bg-opacity-10 rounded-3 p-2`}>
                                                <i className={`bi bi-${stat.icon} text-${stat.color}`}></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold fs-5">{counts[stat.key]}</div>
                                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>{stat.label}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    {/* Filter Tabs */}
                    </div>

                    <div className="d-flex gap-2 flex-wrap mb-4">
                        {["ALL", "TODO", "WIP", "DONE", "OVERDUE"].map(s => {
                            const cfg = s === "ALL"
                                ? { badge: "dark", label: "All Tasks" }
                                : STATUS_CONFIG[s];
                            return (
                                <button
                                    key={s}
                                    className={`btn btn-sm filter-btn ${filterStatus === s ? `btn-${cfg.badge} active` : `btn-outline-${cfg.badge}`}`}
                                    onClick={() => setFilterStatus(s)}
                                >
                                    {s === "ALL" ? "All Tasks" : cfg.label}
                                    <span className={`badge ms-2 ${filterStatus === s ? "bg-white text-dark" : `bg-${cfg.badge} bg-opacity-20 text-${cfg.badge}`}`}>
                                        {counts[s]}
                                    </span>
                                </button>
                            );
                        })}
                        <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={fetchTasks}>
                            <i className="bi bi-arrow-clockwise"></i> Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-danger d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                    {/* Loading */}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-3 text-muted">Loading your tasks...</p>
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox display-1 text-muted"></i>
                            <p className="mt-3 text-muted fw-semibold">
                                {filterStatus === "ALL" ? "No tasks assigned to you yet." : `No ${filterStatus} tasks.`}
                            </p>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {filteredTasks.map((task) => {
                                const sc = STATUS_CONFIG[task.status];
                                const pc = PRIORITY_CONFIG[task.priority];
                                const today = new Date();
                                const due = new Date(task.due_date);
                                const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                                const isUpdating = updating === task.id;

                                return (
                                    <div className="col-md-6 col-xl-4" key={task.id}>
                                                {/* Top row: status + priority */}
                                        <div className={`card shadow-sm task-card ${task.status} h-100`}>
                                            <div className="card-body p-4">

                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <span className={`badge bg-${sc.badge} bg-opacity-15 text-${sc.badge} border border-${sc.badge}-subtle px-2 py-1`}>
                                                        <i className={`bi bi-${sc.icon} me-1`}></i>{sc.label}
                                                    </span>
                                                    <span className={`badge bg-${pc.badge}`}>
                                                        <i className={`bi bi-${pc.icon} me-1`}></i>{pc.label}
                                                {/* Title */}
                                                    </span>
                                                </div>
                                                {/* Description */}

                                                <h6 className="fw-bold mb-2">{task.title}</h6>

                                                {task.description && (
                                                    <p className="text-muted small mb-3" style={{ lineHeight: 1.5 }}>
                                                        {task.description}
                                                {/* Project */}
                                                    </p>
                                                )}

                                                {task.project && (
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <i className="bi bi-folder2 text-muted small"></i>
                                                        <span className="small text-muted">{task.project.name}</span>
                                                {/* Due date */}
                                                    </div>
                                                )}

                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <i className="bi bi-calendar-event text-muted small"></i>
                                                    <span className={`small ${task.status === "OVERDUE" ? "due-overdue"
                                                        : daysLeft <= 2 ? "due-soon"
                                                            : "text-muted"
                                                        }`}>
                                                        Due: {task.due_date}
                                                        {task.status !== "DONE" && task.status !== "OVERDUE" && daysLeft >= 0 && (
                                                            <span className="ms-1">
                                                                ({daysLeft === 0 ? "Today!" : `${daysLeft}d left`})
                                                            </span>
                                                        )}
                                                        {task.status === "OVERDUE" && (
                                                            <span className="ms-1">(Overdue)</span>
                                                        )}
                                                {/* Overdue notice */}
                                                    </span>
                                                </div>

                                                {task.status === "OVERDUE" && (
                                                    <div className="alert alert-danger py-2 px-3 small mb-3">
                                                        <i className="bi bi-lock-fill me-1"></i>
                                                        Only an Admin can close this task.
                                                {/* Status update dropdown — disabled for overdue */}
                                                    </div>
                                                )}

                                                {task.status !== "OVERDUE" && (
                                                    <div>
                                                        <label className="form-label small text-muted mb-1">Update Status</label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={task.status}
                                                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                            disabled={isUpdating}
                                                        >
                                                            {getAvailableStatuses(task).map(s => (
                                                                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                                                            ))}
                                                        </select>
                                                        {isUpdating && (
                                                            <div className="mt-1 small text-muted">
                                                                <span className="spinner-border spinner-border-sm me-1"></span>Updating...
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}

export default MyTasksPage