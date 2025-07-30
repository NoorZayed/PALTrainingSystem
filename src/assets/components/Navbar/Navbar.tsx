import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.scss";
import logo from "../../components/images/PAL.png";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");
  const location = useLocation();
  
  // Helper function to check if the user has a specific role
  const hasRole = (roleToCheck: string): boolean => {
    if (!userRole) return false;
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedRoleToCheck = roleToCheck.toLowerCase();
    return normalizedUserRole === normalizedRoleToCheck;
  };

  useEffect(() => {
    const updateLoginStatus = () => {
      const userString = localStorage.getItem("user");
      console.log('User data from localStorage:', userString);
      
      if (userString) {
        setIsLoggedIn(true);
        try {
          const userData = JSON.parse(userString);
          console.log('Parsed user data:', userData);
          // Check different possible locations for role information
          const role = userData.role || userData.userType || userData.type || "";
          console.log('Detected role:', role);
          setUserRole(role);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          setUserRole("");
        }
      } else {
        setIsLoggedIn(false);
        setUserRole("");
      }
    };
    //check initially
    updateLoginStatus();

    // Listen for changes in localStorage from this or other tabs
    window.addEventListener("storage", updateLoginStatus);

    //clean up listener
    return () => {
      window.removeEventListener("storage", updateLoginStatus);
    };
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(userString);
        // Check different possible locations for role information
        const role = userData.role || userData.userType || userData.type || "";
        setUserRole(role);
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setUserRole("");
      }
    } else {
      setIsLoggedIn(false);
      setUserRole("");
    }
  }, [location]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Left section */}
        <div className={styles.leftSection}>
          <Link to="/">
            <img src={logo} alt="Logo" className={styles.navbarLogo} />
          </Link>
          <Link to="/">
            <span className={styles.navbarBrand}>PAL Training System</span>
          </Link>
        </div>

        {/* Center section */}
        <div className={styles.centerSection}>
          <ul className={styles.navbarNav}>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/aboutus">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
            {/* Role-based navigation links with helper function */}
            {isLoggedIn && hasRole("student") && (
              <li>
                <Link to="/StudentProfile">Student Dashboard</Link>
              </li>
            )}
            {isLoggedIn && hasRole("company") && (
              <li>
                <Link to="/company/CompanyDashboard">Company Dashboard</Link>
              </li>
            )}
            {isLoggedIn && hasRole("training manager") && (
              <li>
                <Link to="/adminDashboard">Training manager Dashboard</Link>
              </li>
            )}
            {isLoggedIn && hasRole("supervisor") && (
              <li>
                <Link to="/supervisor/dashboard">Supervisor Dashboard</Link>
              </li>
            )}
            
    
            
            {/* Alternative approach: Show all links if no specific role is detected */}
            {isLoggedIn && !userRole && (
              <>
                <li><Link to="/StudentProfile">Student Dashboard</Link></li>
                <li><Link to="/CompanyDashboard">Company Dashboard</Link></li>
                <li><Link to="/adminDashboard">Training manager Dashboard</Link></li>
                <li><Link to="/supervisor/dashboard">Supervisor Dashboard</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Right section */}
        <div className={styles.rightSection}>
          {!isLoggedIn ? (
            <>
              <Link to="/login" className={styles.button}>
                Login
              </Link>
              <Link to="/signup" className={styles.button}>
                Signup
              </Link>
            </>
          ) : (
            <>
              <span className={styles.userRole}>
                Role: {userRole || "Not set"}
              </span>
              <button 
                className={styles.button}
                onClick={() => {
                  localStorage.removeItem("user");
                  setIsLoggedIn(false);
                  setUserRole("");
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
