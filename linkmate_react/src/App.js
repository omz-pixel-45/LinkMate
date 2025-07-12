import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './home/home';
import LoginForm from './login.signup/login';
import SignUpForm from './login.signup/signup';
import DetailsForm from './portfolio/details';
import LinkInputForm from './links/links';
import Preview from './preview/preview';
import ShowSharedLinks from './shared/shared';
import LinkChange from './links/linkschange';
import PrivacyPolicy from './others/privacy';
import About from './others/about';
import Contact from './others/contact';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/portfolio" element={<DetailsForm />} />
        <Route path='/links' element={<LinkInputForm />} />
        <Route path='/linkpreview' element={<Preview />} />
        <Route path='/linkshare' element={<ShowSharedLinks />} />
        <Route path='/linkschange' element={<LinkChange />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Catch-all route */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
