import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { checkAuthStatus, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);

  // useEffect(() => {
  //   if (hasChecked) return;

  //   const handleCallback = async () => {
  //     setHasChecked(true);
  //     try {
  //       console.log("Handling Google callback");
  //       const query = new URLSearchParams(location.search);
  //       const code = query.get("code");
  //       const errorParam = query.get("error");

  //       if (errorParam) {
  //         console.error("Google authentication error:", errorParam);
  //         setError("Google authentication failed");
  //         navigate(`/login?error=${errorParam}`, { replace: true });
  //         return;
  //       }

  //       if (!code) {
  //         console.error("Missing authentication code");
  //         setError("Missing authentication code");
  //         navigate("/login?error=missing_code", { replace: true });
  //         return;
  //       }

  //       console.log("Sending code to backend:", { code });
  //       await authAPI.exchangeGoogleCode({ code });
  //       await checkAuthStatus();

  //       if (isAuthenticated && user?.role?.name) {
  //         console.log("User authenticated:", user);
  //         const redirectPath = getRedirectPath(user.role.name);
  //         navigate(redirectPath, { replace: true });
  //       } else {
  //         console.error("Authentication failed or no role found");
  //         setError("Failed to authenticate with Google");
  //         navigate("/login?error=auth_failed", { replace: true });
  //       }
  //     } catch (err) {
  //       console.error("Google callback error:", err);
  //       setError(err.response?.data?.detail || "An error occurred during authentication");
  //       navigate("/login?error=auth_error", { replace: true });
  //     }
  //   };

  //   handleCallback();
  // }, [checkAuthStatus, isAuthenticated, user, navigate, location.search, hasChecked]);
useEffect(() => {
  const query = new URLSearchParams(location.search);
  const code = query.get("code");
  const errorParam = query.get("error");

  if (errorParam) {
    setError("Google authentication failed");
    navigate(`/login?error=${errorParam}`, { replace: true });
    return;
  }

  if (!code) {
    setError("Missing authentication code");
    navigate("/login?error=missing_code", { replace: true });
    return;
  }

  const exchangeCode = async () => {
    try {
      await authAPI.exchangeGoogleCode({ code });
      await checkAuthStatus(); // will update user & isAuthenticated
      console.log("BAck to googlecallback")
      navigate('/user/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred during authentication");
      navigate("/login?error=auth_error", { replace: true });
    }
  };

  exchangeCode();
}, [location.search, navigate, checkAuthStatus]);
useEffect(() => {
  if (isAuthenticated && user?.role?.name) {
    const redirectPath = getRedirectPath(user.role.name);
    navigate(redirectPath, { replace: true });
  }
}, [isAuthenticated, user, navigate]);

  const getRedirectPath = (role) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "instructor":
        return "/instructor/dashboard";
      case "user":
        return "/user/dashboard";
      default:
        return "/";
    }
  };
 
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
};

export default GoogleCallback;