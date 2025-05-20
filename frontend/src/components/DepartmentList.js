import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DepartmentList.css';
import { FaEdit, FaTrash } from "react-icons/fa";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [columns, setColumns] = useState({
    DID: true,
    DNAME: true,
    DHEAD: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [editData, setEditData] = useState({});

  const columnAliases = {
    DID: "Department ID",
    DNAME: "Department Name",
    DHEAD: "Department Head",
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/departmentS');
      setDepartments(response.data);
      setFilteredDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      alert('Failed to fetch department details');
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = departments.filter((department) =>
      Object.values(department)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
    setFilteredDepartments(filtered);
  };

  const handleColumnToggle = (column) => {
    setColumns((prevColumns) => ({
      ...prevColumns,
      [column]: !prevColumns[column],
    }));
  };

  const handleEditClick = (row) => {
    setEditRow(row);
    setEditData({ ...row });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/departmentS/${editData.DID}`, editData);
      const updatedDepartments = departments.map((department) =>
        department.DID === editData.DID ? editData : department
      );
      setDepartments(updatedDepartments);
      setFilteredDepartments(updatedDepartments);
      setEditRow(null);
      setEditData({});
      alert('Department details updated successfully');
    } catch (error) {
      console.error('Error saving department details:', error);
      alert('Failed to save changes. Please try again later.');
    }
  };

  const handleDelete = async (did) => {
    try {
      await axios.delete(`http://localhost:5000/departmentS/${did}`);
      const updatedDepartments = departments.filter(
        (department) => department.DID !== did
      );
      setDepartments(updatedDepartments);
      setFilteredDepartments(updatedDepartments);
      alert('Department deleted successfully');
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Failed to delete department');
    }
  };
  
  useEffect(() => {
    fetchDepartments();
  }, []);

  const activeColumns = Object.keys(columns).filter((col) => columns[col]);

  return (
    <div>
      <h1>Department Management</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search departments..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Column Selection */}
      <div className="column-selection">
        <h3>Select Columns to Display</h3>
        {Object.keys(columns).map((col) => (
          <label key={col}>
            <input
              type="checkbox"
              checked={columns[col]}
              onChange={() => handleColumnToggle(col)}
              aria-label={`Toggle ${columnAliases[col] || col}`}
            />
            {columnAliases[col] || col}
          </label>
        ))}
      </div>

      {/* Table */}
      <table border="1" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            {activeColumns.map((col) => (
              <th key={col}>{columnAliases[col]}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDepartments.map((department) => (
            <tr key={department.DID}>
              {activeColumns.map((col) => (
                <td key={col}>{department[col] || 'N/A'}</td>
              ))}
              <td>
                <FaEdit className="icon-button-edit" onClick={() => handleEditClick(department)} title="Edit"/>
                <FaTrash className="icon-button-dlt" onClick={() => handleDelete(department.DID)} title="Delete"/>

                </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Form as Full-Screen Popup */}
      {editRow && (
        <div className="edit-form-popup">
          <div className="edit-form-content">
            <h2>Modify Department Details</h2>
            <div className="form-group">
              <label>Department Name:</label>
              <input
                type="text"
                name="DNAME"
                value={editData.DNAME}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Department Head:</label>
              <input
                type="text"
                name="DHEAD"
                value={editData.DHEAD}
                onChange={handleInputChange}
              />
            </div>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditRow(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;