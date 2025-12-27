import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Mail, Lock, User, CheckCircle, ChevronRight } from "lucide-react";
import { verifyAuth } from "@/middlewares/auth";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const router = useRouter();
  const { firstname, lastname, email } = router.query;
  const [step, setStep] = useState(0);
  const formRef = useRef(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    nom: lastname || "",
    prenom: firstname || "",
    email: email || "",
    password: "",
    confirmPassword: "",
  });

  const steps = [
    { label: "Enter Your Last Name", field: "nom", type: "text", required: true, icon: <User className="w-6 h-6 text-amber-600" /> },
    { label: "Enter Your First Name", field: "prenom", type: "text", required: true, icon: <User className="w-6 h-6 text-amber-600" /> },
    { label: "Enter Your Email", field: "email", type: "email", required: true, icon: <Mail className="w-6 h-6 text-amber-600" /> },
    { label: "Choose a Password", field: "password", type: "password", required: true, icon: <Lock className="w-6 h-6 text-amber-600" /> },
    { label: "Confirm Password", field: "confirmPassword", type: "password", required: true, icon: <Lock className="w-6 h-6 text-amber-600" /> },
  ];

  useEffect(() => {
    if (formRef.current) {
      gsap.fromTo(
        formRef.current,
        { x: "100%", opacity: 0 },
        { x: "0%", opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && step < steps.length - 1) handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, formData]);

  const handleNext = () => {
    const currentStep = steps[step];
    const value = formData[currentStep.field];
    if (currentStep.required && !value.trim()) {
      setError(`Please fill in the "${currentStep.label}" field.`);
      return;
    }
    if (currentStep.field === "email" && !value.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    if (formRef.current) {
      gsap.to(formRef.current, {
        x: "-100%",
        opacity: 0,
        duration: 0.5,
        onComplete: () => setStep((prev) => prev + 1),
      });
    }
  };

  const handlePrevious = () => {
    if (formRef.current) {
      gsap.to(formRef.current, {
        x: "100%",
        opacity: 0,
        duration: 0.5,
        onComplete: () => setStep((prev) => prev - 1),
      });
    }
  };

  const handleSubmit = async () => {
    const currentStep = steps[step];
    const value = formData[currentStep.field];
    if (currentStep.required && !value.trim()) {
      setError(`Please fill in the "${currentStep.label}" field.`);
      return;
    }
    if (currentStep.field === "email" && !value.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (currentStep.field === "confirmPassword" && formData.password !== formData.confirmPassword) {
      setError("Passwords don\'t match.");
      return;
    }
    try {
      const response = await fetch("/api/_auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message);
        return;
      }
      setSuccess(data.message);
      setTimeout(() => {
        window.location.href = "./";
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const currentStep = steps[step];
  const progress = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-8 py-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg">
              <Mail className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Sign Up</h2>
            <p className="text-amber-50 text-lg">Create your account</p>
          </div>
          {/* Progress Bar */}
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          {/* Form */}
          <div className="px-8 py-8">
            <div ref={formRef} className="relative">
              <h1 className="text-xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                {currentStep.icon} {currentStep.label}
              </h1>
              {error && (
                <p className="text-red-500 text-center mb-4 transition-all">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-green-500 text-center mb-4 transition-all">
                  {success}
                </p>
              )}
              <input
                type={currentStep.type}
                value={formData[currentStep.field]}
                onChange={(e) => handleChange(currentStep.field, e.target.value)}
                required={currentStep.required}
                className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                placeholder={`Enter your ${currentStep.field}`}
              />
              <div className="flex flex-row-reverse justify-between mt-6">
                {step < steps.length - 1 ? (
                  <button
                    className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl hover:bg-amber-700 flex items-center gap-2"
                    onClick={handleNext}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    className="p-3 w-fit bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center gap-2 justify-center"
                    onClick={handleSubmit}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Register
                  </button>
                )}
                {step > 0 && (
                  <button
                    className="p-3 bg-gray-200 rounded-xl hover:bg-gray-300 flex items-center gap-2"
                    onClick={handlePrevious}
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                    Previous
                  </button>
                )}
              </div>
            </div>
            <div className="text-center mt-6">
              <Link href="login" className="text-amber-600 hover:underline flex items-center justify-center gap-1">
                Already have an account? <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);
  if (user) {
    return {
      redirect: {
        destination: "./",
        permanent: false,
      },
    };
  }
  return { props: {} };
}