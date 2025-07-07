import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { useNavigate } from 'react-router-dom';
import './home.css'; // Import the new homepage CSS
import logo from '../logo.png'; // Assuming logo.png is in the parent directory

function Home() {
    const navigate = useNavigate();

    const explanations = [
        "🔗 All Your Links, One Powerful Hub – Say goodbye to messy bookmarks and scattered URLs. LinkMate helps you collect, manage, and share all your important links from one beautiful, organized space.",
        "🚀 Share Like a Pro – Whether you're sending links to clients, teammates, or your audience, LinkMate makes sharing clean, professional, and effortless—no more long, ugly links.",
        "📱 Access Anytime, Anywhere – With a sleek mobile-ready interface, your saved links follow you wherever you go. Perfect for creators, students, developers, and dreamers on the move.",
        "⚡ Fast, Simple & Secure – Built for speed and simplicity, LinkMate respects your time and your privacy. It’s not just a tool—it’s your digital assistant for link management."
    ];

    // State to track if the user has scrolled down
    const [isScrolled, setIsScrolled] = useState(false);
    // State to track if the fixed login button is hovered
    const [isHovered, setIsHovered] = useState(false);
    let scrolledii = document.getElementById('loginBttn');

    // Function to handle scroll events
    const handleScroll = () => {
        // Set isScrolled to true if scroll position is greater than 100px, otherwise false
        if (window.scrollY > 10) {
            setIsScrolled(true);
            scrolledii.classList.add('scrolled');
        } else {
            setIsScrolled(false);
            scrolledii.classList.remove('scrolled');
        }
    };

    // useEffect to add and remove the scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

    const handleGetStarted = () => {
        
        
        navigate('/signup');
    };

    const handleLoginClick = () => {
        console.log("Login button clicked!");
        navigate('/login');
    };

    return (
        <div className="homepage-container">
            {/* Fixed Login Button */}
            <button
                id='loginBttn'
                className='fixed-login-button'
                onClick={handleLoginClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Conditionally render text or icon based on scroll and hover state */}
                <span className="button-text">Login</span>
                <i className="fas fa-sign-in-alt login-icon"></i> {/* Font Awesome login icon */}
            </button>

            {/* Section 1: Logo and Slogan */}
            <section className="hero-section">
                <img src={logo} alt="LinkMate Logo" />
                <h1 className="slogan">The smart way to share!</h1>
            </section>

            {/* Section 2: Bullet Explanations */}
            <section className="explanation-section">
                <h2>Why LinkMate?</h2>
                <ul>
                    {explanations.map((explanation, index) => (
                        <li key={index}>{explanation}</li>
                    ))}
                </ul>
            </section>

            {/* Section 3: Call to Action */}
            <section className="cta-section">
                <h2>Link up with LinkMate now!</h2>
                <button onClick={handleGetStarted}>Get Started</button>
            </section>

            {/* Section 4: Comments (Placeholder) */}
            <section className="comments-section">
                <h2>What people are saying...</h2>
                <div className="comment-area">
                    <p>"LinkMate has revolutionized how I manage my online resources. Simple, effective, and beautiful!" - A Happy User</p>
                    <p>"Finally, a clean way to share my project links without overwhelming my clients. Highly recommend!" - Creative Designer</p>
                    {/* Add more placeholder comments or integrate a real comment system */}
                </div>
                {/* You can add a form here for users to submit comments if desired */}
            </section>

            {/* Footer */}
            <footer className="footerhome">
                <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
                <p>Developed by <a href="https://github.com/omz-pixel-45" target="_blank" rel="noopener noreferrer">Omar Matumbo</a> | GitHub: <a href="https://github.com/omz-pixel-45" target="_blank" rel="noopener noreferrer">omz-pixel-45</a></p>
            </footer>
        </div>
    );
}

export default Home;
