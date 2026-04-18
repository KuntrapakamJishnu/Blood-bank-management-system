import {
  ArrowRight,
  Heart,
  Users,
  MapPin,
  Clock,
  Droplets,
  Shield,
  Zap,
  Search,
  Bell,
  FileText,
  CheckCircle,
  Activity,
  Building,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const LandingPage = () => {
  const networkStats = [
    { icon: Users, label: "Active Donors", value: "24,000+" },
    { icon: Building, label: "Partner Centers", value: "180+" },
    { icon: Droplets, label: "Units Matched", value: "62,500+" },
    { icon: Clock, label: "Avg Match Time", value: "22 mins" },
  ];

  const platformHighlights = [
    {
      icon: Zap,
      title: "Rapid Request Routing",
      description:
        "Urgent requests are auto-routed to nearby compatible donors and facilities in seconds.",
    },
    {
      icon: Search,
      title: "Smart Compatibility Search",
      description:
        "Find exact blood group matches with distance, availability, and response confidence.",
    },
    {
      icon: Bell,
      title: "Reliable Alert Engine",
      description:
        "Priority notifications make sure emergency requests are seen and acted on quickly.",
    },
  ];

  const donorJourney = [
    {
      step: "01",
      icon: FileText,
      title: "Create OneDrop Profile",
      detail: "Register once with verified contact details and eligibility basics.",
    },
    {
      step: "02",
      icon: CheckCircle,
      title: "Get Verified",
      detail: "Complete OTP verification and health checks for trusted matching.",
    },
    {
      step: "03",
      icon: MapPin,
      title: "Receive Nearby Requests",
      detail: "Get location-aware requests only when your blood type is needed.",
    },
    {
      step: "04",
      icon: Heart,
      title: "Donate and Track Impact",
      detail: "See your donation history and real lives supported through the platform.",
    },
  ];

  const trustChecklist = [
    "Verified donor and facility records",
    "Role-based secure access across portals",
    "Audit-friendly donation and request logs",
    "Medical workflow aligned request lifecycle",
  ];

  const donorBenefits = [
    {
      icon: CheckCircle,
      title: "Who Can Donate",
      items: [
        "Age 17-75 (16 with parental consent)",
        "Weight at least 110 lbs (50 kg)",
        "Good general health",
        "No flu or cold symptoms",
      ],
    },
    {
      icon: Droplets,
      title: "Health Benefits",
      items: [
        "Free health screening",
        "Burns 650 calories per donation",
        "Reduces risk of heart disease",
        "Stimulates blood cell production",
      ],
    },
    {
      icon: Shield,
      title: "Safety First",
      items: [
        "Sterile, disposable equipment",
        "Trained medical staff",
        "Comfortable environment",
        "Post-donation care",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-red-50 mt-10 antialiased scroll-smooth">
      <Header />

      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-800 to-red-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(255,255,255,0.12),transparent_36%)]" />
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-red-300/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-rose-200/20 blur-3xl" />

        <div className="container mx-auto relative z-10 px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
              <Activity className="h-4 w-4" />
              OneDrop Blood Response Network
            </span>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl md:leading-[1.05]">
              Simple blood support.
              <span className="block text-red-200">Fast when it matters.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-red-100 md:text-xl">
              OneDrop connects donors, hospitals, and blood labs in a clean,
              reliable flow so urgent blood requests can be handled without
              extra noise.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/login">
                <button className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-lg font-bold text-red-700 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-2xl">
                  Donate Blood <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
              <Link to="#mission">
                <button className="inline-flex items-center justify-center rounded-xl border-2 border-white/80 px-7 py-3 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/10">
                  View Mission
                </button>
              </Link>
            </div>

            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
              {[
                "Verified donors",
                "Simple matching",
                "Secure records",
                "Fast request alerts",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-red-50 backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block h-20 w-full" viewBox="0 0 1200 150" preserveAspectRatio="none">
            <path
              d="M0,64L60,69.3C120,75,240,85,360,85.3C480,85,600,75,720,74.7C840,75,960,85,1080,96C1200,107,1320,117,1380,122.7L1440,128L1440,160L1380,160C1320,160,1200,160,1080,160C960,160,840,160,720,160C600,160,480,160,360,160C240,160,120,160,60,160L0,160Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      <section className="bg-white/90 py-12 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {networkStats.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-red-100/80 bg-white/80 p-5 shadow-[0_12px_30px_rgba(127,29,29,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(127,29,29,0.14)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-black text-red-900">{item.value}</p>
                  <p className="mt-1 text-sm font-medium text-red-700">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="mission" className="py-20 bg-gradient-to-b from-red-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900">Built For Real Emergencies</h2>
            <p className="mt-4 text-lg text-slate-600">
              This is not just a donor directory. OneDrop is an operational platform for
              emergency coordination, fast matching, and transparent donation tracking.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {platformHighlights.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-red-100/80 bg-white/85 p-6 shadow-[0_12px_30px_rgba(127,29,29,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(127,29,29,0.12)]"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white shadow-md">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-slate-600 leading-7">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900">Your Donation Journey, Reimagined</h2>
              <p className="mt-4 text-lg text-slate-600 leading-8">
                OneDrop keeps the flow clear from registration to donation so every step is quick,
                validated, and meaningful.
              </p>
            </div>

            <div className="space-y-4">
              {donorJourney.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="flex gap-4 rounded-3xl border border-red-100/80 bg-gradient-to-br from-white to-red-50/70 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white font-bold shadow-sm">
                      {item.step}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-red-700" />
                        <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                      </div>
                      <p className="mt-2 text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900">
              Donor Eligibility & Benefits
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Safe, simple, and rewarding - discover the benefits of blood donation.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {donorBenefits.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(127,29,29,0.12)]"
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-sm">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 text-center">{card.title}</h3>
                  <ul className="mt-6 space-y-4">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-slate-700">
                        <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center gap-4 flex-col sm:flex-row">
            <Link to="/register/donor">
              <button className="rounded-xl bg-red-600 px-6 py-3 text-base font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-red-700">
                Register as Donor
              </button>
            </Link>
            <Link to="/register/facility">
              <button className="rounded-xl border border-red-300 px-6 py-3 text-base font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-50">
                Register as Facility
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-red-700 via-red-800 to-red-950 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/15 bg-white/10 px-6 py-12 shadow-2xl backdrop-blur-sm">
            <h2 className="text-3xl md:text-5xl font-black text-white">
              Ready to Save Lives?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-red-100">
              Join our community of donors and healthcare professionals working together to
              ensure blood is available when and where it's needed most.
            </p>

            <div className="mt-8 flex justify-center">
              <Link to="/login">
                <button className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-3 text-lg font-bold text-red-700 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-2xl">
                  Join Today <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
