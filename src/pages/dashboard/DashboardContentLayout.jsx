import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header'

function DashboardContentLayout() {
  return (
    <>
    
      <Outlet/>
    </>
  )
}

export default DashboardContentLayout
