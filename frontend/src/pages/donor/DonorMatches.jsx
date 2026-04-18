import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Building2,
  Calendar,
  Clock,
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Navigation,
  Search,
  Shield,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

const DonorMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [radiusKm, setRadiusKm] = useState(50);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMatches = async (overrideLocation) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view nearby matches");
        return;
      }

      const params = new URLSearchParams({
        maxDistanceKm: String(radiusKm),
      });

      const location = overrideLocation || userLocation;
      if (location?.latitude && location?.longitude) {
        params.set("latitude", String(location.latitude));
        params.set("longitude", String(location.longitude));
      }

      const res = await axios.get(`${API_BASE_URL}/api/donor/matches?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMatches(res.data.matches || []);
    } catch (error) {
      console.error("Fetch donor matches error:", error);
      toast.error(error.response?.data?.message || "Failed to load nearby matches");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm]);

  const enableLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(location);
        toast.success("Location enabled. Showing nearby hospitals and labs.");
        fetchMatches(location).finally(() => setLocating(false));
      },
      () => {
        toast.error("Unable to access your location. Please allow browser permission.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const filteredMatches = useMemo(() => {
    if (!searchTerm.trim()) return matches;
    const term = searchTerm.toLowerCase();
    return matches.filter((match) => {
      const name = match.name?.toLowerCase() || "";
      const city = match.address?.city?.toLowerCase() || "";
      const state = match.address?.state?.toLowerCase() || "";
      return name.includes(term) || city.includes(term) || state.includes(term);
    });
  }, [matches, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-medium mb-3">
                <Heart className="w-4 h-4" />
                Nearby donation matches
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Find hospitals and blood labs near you</h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Match with approved facilities by geolocation, then contact them directly to coordinate a donation or emergency handoff.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={enableLocation}
                disabled={locating}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                {locating ? "Locating..." : userLocation ? "Refresh Nearby" : "Use My Location"}
              </button>
              <button
                type="button"
                onClick={() => fetchMatches()}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-700 font-semibold hover:bg-red-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-5">
            <div className="text-sm text-gray-500">Matched facilities</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{filteredMatches.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-5">
            <div className="text-sm text-gray-500">Matching radius</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{radiusKm} km</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-5">
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-lg font-semibold text-green-600 mt-2">Approved facilities only</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search hospital or lab by name, city, or state"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Radius</label>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-48"
              />
              <span className="text-sm font-semibold text-red-700 w-12 text-right">{radiusKm}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-12 text-center">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Finding nearby hospitals and blood labs...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-800">No nearby facilities found</h2>
            <p className="text-gray-600 mt-2">Try increasing the radius or enabling your location for a tighter match.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <div key={match._id} className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold mb-3">
                      {match.facilityType === "hospital" ? "Hospital" : "Blood Lab"}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{match.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{match.facilityCategory || "Private"}</p>
                  </div>
                  {typeof match.distanceKm === "number" && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">{match.distanceKm}</div>
                      <div className="text-xs text-gray-500">km away</div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                    <span>{match.address?.street}, {match.address?.city}, {match.address?.state} - {match.address?.pincode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red-500" />
                    <span>{match.phone || match.emergencyContact || "Call to coordinate"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-red-500" />
                    <span>{match.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span>{match.is24x7 ? "24/7 service" : `${match.operatingHours?.open || "09:00"} - ${match.operatingHours?.close || "18:00"}`}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${match.phone || match.emergencyContact || ""}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                    href={`mailto:${match.email}?subject=Blood%20Donation%20Match`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-700 font-semibold hover:bg-red-50 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                  <button
                    type="button"
                    onClick={() => toast.success("Chat support can be added with WhatsApp or in-app messaging next.")}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorMatches;