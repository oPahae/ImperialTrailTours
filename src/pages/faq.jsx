import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, Search, Mail, Phone, MessageCircle, CreditCard, Calendar, MapPin, Users, Shield, Clock } from 'lucide-react';
import { verifyAuth } from "@/middlewares/auth";

export default function FAQPage() {
    const [openFAQ, setOpenFAQ] = useState(null);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/contacts/getFaqs');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch FAQs');
            }

            setFaqs(data.faqs);
        } catch (err) {
            console.error("Error fetching FAQs:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleFAQ = (id) => {
        setOpenFAQ(openFAQ === id ? null : id);
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (faq.answer && faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white comp flex items-center justify-center">
                <div className="text-lg text-gray-600">Loading FAQs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white comp">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading FAQs</h3>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white comp">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-amber-700 to-amber-900 text-white">
                <div className="absolute inset-0 opacity-25">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30L0 0h60L30 30z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
                    <div className="flex items-center gap-3 mb-4 mt-10">
                        <HelpCircle className="w-8 h-8" />
                        <h1 className="text-4xl sm:text-5xl font-bold">Frequently Asked Questions</h1>
                    </div>
                    <p className="text-lg sm:text-xl text-amber-50 max-w-3xl leading-relaxed">
                        Find answers to common questions about booking tours, payments, travel information, and more. Can't find what you're looking for? Contact our support team.
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="relative max-w-2xl mx-auto">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="max-w-4xl mx-auto mb-12">
                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-12">
                            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-600">Try adjusting your search or browse different categories</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFaqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-amber-300 transition-colors"
                                >
                                    <button
                                        onClick={() => toggleFAQ(faq.id)}
                                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-amber-50 transition-colors"
                                    >
                                        <span className="font-semibold text-gray-900 text-lg pr-4">
                                            {faq.question}
                                        </span>
                                        <ChevronDown
                                            className={`w-6 h-6 text-amber-700 flex-shrink-0 transition-transform ${
                                                openFAQ === faq.id ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                    {openFAQ === faq.id && (
                                        <div className="px-6 pb-5 pt-2 text-gray-700 leading-relaxed border-t border-gray-100">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Tips */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <Calendar className="w-8 h-8 text-amber-700 mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">Book in Advance</h4>
                        <p className="text-sm text-gray-600">Reserve 2-3 weeks ahead for the best availability</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <CreditCard className="w-8 h-8 text-amber-700 mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">Flexible Payment</h4>
                        <p className="text-sm text-gray-600">30% deposit to secure, balance 15 days before</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <Shield className="w-8 h-8 text-amber-700 mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">Travel Insurance</h4>
                        <p className="text-sm text-gray-600">Recommended for peace of mind during your trip</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                        <Clock className="w-8 h-8 text-amber-700 mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
                        <p className="text-sm text-gray-600">Emergency assistance available anytime</p>
                    </div>
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