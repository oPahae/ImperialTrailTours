import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Mail, Lock, LogIn, ChevronRight } from "lucide-react";
import { useRouter } from "next/router";
import { verifyAuth } from "@/middlewares/auth";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const formRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        if (formRef.current) {
            gsap.fromTo(
                formRef.current,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
            );
        }
    }, []);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.email || !formData.password) {
            setError("Veuillez remplir tous les champs.");
            return;
        }

        try {
            const response = await fetch("/api/_auth/login", {
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
                router.push("/");
            }, 1500);
        } catch (err) {
            setError("Une erreur est survenue. Veuillez réessayer.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-md mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* En-tête du formulaire */}
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-8 py-12 text-center">
                        <div className="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg">
                            <LogIn className="w-10 h-10 text-amber-600" />
                        </div>
                        <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Login</h2>
                        <p className="text-amber-50 text-lg">Connectez-vous à votre compte</p>
                    </div>

                    {/* Formulaire */}
                    <div className="px-8 py-8">
                        <div ref={formRef} className="relative">
                            {error && (
                                <p className="text-red-500 text-center mb-4 transition-all">{error}</p>
                            )}
                            {success && (
                                <p className="text-green-500 text-center mb-4 transition-all">{success}</p>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Champ Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600" />
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            className="w-full pl-10 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                                            placeholder="Entrez votre email"
                                        />
                                    </div>
                                </div>

                                {/* Champ Mot de passe */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600" />
                                        <input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => handleChange("password", e.target.value)}
                                            className="w-full pl-10 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                                            placeholder="Entrez votre mot de passe"
                                        />
                                    </div>
                                </div>

                                {/* Bouton de soumission */}
                                <button
                                    type="submit"
                                    className="w-full p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl hover:bg-amber-700 flex items-center justify-center gap-2"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Se connecter
                                </button>
                            </form>

                            {/* Lien vers la page d'inscription */}
                            <div className="text-center mt-6">
                                <Link
                                    href="register"
                                    className="text-amber-600 hover:underline flex items-center justify-center gap-1"
                                >
                                    Pas encore de compte ? <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
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