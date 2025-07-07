import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './preview.css';
import {
  FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaGlobe, FaShareAlt, FaCopy, FaTimes, FaInstagram, FaFacebook, FaYoutube, FaBriefcase, FaBlog,
  FaEdit
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6'; // For "X" icon
import logo from '../logo.png';
import ServerLink from '../serverLink';

const iconMap = {
  website: <FaGlobe />,
  instagram: <FaInstagram />,
  facebook: <FaFacebook />,
  youtube: <FaYoutube />,
  twitter: <FaXTwitter />,   // Using X icon instead of bird
  linkedin: <FaLinkedin />,
  github: <FaGithub />,
  portfolio: <FaBriefcase />,
  blog: <FaBlog />,
  email: <FaEnvelope />,
  other: <FaGlobe />  // Default
};



function getIcon(type) {
  return iconMap[type.toLowerCase()] || <FaGlobe />;
}



function Preview() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showShare, setShowShare] = useState(false);

  const u = searchParams.get('u');

  function editPortfolio(){
    console.log(u);
    window.location.href = `/portfolio?u=${u}&change=yes`;
  }

  function editLinks(){
    window.location.href = `/linkschange?u=${u}`;
  }

  useEffect(() => {
    if (!u) return;

    fetch( ServerLink('/preview'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ u })
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) return <div className="loading-screen">Fetching data...</div>;
  if (!profile) return <div className="error">No profile found.</div>;

  const { picLinkPath, fname, lname, workTitle, about, links, shareLink } = profile;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="section section-top">
          <img src={picLinkPath} alt="Profile" className="profile-pic" />
          <div className="profile-details">
            <h1 className="fade-in-name">{fname} {lname}</h1>
            <h3 className="fade-in-title">{workTitle}</h3>
            <p className="fade-in-about">{about}</p>
          </div>
        </div>
        <hr className="dotted-line" />
        <div className="section section-bottom">
          <div className="links-list">
            {links.map((link, i) => (
              <a key={i} href={link.link} target="_blank" rel="noreferrer" className="link-item">
                {getIcon(link.type)} <span>{link.name}</span>
              </a>
            ))}
          </div>
          <div>
            <button className="share-button" onClick={() => setShowShare(true)}>
              <FaShareAlt /> Share
            </button>
            {showShare && (
              <div className="share-popup">
                <button className="close-popup" onClick={() => setShowShare(false)}><FaTimes /></button>
                <h3>Share Links</h3>
                <button onClick={handleCopy}><FaCopy /> Copy Link</button>
                {/* Add more share methods here if needed */}
              </div>
            )}
          </div>
        </div>
      </div><br /><br />
        <button className="share-button" onClick={editPortfolio}>
            <FaEdit /> Edit Profile
        </button><br />
        <button className="share-button" onClick={editLinks}>
            <FaEdit /> Edit Links
        </button>
      <footer className="footer">
        <a href="/" className="logo">
            <img src={logo} alt='Home'/>
        </a>
        <span> 
          |&nbsp;&nbsp; Developed by <b>Omar Matumbo </b>&nbsp;&nbsp;|         
        </span>
        <span>
          GitHub: <a href="https://github.com/omz-pixel-45" target="_blank" rel="noreferrer"> omz-pixel-45 &nbsp;&nbsp;</a>
        </span>
      </footer>
    </div>
  );
}

export default Preview;