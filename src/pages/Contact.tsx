import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Clock,
  Headphones,
  Loader,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/shared/header";
import Footer from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";

interface ContactPageProps {
  onNavigate: (page: string) => void;
  onCartClick: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  isLoggedIn?: boolean;
  user?: { firstName?: string; lastName?: string; email?: string };
  onLogout?: () => void;
  cartItemCount?: number;
}

export function ContactPage({
  onNavigate,
  onCartClick,
  onLoginClick,
  onRegisterClick,
  isLoggedIn = false,
  user,
  onLogout,
  cartItemCount = 0,
}: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitMessage("Thank you for your message! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error) {
      console.log(error);
      setSubmitMessage("Error sending message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      content: "+86 2317046",
      subtext: "Available every day for quick support",
    },
    {
      icon: Mail,
      title: "Email",
      content: "mumcare@gmail.com",
      subtext: "We usually reply within 24 hours",
    },
    {
      icon: MapPin,
      title: "Store",
      content: "FPT University, District 9",
      subtext: "Ho Chi Minh City, Vietnam",
    },
    {
      icon: Clock,
      title: "Hours",
      content: "Mon - Sat: 8:00 - 20:00",
      subtext: "Sun: 9:00 - 18:00",
    },
  ];

  const faqs = [
    {
      question: "How quickly will MumCare respond?",
      answer: "Most messages receive a reply within 24 hours during business days.",
    },
    {
      question: "Can I ask for product recommendations?",
      answer: "Yes. You can tell us your needs and we will help suggest suitable products.",
    },
    {
      question: "Can I visit the store directly?",
      answer: "Yes. You can visit during business hours and our team will be happy to assist you.",
    },
  ];

  const inputClassName =
    "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100";

  const textareaClassName =
    "min-h-[150px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 resize-none";

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,rgba(253,242,248,0.65),rgba(255,255,255,1)_18%,rgba(239,246,255,0.85)_100%)]">
      <Header
        cartItemCount={cartItemCount}
        onCartClick={onCartClick}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
        isLoggedIn={isLoggedIn}
        user={user}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <main className="container mx-auto flex-1 px-4 py-8 sm:py-10">
        <section className="overflow-hidden rounded-[34px] border border-white/80 bg-white/88 p-6 shadow-[0_32px_80px_-60px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
            <div>
              <Badge className="rounded-full bg-[linear-gradient(135deg,#ec4899,#0ea5e9)] px-4 py-1.5 text-sm font-semibold text-white shadow-sm">
                <Sparkles className="mr-1 size-4" />
                Contact MumCare
              </Badge>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Reach out whenever you need a little extra support.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Whether you have a question about products, delivery, rewards, or recommendations, the MumCare team is
                here to help you with clear and friendly guidance.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-11 rounded-full bg-slate-950 px-5 text-white hover:bg-slate-900">
                  <a href="mailto:mumcare@gmail.com">Email support</a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-full border-slate-200 bg-white px-5 text-slate-800 hover:bg-slate-50"
                >
                  <a href="tel:+862317046">Call MumCare</a>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {contactInfo.map((info) => {
                const IconComponent = info.icon;
                return (
                  <div
                    key={info.title}
                    className="rounded-[28px] border border-slate-100 bg-slate-50 px-5 py-5 shadow-sm"
                  >
                    <div className="inline-flex rounded-2xl bg-[linear-gradient(135deg,rgba(244,114,182,0.14),rgba(14,165,233,0.14))] p-3">
                      <IconComponent className="size-5 text-pink-600" />
                    </div>
                    <h2 className="mt-4 text-lg font-black text-slate-900">{info.title}</h2>
                    <p className="mt-2 text-base font-semibold text-slate-800">{info.content}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{info.subtext}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
            <CardContent className="p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Send A Message</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Tell us what you need</h2>
              <p className="mt-3 text-base leading-8 text-slate-600">
                Share your question and we will follow up as quickly as possible.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={inputClassName}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className={inputClassName}
                      placeholder="your.email@gmail.com"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={inputClassName}
                      placeholder="+84 123 456 789"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className={inputClassName}
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className={textareaClassName}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                {submitMessage && (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      submitMessage.includes("Thank")
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-full bg-slate-950 text-white hover:bg-slate-900"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="size-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="size-5" />
                      Send message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Visit MumCare</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Stop by our store</h2>
                <div className="mt-6 flex h-72 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,rgba(244,114,182,0.12),rgba(14,165,233,0.12))]">
                  <div className="text-center">
                    <div className="mx-auto inline-flex rounded-full bg-white p-4 shadow-sm">
                      <MapPin className="size-8 text-pink-600" />
                    </div>
                    <p className="mt-4 text-lg font-black text-slate-900">FPT University, District 9</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">Ho Chi Minh City, Vietnam</p>
                  </div>
                </div>
                <p className="mt-5 text-base leading-8 text-slate-600">
                  Our team is happy to help with product guidance, order questions, and practical recommendations for
                  daily mom-and-baby care.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border border-white/80 bg-white/88 shadow-[0_28px_72px_-50px_rgba(15,23,42,0.35)]">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-2xl bg-sky-100 p-3">
                    <Headphones className="size-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Support Notes</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-950">Quick answers</h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.question} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="mt-0.5 size-4 shrink-0 text-pink-500" />
                        <div>
                          <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                          <p className="mt-2 text-sm leading-7 text-slate-600">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer setCurrentPage={onNavigate} />
    </div>
  );
}
