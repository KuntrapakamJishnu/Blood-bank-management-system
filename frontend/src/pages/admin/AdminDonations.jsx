import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Droplet,
  Calendar,
  RefreshCw,
  CheckCircle,
  Clock,
  Heart,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";
const API_URL = `${API_BASE_URL}/api/admin`;

const AdminDonations = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDonations = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      else setLoading(true);

      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/donors`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDonors(res.data.donors || []);
      if (showToast) {
        toast.success(`Loaded ${res.data.donors?.length || 0} donors`);
      }
    } catch (error) {
      console.error("Load donations error:", error);
      toast.error(error.response?.data?.message || "Failed to load donations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const donationRows = donors.flatMap((donor) =>
    (donor.donationHistory || []).map((entry, index) => ({
      id: `${donor._id}-${index}`,
      donorName: donor.fullName,
      donorEmail: donor.email,
      bloodGroup: entry.bloodGroup || donor.bloodGroup,
      quantity: entry.quantity || 1,
      donationDate: entry.donationDate,
      remarks: entry.remarks || "-",
      verified: !!entry.verified,
      facility: entry.facility?.name || entry.facility || "-",
    })),
  );

  const totalUnits = donationRows.reduce((sum, row) => sum + row.quantity, 0);
  const verifiedDonations = donationRows.filter((row) => row.verified).length;
  const donorsWithHistory = donors.filter((donor) => (donor.donationHistory || []).length > 0).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Heart className="w-12 h-12 text-red-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Donation Records</h2>
          <p className="text-gray-500">Fetching donation history from all donors...</p>
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
                <Droplet className="w-6 h-6 text-red-600" />
              </div>
              Donation History
            </h1>
            <p className="text-gray-600 mt-2">View donation activity recorded across donor accounts.</p>
          </div>

          <button
            onClick={() => loadDonations(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-red-400">
            <div className="text-2xl font-bold text-gray-800">{donationRows.length}</div>
            <div className="text-sm text-gray-600">Total Donations</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-green-400">
            <div className="text-2xl font-bold text-green-600">{totalUnits}</div>
            <div className="text-sm text-gray-600">Total Units</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-blue-400">
            <div className="text-2xl font-bold text-blue-600">{donorsWithHistory}</div>
            <div className="text-sm text-gray-600">Donors with History</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-lg border-l-4 border-l-yellow-400">
            <div className="text-2xl font-bold text-yellow-600">{verifiedDonations}</div>
            <div className="text-sm text-gray-600">Verified Donations</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Donation Records
            </h2>
          </div>

          {donationRows.length === 0 ? (
            <div className="text-center py-12">
              <Droplet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No donations yet</h3>
              <p className="text-gray-600">Donation entries will appear here once donors start recording donations.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-4 text-left font-semibold text-gray-700">Donor</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Blood Group</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Units</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Facility</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Date</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donationRows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-red-600">
                              {row.donorName?.charAt(0) || "D"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{row.donorName}</div>
                            <div className="text-sm text-gray-500">{row.donorEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          {row.bloodGroup}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-lg font-semibold text-gray-800">{row.quantity}</span>
                        <span className="text-sm text-gray-500 ml-1">units</span>
                      </td>
                      <td className="p-4 text-gray-700">{row.facility}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {row.donationDate ? new Date(row.donationDate).toLocaleDateString() : "-"}
                        <br />
                        <span className="text-xs text-gray-400">
                          {row.donationDate ? new Date(row.donationDate).toLocaleTimeString() : ""}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${row.verified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {row.verified ? <CheckCircle size={14} /> : <Clock size={14} />}
                          {row.verified ? "Verified" : "Pending"}
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

export default AdminDonations;
