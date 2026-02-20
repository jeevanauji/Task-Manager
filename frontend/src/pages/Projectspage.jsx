import { useState, useEffect } from "react";
import { api } from "../api";
const Projectspage = ({ token, user, onLogout, onSelectProject }) => {


  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    const data = await api.get("/projects", token);
    setProjects(Array.isArray(data) ? data : data.data || []);
    console.log(projects);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    await api.post("/projects", newProject, token);
    setNewProject({ name: "", description: "" });
    setShowForm(false);
    fetchProjects();
    setCreating(false);
  };

  const cardColors = ["primary", "success", "info", "warning", "danger", "secondary"];


  return (
    <>
      <style>{`
        body { background-color: #f5f6fa; }
        .navbar-brand { font-weight: 700; font-size: 1.3rem; }
        .project-card {
          border: none;
          border-radius: 14px;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.12) !important;
        }
        .project-card .card-top-bar {
          height: 6px;
          border-radius: 14px 14px 0 0;
        }
        .stat-card {
          border: none;
          border-radius: 12px;
          border-left: 4px solid;
        }
        .btn-create {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 8px;
        }
        .btn-create:hover { opacity: 0.9; }
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
                {user.role === "admin" ? "👑" : "👤"} {user.name}
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>Logout
              </button>
            </div>
          </div>
        </nav>
          {/* Page Header */}

        <div className="container-xl py-4">

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="fw-bold mb-1">Projects</h4>
              <p className="text-muted small mb-0">{projects.length} project(s) available</p>
            </div>
            {user.role === "admin" && (
              <button
                className="btn btn-create text-white px-4"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm
                  ? <><i className="bi bi-x-lg me-1"></i>Cancel</>
                  : <><i className="bi bi-plus-lg me-1"></i>New Project</>
                }
              </button>
            )}
          </div>

          <div className="row g-3 mb-4">
            {[
              { label: "Total Projects", value: projects.length, icon: "folder2-open", color: "primary" },
              { label: "Total Tasks", value: projects.reduce((s, p) => s + (p.tasks?.length || 0), 0), icon: "list-check", color: "success" },
              { label: "Your Role", value: user.role === "admin" ? "Admin" : "Member", icon: "person-badge", color: "info" },
            ].map((stat, i) => (
              <div className="col-md-4" key={i}>
                <div className={`card stat-card shadow-sm border-${stat.color}`}>
                  <div className="card-body d-flex align-items-center gap-3 py-3">
                    <div className={`bg-${stat.color} bg-opacity-10 rounded-3 p-3`}>
                      <i className={`bi bi-${stat.icon} text-${stat.color} fs-5`}></i>
                    </div>
                    <div>
                      <div className="fw-bold fs-5">{stat.value}</div>
                      <div className="text-muted small">{stat.label}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-folder-plus me-2 text-primary"></i>Create New Project
                </h6>
                <form onSubmit={handleCreate}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Project Name *</label>
                      <input
                        className="form-control"
                        placeholder="Enter project name"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Description</label>
                      <input
                        className="form-control"
                        placeholder="Short description (optional)"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <button type="submit" className="btn btn-create text-white px-4" disabled={creating}>
                      {creating
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                        : <><i className="bi bi-check-lg me-1"></i>Create Project</>
                      }
                    </button>
                  </div>
                </form>
              </div>
          {/* Projects Grid */}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-folder-x display-1 text-muted"></i>
              <p className="mt-3 text-muted">No projects yet. Create your first one!</p>
            </div>
          ) : (
            <div className="row g-4">
              {projects.map((project, i) => {
                const color = cardColors[i % cardColors.length];
                const taskCount = project.tasks?.length || 0;
                const doneCount = project.tasks?.filter(t => t.status === "DONE").length || 0;
                const overdueCount = project.tasks?.filter(t => t.status === "OVERDUE").length || 0;

                return (
                  <div className="col-md-6 col-lg-4" key={project.id}>
                    <div className="card project-card shadow-sm h-100" onClick={() => onSelectProject(project.id)}>
                      <div className={`card-top-bar bg-${color}`}></div>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className={`bg-${color} bg-opacity-10 rounded-3 p-2`}>
                            <i className={`bi bi-folder2 text-${color} fs-5`}></i>
                          </div>
                          <span className="badge bg-light text-dark border">
                            {taskCount} task{taskCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <h6 className="fw-bold mb-1">{project.name}</h6>
                        <p className="text-muted small mb-3" style={{ minHeight: 36 }}>
                        {/* Mini progress */}
                          {project.description || "No description provided."}
                        </p>

                        {taskCount > 0 && (
                          <div className="mb-3">
                            <div className="d-flex justify-content-between small text-muted mb-1">
                              <span>Progress</span>
                              <span>{Math.round((doneCount / taskCount) * 100)}%</span>
                            </div>
                            <div className="progress" style={{ height: 6 }}>
                              <div
                                className="progress-bar bg-success"
                                style={{ width: `${(doneCount / taskCount) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="d-flex gap-2 flex-wrap">
                          {doneCount > 0 && <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle">{doneCount} Done</span>}
                          {overdueCount > 0 && <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle">{overdueCount} Overdue</span>}
                        </div>
                      </div>
                      <div className="card-footer bg-transparent border-top-0 px-4 pb-3">
                        <span className={`text-${color} small fw-semibold`}>
                          Open Project <i className="bi bi-arrow-right"></i>
                        </span>
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

export default Projectspage