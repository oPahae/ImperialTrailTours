import React from 'react';
import { MapPin, Users, Award, Globe, Heart, Shield, Star, Clock, Compass, Mountain, Camera, Map } from 'lucide-react';
import Link from 'next/link';
import { verifyAuth } from "@/middlewares/auth";
import { footerInfos } from '@/utils/constants';

export default function AboutPage() {
    const stats = [
        { icon: Users, value: '10,000+', label: 'Happy Travelers' },
        // { icon: Award, value: '15+', label: 'Years Experience' },
        { icon: MapPin, value: '50+', label: 'Destinations' },
        // { icon: Star, value: '4.9', label: 'Average Rating' }
    ];

    const values = [
        {
            icon: Heart,
            title: 'Passion for Morocco',
            description: 'We are deeply passionate about sharing the beauty, culture, and traditions of Morocco with travelers from around the world.'
        },
        {
            icon: Shield,
            title: 'Safety First',
            description: 'Your safety and comfort are our top priorities. We work with certified guides and maintain the highest safety standards.'
        },
        {
            icon: Globe,
            title: 'Authentic Experiences',
            description: 'We create genuine cultural experiences that connect you with local communities and Moroccan traditions.'
        },
        {
            icon: Award,
            title: 'Excellence',
            description: 'We strive for excellence in every detail, from planning to execution, ensuring unforgettable journeys.'
        }
    ];

    const highlights = [
        {
            icon: Compass,
            title: 'Expert Local Guides',
            description: 'All our guides are born and raised in Morocco, offering insider knowledge and authentic perspectives.'
        },
        {
            icon: Mountain,
            title: 'Unique Itineraries',
            description: 'Carefully crafted routes that showcase both famous landmarks and hidden gems off the beaten path.'
        },
        {
            icon: Camera,
            title: 'Memorable Moments',
            description: 'We create opportunities for stunning photography and unforgettable cultural encounters.'
        },
        {
            icon: Map,
            title: 'Flexible Options',
            description: 'Choose from group tours or private experiences tailored to your preferences and schedule.'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-amber-700 to-amber-900 text-white">
                <div className="absolute inset-0 opacity-25">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30L0 0h60L30 30z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">About Our Journey</h1>
                        <p className="text-lg sm:text-xl text-amber-50 max-w-3xl mx-auto leading-relaxed">
                            Sharing the magic of Morocco with the world, one unforgettable journey at a time
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                {/* Stats Section */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100 hover:shadow-lg transition-shadow">
                            <stat.icon className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-600">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Our Story Section */}
                <div className="mb-16">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                            <div className="space-y-4 text-gray-700 leading-relaxed">
                                <p>
                                    Founded in 2026, our agency was born from a simple vision: to share the incredible beauty and rich culture of Morocco with travelers seeking authentic experiences. What started as a small family business has grown into one of Morocco's most trusted tour operators.
                                </p>
                                <p>
                                    We believe that travel is more than just visiting places—it's about creating connections, understanding cultures, and making memories that last a lifetime. Every tour we organize is designed to immerse you in the heart of Moroccan life, from bustling souks to serene desert landscapes.
                                </p>
                                <p>
                                    Our team consists of passionate locals who know every corner of this magnificent country. We take pride in showing you not just the Morocco of postcards, but the Morocco we call home—authentic, vibrant, and endlessly fascinating.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?w=800&h=600&fit=crop"
                                alt="Morocco landscape"
                                className="rounded-xl shadow-xl w-full h-auto"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-amber-600 text-white p-6 rounded-lg shadow-lg max-w-xs hidden sm:block">
                                <p className="font-semibold text-lg">Creating memories in Morocco</p>
                                <p className="text-amber-100 text-sm mt-1">{footerInfos.entreprise}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our Values */}
                <div className="mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10 text-center">Our Values</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                                <value.icon className="w-12 h-12 text-amber-600 mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* What Makes Us Different */}
                <div className="mb-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 sm:p-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10 text-center">What Makes Us Different</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {highlights.map((highlight, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center">
                                        <highlight.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{highlight.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{highlight.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl p-8 sm:p-12 text-center text-white">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Explore Morocco?</h2>
                    <p className="text-lg text-amber-50 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied travelers who have discovered the magic of Morocco with us. Your adventure awaits!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="./destinations" className="bg-white text-amber-700 px-8 py-3 rounded-lg font-semibold hover:bg-amber-50 transition inline-block">
                            Browse Tours
                        </Link>
                        <Link href="./contact" className="bg-amber-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-900 transition inline-block border-2 border-amber-600">
                            Contact Us
                        </Link>
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