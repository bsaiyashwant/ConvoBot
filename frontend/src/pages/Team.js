import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Team.css';
import SplitText from '../components/reactbits/SplitText';
import BlurText from '../components/reactbits/BlurText';
import GradientText from '../components/reactbits/GradientText';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import DecryptedText from '../components/reactbits/DecryptedText';
import ShinyText from '../components/reactbits/ShinyText';
import ClickSpark from '../components/reactbits/ClickSpark';

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
    },
    {
        name: "Mattam Venkata Sesha Bharat",
        role: "UI/UX Designer & Researcher",
        linkedin: "https://www.linkedin.com/in/mattam-venkata-sesha-bharat-371218299",
        image: "/bharat_photo.png",
        isLead: false
    }
];

function Team() {
    const navigate = useNavigate();
    const [activeId, setActiveId] = React.useState(null);

    const handleCardClick = (index) => {
        setActiveId(activeId === index ? null : index);
    };

    return (
        <div className={`team-page-container ${activeId !== null ? 'has-active' : ''}`}>
            <div className="bg-blur-layer"></div>
            <button className="back-btn-team" onClick={() => navigate('/chat')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Chat
            </button>

            <div className="team-header">
                <h1>
                  <SplitText
                    text="Meet Team"
                    delay={60}
                    animationFrom={{ opacity: 0, transform: 'translate3d(0,30px,0)' }}
                    animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                    threshold={0.1}
                    rootMargin="0px"
                  />
                  {' '}
                  <GradientText
                    colors={['#4285f4', '#c678dd', '#4285f4', '#c678dd']}
                    animationSpeed={4}
                    className="team-gradient-podmaan"
                  >
                    podmAAn
                  </GradientText>
                </h1>
                <BlurText
                  text="The minds behind ConvoBot"
                  delay={120}
                  animateBy="words"
                  direction="top"
                  className="team-subtitle-blur"
                />
            </div>

            <div className="team-grid-container">
                {teamMembers.map((member, index) => (
                    <SpotlightCard
                        key={index}
                        className={`team-member-card ${member.isLead ? 'team-lead-card' : ''} ${activeId === index ? 'active' : ''} ${activeId !== null && activeId !== index ? 'blurred' : ''}`}
                        spotlightColor={member.isLead ? 'rgba(198, 120, 221, 0.2)' : 'rgba(66, 133, 244, 0.15)'}
                    >
                      <div onClick={() => handleCardClick(index)} style={{cursor: 'pointer'}}>
                        {activeId === index && (
                            <button 
                                className="card-close-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveId(null);
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                        {member.isLead && (
                            <div className="team-lead-badge">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"></path>
                                </svg>
                                <ShinyText text="LEAD" speed={2} className="lead-shiny" />
                            </div>
                        )}
                        <div className="card-glass-content">
                            <div className="avatar-wrapper">
                                <img src={member.image} alt={member.name} className="team-avatar-img" />
                            </div>
                            <h3>
                              <DecryptedText
                                text={member.name}
                                speed={50}
                                maxIterations={20}
                                sequential={true}
                                revealDirection="start"
                                animateOn="view"
                                className="team-name-revealed"
                                encryptedClassName="team-name-encrypted"
                              />
                            </h3>
                            <p>{member.role}</p>
                            <ClickSpark sparkColor={member.isLead ? '#c678dd' : '#4285F4'} sparkSize={8} sparkRadius={15} sparkCount={6} duration={400}>
                            <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="linkedin-link-team"
                                onClick={(e) => e.stopPropagation()}
                            >
                                View LinkedIn
                            </a>
                            </ClickSpark>
                        </div>
                      </div>
                    </SpotlightCard>
                ))}
            </div>
        </div>
    );
}

export default Team;
