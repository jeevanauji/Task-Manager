import { useState, useEffect } from "react";
import { api } from "../api";

const STATUS_CONFIG = {
  TODO:    { badge: "secondary", icon: "circle",                    label: "To Do"      },
  WIP:     { badge: "primary",   icon: "arrow-repeat",              label: "In Progress"},
  DONE:    { badge: "success",   icon: "check-circle-fill",         label: "Done"       },
  OVERDUE: { badge: "danger",    icon: "exclamation-triangle-fill", label: "Overdue"    },
};

const PRIORITY_CONFIG = {
  LOW:    { badge: "success", icon: "arrow-down"  },
  MEDIUM: { badge: "warning", icon: "dash"        },
  HIGH:   { badge: "danger",  icon: "arrow-up"    },
};

const Projectdetailpage = ({ projectId, token, user, onBack, onLogout }) => {

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("board");
  const [newTask, setNewTask] = useState({
    title: "", description: "", priority: "MEDIUM", due_date: "", assigned_to: "",
  });

  const fetchProject = async () => {
    setLoading(true);
    const data = await api.get(`/projects/${projectId}`, token);
    setProject(data.data || data);
    setLoading(false);
  };

  useEffect(() => { fetchProject(); }, [projectId]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    await api.post("/tasks", { ...newTask, project_id: projectId }, token);
    setNewTask({ title: "", description: "", priority: "MEDIUM", due_date: "", assigned_to: "" });
    setShowForm(false);
    fetchProject();
    setCreating(false);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await api.put(`/tasks/${taskId}`, { status: newStatus }, token);
    fetchProject();
  };

  const getAvailableStatuses = (task) => {
    if (task.status === "OVERDUE") {
      return user.role === "admin" ? ["OVERDUE", "DONE"] : ["OVERDUE"];
    }
    return ["TODO", "WIP", "DONE"];
  };

  if (loading) return (
    <>
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    </>
  );

  const tasks = project?.tasks || [];
  const grouped = {
    TODO:    tasks.filter(t => t.status === "TODO"),
    WIP:     tasks.filter(t => t.status === "WIP"),
    DONE:    tasks.filter(t => t.status === "DONE"),
    OVERDUE: tasks.filter(t => t.status === "OVERDUE"),
  };

  return (
    <>
      <style>{`
        body { background: #f5f6fa; }
        .navbar-brand { font-weight: 700; }
        .task-card { border: none; border-radius: 10px; transition: transform 0.15s, box-shadow 0.15s; border-left: 4px solid transparent; }
        .task-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.1) !important; }
        .task-card.TODO    { border-left-color: #6c757d; }
        .task-card.WIP     { border-left-color: #0d6efd; }
        .task-card.DONE    { border-left-color: #198754; }
        .task-card.OVERDUE { border-left-color: #dc3545; }
        .kanban-col { background: #ebebf0; border-radius: 14px; min-height: 300px; }
        .kanban-col-header { border-radius: 14px 14px 0 0; }
        .btn-create { background: linear-gradient(135deg, #667eea, #764ba2); border: none; border-radius: 8px; }
        .btn-create:hover { opacity: 0.9; }
        .nav-tabs .nav-link.active { font-weight: 600; border-bottom: 3px solid #667eea; color: #667eea; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f6fa" }}>
        <nav className="navbar navbar-expand-lg navbar-dark shadow-sm" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
          <div className="container-xl">
            <span className="navbar-brand"><i className="bi bi-lightning-charge-fill me-2"></i>TaskFlow</span>
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-outline-light btn-sm" onClick={onBack}>
                <i className="bi bi-arrow-left me-1"></i>Projects
              </button>
              <span className="badge bg-white text-dark px-3 py-2">👑 {user.name}</span>
              <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>Logout
              </button>
            </div>
          </div>
          {/* Project Header */}
        </nav>

        <div className="container-xl py-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="bi bi-folder2-open text-primary fs-5"></i>
                    <h4 className="fw-bold mb-0">{project?.name}</h4>
                  </div>
                  <p className="text-muted mb-0">{project?.description || "No description."}</p>
                </div>
                <button className="btn btn-create text-white px-4" onClick={() => setShowForm(!showForm)}>
                  {showForm ? <><i className="bi bi-x-lg me-1"></i>Cancel</> : <><i className="bi bi-plus-lg me-1"></i>Add Task</>}
                </button>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3">
                {Object.entries(grouped).map(([status, list]) => (
                  <span key={status} className={`badge bg-${STATUS_CONFIG[status].badge} bg-opacity-10 text-${STATUS_CONFIG[status].badge} border border-${STATUS_CONFIG[status].badge}-subtle px-3 py-2`}>
                    <i className={`bi bi-${STATUS_CONFIG[status].icon} me-1`}></i>
                    {list.length} {STATUS_CONFIG[status].label}
                  </span>
                ))}
              </div>
          {/* Create Task Form */}
            </div>
          </div>

          {showForm && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3"><i className="bi bi-plus-square me-2 text-primary"></i>New Task</h6>
                <form onSubmit={handleCreateTask}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Title *</label>
                      <input className="form-control" placeholder="Task title" value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Assign to (User ID) *</label>
                      <input type="number" className="form-control" placeholder="User ID" value={newTask.assigned_to}
                        onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Priority</label>
                      <select className="form-select" value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                        <option value="LOW">🟢 Low</option>
                        <option value="MEDIUM">🟡 Medium</option>
                        <option value="HIGH">🔴 High</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Due Date *</label>
                      <input type="date" className="form-control" value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description</label>
                      <textarea className="form-control" rows={2} placeholder="Optional..." value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <button type="submit" className="btn btn-create text-white px-4" disabled={creating}>
                      {creating ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</> : <><i className="bi bi-check-lg me-1"></i>Create Task</>}
                    </button>
                  </div>
                </form>
              </div>
          {/* Tabs */}
            </div>
          )}

          <ul className="nav nav-tabs border-0 mb-3">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "board" ? "active" : "text-muted"}`} onClick={() => setActiveTab("board")}>
                <i className="bi bi-kanban me-1"></i>Board View
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === "list" ? "active" : "text-muted"}`} onClick={() => setActiveTab("list")}>
                <i className="bi bi-list-ul me-1"></i>List View
              </button>
            </li>
          </ul>

          {tasks.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="mt-3 text-muted">No tasks yet. Add one!</p>
            </div>
          ) : activeTab === "board" ? (
            <div className="row g-3">
              {Object.entries(grouped).map(([status, taskList]) => {
                const cfg = STATUS_CONFIG[status];
                return (
                  <div className="col-md-6 col-xl-3" key={status}>
                    <div className="kanban-col">
                      <div className={`kanban-col-header p-3 bg-${cfg.badge} bg-opacity-10 d-flex justify-content-between align-items-center`}>
                        <span className={`fw-semibold text-${cfg.badge} small`}>
                          <i className={`bi bi-${cfg.icon} me-2`}></i>{cfg.label}
                        </span>
                        <span className={`badge bg-${cfg.badge} rounded-pill`}>{taskList.length}</span>
                      </div>
                      <div className="p-2 d-flex flex-column gap-2">
                        {taskList.length === 0 && <p className="text-center text-muted small py-3 mb-0">No tasks</p>}
                        {taskList.map((task) => (
                          <div key={task.id} className={`card shadow-sm task-card ${task.status}`}>
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <p className="fw-semibold small mb-0 me-2">{task.title}</p>
                                <span className={`badge bg-${PRIORITY_CONFIG[task.priority].badge} flex-shrink-0`}>
                                  <i className={`bi bi-${PRIORITY_CONFIG[task.priority].icon}`}></i>
                                </span>
                              </div>
                              {task.description && <p className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>{task.description}</p>}
                              <div className="mb-2">
                                <span className="small text-muted me-2"><i className="bi bi-person me-1"></i>User #{task.assigned_to}</span>
                                <span className="small text-muted"><i className="bi bi-calendar me-1"></i>{task.due_date}</span>
                              </div>
                              <select className="form-select form-select-sm" value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}>
                                {getAvailableStatuses(task).map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Title</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assigned To</th>
                      <th>Due Date</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => {
                      const sc = STATUS_CONFIG[task.status];
                      const pc = PRIORITY_CONFIG[task.priority];
                      return (
                        <tr key={task.id}>
                          <td className="ps-4">
                            <div className="fw-semibold small">{task.title}</div>
                            {task.description && <div className="text-muted" style={{ fontSize: "0.75rem" }}>{task.description}</div>}
                          </td>
                          <td><span className={`badge bg-${sc.badge} bg-opacity-15 text-${sc.badge} border border-${sc.badge}-subtle`}>{task.status}</span></td>
                          <td><span className={`badge bg-${pc.badge}`}>{task.priority}</span></td>
                          <td><span className="small text-muted">User #{task.assigned_to}</span></td>
                          <td><span className="small">{task.due_date}</span></td>
                          <td>
                            <select className="form-select form-select-sm" style={{ width: 130 }} value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}>
                              {getAvailableStatuses(task).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Projectdetailpage