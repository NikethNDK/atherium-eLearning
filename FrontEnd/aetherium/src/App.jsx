
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import PublicRoutes from "./routes/PublicRoutes";
import UserRoutes from "./routes/UserRoutes";
import InstructorRoutes from "./routes/InstructorRoutes";
import AdminRoutes from "./routes/AdminRoutes";

import NotFound from "./pages/common/NotFound";

const queryClient = new QueryClient();

function App() { 
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
            <Routes>
            {PublicRoutes()}
            {UserRoutes()}
            {InstructorRoutes()}
            {AdminRoutes()}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
