import React from 'react'
import { useState, useEffect } from 'react';
import { Menu, X, User, Upload } from 'lucide-react';
import Link from 'next/link';
import { navItems, NO_BANNER_ROUTES } from "@/utils/constants"
import { useRouter } from 'next/router';

const Header = ({ session, entreprise }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || NO_BANNER_ROUTES.includes(router.pathname) ? 'bg-white/20 backdrop-blur-3xl shadow-lg' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="./" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-transparent rounded-lg flex items-center justify-center shadow-lg">
              {/* <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18.5c-3.86-.96-6.5-4.55-6.5-8.5V8.3l6.5-3.25 6.5 3.25V12c0 3.95-2.64 7.54-6.5 8.5z" />
                <circle cx="12" cy="12" r="3" />
              </svg> */}
              <img src="/logo.png" className="w-full h-full" />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-bold tracking-tight ${scrolled || NO_BANNER_ROUTES.includes(router.pathname) ? 'text-gray-900' : 'text-white'}`}>
                {entreprise}
              </span>
              {/* <span className={`text-xs tracking-widest ${scrolled || NO_BANNER_ROUTES.includes(router.pathname) ? 'text-amber-600' : 'text-amber-300'}`}>
                EXPERIENCE MOROCCO
              </span> */}
            </div>
          </Link>

          {/* Pc */}
          <nav className="hidden lg:flex items-center space-x-4">
            {navItems.filter(nav => (
              nav.admin === router.pathname.includes("admin")
              &&
              (nav.titre !== "Me" || (session && nav.titre === "Me"))
            )).map((item, index) => (
              <Link
                key={index}
                href={`${item.href}`}
                className={`px-4 py-2 rounded-lg text-md font-medium transition-all duration-200 ${scrolled || NO_BANNER_ROUTES.includes(router.pathname)
                  ? 'text-gray-700 hover:text-amber-600 hover:bg-amber-50'
                  : 'text-white hover:bg-white/10'
                  }`}
              >
                {item.titre === 'Me' && session ?
                  <div className='flex gap-2 justify-center items-center'>
                    <User size={28} />
                    {session.prenom.slice(0, 10)}
                    {session.prenom.length > 10 && '...'}
                  </div>
                  :
                  item.titre
                }
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg ${scrolled || NO_BANNER_ROUTES.includes(router.pathname) ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Tel */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed w-full top-16 shadow-2xl bg-white/98 backdrop-blur-md border-t border-gray-200">
          <div className="px-6 py-4 space-y-2">
            {navItems.filter(nav => (
              nav.admin === router.pathname.includes("admin")
              &&
              (nav.titre !== "Me" || (session && nav.titre === "Me"))
            )).map((item, index) => (
              <a
                key={index}
                href={`${item.href}`}
                className="block px-4 py-3 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.titre === 'Me' && session ?
                  <div className='flex gap-2 justify-start items-center -translate-x-2'>
                    <User size={28} />
                    {session.prenom.slice(0, 19)}
                    {session.prenom.length > 19 && '...'}
                  </div>
                  :
                  item.titre
                }
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header