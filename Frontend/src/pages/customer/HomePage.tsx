import React from 'react'
import "./HomePage.css"
import Navbar from '../../components/customer/CustomerNavbar'
import AnnouncementsSection from '../../components/customer/HomePage/AnnouncementsSection'
import SuggestedCompanies from '../../components/customer/HomePage/SuggestedCompanies'
import ContractsTable from '../../components/customer/HomePage/ContractsTable'


const HomePage = () => {
  return (
    <>
   <Navbar />
   
      <AnnouncementsSection />
      <SuggestedCompanies />
      <ContractsTable />
    
    </>
  )
}

export default HomePage