import { useState } from "react";
import { api } from "../api";

const LoginPage = ({onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/login", { email, password });
      // console.log(data);
      if (data.token) {
        onLogin(data.user, data.token);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch {
      setError("Connection error. Is Laravel running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <style>{`
        .login-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .login-card {
          border-radius: 16px;
          border: none;
        }
        .login-icon-box {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-primary-custom {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          border-radius: 8px;
        }
        .btn-primary-custom:hover { opacity: 0.9; }
        .input-group-text { background: #f8f9fa; border-right: none; }
        .form-control { border-left: none; }
        .form-control:focus { box-shadow: none; border-color: #dee2e6; }
      `}</style>

      <div className="login-bg d-flex align-items-center justify-content-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-sm-10 col-md-6 col-lg-4">

                  {/* Header */}
              <div className="card shadow-lg login-card">
                <div className="card-body p-5">

                  <div className="text-center mb-4">
                    <div className="login-icon-box mb-3">
                      <i className="bi bi-lightning-charge-fill text-white fs-3"></i>
                    </div>
                    <h2 className="fw-bold mb-1">TaskFlow</h2>
                  {/* Alert */}
                    <p className="text-muted small mb-0">Sign in to manage your projects</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger alert-dismissible d-flex align-items-center py-2 small" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2 flex-shrink-0"></i>
                      <div>{error}</div>
                  {/* Form */}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small text-secondary">Email Address</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-envelope text-muted"></i>
                        </span>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="admin@test.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold small text-secondary">Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock text-muted"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary-custom text-white w-100 py-2 fw-semibold"
                      disabled={loading}
                    >
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
                      ) : (
                        <><i className="bi bi-box-arrow-in-right me-2"></i>Sign In</>
                      )}
                  {/* Credentials hint */}
                    </button>
                  </form>

                  <div className="mt-4 p-3 rounded-3 bg-light border">
                    <p className="fw-semibold small text-muted mb-2">
                      <i className="bi bi-person-badge me-1"></i> Test Credentials
                    </p>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-warning text-dark">Admin</span>
                      <span className="small text-muted">admin@test.com / password</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary">User</span>
                      <span className="small text-muted">user@test.com / password</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage