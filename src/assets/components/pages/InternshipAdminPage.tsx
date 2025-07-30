import React, { useState, useEffect } from "react";
import styles from "../css/InternshipAdminPage.module.css";
import InternshipCard from "./AdminInternshipCard";
import Pagination from "./Pagination";
import companyIcon from "../images/company.svg";
import Aside from "../Navbar/AdminAside";
import axios from "axios";
import { API_BASE_URL } from "../utils/apiUtils";

interface Internship {
  id: number;
  title: string;
  company: string;
  location: string;
  mode: string;
  seats: number;
  startDate: string;
  endDate: string;
  type: string; // internship type: frontend, backend, etc.
}

interface UserOption {
  id: number;
  name: string;
}

const formatDate = (date?: string) => {
  if (!date) return "Not set";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const InternshipAdminPage: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [availableStudents, setAvailableStudents] = useState<string[]>([]);
  const [searchStudentId, setSearchStudentId] = useState("");
  const [matchingStudents, setMatchingStudents] = useState<UserOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserOption | null>(
    null
  );

  const [selectedInternship, setSelectedInternship] =
    useState<Internship | null>(null);
  const [internshipDetails, setInternshipDetails] = useState<Internship | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New filter states
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortCriteria, setSortCriteria] = useState<string>("company");
  const [companies, setCompanies] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  // Apply all filters
  const filteredInternships = internships.filter((internship) => {
    const matchesSearch =
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = selectedCompany
      ? internship.company === selectedCompany
      : true;
    const matchesLocation = selectedLocation
      ? internship.location === selectedLocation
      : true;
    const matchesMode = selectedMode ? internship.mode === selectedMode : true;
    const matchesType = selectedType ? internship.type === selectedType : true;

    return (
      matchesSearch &&
      matchesCompany &&
      matchesLocation &&
      matchesMode &&
      matchesType
    );
  });

  // Apply sorting
  const sortedInternships = [...filteredInternships].sort((a, b) => {
    switch (sortCriteria) {
      case "title":
        return a.title.localeCompare(b.title);
      case "company":
        return a.company.localeCompare(b.company);
      case "location":
        return a.location.localeCompare(b.location);
      case "date":
        return (
          new Date(a.startDate || 0).getTime() -
          new Date(b.startDate || 0).getTime()
        );
      default:
        return 0;
    }
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInternships = sortedInternships.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredInternships.length / itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCompany,
    selectedLocation,
    selectedMode,
    selectedType,
  ]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/internships-with-details`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((i: any) => ({
          id: i.internship_id,
          title: i.title,
          company: i.company,
          location: i.location,
          mode: i.mode,
          seats: i.seats,
          startDate: i.start_date,
          endDate: i.end_date,
          type: i.title || "unknown",
        }));
        setInternships(formatted);

        // Extract unique values for filters
        const uniqueCompanies = Array.from(
          new Set(data.map((i: any) => i.company))
        ).filter(Boolean);
        const uniqueLocations = Array.from(
          new Set(data.map((i: any) => i.location))
        ).filter(Boolean);
        const uniqueModes = Array.from(
          new Set(data.map((i: any) => i.mode))
        ).filter(Boolean);
        const uniqueTypes = Array.from(
          new Set(data.map((i: any) => i.title))
        ).filter(Boolean);

        setCompanies(uniqueCompanies as string[]);
        setLocations(uniqueLocations as string[]);
        setModes(uniqueModes as string[]);
        setTypes(uniqueTypes as string[]);
      })
      .catch(console.error);
  }, []);

  const handleCheckStudent = async () => {
    if (!searchStudentId.trim()) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/students/${searchStudentId.trim()}`
      );

      const mappedStudent: UserOption = {
        id: res.data.student_id,
        name: `${res.data.first_name} ${res.data.last_name}`,
      };

      setSelectedStudent(mappedStudent);
    } catch (err: any) {
      console.error("Student not found:", err);
      alert("Student not found.");
      setSelectedStudent(null);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedInternship || !selectedStudent) {
      alert("Please select both a student and an internship.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/internships/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: selectedStudent?.id,
          internship_id: selectedInternship?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to assign student.");
      }

      alert(
        `Student ${selectedStudent.id} assigned to internship ${selectedInternship.title}.`
      );
      setSelectedStudent(null);
      setSearchStudentId("");
      setMatchingStudents([]);
    } catch (error) {
      console.error("Assignment failed:", error);
      alert("Error assigning student. Please try again.");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCompany("");
    setSelectedLocation("");
    setSelectedMode("");
    setSelectedType("");
    setSortCriteria("company");
    setCurrentPage(1);
  };

  const handleEditInternship = (internship: Internship) => {
    setInternshipDetails(internship);
    setSelectedInternship(internship);
  };

  return (
    <div className={styles.container}>
      <Aside />
      <main className={styles.mainContent}>
        <div className={styles.searchBar}>
          <h1>Internship Management</h1>
          <p>Manage student internship assignments</p>
          <div className={styles.inputs}>
            <input
              type="text"
              placeholder="Search internships by title or company"
              value={searchTerm}
              onChange={handleSearch}
              aria-label="Search internships"
            />
            <button className={styles.searchBtn}>Search</button>
          </div>
        </div>

        <div className={styles.resultsSection}>
          <div className={styles.filterSection}>
            <div className={styles.filterHeader}>
              <h3>Filters</h3>
              <button onClick={resetFilters} className={styles.clearFiltersBtn}>
                Clear All
              </button>
            </div>

            <div className={styles.filtersRow}>
              {/* Company Filter */}
              <div className={styles.filterGroup}>
                <label htmlFor="companyFilter">Company:</label>
                <select
                  id="companyFilter"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className={styles.filterGroup}>
                <label htmlFor="locationFilter">Location:</label>
                <select
                  id="locationFilter"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Mode Filter */}
              <div className={styles.filterGroup}>
                <label htmlFor="modeFilter">Work Mode:</label>
                <select
                  id="modeFilter"
                  value={selectedMode}
                  onChange={(e) => setSelectedMode(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Modes</option>
                  {modes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Internship Type Filter */}
              <div className={styles.filterGroup}>
                <label htmlFor="typeFilter">Internship Type:</label>
                <select
                  id="typeFilter"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Filter */}
              <div className={styles.filterGroup}>
                <label htmlFor="sortBy">Sort By:</label>
                <select
                  id="sortBy"
                  value={sortCriteria}
                  onChange={(e) => setSortCriteria(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="company">Company Name</option>
                  <option value="title">Title</option>
                  <option value="location">Location</option>
                  <option value="date">Start Date</option>
                </select>
              </div>
            </div>
          </div>
          <div className={styles.header}>
            <h2>All internships ({filteredInternships.length})</h2>
          </div>
          <hr />{" "}
          <div className={styles.cards}>
            {currentInternships.map((internship) => (
              <InternshipCard
                key={internship.id}
                title={internship.title}
                company={internship.company}
                location={internship.location}
                companyIcon={companyIcon}
                mode={internship.mode}
                startDate={internship.startDate}
                endDate={internship.endDate}
                onClick={() => handleEditInternship(internship)}
              />
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Student Assignment Section */}
        <div className={styles.assignmentSection}>
          <h3>Assign Student to Selected Internship</h3>
          {selectedInternship ? (
            <div className={styles.selectedInternshipInfo}>
              <h4>Selected Internship: {selectedInternship.title}</h4>
              <p>Company: {selectedInternship.company}</p>
              <p>Location: {selectedInternship.location}</p>
              <p>Start Date: {formatDate(selectedInternship.startDate)}</p>
              <p>End Date: {formatDate(selectedInternship.endDate)}</p>
              <p>Available Seats: {selectedInternship.seats}</p>
            </div>
          ) : (
            <p>Select an internship from the list above</p>
          )}

          {selectedInternship && (
            <div className={styles.studentSearchSection}>
              <h4>Find Student</h4>
              <div className={styles.studentSearchInputs}>
                <input
                  type="text"
                  placeholder="Enter Student ID"
                  value={searchStudentId}
                  onChange={(e) => setSearchStudentId(e.target.value)}
                  className={styles.studentIdInput}
                />
                <button
                  onClick={handleCheckStudent}
                  className={styles.checkStudentBtn}
                >
                  Find Student
                </button>
              </div>

              {selectedStudent && (
                <div className={styles.studentAssignmentSection}>
                  <h4>Student Found:</h4>
                  <p>ID: {selectedStudent.id}</p>
                  <p>Name: {selectedStudent.name}</p>
                  <button
                    onClick={handleAssignStudent}
                    className={styles.assignStudentBtn}
                  >
                    Assign to {selectedInternship.title}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InternshipAdminPage;
