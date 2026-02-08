import React, { useState, useEffect } from 'react'
import "@/styles/globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { footerInfos } from "@/utils/constants"
import { useRouter } from 'next/router'
import { verifyAuth } from "@/middlewares/auth"
import Head from 'next/head'
import { CalendarIcon, X } from 'lucide-react'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let timer;
    if (showNotification) {
      timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [showNotification]);

  return (
    <>
      <Head>
        <link rel="icon" href="/logo.png" />
        <title>{`${footerInfos.entreprise} - Découvrez le Maroc autrement`}</title>
        <meta
          name="description"
          content={`${footerInfos.entreprise} vous propose des circuits et excursions uniques à travers le Maroc. Explorez Marrakech, Casablanca, Fès et plus encore avec des guides locaux.`}
        />
        <meta
          name="keywords"
          content="Tours Maroc, Excursions Maroc, Marrakech, Casablanca, Fès, circuits touristiques, Imperial Trail Tours"
        />
        <meta name="author" content={footerInfos.entreprise} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="og:title"
          content={`${footerInfos.entreprise} - Découvrez le Maroc autrement`}
        />
        <meta
          property="og:description"
          content={`${footerInfos.entreprise} vous propose des circuits et excursions uniques à travers le Maroc.`}
        />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content={footerInfos.domaine} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${footerInfos.entreprise} - Découvrez le Maroc autrement`}
        />
        <meta
          name="twitter:description"
          content={`${footerInfos.entreprise} vous propose des circuits et excursions uniques à travers le Maroc.`}
        />
        <meta name="twitter:image" content="/logo.png" />
        <meta name="twitter:site" content="@ImperialTrailTours" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-white border-2 border-amber-500 rounded-lg shadow-2xl p-4 min-w-[320px] max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="text-amber-600" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Select a Date</h4>
                <p className="text-sm text-gray-600">Please choose your preferred departure date to continue with booking.</p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 animate-progress"
                style={{
                  animation: 'progress 3s linear'
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full h-screen">
        {!router.pathname.includes('login') &&
          !router.pathname.includes('register') && (
            <Header
              session={pageProps.session}
              entreprise={footerInfos.entreprise}
            />
          )}

        <Component {...pageProps}
          entreprise={footerInfos.entreprise}
          setShowNotification={setShowNotification}
        />

        <Footer
          session={pageProps.session}
          isAdmin={router.pathname.includes('admin')}
        />
      </div>
    </>
  )
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res)

  if (user && user.id) {
    return {
      props: {
        session: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
        },
      },
    }
  }

  return {
    props: { session: null },
  }
}