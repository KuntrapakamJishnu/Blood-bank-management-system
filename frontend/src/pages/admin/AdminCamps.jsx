import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Users,
  RefreshCw,
  Heart,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const API_URL = `${API_BASE_URL}/api`;

const AdminCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCamps = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/camps`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCamps(res.data.camps || []);
      if (showToast) {
        toast.success(`Loaded ${res.data.camps?.length || 0} camps`);
      }
    } catch (error) {
      console.error("Load camps error:", error);
      toast.error(error.response?.data?.message || "Failed to load camps");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCamps();
  }, []);

  const upcomingCount = camps.filter((camp) => camp.status === "Upcoming" || camp.status === "upcoming").length;
  const completedCount = camps.filter((camp) => camp.status === "Completed" || camp.status === "completed").length;
  const totalCapacity = camps.reduce((sum, camp) => sum + (camp.capacity || camp.expectedDonors || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Heart className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Blood Camps</h2>
          <p className="text-gray-500">Fetching active camp listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
              Blood Camps
            </h1>
            <p className="text-gray-600 mt-2">Monitor upcoming and completed blood donation camps.</p>
          </div>

          <button
            onClick={() => loadCamps(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-red-400">
            <div className="text-2xl font-bold text-gray-800">{camps.length}</div>
            <div className="text-sm text-gray-600">Total Camps</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-green-400">
            <div className="text-2xl font-bold text-green-600">{upcomingCount}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-blue-400">
            <div className="text-2xl font-bold text-blue-600">{completedCount}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-purple-400">
            <div className="text-2xl font-bold text-purple-600">{totalCapacity}</div>
            <div className="text-sm text-gray-600">Total Capacity</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Camp Listings
            </h2>
          </div>

          {camps.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No camps available</h3>
              <p className="text-gray-600">Camp information will appear here when the blood lab team publishes it.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-left font-semibold text-gray-700">Title</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Facility</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Location</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Date</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Capacity</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {camps.map((camp) => (
                    <tr key={camp._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-gray-800">{camp.title || camp.name}</div>
                        <div className="text-sm text-gray-500">{camp.description || "-"}</div>
                      </td>
                      <td className="p-4 text-gray-700">{camp.hospital?.name || "Unknown Facility"}</td>
                      <td className="p-4 text-gray-700">
                        {camp.location?.venue || camp.location?.city || "-"}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {camp.date ? new Date(camp.date).toLocaleDateString() : "-"}
                        <br />
                        <span className="text-xs text-gray-400">
                          {camp.time?.start && camp.time?.end ? `${camp.time.start} - ${camp.time.end}` : ""}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-red-600" />
                          {camp.expectedDonors || camp.capacity || 0}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${camp.status === "Completed" || camp.status === "completed" ? "bg-green-100 text-green-800" : camp.status === "Cancelled" || camp.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {camp.status || "Upcoming"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCamps;
