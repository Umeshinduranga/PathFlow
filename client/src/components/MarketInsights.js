import React from "react";

// Add the glow animation CSS
const glowKeyframes = `
  @keyframes glow {
    from { box-shadow: 0 0 15px rgba(255, 69, 0, 0.3); }
    to { box-shadow: 0 0 25px rgba(255, 69, 0, 0.6); }
  }
`;

// Insert the keyframes into the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = glowKeyframes;
  document.head.appendChild(style);
}

// Market data for different career goals - you can expand this or fetch from an API
const marketData = {
  "full stack developer": {
    title: "Full Stack Developer",
    salaryRange: "$85,000 - $130,000",
    isHot: true,
    topSkills: ["React", "TypeScript", "AWS"],
    description: "Average salary range"
  },
  "fullstack developer": {
    title: "Full Stack Developer",
    salaryRange: "$85,000 - $130,000",
    isHot: true,
    topSkills: ["React", "TypeScript", "AWS"],
    description: "Average salary range"
  },
  "frontend developer": {
    title: "Frontend Developer",
    salaryRange: "$70,000 - $115,000",
    isHot: true,
    topSkills: ["React", "JavaScript", "CSS"],
    description: "Average salary range"
  },
  "front end developer": {
    title: "Frontend Developer",
    salaryRange: "$70,000 - $115,000",
    isHot: true,
    topSkills: ["React", "JavaScript", "CSS"],
    description: "Average salary range"
  },
  "backend developer": {
    title: "Backend Developer",
    salaryRange: "$80,000 - $125,000",
    isHot: false,
    topSkills: ["Node.js", "Python", "SQL"],
    description: "Average salary range"
  },
  "back end developer": {
    title: "Backend Developer",
    salaryRange: "$80,000 - $125,000",
    isHot: false,
    topSkills: ["Node.js", "Python", "SQL"],
    description: "Average salary range"
  },
  "data scientist": {
    title: "Data Scientist",
    salaryRange: "$90,000 - $140,000",
    isHot: true,
    topSkills: ["Python", "Machine Learning", "SQL"],
    description: "Average salary range"
  },
  "ai engineer": {
    title: "AI Engineer",
    salaryRange: "$110,000 - $170,000",
    isHot: true,
    topSkills: ["Python", "PyTorch", "Machine Learning"],
    description: "Average salary range"
  },
  "ux designer": {
    title: "UX Designer",
    salaryRange: "$65,000 - $105,000",
    isHot: false,
    topSkills: ["Figma", "User Research", "Prototyping"],
    description: "Average salary range"
  },
  "ui designer": {
    title: "UI Designer",
    salaryRange: "$60,000 - $100,000",
    isHot: false,
    topSkills: ["Figma", "Adobe XD", "CSS"],
    description: "Average salary range"
  },
  "product designer": {
    title: "Product Designer",
    salaryRange: "$75,000 - $120,000",
    isHot: true,
    topSkills: ["Figma", "Design Systems", "User Research"],
    description: "Average salary range"
  },
  "devops engineer": {
    title: "DevOps Engineer",
    salaryRange: "$95,000 - $150,000",
    isHot: true,
    topSkills: ["AWS", "Docker", "Kubernetes"],
    description: "Average salary range"
  },
  "cloud engineer": {
    title: "Cloud Engineer",
    salaryRange: "$90,000 - $145,000",
    isHot: true,
    topSkills: ["AWS", "Azure", "Terraform"],
    description: "Average salary range"
  },
  "mobile developer": {
    title: "Mobile Developer",
    salaryRange: "$75,000 - $120,000",
    isHot: false,
    topSkills: ["React Native", "Swift", "Flutter"],
    description: "Average salary range"
  },
  "ios developer": {
    title: "iOS Developer",
    salaryRange: "$80,000 - $125,000",
    isHot: false,
    topSkills: ["Swift", "SwiftUI", "iOS SDK"],
    description: "Average salary range"
  },
  "android developer": {
    title: "Android Developer",
    salaryRange: "$75,000 - $120,000",
    isHot: false,
    topSkills: ["Kotlin", "Java", "Android SDK"],
    description: "Average salary range"
  },
  "machine learning engineer": {
    title: "Machine Learning Engineer",
    salaryRange: "$100,000 - $160,000",
    isHot: true,
    topSkills: ["Python", "TensorFlow", "AWS"],
    description: "Average salary range"
  },
  "software engineer": {
    title: "Software Engineer",
    salaryRange: "$75,000 - $120,000",
    isHot: false,
    topSkills: ["JavaScript", "Python", "Git"],
    description: "Average salary range"
  },
  "web developer": {
    title: "Web Developer",
    salaryRange: "$65,000 - $110,000",
    isHot: false,
    topSkills: ["HTML", "CSS", "JavaScript"],
    description: "Average salary range"
  },
  "cybersecurity analyst": {
    title: "Cybersecurity Analyst",
    salaryRange: "$80,000 - $130,000",
    isHot: true,
    topSkills: ["Network Security", "Python", "Penetration Testing"],
    description: "Average salary range"
  },
  "blockchain developer": {
    title: "Blockchain Developer",
    salaryRange: "$90,000 - $150,000",
    isHot: true,
    topSkills: ["Solidity", "Web3", "Smart Contracts"],
    description: "Average salary range"
  },
  "game developer": {
    title: "Game Developer",
    salaryRange: "$65,000 - $110,000",
    isHot: false,
    topSkills: ["Unity", "C#", "3D Modeling"],
    description: "Average salary range"
  }
};

const MarketInsights = ({ goal }) => {
  // eslint-disable-next-line no-unused-vars
  const [isVisible, setIsVisible] = React.useState(false);

  // Animate in after component mounts
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Normalize the goal to match our data keys
  const normalizedGoal = goal.toLowerCase().trim();
  
  // Try to find exact match or partial match
  let matchedData = marketData[normalizedGoal];
  
  // If no exact match, try to find partial matches
  if (!matchedData) {
    const goalWords = normalizedGoal.split(' ');
    for (const key in marketData) {
      if (goalWords.some(word => key.includes(word) || word.includes(key.split(' ')[0]))) {
        matchedData = marketData[key];
        break;
      }
    }
  }

  // Default data if no match found
  if (!matchedData) {
    matchedData = {
      title: goal,
      salaryRange: "$70,000 - $120,000",
      isHot: false,
      topSkills: ["Communication", "Problem Solving", "Teamwork"],
      description: "Estimated salary range"
    };
  }

  return (
    <div style={{
      backgroundColor: "rgba(20, 20, 30, 0.9)",
      borderRadius: "15px",
      padding: "1.5rem",
      marginTop: "2rem",
      border: "1px solid rgba(60,26,107, 0.4)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      position: "relative",
      overflow: "hidden",
      transform: isVisible ? "translateY(0)" : "translateY(20px)",
      opacity: isVisible ? 1 : 0,
      transition: "all 0.6s ease-out"
    }}>
      {/* Background gradient effect */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "linear-gradient(90deg, #3c1a6b, #6a4c93, #3c1a6b)",
        borderRadius: "15px 15px 0 0"
      }} />

      <div style={{ marginTop: "0.5rem" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem"
        }}>
          <h3 style={{
            color: "white",
            fontSize: "1.5rem",
            margin: 0,
            fontWeight: "600"
          }}>
            Market Insights
          </h3>
          {matchedData.isHot && (
            <div style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(255, 69, 0, 0.3)",
              color: "#ff4500",
              padding: "0.4rem 1rem",
              borderRadius: "25px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              border: "1px solid rgba(255, 107, 53, 0.5)",
              boxShadow: "0 0 15px rgba(255, 69, 0, 0.3)",
              animation: "glow 2s ease-in-out infinite alternate"
            }}>
              Hot 🔥
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          borderRadius: "12px",
          padding: "1.5rem"
        }}>
          <h4 style={{
            color: "white",
            fontSize: "1.2rem",
            margin: "0 0 0.5rem 0",
            fontWeight: "500"
          }}>
            {matchedData.title}
          </h4>
          
          <div style={{
            color: "#4ade80",
            fontSize: "2.2rem",
            fontWeight: "800",
            margin: "0.8rem 0",
            textShadow: "0 0 15px rgba(74, 222, 128, 0.4)",
            letterSpacing: "-0.5px"
          }}>
            {matchedData.salaryRange}
          </div>
          
          <p style={{
            color: "#a0a0a0",
            fontSize: "0.9rem",
            margin: "0 0 1rem 0"
          }}>
            {matchedData.description}
          </p>

          <div>
            <p style={{
              color: "white",
              fontSize: "0.95rem",
              fontWeight: "600",
              margin: "0 0 0.5rem 0"
            }}>
              Top Skills in Demand:
            </p>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem"
            }}>
              {matchedData.topSkills.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: "rgba(60,26,107, 0.3)",
                    color: "#c9a9ff",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                    border: "1px solid rgba(60,26,107, 0.5)"
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          backgroundColor: "rgba(60,26,107, 0.15)",
          borderRadius: "10px",
          border: "1px solid rgba(60,26,107, 0.25)",
          borderLeft: "4px solid #3c1a6b"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "0.5rem"
          }}>
            <span style={{ fontSize: "1.2rem", marginRight: "0.5rem" }}>💡</span>
            <span style={{
              color: "#c9a9ff",
              fontSize: "0.9rem",
              fontWeight: "600"
            }}>
              Market Intelligence
            </span>
          </div>
          <p style={{
            color: "#a0a0a0",
            fontSize: "0.8rem",
            margin: 0,
            textAlign: "center",
            lineHeight: "1.4"
          }}>
            Salary data is based on current industry trends and may vary by location, experience, and company size. Data updated {new Date().getFullYear()}.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketInsights;