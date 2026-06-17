import { useEffect } from 'react';
import AOS from 'aos';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import AboutUs from './pages/AboutUs.jsx';
import Birds from './pages/Birds.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import Blogs from './pages/Blogs.jsx';
import Cart from './pages/Cart.jsx';
import ContactUs from './pages/ContactUs.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Flora from './pages/Flora.jsx';
import Gallery from './pages/Gallery.jsx';
import Home from './pages/Home.jsx';
import InsectsSpiders from './pages/InsectsSpiders.jsx';
import Landscapes from './pages/Landscapes.jsx';
import Mammals from './pages/Mammals.jsx';
import Miscellaneous from './pages/Miscellaneous.jsx';
import Products from './pages/Products.jsx';
import ReptilesAmphibians from './pages/ReptilesAmphibians.jsx';
import WhatsNew from './pages/WhatsNew.jsx';
import 'aos/dist/aos.css';

export const pages = [
  { name: 'Home', path: '/', component: Home },
  { name: "What's New", path: '/whats-new', component: WhatsNew },
  { name: 'About Us', path: '/about-us', component: AboutUs },
  { name: 'Gallery', path: '/gallery', component: Gallery },
  { name: 'Blogs', path: '/blogs', component: Blogs },
  { name: 'Products', path: '/products', component: Products, hidden: true },
  { name: 'Birds', path: '/birds', navPath: '/gallery/#birds', component: Birds },
  {
    name: 'Mammals',
    path: '/mammals',
    navPath: '/gallery/#mammals',
    component: Mammals,
  },
  {
    name: 'Insects & Spiders',
    path: '/insects-spiders',
    navPath: '/gallery/#insects-spiders',
    component: InsectsSpiders,
  },
  {
    name: 'Reptiles & Amphibians',
    path: '/reptiles-amphibians',
    navPath: '/gallery/#reptiles-amphibians',
    component: ReptilesAmphibians,
  },
  { name: 'Flora', path: '/flora', navPath: '/gallery/#flora', component: Flora },
  {
    name: 'Landscapes',
    path: '/landscapes',
    navPath: '/gallery/#landscapes',
    component: Landscapes,
  },
  {
    name: 'Miscellaneous',
    path: '/miscellaneous',
    navPath: '/gallery/#miscellaneous',
    component: Miscellaneous,
  },
];

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-out-cubic',
      offset: 120,
      once: true,
    });
  }, []);

  useEffect(() => {
    window.setTimeout(() => {
      AOS.refreshHard();
    }, 100);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.hash || location.state?.gallerySlug) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  }, [location.pathname, location.hash, location.state]);

  return (
    <>
      <Header pages={pages} />
      <Routes>
        {pages.map(({ path, component: Page }) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
        <Route path="/blogs/:slug" element={<BlogDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
