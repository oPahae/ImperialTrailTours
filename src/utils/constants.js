import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

export const NO_BANNER_ROUTES = [
    "/tour", "/admin/tours", "/reserver", "/reserver-daily", "/admin/ajouterTour", "/admin/modifierTour", "/admin/reservations",
    "/admin/blog", "/admin/ajouterBlog", "/admin/modifierBlog", "/me", "/about", "/privacy", "/myreservations", "/profile"
];

export const navItems = [
    {
        titre: "Destinations",
        href: "destinations",
        admin: false,
    },
    {
        titre: "About",
        href: "about",
        admin: false,
    },
    {
        titre: "Blogs",
        href: "blogs",
        admin: false,
    },
    {
        titre: "Contact Us",
        href: "contact",
        admin: false,
    },
    {
        titre: "FAQ",
        href: "faq",
        admin: false,
    },
    {
        titre: "My Reservations",
        href: "myreservations",
        admin: false,
    },
    {
        titre: "Profile",
        href: "profile",
        admin: false,
    },
    ////////////////////////////////////
    {
        titre: "Dashboard",
        href: "stats",
        admin: true,
    },
    {
        titre: "Reservations",
        href: "reservations",
        admin: true,
    },
    {
        titre: "Tours",
        href: "tours",
        admin: true,
    },
    {
        titre: "Blogs",
        href: "blogs",
        admin: true,
    },
    {
        titre: "Contacts",
        href: "contacts",
        admin: true,
    },
];

export const travelTypes = [
    {
        id: 2,
        title: "Affinity Travels",
        description: "Themed journeys designed for groups sharing the same interests: culture, gastronomy, adventure, or wellness. A tailor-made experience for your passion.",
        image: "/travelType1.jpg",
        color: "#D4A574"
    },
    {
        id: 3,
        title: "MICE",
        description: "Professional solutions for your corporate events: conferences, incentives, seminars, and team-building experiences in the most prestigious locations in Morocco.",
        image: "/travelType2.png",
        color: "#4A7C59"
    },
    {
        id: 4,
        title: "Weddings",
        description: "Celebrate your union in the magic of Morocco. Full-service wedding planning and unforgettable honeymoons in exceptional settings.",
        image: "/travelType3.jpg",
        color: "#8B6F47"
    },
    {
        id: 5,
        title: "Tailored Travel",
        description: "Your trip, your rules. Fully customized itineraries based on your desires, pace, and interests for a truly unique experience.",
        image: "/travelType4.jpg",
        color: "#2C5F7C"
    }
];

export const inspirations = [
    {
        id: 1,
        title: "Women's Groups",
        description: "Empower your journey with like-minded travelers. Experience Morocco's vibrant culture, bustling souks, and serene landscapes in the company of inspiring women.",
        image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
        color: "from-rose-400 to-orange-300"
    },
    {
        id: 2,
        title: "Jewish Heritage",
        description: "Discover Morocco's rich Jewish history. Visit ancient synagogues, explore mellah quarters, and connect with centuries of Sephardic culture and tradition.",
        image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80",
        color: "from-blue-400 to-cyan-300"
    },
    {
        id: 3,
        title: "Adventure",
        description: "Trek the Atlas Mountains, ride camels through golden dunes, and surf Atlantic waves. Morocco awaits your adventurous spirit.",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
        color: "from-amber-400 to-yellow-300"
    },
    {
        id: 4,
        title: "Romance",
        description: "Enchant your senses in Morocco's most romantic settings. From Marrakech riads to Sahara sunsets, create unforgettable memories together.",
        image: "https://images.unsplash.com/photo-1557180295-76eee20ae8aa?w=800&q=80",
        color: "from-pink-400 to-rose-300"
    },
    {
        id: 5,
        title: "Design",
        description: "Immerse yourself in Morocco's architectural wonders. Explore intricate zellige mosaics, cedar carvings, and contemporary Moroccan design.",
        image: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800&q=80",
        color: "from-teal-400 to-emerald-300"
    },
    {
        id: 6,
        title: "Yoga & Wellness",
        description: "Rejuvenate mind and body. Practice yoga in peaceful riads, indulge in traditional hammams, and find tranquility in Morocco's serene landscapes.",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
        color: "from-purple-400 to-indigo-300"
    },
];

export const whatwedoinfos = [
    { number: '10+', label: 'Years Experience' },
    { number: '5000+', label: 'Happy Travelers' },
    { number: '100%', label: 'Local Guides' },
    { number: '50+', label: 'Destinations' }
];

export const destinations = [
    {
        id: 1,
        name: "Marrakech",
        description: "The Pearl of the South, with its lively souks, the Majorelle Garden, and Jemaa el-Fna Square. A city where tradition and modernity meet.",
        image: "/marrakech.jpg"
    },
    {
        id: 2,
        name: "Chefchaouen",
        description: "The Blue City nestled in the Rif Mountains, offering picturesque alleyways and a uniquely peaceful atmosphere.",
        image: "/chefchaouen.jpg"
    },
    {
        id: 3,
        name: "Fes",
        description: "The spiritual capital of Morocco, home to the world’s oldest university and a medina listed as a UNESCO World Heritage site.",
        image: "/fes.jpg"
    },
    {
        id: 4,
        name: "Essaouira",
        description: "A fortified coastal city, known for its windy beaches, authentic fishing port, and the Gnaoua World Music Festival.",
        image: "/essaouira.jpg"
    },
    {
        id: 5,
        name: "Merzouga",
        description: "Gateway to the Sahara Desert, offering spectacular golden dunes and unforgettable starry nights.",
        image: "/merzouga.jpg"
    },
    {
        id: 6,
        name: "Casablanca",
        description: "A modern Moroccan metropolis, famous for the Hassan II Mosque and its blend of Art Deco and Moorish architecture.",
        image: "/casablanca.jpeg"
    }
];

export const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' },
];

export const footerInfos = {
    entreprise: "Imperial Trail Tours",
    tel: "+212 661-377968",
    email: "contact@imperialtrailtours.com",
    location: "A123 Residence Soraya Bloc A Imm MHamid 9, Marrakech",
    domaine: "https://www.imperialtrailtours.com",
    bank: [
        { title: 'ribTitle', value: 'MR JAMAI YOUSSEF (Manager)' },
        { title: 'rib', value: '145 450 2111194938690024 21' },
        { title: 'iban', value: 'MA64 - 145450211119493869002421' },
        { title: 'swift', value: 'BCPOMAMC' },
        { title: 'bankPopular', value: 'Banque Populaire – INARA' },
    ],
}

export const destination = {
    name: 'Find a destination for you',
    descr: 'Discover unique places around the world tailored to your interests and travel style. Whether you seek adventure, relaxation, or cultural experiences, find the perfect destination that matches your dreams.'
};

export const types = ['Cultural', 'Adventure', 'Desert', 'Coastal', 'Mountain', 'City'];

export const AIQuestions = [
    'I want to speak to a human',
    'Which tours have the highest ratings'
]