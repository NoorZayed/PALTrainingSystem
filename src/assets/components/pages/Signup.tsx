import React, { useState } from "react";
import styles from "../../components/css/Signup.module.css";
import sidebarImage from "../../components/images/signup.png";
import companyImage from "../../components/images/company.png";
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiUtils';
const steps = [
  "Account Details",
  "Complete Profile"
];

const Signup = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("company"); // Default to company type
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const [isSignupFailed, setIsSignupFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleCloseSuccess = () => {
    setIsSignupSuccess(false);
  };

  const handleCloseFailure = () => {
    setIsSignupFailed(false);
    setErrorMessage("");
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupSidebar} style={{ backgroundImage: `url(${sidebarImage})` }}>
        <div className={styles.signupLogo}></div>
      </div>
      <div className={styles.signupFormContainer}>
        {/* Stepper */}
        <div className={styles.stepper}>
          {steps.map((label, idx) => (
            <div key={label} className={styles.stepperItem}>
              <div className={`${styles.stepperCircle} ${idx + 1 <= step ? styles.active : ''}`}>
                {idx + 1 < step ? '✓' : idx + 1}
              </div>
              <span className={`${styles.stepperLabel} ${idx + 1 === step ? styles.active : ''}`}>{label}</span>
              {idx < steps.length - 1 && <div className={styles.stepperLine} />}
            </div>
          ))}
        </div>
        {step === 1 && (
          <SignupStep2 setStep={setStep} userType={userType} handleBack={() => {}} />
        )}
        {step === 2 && (
          <SignupStep3
            handleBack={handleBack}
            setIsSignupSuccess={setIsSignupSuccess}
            setIsSignupFailed={setIsSignupFailed}
            setErrorMessage={setErrorMessage}
          />
        )}
      </div>
      {isSignupSuccess && (
        <div className={styles.successWindow}>
          <p>Signup successful!</p>
          <button onClick={handleCloseSuccess}>Close</button>
        </div>
      )}
      {isSignupFailed && (
        <div className={styles.failureWindow}>
          <p>Signup failed: {errorMessage}</p>
          <button onClick={handleCloseFailure}>Close</button>
        </div>
      )}
    </div>
  );
};

const SignupStep2: React.FC<{
  setStep: React.Dispatch<React.SetStateAction<number>>;
  userType: string;
  handleBack: () => void;
}> = ({ setStep, userType, handleBack }) => {
  const verifyCompanyCode = async (code: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/company/verify-code`, { code });
    if (response.data.success) {
      const { company_name, registration_number } = response.data.company;
      setFormData(prev => ({
        ...prev,
        companyName: company_name,
        registrationNumber: registration_number,
      }));
    } else {
      alert("Invalid or already used code.");
    }
  } catch (error) {
    alert("Error verifying code.");
  }
};

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    universityId: "",
    companyName: "",
    registrationNumber: "",
    contactPerson: "",
    website: "",
  });
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  

  return (
    <div className={styles.stepContainer}>
      <h2>Register Company Account</h2>
      <form>
        <label>Company Name</label>
        <input
          type="text"
          name="companyName"
          placeholder="Enter your company name"
          onChange={handleChange}
          required
        />
        <label>Verification Code</label>
        <input
          type="text"
          name="code"
          placeholder="Enter your company verification code"
          onChange={handleChange}
          onBlur={(e) => verifyCompanyCode(e.target.value)}
          required
        />
        <label>Registration Number</label>
        <input
          type="text"
          name="registrationNumber"
          placeholder="Enter your registration number"
          onChange={handleChange}
          required
        />
        <label>Contact Person</label>
        <input
          type="text"
          name="contactPerson"
          placeholder="Enter contact person"
          onChange={handleChange}
          required
        />
        <label>Website</label>
        <input
          type="text"
          name="website"
          placeholder="Enter website"
          onChange={handleChange}
          required
        />
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          onChange={handleChange}
          required
        />
        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          onChange={handleChange}
          required
        />
        <div className={styles.bottomButtons}>
          <button type="button" className={styles.primaryBtn} onClick={() => setStep(2)}>
            Next
          </button>
        </div>
        <p className={styles.loginLink}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
};

const SignupStep3: React.FC<{
  handleBack: () => void;
  setIsSignupSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSignupFailed: React.Dispatch<React.SetStateAction<boolean>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
}> = ({ handleBack, setIsSignupSuccess, setIsSignupFailed, setErrorMessage }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mockApiCall = new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve("Signup successful");
          } else {
            reject(new Error("Signup failed: Mock error"));
          }
        }, 1000);
      });

      await mockApiCall;
      setIsSignupSuccess(true);
      setIsSignupFailed(false);
    } catch (error) {
      setIsSignupSuccess(false);
      setIsSignupFailed(true);
      if (error instanceof Error) {
        setErrorMessage(error.toString());
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  return (
    <div className={styles.stepContainer}>
      <h2>Complete Your Company Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>Phone Number</label>
        <input type="tel" placeholder="Enter your company phone number" required />
        <label>Address</label>
        <input type="text" placeholder="Enter your company address" required />
        <label>Country</label>
        <select title="Select your country" required>
          <option value="">Select country</option>
          <option value="PS">Palestine</option>
          <option value="JO">Jordan</option>
          <option value="SA">Saudi Arabia</option>
          <option value="AE">United Arab Emirates</option>
          <option value="QA">Qatar</option>
          <option value="KW">Kuwait</option>
          <option value="BH">Bahrain</option>
          <option value="OM">Oman</option>
        </select>
        <div className={styles.bottomButtons}>
          <button type="button" className={styles.secondaryBtn} onClick={handleBack}>
            Back
          </button>
          <button type="submit" className={styles.primaryBtn}>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Signup;