import React, { useState } from 'react';
import { Mail, Send, User, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { verifyAuth } from "@/middlewares/auth";
import { footerInfos } from '@/utils/constants';

export default function ContactPage({ session }) {
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: session ? session.nom : '',
        email: session ? session.email : '',
        message: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            setMessage({ type: 'error', text: 'Please fill in all required fields' });
            return;
        }

        try {
            setLoading(true);

            const response = await fetch('/api/contacts/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: formData.name,
                    email: formData.email,
                    msg: formData.message,
                    dateC: new Date().toISOString()
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitted(true);

                // Réinitialiser le formulaire après 3 secondes
                setTimeout(() => {
                    setFormData({
                        name: '',
                        email: '',
                        message: ''
                    });
                    setIsSubmitted(false);
                }, 3000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to send message' });
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            setMessage({ type: 'error', text: 'An error occurred while sending your message' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white comp">
            {/* Hero */}
            <div className="relative bg-gradient-to-r from-amber-700 to-amber-900 text-white">
                <div className="absolute inset-0 opacity-25">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30L0 0h60L30 30z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
                    <div className="flex items-center gap-3 mb-4 mt-10">
                        <Mail className="w-8 h-8" />
                        <h1 className="text-4xl sm:text-5xl font-bold">Contact Us</h1>
                    </div>
                    <p className="text-lg sm:text-xl text-amber-50 max-w-3xl leading-relaxed">
                        Have questions about our tours or need personalized advice? Our team is here to help you plan your perfect Moroccan adventure.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="">
                    <div className="">
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>

                            {message.text && (
                                <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success'
                                    ? 'bg-green-50 text-green-800 border-2 border-green-200'
                                    : 'bg-red-50 text-red-800 border-2 border-red-200'
                                    }`}>
                                    {message.type === 'success' ? (
                                        <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                    )}
                                    <span>{message.text}</span>
                                </div>
                            )}

                            {isSubmitted ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                                    <p className="text-gray-600 text-center">Thank you for contacting us. We'll get back to you soon.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    required
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                                    placeholder="Full name"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    required
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message *
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows="6"
                                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
                                                placeholder="Tell us about your travel plans or ask us any questions..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <p className="text-sm text-gray-500">* Required</p>
                                        <button
                                            onClick={handleSubmit}
                                            className="bg-gradient-to-r from-amber-700 to-amber-900 text-white px-8 py-3 rounded-lg font-semibold hover:from-amber-800 hover:to-amber-950 transition flex items-center gap-2"
                                        >
                                            <Send className="w-5 h-5" />
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="mt-12 bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Our Location
                </h3>

                <p className="text-gray-600 mb-6">
                    A123 Residence Soraya Bloc A Imm MHamid 9, Marrakech
                </p>

                <div className="w-full h-[200px] md:h-[600px] rounded-xl overflow-hidden border-2 border-amber-200">
                    <iframe
                        title="Google Maps Location"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(footerInfos.location)}&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </div>
    );
}

export async function getServerSideProps({ req, res }) {
    const user = verifyAuth(req, res);

    if (user) return {
        props: { session: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } },
    };

    else return {
        props: { session: null },
    };
}