import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Search,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const AdminBloodCamps = () => {
  const token = localStorage.getItem("token");
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    hospital: "",
    venue: "",
    city: "",
    state: "",
    pincode: "",
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    expectedDonors: 0,
    status: "scheduled",
  });

  const [hospitals, setHospitals] = useState([]);

  // Fetch hospitals for dropdown
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/admin/facilities?facilityType=hospital`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setHospitals(
            data.data.filter((f) => f.status === "approved") ||
              data.facilities
          );
        }
      } catch (err) {
        console.error("Fetch hospitals error:", err);
      }
    };

    fetchHospitals();
  }, [token]);

  // Fetch blood camps
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setLoading(true);
        let url = `${API_BASE_URL}/api/admin/camps?page=${page}&limit=10`;
        if (status !== "all") url += `&status=${status}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch camps");

        const data = await res.json();
        setCamps(data.data || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Fetch camps error:", err);
        toast.error("Failed to load blood camps");
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, [page, status, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.hospital || !formData.venue || !formData.date) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const url = editingId
        ? `${API_BASE_URL}/api/admin/camps/${editingId}`
        : `${API_BASE_URL}/api/admin/camps`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save camp");

      toast.success(
        editingId
          ? "Blood camp updated successfully"
          : "Blood camp created successfully"
      );

      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        hospital: "",
        venue: "",
        city: "",
        state: "",
        pincode: "",
        date: "",
        startTime: "09:00",
        endTime: "17:00",
        expectedDonors: 0,
        status: "scheduled",
      });

      // Refresh list
      setPage(1);
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(err.message || "Failed to save blood camp");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blood camp?")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/camps/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete camp");

      toast.success("Blood camp deleted successfully");
      setPage(1);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete blood camp");
    }
  };

  const handleEdit = (camp) => {
    setFormData({
      title: camp.title,
      description: camp.description || "",
      hospital: camp.hospital._id || camp.hospital,
      venue: camp.venue,
      city: camp.city,
      state: camp.state || "",
      pincode: camp.pincode || "",
      date: camp.date ? camp.date.split("T")[0] : "",
      startTime: camp.startTime || "09:00",
      endTime: camp.endTime || "17:00",
      expectedDonors: camp.expectedDonors || 0,
      status: camp.status,
    });
    setEditingId(camp._id);
    setShowForm(true);
  };

  const filteredCamps = camps.filter((camp) =>
    camp.title.toLowerCase().includes(search.toLowerCase()) ||
    camp.venue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Blood Camps</h1>
            <p className="text-gray-600 mt-1">Manage blood donation camps</p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              if (!showForm) {
                setFormData({
                  title: "",
                  description: "",
                  hospital: "",
                  venue: "",
                  city: "",
                  state: "",
                  pincode: "",
                  date: "",
                  startTime: "09:00",
                  endTime: "17:00",
                  expectedDonors: 0,
                  status: "scheduled",
                });
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            New Blood Camp
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingId ? "Edit Blood Camp" : "Create New Blood Camp"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Camp Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Summer Blood Drive 2024"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Hospital */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hospital/Facility *
                  </label>
                  <select
                    value={formData.hospital}
                    onChange={(e) =>
                      setFormData({ ...formData, hospital: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  >
                    <option value="">Select a hospital...</option>
                    {hospitals.map((h) => (
                      <option key={h._id} value={h._id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) =>
                      setFormData({ ...formData, venue: e.target.value })
                    }
                    placeholder="e.g., Hospital Main Hall"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                    required
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Expected Donors */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected Donors
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.expectedDonors}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedDonors: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Camp details..."
                  rows="3"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  {editingId ? "Update Camp" : "Create Camp"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search camps..."
              className="flex-1 bg-transparent outline-none text-gray-700"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Camps List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-red-500 rounded-full border-t-transparent"></div>
            <p className="text-gray-600 mt-4">Loading blood camps...</p>
          </div>
        ) : filteredCamps.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-lg">No blood camps found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCamps.map((camp) => (
              <div
                key={camp._id}
                className="bg-white rounded-lg shadow hover:shadow-lg border border-gray-200 p-5 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {camp.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-500" />
                        {new Date(camp.date).toLocaleDateString()} {camp.startTime} -{" "}
                        {camp.endTime}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {camp.venue}, {camp.city}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-500" />
                        Expected: {camp.expectedDonors} donors | Actual:{" "}
                        {camp.actualDonors || 0}
                      </div>
                      {camp.hospital && (
                        <div className="text-xs text-gray-500">
                          Hospital: {camp.hospital.name || camp.hospital}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        camp.status === "scheduled"
                          ? "bg-blue-100 text-blue-700"
                          : camp.status === "ongoing"
                          ? "bg-green-100 text-green-700"
                          : camp.status === "completed"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {camp.status}
                    </span>

                    <button
                      onClick={() => handleEdit(camp)}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(camp._id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({
              length: Math.ceil(total / 10),
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
    </div>
  );
};

export default AdminBloodCamps;
