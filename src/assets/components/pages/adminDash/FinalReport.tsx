import React, { useState } from "react";
import axios from "axios";
import styles from "../../css/FinalReport.module.css";
import { API_BASE_URL } from "../../utils/apiUtils";

const FinalReport: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/final-report/download?threshold=${threshold}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "FinalReport.xlsx");
      document.body.appendChild(link);
      link.click();
      setSuccessMessage("Excel report downloaded successfully.");
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.finalReportContainer}>
      <h2 className={styles.title}>Final Report Generator</h2>

      <label htmlFor="threshold" className={styles.label}>
        Attendance Passing Percentage (%):
      </label>
      <input
        type="number"
        id="threshold"
        value={threshold}
        onChange={(e) => setThreshold(Number(e.target.value))}
        min={0}
        max={100}
        className={styles.input}
      />

      <button
        onClick={handleGenerateReport}
        className={styles.button}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Excel Report"}
      </button>

      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}
    </div>
  );
};

export default FinalReport;
