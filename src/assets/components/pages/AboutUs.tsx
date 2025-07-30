// src/components/AboutUs.tsx
import React, { useEffect, useRef } from "react";
import styles from "../../components/css/AboutUs.module.css";

// Import your images
import teamImage from "../../components/images/team.jpg";
import featuresImage from "../../components/images/featuresImage.png";
import contactImage from "../../components/images/teamImage.png";
import testimonial1Image from "../../components/images/testimonial1Image.jpg"; 
import testimonial2Image from "../../components/images/testimonial2Image.png"; 


import mohammadImage from "../../components/images/mohammad.jpg"; 
import nourImage from "../../components/images/nour.jpg"; 
import furatImage from "../../components/images/furat.jpg";
import { Link } from "react-router-dom";

const AboutUs: React.FC = () => {
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      sectionsRef.current.forEach((section) => {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top < window.innerHeight - 150) {
            section.classList.add(styles.visible);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.parallax}></div>

      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Your Imagination Is Your Only Limit</h1>
        <p className={styles.heroTagline}>
          We always try to make our customer Happy. We provide all kind of facilities. Your Satisfaction is our main priority.
        </p>
        <button className={styles.heroButton}>Discover more</button>
      </div>
      <div ref={addToRefs} className={`${styles.section} ${styles.missionSection}`}>
        <h2>Our Mission</h2>
        <p>
          Our goal is to provide students with an easy way to find internships,
          companies with a structured way to manage applicants, and training managers with efficient tracking tools.
        </p>
      </div>
      <div ref={addToRefs} className={styles.servicesSection}>
        <h2>Our Services</h2>
        <p>We always try to give you the best service.</p>
        <ul className={styles.servicesList}>
          <li>Internship search and applications</li>
          <li>Secure communication between all parties</li>
          <li>Progress tracking and reporting</li>
          <li>Internship approval and feedback</li>
          <li>Notifications for deadlines and updates</li>
        </ul>
      </div>

      <div ref={addToRefs} className={styles.section}>
        <h2>Key Features</h2>
        <div className={styles.featuresGrid}>
          <img src={featuresImage} alt="Features" className={styles.sectionImage} />
          {[
            "🔎 Internship search and applications",
            "📨 Secure communication between students, managers, and companies",
            "📊 Progress tracking and reporting",
            "✅ Internship approval and feedback system",
            "📅 Notifications for deadlines and status updates",
          ].map((feature, index) => (
            <div key={index} ref={addToRefs} className={styles.featureCard}>
              <p>{feature}</p>
            </div>
          ))}
        </div>
      </div>

      <div ref={addToRefs} className={`${styles.section} ${styles.teamSection}`}>
        <h2>Meet Our Team</h2>
        <img src={teamImage} alt="Team" className={styles.sectionImage} />
        <div className={styles.teamMembersGrid}>
          <div className={styles.teamMember}>
            <img src={mohammadImage} alt="Mohammad Issa" className={styles.teamMemberImage} />
            <p>👨‍💻 <strong>Mohammad Issa</strong> - Developer</p>
          </div>
          <div className={styles.teamMember}>
            <img src={nourImage} alt="Nour Zayed" className={styles.teamMemberImage} />
            <p>👩‍💻 <strong>Nour Zayed</strong> - Developer</p>
          </div>
          <div className={styles.teamMember}>
            <img src={furatImage} alt="Furat Madi" className={styles.teamMemberImage} />
            <p>👨‍💻 <strong>Furat Madi</strong> - Developer</p>
          </div>
          <div className={styles.teamMember}>
          </div>
          <p>🎓 <strong>Supervisor:</strong> Dr. Murad Njoum</p>

        </div>
      </div>

      <div ref={addToRefs} className={`${styles.section} ${styles.testimonialsSection}`}>
        <h2>What People Say About Us</h2>
        <div className={styles.testimonialsGrid}>
          <div className={styles.testimonial}>
            <img src={testimonial1Image} alt="Testimonial 1" className={styles.testimonialImage} />
            <p>"PalTrainingSystem helped me find the perfect internship!"</p>
          </div>
          <div className={styles.testimonial}>
            <img src={testimonial2Image} alt="Testimonial 2" className={styles.testimonialImage} />
            <p>"The platform is user-friendly and efficient."</p>
          </div>
        </div>
      </div>

    
      <div ref={addToRefs} className={`${styles.section} ${styles.getStartedSection}`}>
        <h2>Get Started Today</h2>
        <p>Ready to find your dream internship? Sign up now!</p>
        <button className={styles.getStartedButton}>     
             <Link to="/signup" color="white" className={styles.button}>Signup</Link>

        </button>

      </div>
    </div>
  );
};

export default AboutUs;