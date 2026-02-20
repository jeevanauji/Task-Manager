import { useState, useEffect } from "react";
import LoginPage from "./pages/Loginpage";
import Projectspage from "./pages/Projectspage";
import Projectdetailpage from "./pages/Projectdetailpage";
import MyTasksPage from "./pages/MyTasksPage";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentPage("home");
  };

  const navigateTo = (page, projectId = null) => {
    setCurrentPage(page);
    if (projectId) setSelectedProjectId(projectId);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  // 👤 Regular users see only their assigned tasks
  if (user.role !== "admin") {
    return <MyTasksPage token={token} user={user} onLogout={handleLogout} />;
  }

  // 👑 Admin - project detail
  if (currentPage === "project-detail" && selectedProjectId) {
    return (
      <Projectdetailpage
        projectId={selectedProjectId}
        token={token}
        user={user}
        onBack={() => navigateTo("projects")}
        onLogout={handleLogout}
      />
    );
  }

  // 👑 Admin - projects list
  return (
    <Projectspage
      token={token}
      user={user}
      onLogout={handleLogout}
      onSelectProject={(id) => navigateTo("project-detail", id)}
    />
  );
}

export default App
