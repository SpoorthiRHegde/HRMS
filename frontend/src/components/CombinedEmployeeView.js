import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaCog, FaTimes, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import './CombinedEmployeeView.css';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

const downloadEmployeePDF = (employee) => {
  try {
    const doc = new jsPDF();
    const account = getEmployeeAccount(employee.EID);
    const family = getEmployeeFamily(employee.EID);
    const qualifications = getEmployeeQualifications(employee.EID);

    // Add title
    doc.setFontSize(18);
    doc.text('Employee Detailed Report', 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Employee Basic Information Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('1. Basic Information', 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Field', 'Value']],
      body: [
        ['Employee ID', employee.EID || 'N/A'],
        ['Name', `${employee.INITIAL || ''} ${employee.FIRSTNAME || ''} ${employee.MIDDLENAME || ''} ${employee.LASTNAME || ''}`.trim()],
        ['Designation', employee.DESIGNATION || 'N/A'],
        ['Department ID', employee.DID || 'N/A'],
        ['Date of Birth', formatDate(employee.DOB) || 'N/A'],
        ['Date of Joining', formatDate(employee.DATE_OF_JOIN) || 'N/A'],
        ['Gender', employee.GENDER || 'N/A'],
        ['Phone', employee.PHONE || 'N/A'],
        ['Email', employee.EMAIL || 'N/A'],
        ['Address', `${employee.DOORNO || ''}, ${employee.CITY || ''}, ${employee.STATE || ''} - ${employee.PINCODE || ''}`.trim()],
        ['Nationality', employee.NATIONALITY || 'N/A'],
        ['Faculty Type', employee.FTYPE || 'N/A'],
        ['Caste', employee.CASTE || 'N/A']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      }
    });

    // Professional Experience Section
    if (employee.PPROFEXP_FROM || employee.PPROFEXP_TO || employee.PROFEXP_DESIGNATION) {
      doc.setFontSize(14);
      doc.text('2. Professional Experience', 14, doc.lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Designation', 'From', 'To']],
        body: [
          [
            employee.PROFEXP_DESIGNATION || 'N/A',
            formatDate(employee.PPROFEXP_FROM) || 'N/A',
            formatDate(employee.PPROFEXP_TO) || 'N/A'
          ]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: [52, 152, 219],
          textColor: 255,
          fontStyle: 'bold'
        }
      });
    }

    // Account Details Section
    doc.setFontSize(14);
    doc.text('3. Account Details', 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Field', 'Value']],
      body: [
        ['Biometric Card No.', account.BIOMETRIC_CARD_NO || 'N/A'],
        ['Aadhar Number', account.AADHAR || 'N/A'],
        ['Bank Account', account.BANK_ACC || 'N/A'],
        ['PAN Number', account.PAN || 'N/A']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [155, 89, 182],
        textColor: 255,
        fontStyle: 'bold'
      }
    });

    // Family Details Section
    doc.setFontSize(14);
    doc.text('4. Family Details', 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Relation', 'Name', 'Date of Birth']],
      body: [
        ['Father', family.FNAME || 'N/A', formatDate(family.F_DOB) || 'N/A'],
        ['Mother', family.MNAME || 'N/A', formatDate(family.M_DOB) || 'N/A']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [231, 76, 60],
        textColor: 255,
        fontStyle: 'bold'
      }
    });

    // Qualifications Section
    if (qualifications.length > 0) {
      doc.setFontSize(14);
      doc.text('5. Educational Qualifications', 14, doc.lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Institution', 'Specialization', 'Year', 'Percentage']],
        body: qualifications.map(q => [
          q.INSTITUTION || 'N/A',
          q.SPECIALIZATION || 'N/A',
          q.YOG || 'N/A',
          q.PERCENTAGE ? `${q.PERCENTAGE}%` : 'N/A'
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: [26, 188, 156],
          textColor: 255,
          fontStyle: 'bold'
        }
      });
    }

    // Leave Balances Section
    doc.setFontSize(14);
    doc.text('6. Leave Balances', 14, doc.lastAutoTable.finalY + 15);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Leave Type', 'Balance']],
      body: [
        ['Medical Leave', employee.LEAVE_ML || 'N/A'],
        ['Casual Leave', employee.LEAVE_CL || 'N/A'],
        ['Restricted Holiday', employee.LEAVE_RH || 'N/A'],
        ['On Official Duty', employee.LEAVE_OOD || 'N/A'],
        ['Loss of Pay', employee.LEAVE_LOP || 'N/A']
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [241, 196, 15],
        textColor: 0,
        fontStyle: 'bold'
      }
    });

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    doc.save(`Employee_${employee.EID}_Full_Details.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};

  // Download all displayed employees as Excel
  const downloadAllEmployeesExcel = () => {
    const data = filteredEmployees.map(emp => {
      const account = getEmployeeAccount(emp.EID);
      const family = getEmployeeFamily(emp.EID);
      
      return {
        'Employee ID': emp.EID,
        'Name': `${emp.FIRSTNAME || ''} ${emp.LASTNAME || ''}`,
        'Designation': emp.DESIGNATION,
        'Date of Joining': formatDate(emp.DATE_OF_JOIN),
        'Email': emp.EMAIL,
        'Phone': emp.PHONE,
        'Biometric Card': account.BIOMETRIC_CARD_NO || 'N/A',
        'PAN': account.PAN || 'N/A',
        "Father's Name": family.FNAME || 'N/A',
        "Mother's Name": family.MNAME || 'N/A'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employees_data.xlsx");
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
                    <button 
          className="icon-button-pdf" 
          title="Download PDF"
          onClick={() => downloadEmployeePDF(emp)}
        >
          <FaFilePdf /> PDF
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
         <button 
    className="excel-download-btn"
    onClick={downloadAllEmployeesExcel}
  >
    <FaFileExcel /> Export to Excel
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