import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaCog, FaTimes } from 'react-icons/fa';
import './CombinedEmployeeView.css';

const CombinedEmployeeView = () => {
  // State for all data types with proper initialization
  const [employees, setEmployees] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [families, setFamilies] = useState([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  // UI states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Column visibility configuration
  const [columns, setColumns] = useState({
    // Basic info columns
    EID: true,
  INITIAL: true,
  FIRSTNAME: true,
  MIDDLENAME: false,
  LASTNAME: true,
  DESIGNATION: true,
  DOB: false,
  DATE_OF_JOIN: true,
  FTYPE: false,
  NATIONALITY: false,
  PHONE: true,
  EMAIL: true,
  CASTE: false,
  DOORNO: false,
  CITY: false,
  STATE: false,
  PINCODE: false,
  GENDER: false,
  PROFEXP_DESIGNATION: false,
  PPROFEXP_FROM: false,
  PPROFEXP_TO: false,
  LEAVE_ML: false,
  LEAVE_LOP: false,
  LEAVE_RH: false,
  LEAVE_OOD: false,
  LEAVE_CL: false,
  DID: false,

  // Qualification Details
  INSTITUTION: true,
  PERCENTAGE: false,
  SPECIALIZATION: true,
  YOG: true,

  // Employee Account Details
  BIOMETRIC_CARD_NO: true,
  AADHAR: false,
  BANK_ACC: false,
  PAN: true,

  // Family Details
  FNAME: true,
  F_DOB: false,
  MNAME: true,
  M_DOB: false
  });

  // Column aliases for display
  const columnAliases = {
    EID: "Employee ID",
  INITIAL: "Initial",
  FIRSTNAME: "First Name",
  MIDDLENAME: "Middle Name",
  LASTNAME: "Last Name",
  DESIGNATION: "Designation",
  DOB: "Date of Birth",
  DATE_OF_JOIN: "Date of Joining",
  FTYPE: "Faculty Type",
  NATIONALITY: "Nationality",
  PHONE: "Phone",
  EMAIL: "Email",
  CASTE: "Caste",
  DOORNO: "Door No.",
  CITY: "City",
  STATE: "State",
  PINCODE: "Pincode",
  GENDER: "Gender",
  PROFEXP_DESIGNATION: "Previous Designation",
  PPROFEXP_FROM: "Previous Experience From",
  PPROFEXP_TO: "Previous Experience To",
  LEAVE_ML: "Medical Leave",
  LEAVE_LOP: "Loss of Pay",
  LEAVE_RH: "Restricted Holiday",
  LEAVE_OOD: "On Official Duty",
  LEAVE_CL: "Casual Leave",
  DID: "Department ID",

  // Qualification Details
  INSTITUTION: "Institution",
  PERCENTAGE: "Percentage",
  SPECIALIZATION: "Specialization",
  YOG: "Year of Graduation",

  // Employee Account Details
  BIOMETRIC_CARD_NO: "Biometric Card Number",
  AADHAR: "Aadhar",
  BANK_ACC: "Bank Account",
  PAN: "PAN",

  // Family Details
  FNAME: "Father's Name",
  F_DOB: "Father's DOB",
  MNAME: "Mother's Name",
  M_DOB: "Mother's DOB"
  };

const fetchAllData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const response = await axios.get('http://localhost:5000/employees');
    
    if (!response.data) {
      throw new Error('No data received from server');
    }

    console.log("API Response:", response.data); // Log the response
    
    const { employees = [], qualifications = [], accounts = [], families = [] } = response.data;
    
    setEmployees(employees);
    setQualifications(qualifications);
    setAccounts(accounts);
    setFamilies(families);
    setFilteredEmployees(employees);
  } catch (err) {
    console.error('Full error:', err);
    console.error('Error response:', err.response); // This will show the server's error response
    setError(err.response?.data?.detailedError || err.message || 'Failed to load employee data');
  } finally {
    setIsLoading(false);
  }
};

  // Handle search
  useEffect(() => {
    if (!Array.isArray(employees)) return;
    
    if (!searchQuery) {
      setFilteredEmployees(employees);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(emp => 
      emp && Object.values(emp).some(val => 
        val && String(val).toLowerCase().includes(query)
      )
    );
    setFilteredEmployees(filtered || []);
  }, [searchQuery, employees]);

  // Load data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Toggle column visibility
  const toggleColumn = (column) => {
    setColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  // Get employee qualifications
  const getEmployeeQualifications = (eid) => {
    return qualifications.filter(q => q.EID === eid);
  };

  // Get employee account details
  const getEmployeeAccount = (eid) => {
    return accounts.find(a => a.EID === eid) || {};
  };

  // Get employee family details
  const getEmployeeFamily = (eid) => {
    return families.find(f => f.EID === eid) || {};
  };

  // Render the main table
  const renderEmployeeTable = () => {
    if (!Array.isArray(filteredEmployees)) {
      return <div className="error-message">No employee data available</div>;
    }

    // Get all visible columns
    const visibleColumns = Object.keys(columns).filter(col => columns[col]);

    return (
      <div className="table-container">
        <table className="employee-table">
          <thead>
            <tr>
              {visibleColumns.map(col => (
                <th key={col}>{columnAliases[col]}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(emp => {
              const employeeQuals = getEmployeeQualifications(emp.EID);
              const employeeAccount = getEmployeeAccount(emp.EID);
              const employeeFamily = getEmployeeFamily(emp.EID);

              return (
                <tr key={emp.EID}>
                  {visibleColumns.map(col => {
                    // Handle basic employee info
                    if (emp[col] !== undefined) {
                      return (
                        <td key={`${emp.EID}-${col}`}>
                          {col.includes('DATE') || col === 'DOB' ? formatDate(emp[col]) : emp[col] || 'N/A'}
                        </td>
                      );
                    }
                    // Handle qualification info
                    else if (col === 'INSTITUTION' || col === 'SPECIALIZATION' || col === 'YOG' || col === 'PERCENTAGE') {
                      return (
                        <td key={`${emp.EID}-${col}`}>
                          {employeeQuals.length > 0 ? (
                            <ul className="qualification-list">
                              {employeeQuals.map((qual, idx) => (
                                <li key={`${emp.EID}-qual-${idx}`}>
                                  {qual[col] || 'N/A'}
                                </li>
                              ))}
                            </ul>
                          ) : 'N/A'}
                        </td>
                      );
                    }
                    // Handle account info
                    else if (employeeAccount[col] !== undefined) {
                      return (
                        <td key={`${emp.EID}-${col}`}>
                          {employeeAccount[col] || 'N/A'}
                        </td>
                      );
                    }
                    // Handle family info
                    else if (employeeFamily[col] !== undefined) {
                      return (
                        <td key={`${emp.EID}-${col}`}>
                          {col.includes('DOB') ? formatDate(employeeFamily[col]) : employeeFamily[col] || 'N/A'}
                        </td>
                      );
                    }
                    return <td key={`${emp.EID}-${col}`}>N/A</td>;
                  })}
                  <td className="action-buttons">
                    <button className="icon-button-edit" title="Edit">
                      <FaEdit />
                    </button>
                    <button className="icon-button-dlt" title="Delete">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Render loading, error, or content
  const renderContent = () => {
    if (isLoading) {
      return <div className="loading">Loading employee data...</div>;
    }
    
    if (error) {
      return <div className="error-message">{error}</div>;
    }
    
    return renderEmployeeTable();
  };

  return (
    <div className="combined-employee-view">
      <h1>Employee Management</h1>
      
      <div className="controls">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button 
          className="column-settings-btn"
          onClick={() => setShowColumnSelector(!showColumnSelector)}
        >
          <FaCog /> Columns
        </button>
      </div>
      
      {showColumnSelector && (
  <div className="column-selector">
    <div className="column-selector-header">
      <h3>Select Columns to Display</h3>
      <button className="close-button" onClick={() => setShowColumnSelector(false)}>
        <FaTimes />
      </button>
    </div>
    
    <div className="column-groups">
      {/* Basic Information Group */}
      <div className="column-group">
        <h4>Basic Information</h4>
        {[
          'EID', 'INITIAL', 'FIRSTNAME', 'MIDDLENAME', 'LASTNAME', 
          'DESIGNATION', 'DOB', 'DATE_OF_JOIN', 'FTYPE', 'NATIONALITY',
          'PHONE', 'EMAIL', 'CASTE', 'DOORNO', 'CITY', 'STATE', 
          'PINCODE', 'GENDER', 'PROFEXP_DESIGNATION', 'PPROFEXP_FROM',
          'PPROFEXP_TO', 'LEAVE_ML', 'LEAVE_LOP', 'LEAVE_RH', 
          'LEAVE_OOD', 'LEAVE_CL', 'DID'
        ].map(col => (
          <label key={col}>
            <input
              type="checkbox"
              checked={columns[col] || false}
              onChange={() => toggleColumn(col)}
            />
            {columnAliases[col]}
          </label>
        ))}
      </div>
      
      {/* Qualification Details Group */}
      <div className="column-group">
        <h4>Qualification Details</h4>
        {['INSTITUTION', 'PERCENTAGE', 'SPECIALIZATION', 'YOG'].map(col => (
          <label key={col}>
            <input
              type="checkbox"
              checked={columns[col] || false}
              onChange={() => toggleColumn(col)}
            />
            {columnAliases[col]}
          </label>
        ))}
      </div>
      
      {/* Account Details Group */}
      <div className="column-group">
        <h4>Account Details</h4>
        {['BIOMETRIC_CARD_NO', 'AADHAR', 'BANK_ACC', 'PAN'].map(col => (
          <label key={col}>
            <input
              type="checkbox"
              checked={columns[col] || false}
              onChange={() => toggleColumn(col)}
            />
            {columnAliases[col]}
          </label>
        ))}
      </div>
      
      {/* Family Details Group */}
      <div className="column-group">
        <h4>Family Details</h4>
        {['FNAME', 'F_DOB', 'MNAME', 'M_DOB'].map(col => (
          <label key={col}>
            <input
              type="checkbox"
              checked={columns[col] || false}
              onChange={() => toggleColumn(col)}
            />
            {columnAliases[col]}
          </label>
        ))}
      </div>
    </div>
  </div>
)}

      
      {renderContent()}
    </div>
  );
};

export default CombinedEmployeeView;