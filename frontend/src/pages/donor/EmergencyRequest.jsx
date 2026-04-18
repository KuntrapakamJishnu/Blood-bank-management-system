import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Send,
  Zap,
} from "lucide-react";
import { toast } from "react-hot-toast";
import ChatModal from "../../components/ChatModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const EmergencyRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { facilityId } = useParams();
  const token = localStorage.getItem("token");

  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const [formData, setFormData] = useState({
    bloodType: "O+",
    quantity: 1,
    urgency: "standard",
    reason: "",
  });

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        if (location.state?.facility && location.state.facility._id === facilityId) {
          setFacility(location.state.facility);
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/donor/matches?maxDistanceKm=500`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch donor matches");

        const data = await res.json();
        const match = (data.matches || []).find((item) => item._id === facilityId);
        if (!match) throw new Error("Facility not found in donor matches");
        setFacility(match);
      } catch (err) {
        console.error("Fetch facility error:", err);
        toast.error("Failed to load facility details");
      } finally {
        setLoading(false);
      }
    };

    if (facilityId) {
      fetchFacility();
    }
  }, [facilityId, location.state, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bloodType || !formData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(
        `${API_BASE_URL}/api/emergency-requests`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            facilityId,
            bloodType: formData.bloodType,
            quantity: parseInt(formData.quantity),
            urgency: formData.urgency,
            reason: formData.reason,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create request");
      }

      await res.json();

      toast.success("Emergency request created successfully!");
      
      // Open chat after creating request
      setChatOpen(true);

      // Redirect to donor dashboard after 3 seconds
      setTimeout(() => {
        navigate("/donor");
      }, 3000);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-red-500 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-600">Loading facility details...</p>
        </div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-red-100">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">Facility not found</p>
          <button
            onClick={() => navigate("/donor/matches")}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-4 md:p-6">
      <button
        onClick={() => navigate("/donor/matches")}
        className="mb-6 text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
      >
        ← Back to Matches
      </button>

      <div className="max-w-2xl mx-auto">
        {/* Facility Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 mb-6 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {facility.name}
              </h1>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {facility.facilityType === "hospital"
                    ? "🏥 Hospital"
                    : "🧪 Blood Lab"}
                </span>
                {facility.is24x7 && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    24/7 Service
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <a
                  href={`tel:${facility.phone}`}
                  className="hover:text-red-600 font-medium"
                >
                  {facility.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <a
                  href={`mailto:${facility.email}`}
                  className="hover:text-red-600 font-medium"
                >
                  {facility.email}
                </a>
              </div>
            </div>

            {facility.emergencyContact && (
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs text-gray-500">Emergency</p>
                  <a
                    href={`tel:${facility.emergencyContact}`}
                    className="hover:text-red-600 font-medium"
                  >
                    {facility.emergencyContact}
                  </a>
                </div>
              </div>
            )}

            {facility.operatingHours && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Hours</p>
                  <p className="font-medium">
                    {facility.operatingHours.open} -{" "}
                    {facility.operatingHours.close}
                  </p>
                </div>
              </div>
            )}
          </div>

          {facility.address && (
            <div className="mt-4 pt-4 border-t flex items-start gap-3">
              <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-gray-600">
                  {facility.address.street}, {facility.address.city},{" "}
                  {facility.address.state} {facility.address.pincode}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Request Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Emergency Blood Request
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Blood Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blood Type Required
              </label>
              <select
                value={formData.bloodType}
                onChange={(e) =>
                  setFormData({ ...formData, bloodType: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              >
                {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(
                  (type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity (Units)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Urgency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                value={formData.urgency}
                onChange={(e) =>
                  setFormData({ ...formData, urgency: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              >
                <option value="standard">Standard (24-48 hours)</option>
                <option value="urgent">Urgent (2-4 hours)</option>
                <option value="critical">Critical (Immediate)</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Request
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Brief description of blood requirement..."
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Info Alert */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-1">Important</p>
                <p>
                  Your request will be reviewed and approved by an admin before
                  processing. You can track status in real-time and chat with
                  the facility.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {submitting ? (
                <>
                  <div className="animate-spin">
                    <Zap className="w-5 h-5" />
                  </div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Emergency Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* Chat Preview */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-900 text-sm font-medium">
            💬 After submitting, you can chat directly with {facility.name} to
            discuss details.
          </p>
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <ChatModal
          facilityId={facilityId}
          facilityName={facility.name}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
};

export default EmergencyRequest;
