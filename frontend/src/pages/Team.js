import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Team.css';

const teamMembers = [
    {
        name: "Perali Sri Harshavardhan",
        role: "Front End Developer & Tester",
        linkedin: "https://www.linkedin.com/in/perali-sri-harsha-vardhan-3a8541325/",
        image: "/harsha_photo.png",
        isLead: false
    },
    {
        name: "Balivada Sai Yashwant",
        role: "Backend Developer & Debugger",
        linkedin: "https://www.linkedin.com/in/balivadasaiyashwant/",
        image: "/yashwant_photo.png",
        isLead: true
    },
    {
        name: "Ritesh Devineni",
        role: "Front End Developer & Debugger",
        linkedin: "https://www.linkedin.com/in/ritesh-devineni-aba96b286/",
        image: "/ritesh_photo.png",
        isLead: false
    }
];

function Team() {
    const navigate = useNavigate();

    return (
        <div className="team-page-container">
            <button className="back-btn-team" onClick={() => navigate('/chat')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Chat
            </button>

            <div className="team-header">
                <h1>Meet Team <span className="gradient-text">podmAAn</span></h1>
                <p>The minds behind ConvoBot</p>
            </div>

            <div className="team-grid-container">
                {teamMembers.map((member, index) => (
                    <div key={index} className={`team-member-card ${member.isLead ? 'team-lead-card' : ''}`}>
                        {member.isLead && (
                            <div className="team-lead-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
                                </svg>
                                LEAD
                            </div>
                        )}
                        <div className="card-glass-content">
                            <div className="avatar-wrapper">
                                <img src={member.image} alt={member.name} className="team-avatar-img" />
                            </div>
                            <h3>{member.name}</h3>
                            <p>{member.role}</p>
                            <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="linkedin-link-team"
                            >
                                View LinkedIn
                            </a>
                        </div>
                        {/* Decorative background glow */}
                        <div className="card-glow"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Team;
