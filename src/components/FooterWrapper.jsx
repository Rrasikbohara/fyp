import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';

const FooterWrapper = () => {
  const location = useLocation();
  // Do not show Footer on dashboard or admin pages
  if (location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin")) {
    return null;
  }
  return <Footer />;
};

export default FooterWrapper;
