import React, { useEffect, useState } from 'react' 
import Hero from "@/components/Hero"
import Philosophy from "@/components/Philosophy"
import Whatwedo from "@/components/Whatwedo"
import Destinations from "@/components/Destinations"
import Styles from "@/components/Styles"
import Getinspired from "@/components/Getinspired"
import Team from "@/components/Team"
import Reviews from "@/components/Reviews"
import ChatAI from "@/components/ChatAI"
import { verifyAuth } from "@/middlewares/auth";

const index = ({ session, entreprise }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div onClick={() => setIsOpen(false)}>
      <Hero session={session} entreprise={entreprise} />
      <Philosophy entreprise={entreprise} />
      <Whatwedo entreprise={entreprise} />
      <Destinations entreprise={entreprise} />
      <Styles entreprise={entreprise} />
      <Getinspired entreprise={entreprise} />
      {/* <Team entreprise={entreprise} /> */}
      <Reviews entreprise={entreprise} />
      <ChatAI isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}

export default index;

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);
  console.log(user)

  if(user && user.id) return {
    props: { session: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email } },
  };

  else return {
    props: { session: null },
  };
}
