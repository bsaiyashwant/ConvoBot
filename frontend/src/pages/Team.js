import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Team.css';

const teamMembers = [
    {
        name: "Balivada Sai Yashwant",
        role: "Backend Developer & Debugger",
        linkedin: "https://www.linkedin.com/in/balivadasaiyashwant/",
        angle: 0
    },
    {
        name: "Perali Sri Harshavardhan",
        role: "Front End Developer & Tester",
        linkedin: "https://www.linkedin.com/in/perali-sri-harsha-vardhan-3a8541325/",
        angle: 120
    },
    {
        name: "Ritesh Devineni",
        role: "Front End Developer & Debugger",
        linkedin: "https://www.linkedin.com/in/ritesh-devineni-aba96b286/",
        angle: 240
    }
];

function Team() {
    const [rotation, setRotation] = useState(0);
    const navigate = useNavigate();

    const handleMemberClick = (memberAngle) => {
        // Current rotation might be something like -720
        // We want to rotate to a target that makes memberAngle face front (0)
        // Target net field rotation is -memberAngle

        // Simple logic: just set it. For more advanced "shortest path", we'd do math.
        setRotation(-memberAngle);
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
                {/* The "Earth" Center - ignore clicks so it doesn't block cards */}
                <div className="earth-concept" style={{ pointerEvents: 'none' }}>
                    <div className="earth-glow"></div>
                </div>

                {/* Orbiting Members */}
                <div className="orbit-field" style={{ transform: `rotateY(${rotation}deg)` }}>
                    {teamMembers.map((member, index) => (
                        <div
                            key={index}
                            className="member-orbital-path"
                            style={{
                                transform: `rotateY(${member.angle}deg) translateZ(350px)`,
                                '--member-angle': `${member.angle}deg`
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
                                    zIndex: Math.round(Math.cos((member.angle + rotation) * Math.PI / 180) * 100)
                                }}
                            >
                                <div className="card-glass-content">
                                    <div className="avatar-placeholder">
                                        {member.name.charAt(0)}
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
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Team;
