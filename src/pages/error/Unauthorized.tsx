import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import astronautSvg from "@/assets/404/astronaut.svg";
import particlesImg from "@/assets/404/particles.png";
import planetSvg from "@/assets/404/planet.svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type UnauthorizedState = {
  from?: string;
};

export default function Unauthorized() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as UnauthorizedState | null)?.from;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#120f20] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(248,113,113,0.16),transparent_30%)]" />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `url(${particlesImg})`,
          backgroundPosition: "center",
          backgroundRepeat: "repeat",
          backgroundSize: "360px",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,32,0.08),rgba(18,15,32,0.82))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-12 px-6 py-12 lg:flex-row lg:gap-8">
        <section className="max-w-xl text-center lg:text-left">
          <Badge className="rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100 hover:bg-white/10">
            Error 403
          </Badge>

          <p className="mt-6 text-6xl font-black tracking-[-0.04em] text-white sm:text-7xl">Access denied</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-100 sm:text-5xl">
            This route is outside your permission zone.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-8 text-slate-300 sm:text-lg">
            Your account is signed in, but it does not have access to the page you tried to open.
            {from ? " Please return to a page that matches your role." : ""}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="h-11 rounded-full bg-white px-5 text-slate-950 shadow-lg shadow-slate-950/20 hover:bg-slate-100"
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/">
                <Home className="size-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-100">
            <ShieldAlert className="size-4" />
            Only routes allowed for your current role can be opened here.
          </div>
        </section>

        <section className="relative flex w-full max-w-lg items-center justify-center">
          <div className="absolute h-72 w-72 rounded-full bg-amber-400/15 blur-3xl sm:h-80 sm:w-80" />
          <img
            src={planetSvg}
            alt=""
            aria-hidden="true"
            className="relative z-10 w-full max-w-[320px] animate-spin drop-shadow-[0_30px_80px_rgba(251,191,36,0.2)] sm:max-w-[380px]"
            style={{ animationDuration: "30s" }}
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
