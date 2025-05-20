import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ViewQualificationDetails.css';
import { FaEdit, FaTrash } from "react-icons/fa";

const ViewQualificationDetails = () => {
  const [qualificationDetails, setQualificationDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [columns, setColumns] = useState({
    EID: true,
    INSTITUTION: true,
    PERCENTAGE: true,
    SPECIALIZATION: true,
    YOG: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [editRow, setEditRow] = useState(null);
  const [editData, setEditData] = useState({});
  const [deleteRow, setDeleteRow] = useState(null); // State for delete confirmation

  const columnAliases = {
    EID: "Employee ID",
    INSTITUTION: "Institution",
    PERCENTAGE: "Percentage",
    SPECIALIZATION: "Specialization",
    YOG: "Year of Graduation",
  };

  const fetchQualificationDetails = async () => {
    try {
      const response = await axios.get('http://localhost:5000/qualifications');
      setQualificationDetails(response.data);
      setFilteredDetails(response.data); // Initialize filteredDetails with the fetched data
    } catch (error) {
      console.error('Error fetching qualification details:', error);
      alert('Failed to fetch qualification details');
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = qualificationDetails.filter((qualification) =>
        Object.values(qualification)
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

      const response = await axios.put("http://localhost:5000/qualifications", {
      oldEID: editRow.EID,
      oldINSTITUTION: editRow.INSTITUTION,
      oldPERCENTAGE: editRow.PERCENTAGE,
      oldSPECIALIZATION: editRow.SPECIALIZATION,
      oldYOG: editRow.YOG,
      newINSTITUTION: editData.INSTITUTION,
      newPERCENTAGE: editData.PERCENTAGE,
      newSPECIALIZATION: editData.SPECIALIZATION,
      newYOG: editData.YOG,
    });

    console.log("Update response:", response.data);

    // Update the frontend state
    const updatedDetails = qualificationDetails.map((qualification) =>
      qualification.EID === editRow.EID &&
      qualification.INSTITUTION === editRow.INSTITUTION &&
      qualification.PERCENTAGE === editRow.PERCENTAGE &&
      qualification.SPECIALIZATION === editRow.SPECIALIZATION &&
      qualification.YOG === editRow.YOG
        ? editData // Replace with edited data
        : qualification
    );
      setQualificationDetails(updatedDetails);
      setFilteredDetails(updatedDetails);

      setEditRow(null);
      setEditData({});
      alert('Qualification details updated successfully');
    } catch (error) {
      console.error('Error saving qualification details:', error.message);
      alert('Failed to save changes. Please try again later.');
    }
  };

  const handleDeleteClick = (qualification) => {
    setDeleteRow(qualification);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete('http://localhost:5000/qualifications', {
        data: {
          EID: deleteRow.EID,
          INSTITUTION: deleteRow.INSTITUTION,
          PERCENTAGE: deleteRow.PERCENTAGE,
          YOG: deleteRow.YOG,
        },
      });
      console.log('Delete response:', response.data);
      const updatedQualificationDetails = qualificationDetails.filter(
        (q) =>
          q.EID !== deleteRow.EID ||
          q.INSTITUTION !== deleteRow.INSTITUTION ||
          q.PERCENTAGE !== deleteRow.PERCENTAGE ||
          q.YOG !== deleteRow.YOG
      );
      setQualificationDetails(updatedQualificationDetails);
      setFilteredDetails(updatedQualificationDetails);
      setDeleteRow(null);
      alert('Qualification details deleted successfully');
    } catch (error) {
      console.error('Error deleting qualification details:', error);
      alert('Failed to delete qualification details');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteRow(null);
  };

  useEffect(() => {
    fetchQualificationDetails();
  }, []);

  const activeColumns = Object.keys(columns).filter((col) => columns[col]);

  return (
    <div>
      <h1>Qualification Details</h1>
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
          {filteredDetails.map((qualification, index) => (
            <tr key={index}>
              {Object.keys(columns).map(
                (col) => columns[col] && <td key={col}>{qualification[col] || 'N/A'}</td>
              )}
              <td>
                <button className="icon-button-edit" onClick={() => handleEditClick(qualification)} title="Modify"><FaEdit/></button>
                <button className="icon-button-dlt" onClick={() => handleDeleteClick(qualification)} title="Delete"><FaTrash/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editRow && (
        <div className="edit-form-popup">
          <div className="edit-form-content">
            <h2>Modify Qualification Details</h2>
            <div className="form-group">
              <label>Institution:</label>
              <input
                type="text"
                name="INSTITUTION"
                value={editData.INSTITUTION}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Percentage:</label>
              <input
                type="number"
                name="PERCENTAGE"
                value={editData.PERCENTAGE}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Specialization:</label>
              <input
                type="text"
                name="SPECIALIZATION"
                value={editData.SPECIALIZATION}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Year of Graduation:</label>
              <input
                type="number"
                name="YOG"
                value={editData.YOG}
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

export default ViewQualificationDetails;