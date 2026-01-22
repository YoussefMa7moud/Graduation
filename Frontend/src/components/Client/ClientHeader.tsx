import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface User {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  role?: string[];
  email?: string;
}

const ClientHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth() as { logout: () => Promise<void>; user: User | null };
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mainColor = "#0f172a";

  // --- DEBUGGING LOG ---
  // Open your browser console (F12) to see what is actually inside the user object
  useEffect(() => {
    console.log("DEBUG: Current User Object:", user);
  }, [user]);

  // --- LOGIC ---
  const isCompany = user?.role?.includes("COMPANY");

  // Robust check: try to find any name possible before falling back to "Client"
  const displayName = isCompany 
    ? (user?.companyName || "Company Account") 
    : (user?.firstName || user?.lastName 
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() 
        : (user?.email || "Client")); // If names are missing, show email, else show "Client"

  const initials = isCompany
    ? (user?.companyName?.substring(0, 2) || "CP").toUpperCase()
    : ((user?.firstName?.charAt(0) || "") + (user?.lastName?.charAt(0) || "") || user?.email?.charAt(0) || "CL").toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/auth");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000, width: "100%", height: "72px", backgroundColor: mainColor, borderBottom: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "200px" }}>
          <div style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", padding: "8px", borderRadius: "8px", color: "#ffffff", display: "flex", alignItems: "center" }}>
            <i className="bi bi-briefcase fs-5"></i>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>LexGuard AI</h1>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Client Dashboard</div>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "30px" }}>
          {[
            { name: "Browse Companies", path: "/BrowseCompanies" },
            { name: "My Proposals", path: "/proposals" },
            { name: "My Projects", path: "/OngoingProjects" },
            { name: "My Contracts", path: "/SignedProjects" },
          ].map((item) => (
            <Link key={item.name} to={item.path} style={{ textDecoration: "none", color: "#ffffff", fontSize: "14px", fontWeight: isActive(item.path) ? 700 : 500, opacity: isActive(item.path) ? 1 : 0.7, position: "relative", padding: "8px 0" }}>
              {item.name}
              {isActive(item.path) && <div style={{ position: "absolute", bottom: "0", left: 0, width: "100%", height: "2px", backgroundColor: "#ffffff", borderRadius: "2px" }} />}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "20px", minWidth: "200px", justifyContent: "flex-end" }} ref={dropdownRef}>
          <div onClick={() => setDropdownOpen(!dropdownOpen)} style={{ height: "40px", padding: "0 12px", borderRadius: "20px", backgroundColor: "#ffffff", color: mainColor, display: "flex", alignItems: "center", gap: "10px", fontWeight: 700, fontSize: "13px", cursor: "pointer", position: "relative" }}>
            <div style={{ backgroundColor: mainColor, color: "#fff", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>
              {initials}
            </div>
            <span>{displayName}</span>
            <i className={`bi bi-chevron-${dropdownOpen ? "up" : "down"}`} style={{ fontSize: "12px" }}></i>

            {dropdownOpen && (
              <div style={{ position: "absolute", top: "48px", right: 0, backgroundColor: "#ffffff", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", minWidth: "180px", overflow: "hidden", border: "1px solid #e2e8f0", zIndex: 1001 }}>
                <div onClick={() => navigate("/settings")} style={{ padding: "12px 16px", color: "#1e293b", fontSize: "14px", cursor: "pointer" }}>
                  <i className="bi bi-gear me-2"></i> Settings
                </div>
                <div onClick={handleSignOut} style={{ padding: "12px 16px", color: "#ef4444", fontSize: "14px", borderTop: "1px solid #f1f5f9", cursor: "pointer" }}>
                  <i className="bi bi-box-arrow-right me-2"></i> Sign Out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClientHeader;