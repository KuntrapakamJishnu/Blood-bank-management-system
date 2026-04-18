import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

const Login = lazy(() => import("./pages/auth/Login"));
const LandingPage = lazy(() => import("./pages/Landing"));
const FacilityForm = lazy(() => import("./pages/auth/FacultyRegister"));
const DonorRegister = lazy(() => import("./pages/auth/DonorRegister"));
const DonorDashboard = lazy(() => import("./pages/donor/DonorDashboard"));
const DashboardLayout = lazy(() => import("./components/layouts/DashboardLayout"));
const DonorProfile = lazy(() => import("./pages/donor/DonorProfile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminFacilities = lazy(() => import("./pages/admin/AdminFacilities"));
const HospitalDashboard = lazy(() => import("./pages/hospital/HospitalDashboard"));
const BloodCamps = lazy(() => import("./pages/bloodlab/BloodCamps"));
const BloodlabDashboard = lazy(() => import("./pages/bloodlab/BloodLabDashboard"));
const BloodStock = lazy(() => import("./pages/bloodlab/BloodStock"));
const LabProfile = lazy(() => import("./pages/bloodlab/LabProfile"));
const GetAllFacilities = lazy(() => import("./pages/admin/GetAllFacilities"));
const GetAllDonors = lazy(() => import("./pages/admin/GetAllDonors"));
const DonorCampsList = lazy(() => import("./pages/donor/DonorCampsList"));
const LabManageRequests = lazy(() => import("./pages/bloodlab/LabManageRequests"));
const HospitalRequestBlood = lazy(() => import("./pages/hospital/HospitalRequestBlood"));
const HospitalRequestHistory = lazy(() => import("./pages/hospital/HospitalRequestHistory"));
const HospitalBloodStock = lazy(() => import("./pages/hospital/HospitalBloodStock"));
const BloodLabDonor = lazy(() => import("./pages/bloodlab/BloodLabDonor"));
const DonorDirectory = lazy(() => import("./pages/hospital/DonorDirectory"));
const About = lazy(() => import("./components/about/About"));
const Contact = lazy(() => import("./components/contact/Contact"));
const DonorDonationHistory = lazy(() => import("./pages/donor/DonorDonationHistory"));
const StaticInfoPage = lazy(() => import("./components/StaticInfoPage"));
const ForgotPassword = lazy(() => import("./pages/user/ForgotPassowrd"));

function App() {
  return (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register/donor" element={<DonorRegister />} />
        <Route path="/register/facility" element={<FacilityForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/mission" element={<StaticInfoPage />} />
        <Route path="/stories" element={<StaticInfoPage />} />
        <Route path="/news" element={<StaticInfoPage />} />
        <Route path="/eligibility" element={<StaticInfoPage />} />
        <Route path="/process" element={<StaticInfoPage />} />
        <Route path="/benefits" element={<StaticInfoPage />} />
        <Route path="/request-blood" element={<StaticInfoPage />} />
        <Route path="/inventory" element={<StaticInfoPage />} />
        <Route path="/emergency" element={<StaticInfoPage />} />
        <Route path="/privacy" element={<StaticInfoPage />} />
        <Route path="/terms" element={<StaticInfoPage />} />
        <Route path="/cookies" element={<StaticInfoPage />} />

        <Route path="/donor" element={<ProtectedRoute><DashboardLayout userRole="donor" /></ProtectedRoute>}>
          <Route index element={<DonorDashboard />} />
          <Route path="profile" element={<DonorProfile />} />
          <Route path="camps" element={<DonorCampsList />} />
          <Route path="history" element={<DonorDonationHistory />} />
        </Route>
      
        <Route path="/hospital" element={<ProtectedRoute><DashboardLayout userRole="hospital" /></ProtectedRoute>}>
          <Route index element={<HospitalDashboard />} />
          <Route path="blood-request-create" element={<HospitalRequestBlood />} />
          <Route path="blood-request-history" element={<HospitalRequestHistory />} />
          <Route path="inventory" element={<HospitalBloodStock />} />
          <Route path="donors" element={<DonorDirectory />} />
       </Route>
      
        <Route path="/lab" element={<ProtectedRoute><DashboardLayout userRole="blood-lab" /></ProtectedRoute>}>
          <Route index element={<BloodlabDashboard />} />
          <Route path="inventory" element={<BloodStock />} />
          <Route path="camps" element={<BloodCamps />} />
          <Route path="profile" element={<LabProfile />} />
          <Route path="requests" element={<LabManageRequests />} />
          <Route path="donor" element={<BloodLabDonor />} />
        </Route>
        
        <Route path="/admin" element={<ProtectedRoute><DashboardLayout userRole="admin" /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="verification" element={<AdminFacilities />} />
          <Route path="donors" element={<GetAllDonors />} />
          <Route path="facilities" element={<GetAllFacilities />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;