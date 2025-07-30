import React from "react";
import { motion } from "framer-motion";
import "../../components/css/templatemo-space-dynamic.css";
import heroImage from '../../components/images/main.png';
import staffTrainingImage from '../../components/images/staffTrainingImage.png';
import gridIcon from '../../components/images/gridIcon.png';
import teamIcon from '../../components/images/teamIcon.png';
import dataIcon from '../../components/images/dataIcon.png';
import CreateAccount from '../../components/images/CreateAccount.png';
import FillForm from '../../components/images/FillForm.png';
import FindInternship from '../../components/images/FindInternship.png';
import ApplyInternship from '../../components/images/ApplyInternship.png';

const Home: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <div className="main-banner wow fadeIn" id="top" data-wow-duration="1s" data-wow-delay="0.5s">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="row">
                <div className="col-lg-6 align-self-center">
                  <div className="left-content header-text wow fadeInLeft" data-wow-duration="1s" data-wow-delay="1s">
                    <h5>Welcome to PAL Training System</h5>
                    <h2>Find an <span><strong>internship</strong></span> that aligns with your interests and skills</h2>
                    <p>Thousands of internships in all the leading sectors are waiting for you.</p>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="right-image wow fadeInRight" data-wow-duration="1s" data-wow-delay="0.5s">
                    <img src={heroImage} alt="Hero Illustration" className="team meeting" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main>
        {/* Staff Training Section */}
        <motion.section id="about" className="section" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}>
          <div className="about-us section">
            <h2>Staff <em>Training</em> Section</h2>
            <div className="container">
              <div className="row">
                <div className="col-lg-4">
                  <div className="left-image wow fadeIn" data-wow-duration="1s" data-wow-delay="0.2s">
                    <img src={staffTrainingImage} alt="Staff Training Illustration" className="staffTrainingImage" />
                  </div>
                </div>
                <div className="col-lg-8 align-self-center">
                  <div className="services">
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="item wow fadeIn" data-wow-duration="1s" data-wow-delay="0.5s">
                          <div className="icon">
                            <img src={gridIcon} alt="Grid Icon" />
                          </div>
                          <div className="right-text">
                            <h4>Training manager doesn't get lost in the grid view and has a dedicated Pedium space.</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="item wow fadeIn" data-wow-duration="1s" data-wow-delay="0.7s">
                          <div className="icon">
                            <img src={teamIcon} alt="Team Icon" />
                          </div>
                          <div className="right-text">
                            <h4>Company and trainers can be moved to the front of the internship.</h4>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="item wow fadeIn" data-wow-duration="1s" data-wow-delay="0.9s">
                          <div className="icon">
                            <img src={dataIcon} alt="Data Icon" />
                          </div>
                          <div className="right-text">
                            <h4>Training manager can easily see all students and class data at one time.</h4>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
        
        {/* How It Works Section */}
        <motion.section id="contact" className="section" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 1 }}>
          <div className="our-portfolio section">
            <div className="container">
              <div className="row">
                <div className="col-lg-6 offset-lg-3">
                  <div className="section-heading wow bounceIn" data-wow-duration="1s" data-wow-delay="0.2s">
                    <h2>How <em>PAL Training System</em> Works <span>!</span></h2>
                  </div>
                </div>
              </div>
              <div className="row">
                {[{ img: CreateAccount, title: "1-Create Account", text: "Sign up on our platform and create your profile to get started." },
                  { img: FillForm, title: "2-Fill Form CV/Resume", text: "Complete your profile by uploading your CV or filling out the resume form." },
                  { img: FindInternship, title: "3-Find Suitable Internship", text: "Browse available internships that match your skills and interests." },
                  { img: ApplyInternship, title: "4-Apply for Internship", text: "Submit your application and get ready for the next step in your career." }]
                  .map((step, index) => (
                    <div key={index} className="col-lg-3 col-sm-6">
                      <div className="item wow bounceInUp" data-wow-duration="1s" data-wow-delay={`${0.3 + index * 0.1}s`}>
                        <div className="hidden-content">
                          <h4>{step.title}</h4>
                          <p>{step.text}</p>
                        </div>
                        <div className="showed-content">
                          <img src={step.img} alt={step.title} />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </motion.div>
  );
};

export default Home;
