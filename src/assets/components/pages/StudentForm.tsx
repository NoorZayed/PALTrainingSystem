import React, { useState, useEffect } from "react";
import Select from "react-select";
import styles from "../../components/css/StudentForm.module.css";
import PhoneInput, { Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../utils/apiUtils';

interface OptionType {
  label: string;
  value: string;
}

interface FormErrors {
  major?: string;
  sex?: string;
  phoneNumber?: string;
  location?: string;
}

const StudentForm: React.FC = () => {
  const [majors, setMajors] = useState<OptionType[]>([]);
  const [major, setMajor] = useState<OptionType | null>(null);
  const [interestsOptions, setInterestsOptions] = useState<OptionType[]>([]);
  const [interests, setInterests] = useState<OptionType[]>([]);
  const [skills, setSkills] = useState<OptionType[]>([]);
  const [sex, setSex] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState<OptionType | null>(null);
  const [description, setDescription] = useState("");
  const [gpa, setGpa] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [completedHours, setCompletedHours] = useState("");
  const [experience, setExperience] = useState("");
  const [certifications, setCertifications] = useState("");
  const [languages, setLanguages] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [preferredTraining, setPreferredTraining] = useState("");
  const [availability, setAvailability] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const locations = [
    { value: "Nablus", label: "Nablus" },
    { value: "Ramallah", label: "Ramallah" },
    { value: "Jerusalem", label: "Jerusalem" },
    { value: "Hebron", label: "Hebron" },
    { value: "Gaza", label: "Gaza" },
  ];

  const allSkills = [
    { value: "JavaScript", label: "JavaScript" },
    { value: "React", label: "React" },
    { value: "Node.js", label: "Node.js" },
    { value: "Python", label: "Python" },
    { value: "Java", label: "Java" },
    { value: "Design", label: "Design" },
    { value: "Marketing", label: "Marketing" },
  ];
  const trainingOptions = [
    { value: "remote", label: "Remote" },
    { value: "on-site", label: "On-site" },
    { value: "hybrid", label: "Hybrid" },
  ];

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/majors`);
        const data = await res.json();
        setMajors(data.map((m: any) => ({ value: m.name, label: m.name })));
      } catch (err) {
        console.error("Failed to fetch majors", err);
      }
    };
    fetchMajors();
  }, []);

  useEffect(() => {
    if (!major) return;
    const fetchInterests = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/interests/by-major-name/${major.value}`
        );
        const data = await res.json();
        setInterestsOptions(
          data.map((i: any) => ({ value: i.interest_id, label: i.name }))
        );
      } catch (err) {
        console.error("Failed to fetch interests", err);
      }
    };
    fetchInterests();
  }, [major]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    switch (name) {
      case "sex":
        setSex(value);
        break;
      case "description":
        setDescription(value);
        break;
      case "gpa":
        setGpa(value);
        break;
      case "graduationYear":
        setGraduationYear(value);
        break;
      case "completedHours":
        setCompletedHours(value);
        break;
      case "experience":
        setExperience(value);
        break;
      case "certifications":
        setCertifications(value);
        break;
      case "languages":
        setLanguages(value);
        break;
      case "linkedin":
        setLinkedin(value);
        break;
      case "portfolio":
        setPortfolio(value);
        break;
      case "preferredTraining":
        setPreferredTraining(value);
        break;
      case "availability":
        setAvailability(value);
        break;
    }
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const handlePhoneNumberChange = (value: Value) => {
    setPhoneNumber(value || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.id) return;

    let isValid = true;
    const errors: FormErrors = {};
    if (!major) {
      errors.major = "Major is required.";
      isValid = false;
    }
    if (!sex) {
      errors.sex = "Sex is required.";
      isValid = false;
    }
    if (!phoneNumber) {
      errors.phoneNumber = "Phone number is required.";
      isValid = false;
    }
    if (!location) {
      errors.location = "Location is required.";
      isValid = false;
    }

    setFormErrors(errors);

    if (isValid) {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/student-form`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: user.id,
            major: major ? major.value : "",
            sex,
            phoneNumber,
            location: location ? location.value : "",
            interests: interests.map((i) => i.value),
            skills: skills.map((s) => s.value),
            description,
            gpa,
            graduationYear,
            completedHours,
            experience,
            certifications,
            languages,
            linkedin,
            portfolio,
            preferredTraining,
            availability,
          }),
        });

        if (res.ok) {
          setProfileSuccess(true);
          setProfileError("");
        } else {
          const errData = await res.json();
          setProfileError(errData.message || "Update failed.");
        }
      } catch {
        setProfileError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (profileSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.profileSuccess}>
          <h2>Profile Updated Successfully!</h2>
          <p>Your profile has been updated. You can now access your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileForm}>
        <h2>Student Form</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Major</label>
            <Select
              options={majors}
              value={major}
              onChange={setMajor}
              isClearable
            />
            {formErrors.major && (
              <p className={styles.error}>{formErrors.major}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Interests</label>
            <Select
              options={interestsOptions}
              value={interests}
              onChange={(selected) => setInterests([...selected])}
              isMulti
            />
          </div>

          <div className={styles.formGroup}>
            <label>Skills</label>
            <Select
              options={allSkills}
              value={skills}
              onChange={(selected) => setSkills([...selected])}
              isMulti
            />
          </div>

          <div className={styles.formGroup}>
            <label>Sex</label>
            <select
              name="sex"
              value={sex}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {formErrors.sex && <p className={styles.error}>{formErrors.sex}</p>}
          </div>

          <div className={styles.formGroup}>
            <label>Phone Number</label>
            <PhoneInput
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className={styles.input}
              defaultCountry="PS"
            />
            {formErrors.phoneNumber && (
              <p className={styles.error}>{formErrors.phoneNumber}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Location</label>
            <Select
              options={locations}
              value={location}
              onChange={setLocation}
              isClearable
            />
            {formErrors.location && (
              <p className={styles.error}>{formErrors.location}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={description}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>GPA</label>
            <input
              name="gpa"
              value={gpa}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Graduation Year</label>
            <input
              type="date"
              name="graduationYear"
              value={graduationYear}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Completed Hours</label>
            <input
              type="number"
              name="completedHours"
              value={completedHours}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Experience</label>
            <textarea
              name="experience"
              value={experience}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Certifications</label>
            <input
              name="certifications"
              value={certifications}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Languages</label>
            <input
              name="languages"
              value={languages}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>LinkedIn</label>
            <input
              name="linkedin"
              value={linkedin}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Portfolio</label>
            <input
              name="portfolio"
              value={portfolio}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Preferred Training Type</label>
            <Select
              options={trainingOptions}
              value={trainingOptions.find(
                (opt) => opt.value === preferredTraining
              )}
              onChange={(selected) =>
                setPreferredTraining(selected?.value || "")
              }
              isClearable
            />
          </div>

          <div className={styles.formGroup}>
            <label>Availability</label>
            <input
              type="date"
              name="availability"
              value={availability}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          {profileError && <p className={styles.error}>{profileError}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
