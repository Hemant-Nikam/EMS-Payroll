import React from 'react';

const FooterComponent = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="modern-footer">
      <div className="container-xl d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 text-center text-md-start">
        <div className="d-flex align-items-center gap-2">
          <span className="status-dot"></span>
          <span>System Online &bull; Spring Boot + React + MySQL</span>
        </div>
        <div>
          <span>&copy; {currentYear} EMS Pro Portal &bull; All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
