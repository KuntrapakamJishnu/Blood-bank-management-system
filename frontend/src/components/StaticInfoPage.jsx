import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Heart, Shield, Mail, Info, Clock, MapPin } from "lucide-react";

const pageContent = {
  "/mission": {
    title: "Our Mission",
    subtitle: "Connecting donors, hospitals, and blood banks to save lives faster.",
    points: [
      "Make blood donation easy, safe, and accessible.",
      "Help hospitals find blood products when they need them most.",
      "Build a reliable community of verified donors and facilities.",
    ],
    primary: { label: "Become a Donor", to: "/register/donor" },
    secondary: { label: "Contact Support", to: "/contact" },
  },
  "/stories": {
    title: "Success Stories",
    subtitle: "Real impact stories will appear here as the platform grows.",
    points: [
      "Families helped through emergency blood requests.",
      "Donors matched to camps near their location.",
      "Facilities approved and onboarded for faster collaboration.",
    ],
    primary: { label: "See Blood Camps", to: "/donor/camps" },
    secondary: { label: "Join the Mission", to: "/register/donor" },
  },
  "/news": {
    title: "News & Updates",
    subtitle: "Latest platform updates, camp announcements, and community news.",
    points: [
      "New blood donation camps and drives.",
      "Feature releases and platform improvements.",
      "Urgent blood requirement alerts.",
    ],
    primary: { label: "View Blood Camps", to: "/donor/camps" },
    secondary: { label: "Login", to: "/login" },
  },
  "/eligibility": {
    title: "Eligibility Criteria",
    subtitle: "Basic guidance for safe blood donation participation.",
    points: [
      "Be in good general health and meet the minimum age requirement.",
      "Carry a valid ID and share accurate medical information.",
      "Follow the instructions given by medical staff at the camp.",
    ],
    primary: { label: "Register as Donor", to: "/register/donor" },
    secondary: { label: "Read Contact Info", to: "/contact" },
  },
  "/process": {
    title: "Donation Process",
    subtitle: "Simple steps to become a donor and complete a safe donation.",
    points: [
      "Register and verify your account.",
      "Find a camp or location near you.",
      "Complete screening and donate blood safely.",
    ],
    primary: { label: "Schedule Donation", to: "/donor/camps" },
    secondary: { label: "Login", to: "/login" },
  },
  "/benefits": {
    title: "Donor Benefits",
    subtitle: "Track your impact and get recognition for saving lives.",
    points: [
      "Donation certificates and history tracking.",
      "Health awareness and community recognition.",
      "Access to donation campaigns and camps.",
    ],
    primary: { label: "View Donation History", to: "/donor/history" },
    secondary: { label: "Become a Donor", to: "/register/donor" },
  },
  "/request-blood": {
    title: "Blood Request",
    subtitle: "Hospitals can log in to create and manage blood requests.",
    points: [
      "Use the hospital dashboard to create requests.",
      "Track request history and fulfillment status.",
      "Coordinate with verified blood labs and donors.",
    ],
    primary: { label: "Hospital Login", to: "/login" },
    secondary: { label: "Contact Support", to: "/contact" },
  },
  "/inventory": {
    title: "Inventory Management",
    subtitle: "Blood inventory is managed inside the protected dashboards.",
    points: [
      "Hospital and blood lab users can manage stock securely.",
      "Inventory updates are available after login.",
      "Protected routes keep operational data private.",
    ],
    primary: { label: "Login", to: "/login" },
    secondary: { label: "Go Home", to: "/" },
  },
  "/emergency": {
    title: "Emergency Protocol",
    subtitle: "Use the platform quickly during urgent blood need situations.",
    points: [
      "Check current blood availability and donor access.",
      "Notify the appropriate hospital or blood lab team.",
      "Use contact channels for urgent coordination.",
    ],
    primary: { label: "Contact Us", to: "/contact" },
    secondary: { label: "Login", to: "/login" },
  },
  "/privacy": {
    title: "Privacy Policy",
    subtitle: "Your data is handled carefully and used only for platform operations.",
    points: [
      "We collect information needed for donor and facility workflows.",
      "Authentication data is protected with standard security controls.",
      "Contact support if you want clarification about data usage.",
    ],
    primary: { label: "Contact Support", to: "/contact" },
    secondary: { label: "Go Home", to: "/" },
  },
  "/terms": {
    title: "Terms of Service",
    subtitle: "Guidelines for using the blood bank management platform.",
    points: [
      "Use the system responsibly and provide accurate information.",
      "Protected dashboard access is limited to authorized users.",
      "Platform content may change as features are added.",
    ],
    primary: { label: "Login", to: "/login" },
    secondary: { label: "Go Home", to: "/" },
  },
  "/cookies": {
    title: "Cookie Policy",
    subtitle: "We use essential session-related data to keep you signed in.",
    points: [
      "Authentication requires browser storage for secure sessions.",
      "No advertising cookies are used for this workflow.",
      "Clear your browser data to sign out everywhere.",
    ],
    primary: { label: "Login", to: "/login" },
    secondary: { label: "Contact Support", to: "/contact" },
  },
};

const fallbackContent = {
  title: "Information Page",
  subtitle: "This page is available as part of the public site.",
  points: [
    "Use the navigation to reach the available features.",
    "If you need help, the contact page has the latest support details.",
  ],
  primary: { label: "Go Home", to: "/" },
  secondary: { label: "Contact Support", to: "/contact" },
};

export default function StaticInfoPage() {
  const location = useLocation();
  const content = pageContent[location.pathname] || fallbackContent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-8 md:p-12">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">
              OneDrop
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {content.title}
          </h1>
          <p className="text-lg text-gray-600 mb-8">{content.subtitle}</p>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {content.points.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-red-100 bg-red-50/70 p-5 text-gray-700"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  <p className="leading-relaxed">{point}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={content.primary.to}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
            >
              {content.primary.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={content.secondary.to}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-3 font-semibold text-red-700 transition-colors hover:bg-red-50"
            >
              {content.secondary.label}
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Built for donors and hospitals
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-500" />
            Available around the clock
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            Supporting Amaravathi, AP and beyond
          </div>
        </div>
      </div>
    </div>
  );
}
