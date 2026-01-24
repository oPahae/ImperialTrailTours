import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, LogOut } from 'lucide-react';
import { navItems, socialLinks, footerInfos } from '@/utils/constants';
import Link from 'next/link';

const Footer = ({ session, isAdmin }) => {
  const [email, setEmail] = useState(!isAdmin && session ? session.email : '');
  const [fullname, setFullname] = useState(!isAdmin && session ? `${session.nom} ${session.prenom}` : '');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !fullname || !feedback || !rating) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await fetch("/api/general/addReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: fullname,
          dateR: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
          contenu: feedback,
          netoiles: rating,
        }),
      });

      const data = await response.json();

      if (data.message === "success") {
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setEmail('');
          setFullname('');
          setFeedback('');
          setRating(5);
        }, 3000);
      } else {
        alert(data.message || "Une erreur est survenue.");
      }
    } catch (err) {
      alert("Erreur lors de l'envoi du formulaire : " + err.message);
    }
  };

  const handleLogout = () => {
    fetch('/api/_auth/adminLogout').then(res => res.json()).then(data => {
      if (data.message === 'success')
        window.location.reload();
      else
        alert(data.message)
    }).catch(err => alert(err))
  }

  return (
    <footer className="relative bg-gradient-to-br from-[#F4EFEA] via-white to-[#F4EFEA] overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C0392B' fill-opacity='1'%3E%3Cpath d='M30 30l15-15v30L30 30zm0 0l-15 15V15l15 15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />

      <div className="h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative max-w-7xl mx-auto px-6 py-16 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

          <motion.div variants={itemVariants} className="space-y-6">
            <div className="relative inline-block">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#C0392B] via-[#D4AF37] to-[#004E64] bg-clip-text text-transparent">
                {footerInfos.entreprise}
              </h2>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#D4AF37] to-transparent" />
            </div>

            <p className="text-gray-700 leading-relaxed text-sm">
              Discover Morocco through authentic experiences, crafted with passion and elegance.
              Your journey to unforgettable memories starts here.
            </p>

            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-white border border-[#D4AF37]/20 flex items-center justify-center text-[#C0392B] hover:bg-gradient-to-br hover:from-[#C0392B] hover:to-[#004E64] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-semibold text-[#004E64] flex items-center gap-2">
              <span className="w-8 h-0.5 bg-[#D4AF37]" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {navItems.filter(nav => isAdmin ? nav.admin : !nav.admin).map((link, idx) => (
                <motion.li key={idx}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center text-gray-700 hover:text-[#C0392B] transition-colors duration-300"
                  >
                    <span className="relative">
                      {link.titre}
                      <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
                    </span>
                    <motion.span
                      initial={{ x: -5, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                      className="ml-1"
                    >
                      →
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-semibold text-[#004E64] flex items-center gap-2">
              <span className="w-8 h-0.5 bg-[#D4AF37]" />
              Contact Info
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37]/10 to-[#C0392B]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <MapPin size={18} className="text-[#C0392B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Our Location</p>
                  <p className="text-sm text-gray-600">{footerInfos.location}</p>
                </div>
              </li>

              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37]/10 to-[#004E64]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Phone size={18} className="text-[#004E64]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Phone</p>
                  <a href={`wa.me/${footerInfos.tel}`} className="text-sm text-gray-600 hover:text-[#C0392B] transition-colors">
                    {footerInfos.tel}
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#004E64]/10 to-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Mail size={18} className="text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Email</p>
                  <a href={`mailto:${footerInfos.email}`} className="text-sm text-gray-600 hover:text-[#C0392B] transition-colors">
                    {footerInfos.email}
                  </a>
                </div>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xl font-semibold text-[#004E64] flex items-center gap-2">
              <span className="w-8 h-0.5 bg-[#D4AF37]" />
              {isAdmin ? 'Session actions' : 'Give us a feedback'}
            </h3>

            {!isAdmin ?
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative space-y-3">
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="Full name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#D4AF37]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 text-sm"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#D4AF37]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 text-sm"
                  />
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Say something"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-[#D4AF37]/30 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 text-sm"
                  />
                  {/* Ajout de l'input range pour les étoiles */}
                  <div className="flex items-center gap-4">
                    <label htmlFor="rating" className="text-sm font-medium text-gray-800">
                      Rating:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        id="rating"
                        name="rating"
                        min="1"
                        max="5"
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                        className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-medium text-gray-800">
                        {rating} <span className="text-yellow-500">★</span>
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#C0392B] to-[#004E64] text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                >
                  {isSubmitted ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-2"
                    >
                      ✓ Sent!
                    </motion.span>
                  ) : (
                    <>
                      Send
                      <Send size={16} />
                    </>
                  )}
                </motion.button>
              </form>
              :
              <div onClick={handleLogout} className='w-fit text-white font-bold bg-amber-500 hobver:bg-amber-600 cursor-pointer px-4 py-2 rounded-xl shadow-2xl text-center flex gap-3'>
                <LogOut size={24} />
                <span>Logout</span>
              </div>
            }

            {isSubmitted && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-green-600 font-medium"
              >
                Thank you for subscribing!
              </motion.p>
            )}
          </motion.div>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#D4AF37]/20" />
          </div>
          <div className="relative flex justify-center">
            <div className="w-12 h-1 bg-gradient-to-r from-[#C0392B] via-[#D4AF37] to-[#004E64] rounded-full" />
          </div>
        </div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600"
        >
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} <span className="font-semibold text-[#C0392B]">{footerInfos.entreprise}</span>. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="privacy.html" className="hover:text-[#C0392B] transition-colors duration-300">
              Privacy Policy
            </a>
            {/* <span className="text-[#D4AF37]">•</span>
            <Link href="terms" className="hover:text-[#C0392B] transition-colors duration-300">
              Terms of Service
            </Link> */}
          </div>
        </motion.div>
      </motion.div>

      <div className="h-2 bg-gradient-to-r from-[#C0392B] via-[#D4AF37] to-[#004E64]" />
    </footer>
  );
};

export default Footer;