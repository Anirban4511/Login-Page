import React from 'react'
import Navbar from '../components/Navbar'
import Header from '../components/Header'

import bgImage from '../assets/bg_img.png';

const Home = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-cover bg-center' style={{ backgroundImage: `url(${bgImage})` }}>
      <Navbar/>
      <Header />
    </div>
  )
}

export default Home
