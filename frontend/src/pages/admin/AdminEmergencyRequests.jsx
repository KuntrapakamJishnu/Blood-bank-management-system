import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Eye,
  Filter,
  Clock,
  User,
  MapPin,
  Droplet,
} from "lucide-react";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const AdminEmergencyRequests = () => {
  const token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminStatus, setAdminStatus] = useState("pending");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch emergency requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE_URL}/api/emergency-requests?adminStatus=${adminStatus}&page=${page}&limit=20`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch requests");

        const data = await res.json();
        setRequests(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to load emergency requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [adminStatus, page]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/emergency-requests/${selectedRequest._id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminNotes }),
        }
      );

      if (!res.ok) throw new Error("Failed to approve request");

      toast.success("Emergency request approved successfully!");
      setSelectedRequest(null);
      setAdminNotes("");
      setAdminStatus("pending");
      setPage(1);
    } catch (err) {
      console.error("Approve error:", err);
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !adminNotes.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/emergency-requests/${selectedRequest._id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminNotes }),
        }
      );

      if (!res.ok) throw new Error("Failed to reject request");

      toast.success("Emergency request rejected successfully!");
      setSelectedRequest(null);
      setAdminNotes("");
      setAdminStatus("pending");
      setPage(1);
    } catch (err) {
      console.error("Reject error:", err);
      toast.error("Failed to reject request");
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "urgent":
        return "text-orange-600 bg-orange-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Emergency Blood Requests
            </h1>
          </div>
          <p className="text-gray-600">
            Review and approve/reject emergency blood requests from donors
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setAdminStatus(status);
                setPage(1);
              }}
              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${
                adminStatus === status
                  ? "bg-red-600 text-white"
                  : "bg-white border-2 border-gray-300 text-gray-700 hover:border-red-500"
              }`}
            >
              {getStatusIcon(status)}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
                <p className="text-gray-600 mt-4">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-lg">
                  No {adminStatus} requests
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request._id}
                    onClick={() => {
                      setSelectedRequest(request);
                      setAdminNotes("");
                    }}
                    className={`bg-white rounded-lg shadow hover:shadow-lg border-2 p-4 cursor-pointer transition ${
                      selectedRequest?._id === request._id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-800">
                            {request.donor?.name || "Anonymous"}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyColor(
                              request.urgency
                            )}`}
                          >
                            {request.urgency.toUpperCase()}
                          </span>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-red-500" />
                            {request.bloodType} × {request.quantity} units
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-500" />
                            {request.facility?.name || "Unknown Facility"}
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-red-500" />
                            ETA: ~{request.estimatedETA || 0} minutes
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        {getStatusIcon(request.adminStatus)}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 border-l-2 border-red-300">
                        <p className="font-semibold mb-1">Reason:</p>
                        <p>{request.reason}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({
                  length: Math.ceil(total / 20),
                }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      page === i + 1
                        ? "bg-red-600 text-white"
                        : "bg-white border-2 border-gray-300 text-gray-700 hover:border-red-500"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Request Details & Action Panel */}
          {selectedRequest ? (
            <div className="bg-white rounded-lg shadow-lg border-2 border-red-100 p-6 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-600" />
                Request Details
              </h2>

              <div className="space-y-4 mb-6">
                {/* Donor Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 font-semibold mb-1">
                    DONOR
                  </p>
                  <p className="font-semibold text-gray-800">
                    {selectedRequest.donor?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.donor?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.donor?.phone}
                  </p>
                </div>

                {/* Facility Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 font-semibold mb-1">
                    FACILITY
                  </p>
                  <p className="font-semibold text-gray-800">
                    {selectedRequest.facility?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.facility?.facilityType}
                  </p>
                  <p className="text-sm text-gray-600">
                    Distance: {selectedRequest.distance?.toFixed(2) || 0} km
                  </p>
                </div>

                {/* Request Details */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 font-semibold mb-2">
                    REQUEST DETAILS
                  </p>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Blood Type:</span>
                      <span className="font-semibold ml-2">
                        {selectedRequest.bloodType}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-semibold ml-2">
                        {selectedRequest.quantity} units
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Urgency:</span>
                      <span
                        className={`font-semibold ml-2 ${getUrgencyColor(
                          selectedRequest.urgency
                        )}`}
                      >
                        {selectedRequest.urgency}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedRequest.adminStatus === "pending" ? (
                <>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes for approval/rejection..."
                    rows="4"
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:border-red-500 focus:outline-none mb-4"
                  />

                  <div className="space-y-2">
                    <button
                      onClick={handleApprove}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Request
                    </button>
                    <button
                      onClick={handleReject}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Request
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Admin Notes:
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.adminNotes || "No notes provided"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 h-fit flex items-center justify-center text-center">
              <div>
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  Select a request to view details and take action
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEmergencyRequests;
