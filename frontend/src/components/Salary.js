import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './addsalary.css';
import { FaEdit, FaTrash } from "react-icons/fa";

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [filteredSalaries, setFilteredSalaries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [columns, setColumns] = useState({
    EID: true,
    BASIC_SAL: true,
    AGP: true,
    ESI: true,
    LOAN: true,
    IT: true,
    SAL_DATE: true,
  });
  const [editRow, setEditRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteRow, setDeleteRow] = useState(null);

  const columnAliases = {
    EID: "Employee ID",
    BASIC_SAL: "Basic Salary",
    AGP: "AGP",
    ESI: "ESI",
    LOAN: "Loan",
    IT: "Income Tax",
    SAL_DATE: "Date",
  };

  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const formatDateForDB = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

//   const minSALDate = new Date();
// minSALDate.setFullYear(minSALDate.getFullYear() - 50); // 50 years ago
// const maxSALDate = new Date();
// maxSALDate.setFullYear(maxSALDate.getFullYear() + 1); // Up to next year

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/salaries');
      const formattedData = response.data.map((salaryDetails) => ({
        ...salaryDetails,
        SAL_DATE: formatDateForDisplay(salaryDetails.SAL_DATE)
      }));
      setSalaries(formattedData);
      setFilteredSalaries(formattedData);
    } catch (error) {
      console.error('Error fetching salaries:', error);
      alert('Failed to fetch salary details');
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = salaries.filter((salary) =>
      Object.values(salary)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
    setFilteredSalaries(filtered);
  };

  const handleColumnToggle = (column) => {
    setColumns({ ...columns, [column]: !columns[column] });
  };

  const handleEditClick = (salary) => {
    setEditRow(salary);
    setEditData({ ...salary,
      SAL_DATE: formatDateForDB(salary.SAL_DATE)
     });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const formattedEditData = {
        ...editData,
        SAL_DATE: formatDate(editData.SAL_DATE),
      };
      const response = await axios.put(`http://localhost:5000/salaries/${editData.EID}`, formattedEditData);
      const updatedSalaries = salaries.map((salary) =>
        salary.EID === editData.EID ? formattedEditData : salary
      );
      setSalaries(updatedSalaries);
      setFilteredSalaries(updatedSalaries);
      setEditRow(null);
      setEditData({});
      alert('Salary details updated successfully');
    } catch (error) {
      console.error('Error saving salary details:', error);
      alert('Failed to save changes');
    }
  };
  
  const handleDeleteClick = (salary) => {
    setDeleteRow(salary);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/salaries/${deleteRow.EID}`);
      const updatedSalaries = salaries.filter((salary) => salary.EID !== deleteRow.EID);
      setSalaries(updatedSalaries);
      setFilteredSalaries(updatedSalaries);
      setDeleteRow(null);
      alert('Salary entry deleted successfully');
    } catch (error) {
      console.error('Error deleting salary entry:', error);
      alert('Failed to delete salary entry');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteRow(null);
  };

  return (
    <div className="salary-management">
      <h1>Salary Management</h1>

      <input
        type="text"
        placeholder="Search by Employee ID..."
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: '10px', padding: '5px', width: '250px' }}
      />

      <div className="column-selection">
        <h3>Select Columns to Display</h3>
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

      <table border="1" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            {Object.keys(columns).map(
              (col) => columns[col] && <th key={col}>{columnAliases[col]}</th>
            )}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSalaries.map((salary) => (
            <tr key={salary.EID}>
              {Object.keys(columns).map(
                (col) => columns[col] && <td key={col}>{salary[col] || 'N/A'}</td>
              )}
              <td>
                <FaEdit className="icon-button-edit" onClick={() => handleEditClick(salary)} title="Modify"/>
                <FaTrash className="icon-button-dlt" onClick={() => handleDeleteClick(salary)} title="Delete"/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editRow && (
        <div className="edit-form-popup">
          <div className="edit-form-content">
            <h2>Modify Salary Details</h2>
            <div className="form-group">
              <label>Basic Salary:</label>
              <input
                type="text"
                name="BASIC_SAL"
                value={editData.BASIC_SAL}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Salary Date:</label>
              <input
                type="date"
                name="SAL_DATE"
                value={editData.SAL_DATE}
                onChange={handleInputChange}
                // min={minSALDate.toISOString().split('T')[0]}
                // max={maxSALDate.toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>AGP:</label>
              <input
                type="text"
                name="AGP"
                value={editData.AGP}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>ESI:</label>
              <input
                type="text"
                name="ESI"
                value={editData.ESI}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Loan:</label>
              <input
                type="text"
                name="LOAN"
                value={editData.LOAN}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Income Tax:</label>
              <input
                type="text"
                name="IT"
                value={editData.IT}
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

export default Salary;