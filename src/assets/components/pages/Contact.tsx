import React, { useState } from "react";
import styles from "../../components/css/Contact.module.scss";
import contactImage from "../../components/images/contact.png"; // Ensure correct path
import { API_BASE_URL } from '../utils/apiUtils';

const Contact = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    message: "",
  });

  const [responseMessage, setResponseMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResponseMessage(data.message);

      if (response.ok) {
        //clear form after submission
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          message: "",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setResponseMessage("Failed to send message. Please try again.");
    }

    setIsSubmitting(false);
  };
  return (
    <main className={styles.mainContent}>
      <section className={styles.contactSection}>
        <div className={styles.contactForm}>
          <h2>Get in touch</h2>
          <p>
            We are here for you! How can we help? Questions, comments, or
            suggestions? Simply fill in the form and we'll be in touch shortly.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              required
              value={formData.first_name}
              onChange={handleChange}
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              required
              value={formData.last_name}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="phone_number"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Your message"
              required
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
          {responseMessage && (
            <p className={styles.responseMessage}>{responseMessage}</p>
          )}
        </div>
        <div className={styles.rightSection}>
          <img src={contactImage} alt="Contact Us" />
        </div>
      </section>
    </main>
  );
};

export default Contact;
