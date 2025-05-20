import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ViewFamily.css';
import { FaEdit, FaTrash } from "react-icons/fa";

const ViewFamily = () => {
    const [familyDetails, setFamilyDetails] = useState([]);
    const [filteredDetails, setFilteredDetails] = useState([]);
    const [columns, setColumns] = useState({
        EID: true,
        FNAME: true,
        F_DOB: true,
        MNAME: true,
        M_DOB: true,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [editRow, setEditRow] = useState(null);
    const [editData, setEditData] = useState({});

    const columnAliases = {
        EID: "Employee ID",
        FNAME: "Family Member Name",
        F_DOB: "Family Member DOB",
        MNAME: "Mother's Name",
        M_DOB: "Mother's DOB",
    };

    const minDOB = new Date();
  minDOB.setFullYear(minDOB.getFullYear() - 100); // Minimum DOB: 100 years ago
  const maxDOB = new Date();
  maxDOB.setFullYear(maxDOB.getFullYear() - 35); 

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

    const fetchFamilyDetails = async () => {
        try {
            const response = await axios.get('http://localhost:5000/families');
            const formattedData = response.data.map((familyDetails) => ({
                ...familyDetails,
                F_DOB: formatDateForDisplay(familyDetails.F_DOB),
                M_DOB: formatDateForDisplay(familyDetails.M_DOB)
              }));
              setFamilyDetails(formattedData);
            setFilteredDetails(formattedData);
        } catch (error) {
            console.error('Error fetching family details:', error.message);
            alert('Failed to fetch family details. Please try again later.');
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = familyDetails.filter((family) =>
            Object.values(family)
                .join(' ')
                .toLowerCase()
                .includes(term)
        );
        setFilteredDetails(filtered);
    };

    const handleColumnToggle = (column) => {
        setColumns((prevColumns) => ({
            ...prevColumns,
            [column]: !prevColumns[column],
        }));
    };

    const handleEditClick = (row) => {
        setEditRow(row);
        const rowData = { ...row };
        if (row.F_DOB) rowData.F_DOB = formatDateForDB(row.F_DOB);
        if (row.M_DOB) rowData.M_DOB = formatDateForDB(row.M_DOB);
        setEditData(rowData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    const handleSave = async () => {
        try {
            const formattedData={
                ...editData,
                F_DOB: formatDateForDB(editData.F_DOB),
                M_DOB: formatDateForDB(editData.M_DOB)
            }
            await axios.put(`http://localhost:5000/families/${editData.EID}`, editData);
            const updatedDetails = familyDetails.map((family) =>
                family.EID === editData.EID ? formattedData : family
            );
            setFamilyDetails(updatedDetails);
            setFilteredDetails(updatedDetails);

            setEditRow(null);
            setEditData({});
            alert('Family details updated successfully');
        } catch (error) {
            console.error('Error saving family details:', error.message);
            alert('Failed to save changes. Please try again later.');
        }
    };
    
    const handleDelete = async (eid) => {
        try {
            await axios.delete(`http://localhost:5000/families/${eid}`);
            setFamilyDetails(familyDetails.filter((family) => family.EID !== eid));
            setFilteredDetails(filteredDetails.filter((family) => family.EID !== eid));
            alert('Family details deleted successfully');
        } catch (error) {
            console.error('Error deleting family details:', error.message);
            alert('Failed to delete family details. Please try again later.');
        }
    };

    useEffect(() => {
        fetchFamilyDetails();
    }, []);

    const activeColumns = Object.keys(columns).filter((col) => columns[col]);

    return (
        <div>
            <h1>Family Details</h1>

            {/* Search Bar */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search family details..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>
            <h3>Select Columns to Display</h3>
            {/* Column Selection */}
            <div className="column-selection">
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
            <table className="family-table">
                <thead>
                    <tr>
                        {activeColumns.map((col) => (
                            <th key={col}>{columnAliases[col]}</th>
                        ))}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDetails.map((family, index) => (
                        <tr key={index}>
                            {activeColumns.map((col) => (
                                <td key={col}>{family[col] || 'N/A'}</td>
                            ))}
                            <td>
                                <FaEdit className="icon-button-edit" onClick={() => handleEditClick(family)} title="Edit"/>
                                <FaTrash className="icon-button-dlt" onClick={() => handleDelete(family.EID)} title="Delete"/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Edit Form as Full-Screen Popup */}
            {editRow && (
                <div className="edit-form-popup">
                    <div className="edit-form-content">
                        <h2>Modify Family Details</h2>
                        <div className="form-group">
                            <label>Family Member Name:</label>
                            <input
                                type="text"
                                name="FNAME"
                                value={editData.FNAME}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Family Member DOB:</label>
                            <input
                                type="date"
                                name="F_DOB"
                                value={editData.F_DOB}
                                onChange={handleInputChange}
                                min={minDOB.toISOString().split('T')[0]} // Minimum DOB: 100 years ago
                                 max={maxDOB.toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="form-group">
                            <label>Mother's Name:</label>
                            <input
                                type="text"
                                name="MNAME"
                                value={editData.MNAME}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Mother's DOB:</label>
                            <input
                                type="date"
                                name="M_DOB"
                                value={editData.M_DOB}
                                onChange={handleInputChange}
                                min={minDOB.toISOString().split('T')[0]} // Minimum DOB: 100 years ago
                                max={maxDOB.toISOString().split('T')[0]}
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

export default ViewFamily;