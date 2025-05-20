import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ViewEmployeeAccount.css';
import { FaEdit, FaTrash } from "react-icons/fa";

const ViewEmployeeAccount = () => {
  const [employeeDetails, setEmployeeDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [columns, setColumns] = useState({
    EID: true,
    BIOMETRIC_CARD_NO: true,
    AADHAR: true,
    BANK_ACC: true,
    PAN: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteRow, setDeleteRow] = useState(null); // State for delete confirmation

  const columnAliases = {
    EID: "Employee ID",
    BIOMETRIC_CARD_NO: "Biometric Card No",
    AADHAR: "Aadhar Number",
    BANK_ACC: "Bank Account Number",
    PAN: "PAN Number",
  };

  const fetchEmployeeDetails = async () => {
    try {
      const response = await axios.get('http://localhost:5000/employee-accounts');
      setEmployeeDetails(response.data);
      setFilteredDetails(response.data); // Initialize filteredDetails with the fetched data
    } catch (error) {
      console.error('Error fetching employee details:', error);
      alert('Failed to fetch employee details');
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = employeeDetails.filter((employee) =>
        Object.values(employee)
            .join(' ')
            .toLowerCase()
            .includes(term)
    );
    setFilteredDetails(filtered);
  };

  const handleColumnToggle = (column) => {
    setColumns({ ...columns, [column]: !columns[column] });
  };

  const handleEditClick = (row) => {
    setEditRow(row);
    const rowData = { ...row };
    setEditData(rowData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    try {
      console.log('Sending update request with:', editData);

      const response = await axios.put(`http://localhost:5000/employee-accounts/${editData.EID}`, editData);
      console.log('Update response:', response.data);

      const updatedDetails = employeeDetails.map((employee) =>
        employee.EID === editData.EID ? editData : employee
      );
      setEmployeeDetails(updatedDetails);
      setFilteredDetails(updatedDetails);

      setEditRow(null);
      setEditData({});
      alert('Employee account details updated successfully');
    } catch (error) {
      console.error('Error saving employee account details:', error.message);
      alert('Failed to save changes. Please try again later.');
    }
  };

  const handleDeleteClick = (employee) => {
    setDeleteRow(employee);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/employee-accounts/${deleteRow.EID}`);
      console.log('Delete response:', response.data);
      const updatedEmployeeDetails = employeeDetails.filter(
        (e) => e.EID !== deleteRow.EID
      );
      setEmployeeDetails(updatedEmployeeDetails);
      setFilteredDetails(updatedEmployeeDetails);
      setDeleteRow(null);
      alert('Employee account deleted successfully');
    } catch (error) {
      console.error('Error deleting employee account:', error);
      alert('Failed to delete employee account');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteRow(null);
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, []);

  const activeColumns = Object.keys(columns).filter((col) => columns[col]);

  return (
    <div>
      <h1>Employee Account Details</h1>
      <div className="search-bar">
          <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
          />
      </div>
      <h3>Select Columns to Display</h3>
      <div className="column-selection">
        {Object.keys(columns).map((col) => (
          <label key={col}>
            <input
              type="checkbox"
              checked={columns[col]}
              onChange={() => handleColumnToggle(col)}
            />
            {columnAliases[col] || col}
          </label>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            {Object.keys(columns).map(
              (col) => columns[col] && <th key={col}>{columnAliases[col]}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredDetails.map((employee, index) => (
            <tr key={index}>
              {Object.keys(columns).map(
                (col) => columns[col] && <td key={col}>{employee[col] || 'N/A'}</td>
              )}
              <td>
                <button className="icon-button-edit" onClick={() => handleEditClick(employee)} title="Modify"><FaEdit/></button>
                <button className="icon-button-dlt" onClick={() => handleDeleteClick(employee)} title="Delete"><FaTrash/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editRow && (
        <div className="edit-form-popup">
          <div className="edit-form-content">
            <h2>Modify Employee Account Details</h2>
            <div className="form-group">
              <label>Biometric Card No:</label>
              <input
                type="text"
                name="BIOMETRIC_CARD_NO"
                value={editData.BIOMETRIC_CARD_NO}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Aadhar Number:</label>
              <input
                type="text"
                name="AADHAR"
                value={editData.AADHAR}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Bank Account Number:</label>
              <input
                type="text"
                name="BANK_ACC"
                value={editData.BANK_ACC}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>PAN Number:</label>
              <input
                type="text"
                name="PAN"
                value={editData.PAN}
                onChange={handleInputChange}
              />
            </div>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditRow(null)}>Cancel</button>
          </div>
        </div>
      )}
      {deleteRow && (
        <div className="delete-confirm-popup">
          <div className="delete-confirm-content">
            <h2>Delete this record?</h2>
            <button onClick={handleDeleteConfirm}>Delete</button>
            <button onClick={handleDeleteCancel}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEmployeeAccount;