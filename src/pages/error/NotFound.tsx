import { Compass, Home, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import astronautSvg from "@/assets/404/astronaut.svg";
import particlesImg from "@/assets/404/particles.png";
import planetSvg from "@/assets/404/planet.svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#08111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_34%),radial-gradient(circle_at_bottom,rgba(244,114,182,0.18),transparent_30%)]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${particlesImg})`,
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
          backgroundSize: "360px",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,31,0.08),rgba(8,17,31,0.82))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-12 px-6 py-12 lg:flex-row lg:gap-8">
        <section className="max-w-xl text-center lg:text-left">
          <Badge className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-100 hover:bg-white/10">
            Error 404
          </Badge>

          <p className="mt-6 text-6xl font-black tracking-[-0.04em] text-white sm:text-7xl">Page not found</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-100 sm:text-5xl">
            We lost this page somewhere in orbit.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-300 sm:text-lg">
            The link may be outdated, the page may have moved, or the address may not exist in the
            current MumCare route map.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              asChild
              className="h-11 rounded-full bg-white px-5 text-slate-950 shadow-lg shadow-slate-950/20 hover:bg-slate-100"
            >
              <Link to="/">
                <Home className="size-4" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/products">
                <ShoppingBag className="size-4" />
                Browse Products
              </Link>
            </Button>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-100">
            <Compass className="size-4" />
            Try checking the URL or returning to a known page.
          </div>
        </section>

        <section className="relative flex w-full max-w-lg items-center justify-center">
          <div className="absolute h-72 w-72 rounded-full bg-sky-400/15 blur-3xl sm:h-80 sm:w-80" />
          <img
            src={planetSvg}
            alt=""
            aria-hidden="true"
            className="relative z-10 w-full max-w-[320px] animate-spin drop-shadow-[0_30px_80px_rgba(14,165,233,0.28)] sm:max-w-[380px]"
            style={{ animationDuration: "26s" }}
          />
          <img
            src={astronautSvg}
            alt=""
            aria-hidden="true"
            className="absolute right-6 top-0 z-20 w-20 animate-bounce drop-shadow-[0_24px_50px_rgba(255,255,255,0.16)] sm:right-12 sm:top-4 sm:w-24"
          />
        </section>
      </div>
    </div>
  );
}
