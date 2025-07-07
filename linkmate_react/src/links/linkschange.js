import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './links.css'; // Import the new CSS file
import logo from '../logo.png'; // Assuming logo.png is in the parent directory
import ServerLink from '../serverLink';

// --- Utility Functions and Data ---

// Define common link types and their associated Font Awesome icons
const commonLinkTypes = [
    { type: 'Website', icon: 'fas fa-link' },
    { type: 'Instagram', icon: 'fab fa-instagram' },
    { type: 'Facebook', icon: 'fab fa-facebook' },
    { type: 'YouTube', icon: 'fab fa-youtube' },
    { type: 'Twitter', icon: 'fab fa-twitter' },
    { type: 'X (Twitter)', icon: 'fab fa-x-twitter' },
    { type: 'LinkedIn', icon: 'fab fa-linkedin' },
    { type: 'GitHub', icon: 'fab fa-github' },
    { type: 'Discord', icon: 'fab fa-discord' },
    { type: 'Twitch', icon: 'fab fa-twitch' },
    { type: 'Reddit', icon: 'fab fa-reddit' },
    { type: 'Snapchat', icon: 'fab fa-snapchat' },
    { type: 'TikTok', icon: 'fab fa-tiktok' },
    { type: 'Pinterest', icon: 'fab fa-pinterest' },
    { type: 'Dribbble', icon: 'fab fa-dribbble' },
    { type: 'Behance', icon: 'fab fa-behance' },
    { type: 'Medium', icon: 'fab fa-medium' },
    { type: 'Stack Overflow', icon: 'fab fa-stack-overflow' },
    { type: 'CodePen', icon: 'fab fa-codepen' },
    { type: 'Portfolio', icon: 'fas fa-briefcase' },
    { type: 'Blog', icon: 'fas fa-blog' },
    { type: 'Email', icon: 'fas fa-envelope' },
    { type: 'Other', icon: 'fas fa-globe' }
];

// Function to get the icon based on URL or selected type
const getLinkIcon = (url, type) => {
    if (type && type !== 'Other') {
        const foundType = commonLinkTypes.find(lt => lt.type === type);
        if (foundType) return foundType.icon;
    }

    // Attempt to infer from URL if type is 'Other' or not explicitly set
    if (url) {
        url = url.toLowerCase();

        if (url.includes('instagram.com')) return 'fab fa-instagram';
        if (url.includes('facebook.com')) return 'fab fa-facebook';
        if (url.includes('youtube.com')) return 'fab fa-youtube';
        if (url.includes('x.com') || url.includes('twitter.com')) return 'fab fa-twitter';
        if (url.includes('linkedin.com')) return 'fab fa-linkedin';
        if (url.includes('github.com')) return 'fab fa-github';
        if (url.includes('discord.com')) return 'fab fa-discord';
        if (url.includes('twitch.tv')) return 'fab fa-twitch';
        if (url.includes('reddit.com')) return 'fab fa-reddit';
        if (url.includes('snapchat.com')) return 'fab fa-snapchat';
        if (url.includes('tiktok.com')) return 'fab fa-tiktok';
        if (url.includes('pinterest.com')) return 'fab fa-pinterest';
        if (url.includes('dribbble.com')) return 'fab fa-dribbble';
        if (url.includes('behance.net')) return 'fab fa-behance';
        if (url.includes('medium.com')) return 'fab fa-medium';
        if (url.includes('stackoverflow.com')) return 'fab fa-stack-overflow';
        if (url.includes('codepen.io')) return 'fab fa-codepen';
        if (url.includes('mailto:')) return 'fas fa-envelope';
    }

    // Default icon if no specific type or URL match
    return 'fas fa-link'; // Generic link icon
};

// --- Custom Modal Component ---
const Modal = ({ message, isSuccess, onClose }) => {
    if (!message) return null;

    return (
        <div className="modal-overlay">
            <div className={`modal-content ${isSuccess ? 'success' : 'error'}`}>
                <h3>{isSuccess ? 'Success!' : 'Error!'}</h3>
                <p>{message}</p>
                <button onClick={onClose} className="modal-close-button">Close</button>
            </div>
        </div>
    );
};

// --- Main LinkInputForm Component ---
function LinkChange() {

    const [links, setLinks] = useState([]);
    
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Effect to read 'n' from URL on component mount
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const u = queryParams.get('u');

        async function fetchFile() {
            try {
                const resp = await fetch(ServerLink("/getLinks?u=" + u), {
                    method: "GET",
                    credentials: "include"
                });

                const data = await resp.json();
                console.log(data);
                setLinks(data.links || []);
            } catch (err) {
                console.error("Failed to fetch links:", err);
            }
        }

        fetchFile();
    }, []);
 // Empty dependency array means this runs once on mount

    // Handler for adding a new link field
    const handleAddLink = () => {
        setLinks(prevLinks => [
            ...prevLinks,
            { link: '', type: 'Other', name:'', id: crypto.randomUUID() }
        ]);
    };

    // Handler for removing a link field
    const handleRemoveLink = (idToRemove) => {
        setLinks(prevLinks => prevLinks.filter(link => link.id !== idToRemove));
    };

    // Handler for input and select changes
    const handleLinkChange = (id, field, value) => {
        setLinks(prevLinks =>
            prevLinks.map(link => {
                if (link.id === id) {
                    const updatedLink = { ...link, [field]: value };
                    // If URL changes, try to update the type automatically
                    if (field === 'link') {
                        const inferredIcon = getLinkIcon(value, ''); // Pass empty type to force inference
                        const inferredType = commonLinkTypes.find(lt => lt.icon === inferredIcon)?.type || 'Other';
                        updatedLink.type = inferredType;
                    }
                    return updatedLink;
                }
                return link;
            })
        );
    };

    // Handler for form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setIsSubmitting(true);
        setModalMessage(''); // Clear previous messages
        setShowModal(false);

        // Basic validation
        const hasEmptyUrls = links.some(link => !link.link.trim());
        if (hasEmptyUrls) {
            setModalMessage('Please fill in all link URLs before submitting.');
            setIsSuccess(false);
            setShowModal(true);
            setIsSubmitting(false);
            return;
        }

        try {
            // Filter out empty links before sending (optional, but good practice)
            const dataToSend = links.filter(lnk => lnk.link.trim() !== '');

            console.log(dataToSend);

            const queryParams = new URLSearchParams(window.location.search);
            const userId = queryParams.get('u');
            console.log(userId);

            const response = await axios.post(
                ServerLink("/updlinks"), 
                { links: dataToSend, uId: userId },
                { withCredentials: true }
            );
            console.log("Submission successful:", response.data);
            setModalMessage('Links submitted successfully!');
            setIsSuccess(true);
            setShowModal(true);
            window.location.href = `/linkpreview?u=${response.data.userId}`
            // Optionally clear the form or reset state here
            setLinks(links.map(link => ({ ...link, url: '', type: 'Other' }))); // Clear URLs after successful submission
        } catch (error) {
            console.error("Submission error:", error);
            setModalMessage('Failed to submit links. Please try again.');
            setIsSuccess(false);
            setShowModal(true);
            // More detailed error handling could go here, e.g., checking error.response.data
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="link-form-container">
            <div className="link-form-card">
                <img src={logo} alt="LinkMate Logo" />
                <h2>Add Your Links</h2>

                <form onSubmit={handleSubmit}>
                    {links.map((link, index) => (
                        <div key={link.id} className="link-field">
                            <div className="link-icon-wrapper">
                                <i className={getLinkIcon(link.url, link.type)}></i>
                            </div>
                            <input
                                type="url" // Use type="url" for better mobile keyboard and validation
                                className="link-input"
                                placeholder="Enter your link here (e.g., https://example.com/profile)"
                                value={link.link}
                                onChange={(e) => handleLinkChange(link.id, 'link', e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                className="link-name-input"
                                placeholder="Link name (e.g., My Portfolio)"
                                value={link.name}
                                onChange={(e) => handleLinkChange(link.id, 'name', e.target.value)}
                                required
                            />
                            <select
                                className="link-type-select"
                                value={link.type}
                                onChange={(e) => handleLinkChange(link.id, 'type', e.target.value)}
                            >
                                {commonLinkTypes.map(lt => (
                                    <option key={lt.type} value={lt.type}>
                                        {lt.type}
                                    </option>
                                ))}
                            </select>
                            {links.length > 1 && ( // Only show remove button if more than one link
                                <button
                                    type="button" // Important: type="button" to prevent form submission
                                    className="remove-link-button"
                                    onClick={() => handleRemoveLink(link.id)}
                                >
                                    &times; {/* HTML entity for multiplication sign (X) */}
                                </button>
                            )}
                        </div>
                    ))}

                    <button type="button" className="add-link-button" onClick={handleAddLink}>
                        Add +
                    </button><br />

                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit Links'}
                    </button>
                </form>
            </div>

            {/* Render the custom Modal */}
            <Modal
                message={modalMessage}
                isSuccess={isSuccess}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}

export default LinkChange;
