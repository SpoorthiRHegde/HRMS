import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EmployeeList.css";
import { FaEdit, FaTrash, FaCog, FaTimes, FaSearch } from "react-icons/fa";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [columns, setColumns] = useState({
    EID: true,
    INITIAL: true,
    FIRSTNAME: true,
    MIDDLENAME: true,
    LASTNAME: true,
    DESIGNATION: true,
    DOB: true,
    DATE_OF_JOIN: true,
    FTYPE: false,
    NATIONALITY: true,
    PHONE: true,
    EMAIL: true,
    CASTE: false,
    DOORNO: false,
    CITY: true,
    STATE: true,
    PINCODE: true,
    GENDER: true,
    PROFEXP_DESIGNATION: true,
    PPROFEXP_FROM: true,
    PPROFEXP_TO: true,
    LEAVE_ML: true,
    LEAVE_LOP: true,
    LEAVE_RH: true,
    LEAVE_OOD: true,
    LEAVE_CL: true,
    DID: true,
  });
  const [editRow, setEditRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const columnAliases = {
    EID: "Employee ID",
    INITIAL: "Initial",
    FIRSTNAME: "First Name",
    MIDDLENAME: "Middle Name",
    LASTNAME: "Last Name",
    DESIGNATION: "Designation",
    DOB: "Date of Birth",
    DATE_OF_JOIN: "Date of Joining",
    FTYPE: "Employee Type",
    NATIONALITY: "Nationality",
    PHONE: "Phone",
    EMAIL: "Email",
    CASTE: "Caste",
    DOORNO: "Door No",
    CITY: "City",
    STATE: "State",
    PINCODE: "Pincode",
    GENDER: "Gender",
    PROFEXP_DESIGNATION: "Prof Exp Degn",
    PPROFEXP_FROM: "Prof Exp From",
    PPROFEXP_TO: "Prof Exp To",
    LEAVE_ML: "Leave ML",
    LEAVE_LOP: "Leave LOP",
    LEAVE_RH: "Leave RH",
    LEAVE_OOD: "Leave OOD",
    LEAVE_CL: "Leave CL",
    DID: "Department ID",
  };

  // Convert MySQL date (YYYY-MM-DD) to DD-MM-YYYY
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Convert input date (DD-MM-YYYY) to MySQL format (YYYY-MM-DD)
  const formatDateForDB = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  // Fetch employees and format dates
  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/employees");
      console.log("Data from backend:", response.data); // Debug: Log the data from the backend
      const formattedData = response.data.map((emp) => ({
        ...emp,
        EID: emp.EID.toString(), // Ensure EID is a string
        DOB: formatDateForDisplay(emp.DOB),
        DATE_OF_JOIN: formatDateForDisplay(emp.DATE_OF_JOIN),
        PPROFEXP_FROM: formatDateForDisplay(emp.PPROFEXP_FROM),
        PPROFEXP_TO: formatDateForDisplay(emp.PPROFEXP_TO),
      }));
      setEmployees(formattedData);
      setFilteredEmployees(formattedData); // Initialize filtered employees
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employee details");
    }
  };

  // Handle search automatically when searchQuery changes
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    console.log("Search Query:", query); // Debug: Log the search query

    if (!query) {
      // If the search query is empty, reset the filtered list to all employees
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter((employee) => {
      // Check if any field includes the search query
      return Object.values(employee).some((value) => {
        const stringValue = value?.toString().toLowerCase() || "";
        return stringValue.includes(query);
      });
    });

    console.log("Filtered Employees:", filtered); // Debug: Log the filtered results
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const handleDelete = async (eid) => {
    try {
      await axios.delete(`http://localhost:5000/employees/${eid}`);
      setEmployees(employees.filter((employee) => employee.EID !== eid));
      setFilteredEmployees(filteredEmployees.filter((employee) => employee.EID !== eid));
      alert("Employee deleted successfully");
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
    }
  };

  const handleModifyClick = (employee) => {
    setEditRow(employee);
    setEditData({
      ...employee,
      DOB: employee.DOB ? formatDateForDisplay(employee.DOB) : "",
      DATE_OF_JOIN: employee.DATE_OF_JOIN ? formatDateForDisplay(employee.DATE_OF_JOIN) : "",
      PPROFEXP_FROM: employee.PPROFEXP_FROM ? formatDateForDisplay(employee.PPROFEXP_FROM) : "",
      PPROFEXP_TO: employee.PPROFEXP_TO ? formatDateForDisplay(employee.PPROFEXP_TO) : "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    try {
      // Validate dates
      if (new Date(editData.PPROFEXP_FROM) > new Date(editData.PPROFEXP_TO)) {
        alert("PPROFEXP_FROM must be before PPROFEXP_TO");
        return;
      }

      if (new Date(editData.DOB) > new Date()) {
        alert("DOB cannot be in the future");
        return;
      }

      if (new Date(editData.DATE_OF_JOIN) < new Date(editData.DOB)) {
        alert("DATE_OF_JOIN must be after DOB");
        return;
      }

      // Format dates for the database
      const formattedData = {
        ...editData,
        DOB: formatDateForDB(editData.DOB),
        DATE_OF_JOIN: formatDateForDB(editData.DATE_OF_JOIN),
        PPROFEXP_FROM: formatDateForDB(editData.PPROFEXP_FROM),
        PPROFEXP_TO: formatDateForDB(editData.PPROFEXP_TO),
      };

      // Send data to the backend
      const response = await axios.put(`http://localhost:5000/employees/${editData.EID}`, formattedData);
      setEmployees(
        employees.map((emp) => (emp.EID === editData.EID ? formattedData : emp))
      );
      setFilteredEmployees(
        filteredEmployees.map((emp) => (emp.EID === editData.EID ? formattedData : emp))
      );
      setEditRow(null);
      alert("Employee details updated successfully");
    } catch (error) {
      console.error("Error saving employee details:", error);
      alert(error.response?.data?.error || "Failed to save changes");
    }
  };

  const toggleColumn = (column) => {
    setColumns({ ...columns, [column]: !columns[column] });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div>
      <h1>Employee Management</h1>
      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <button onClick={() => setShowColumnSelector(!showColumnSelector)}>
        <FaCog /> Column Settings
      </button>
      {showColumnSelector && (
        <div className="column-selector">
          <div className="column-selector-header">
            <h3>Select Columns to Display</h3>
            <button className="close-button" onClick={() => setShowColumnSelector(false)}>
              <FaTimes />
            </button>
          </div>
          {Object.keys(columns).map((col) => (
            <label key={col}>
              <input
                type="checkbox"
                checked={columns[col]}
                onChange={() => toggleColumn(col)}
              />
              {columnAliases[col]}
            </label>
          ))}
        </div>
      )}
      <table border="1" style={{ marginTop: "20px", width: "100%" }}>
        <thead>
          <tr>
            {Object.keys(columns).map((col) => columns[col] && <th key={col}>{columnAliases[col]}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((employee) => (
            <tr key={employee.EID}>
              {Object.keys(columns).map((col) => 
                columns[col] && <td key={col}>{employee[col] || "N/A"}</td>
              )}
              <td>
                <FaEdit className="icon-button-edit" onClick={() => handleModifyClick(employee)} title="Edit"/>
                <FaTrash className="icon-button-dlt" onClick={() => handleDelete(employee.EID)} title="Delete"/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editRow && (
        <div className="edit-form-popup">
          <div className="edit-form-content">
            <h2>Modify Employee Details</h2>
            {Object.keys(editData).map((key) => (
              <div className="form-group" key={key}>
                <label>{columnAliases[key] || key}:</label>
                <input type="text" name={key} value={editData[key] || ""} onChange={handleInputChange} />
              </div>
            ))}
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditRow(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;