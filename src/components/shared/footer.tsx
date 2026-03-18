import { Baby, ChevronRight, Mail, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";

interface FooterProps {
  setCurrentPage: (page: string) => void;
}

const quickLinks = [
  { label: "Home", page: "home" },
  { label: "Products", page: "products" },
  { label: "Blogs", page: "blogs" },
  { label: "Loyalty", page: "loyalty" },
];

const supportLinks = [
  { label: "About Us", page: "about" },
  { label: "Contact", page: "contact" },
];

const trustItems = [
  { icon: Truck, text: "Fast delivery for family essentials" },
  { icon: ShieldCheck, text: "Verified products from trusted brands" },
];

export default function Footer({ setCurrentPage }: FooterProps) {
  return (
    <footer className="mt-auto border-t border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(252,231,243,0.6),rgba(219,234,254,0.58))]">
      <div className="h-px w-full bg-gradient-to-r from-pink-400 via-sky-400 to-emerald-300" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-white/78 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-sky-500 text-white shadow-md shadow-pink-100/70">
                <Baby className="h-6 w-6" />
              </div>
              <div>
                <h3 className="bg-gradient-to-r from-slate-900 via-pink-700 to-sky-700 bg-clip-text text-xl font-black text-transparent">
                  MumCare
                </h3>
                <p className="text-sm text-slate-500">Simple care for moms and little ones</p>
              </div>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
              Premium nutrition, baby essentials, and trusted care products selected to support every step of motherhood.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sky-600 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-slate-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/78 p-6 shadow-sm backdrop-blur-sm">
            <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-800">Explore</h4>
            <div className="mt-4 space-y-2">
              {quickLinks.map((item) => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>

            <h4 className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-slate-800">Support</h4>
            <div className="mt-4 space-y-2">
              {supportLinks.map((item) => (
                <button
                  key={item.page}
                  onClick={() => setCurrentPage(item.page)}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/78 p-6 shadow-sm backdrop-blur-sm">
            <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-800">Contact</h4>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-pink-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Hotline</p>
                  <p className="text-sm text-slate-600">+84 86231706</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Email</p>
                  <p className="text-sm text-slate-600">mumcare@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Address</p>
                  <p className="text-sm leading-6 text-slate-600">
                    FPT University, District 9,
                    <br />
                    Ho Chi Minh City
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 MumCare. All rights reserved.</p>
          <p>Made with care for mothers and babies.</p>
        </div>
      </div>
    </footer>
  );
}
