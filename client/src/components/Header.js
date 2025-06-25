import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom' // Untuk navigasi setelah logout
import { MdExitToApp } from "react-icons/md";
function Header() {
   const navigate = useNavigate()
   const location = useLocation()

   const getPageTitle = () => {
      const path = location.pathname
      let lastSegment = path.substring(path.lastIndexOf('/') + 1)
      if (lastSegment.length < 4) {
         lastSegment = path.substring(path.lastIndexOf('/', path.lastIndexOf('/') - 1) + 1, path.lastIndexOf('/'))
      }
      const formattedSegment = lastSegment.replace(/-/g, ' ')
      return formattedSegment.split(' ')
         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
         .join(' ') || 'Dashboard'
   }
   const handleLogout = () => {
      if (window.confirm("Apakah Anda yakin ingin keluar?")) {
         localStorage.removeItem('token')
         localStorage.removeItem('role')
         navigate('/login')
      }
   }

   return (
      <header className="top-0 right-0 left-64 h-12 bg-white shadow-md flex items-center justify-between px-6 ">
         {/* <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1> */}
         <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-m font-medium text-black bg-white rounded-md hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
         >
            <MdExitToApp size={24} className="mr-2"/>
            Keluar
         </button>
      </header>
   )
}

export default Header
