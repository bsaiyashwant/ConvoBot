import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Team.css';

const teamMembers = [
    {
        name: "Perali Sri Harshavardhan",
        role: "Front End Developer & Tester",
        linkedin: "https://www.linkedin.com/in/perali-sri-harsha-vardhan-3a8541325/",
        image: "/harsha_photo.png",
        angle: 0
    },
    {
        name: "Ritesh Devineni",
        role: "Front End Developer & Debugger",
        linkedin: "https://www.linkedin.com/in/ritesh-devineni-aba96b286/",
        image: "/ritesh_photo.png",
        angle: 120
    },
    {
        name: "Balivada Sai Yashwant",
        role: "Backend Developer & Debugger",
        linkedin: "https://www.linkedin.com/in/balivadasaiyashwant/",
        image: "/yashwant_photo.png",
        angle: 240
    }
];

function Team() {
    const [rotation, setRotation] = useState(0);
    const navigate = useNavigate();

    const handleMemberClick = (memberAngle) => {
        // Shortest path rotation
        const targetRotation = -memberAngle;
        let diff = (targetRotation - (rotation % 360)) % 360;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        setRotation(rotation + diff);
    };

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

            <div className="orbit-container">
                {/* The "Earth" Center - ignore clicks */}
                <div className="earth-concept" style={{ pointerEvents: 'none' }}>
                    <div className="earth-glow"></div>
                </div>

                {/* Orbiting Members */}
                <div className="orbit-field" style={{ transform: `rotateY(${rotation}deg)` }}>
                    {teamMembers.map((member, index) => {
                        // Calculate relative angle to find who is in front
                        const relativeAngle = (member.angle + rotation) % 360;
                        const normalizedAngle = relativeAngle < 0 ? relativeAngle + 360 : relativeAngle;

                        // Cards near 0 or 360 are "in front"
                        // We use cosine to distribute z-index (1 is front, -1 is back)
                        const zIndex = Math.round(Math.cos(normalizedAngle * Math.PI / 180) * 100);

                        return (
                            <div
                                key={index}
                                className="member-orbital-path"
                                style={{
                                    transform: `rotateY(${member.angle}deg) translateZ(400px)`,
                                    '--member-angle': `${member.angle}deg`,
                                    zIndex: zIndex
                                }}
                            >
                                <div
                                    className="member-card-3d"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMemberClick(member.angle);
                                    }}
                                    style={{
                                        transform: `rotateY(${-member.angle - rotation}deg)`,
                                    }}
                                >
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
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View LinkedIn
                                        </a>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Team;
