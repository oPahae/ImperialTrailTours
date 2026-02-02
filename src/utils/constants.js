import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

export const NO_BANNER_ROUTES = [
    "/tour", "/admin/tours", "/reserver", "/admin/ajouterTour", "/admin/modifierTour", "/admin/reservations",
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
        description: "Voyages thématiques conçus pour des groupes partageant les mêmes intérêts : culture, gastronomie, aventure ou bien-être. Une expérience sur mesure pour votre passion.",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
        color: "#D4A574"
    },
    {
        id: 3,
        title: "MICE",
        description: "Solutions professionnelles pour vos événements d'entreprise : conférences, incentives, séminaires et team building dans les lieux les plus prestigieux du Maroc.",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        color: "#4A7C59"
    },
    {
        id: 4,
        title: "Weddings",
        description: "Célébrez votre union dans la magie du Maroc. Organisation complète de mariages et lunes de miel inoubliables dans des cadres exceptionnels.",
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
        color: "#8B6F47"
    },
    {
        id: 5,
        title: "Tailored Travel",
        description: "Votre voyage, vos règles. Des itinéraires entièrement personnalisés selon vos envies, votre rythme et vos centres d'intérêt pour une expérience unique.",
        image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=800&q=80",
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
        description: "La perle du Sud, avec ses souks animés, le jardin Majorelle et la place Jemaa el-Fna. Une ville où tradition et modernité se rencontrent.",
        image: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=800&q=80"
    },
    {
        id: 2,
        name: "Chefchaouen",
        description: "La ville bleue nichée dans les montagnes du Rif, offrant des ruelles pittoresques et une atmosphère paisible unique.",
        image: "https://images.unsplash.com/photo-1585462612241-01a2f837d53d?w=800&q=80"
    },
    {
        id: 3,
        name: "Fès",
        description: "Capitale spirituelle du Maroc, abritant la plus ancienne université du monde et une médina classée au patrimoine mondial.",
        image: "https://images.unsplash.com/photo-1566465497207-e8e5c0c2c2b6?w=800&q=80"
    },
    {
        id: 4,
        name: "Essaouira",
        description: "Ville côtière fortifiée, réputée pour ses plages venteuses, son port de pêche authentique et son festival de musique Gnaoua.",
        image: "https://images.unsplash.com/photo-1608106250061-86f118de58c6?w=800&q=80"
    },
    {
        id: 5,
        name: "Merzouga",
        description: "Porte du désert du Sahara, offrant des dunes dorées spectaculaires et des nuits étoilées inoubliables.",
        image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&q=80"
    },
    {
        id: 6,
        name: "Casablanca",
        description: "Métropole moderne du Maroc, célèbre pour la Mosquée Hassan II et son mélange architectural art déco et mauresque.",
        image: "https://images.unsplash.com/photo-1591439657848-9f4b9ce436b9?w=800&q=80"
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
    rib: '1234 5678 9012 3456 7890',
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