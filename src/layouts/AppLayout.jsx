import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        <Outlet />
      </main>
    </>
  );
};

export default AppLayout;