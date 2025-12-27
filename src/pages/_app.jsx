import React from 'react'
import styles from "@/styles/globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { footerInfos } from "@/utils/constants"
import { useRouter } from 'next/router'
import { verifyAuth } from "@/middlewares/auth";

export default function MyApp({ Component, pageProps }) {
    const router = useRouter();

    return (
        <div className='w-full h-screen'>
            {(!router.pathname.includes('login') && !router.pathname.includes('register')) &&
                <Header session={pageProps.session} entreprise={footerInfos.entreprise} />
            }
            <Component {...pageProps} entreprise={footerInfos.entreprise} />
            <Footer session={pageProps.session} isAdmin={router.pathname.includes('admin')} />
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