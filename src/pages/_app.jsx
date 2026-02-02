import React from 'react'
import "@/styles/globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { footerInfos } from "@/utils/constants"
import { useRouter } from 'next/router'
import { verifyAuth } from "@/middlewares/auth"
import Head from 'next/head'

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()

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

      <div className="w-full h-screen">
        {!router.pathname.includes('login') &&
          !router.pathname.includes('register') && (
            <Header
              session={pageProps.session}
              entreprise={footerInfos.entreprise}
            />
          )}

        <Component {...pageProps} entreprise={footerInfos.entreprise} />

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