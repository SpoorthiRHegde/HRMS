import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

// Format date for display (DD:MM:YYYY)
// Convert MySQL date (YYYY-MM-DD) to Display format (DD-MM-YYYY)
const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
};

// Convert Display date (DD-MM-YYYY) to MySQL format (YYYY-MM-DD)
const formatDateForMySQL = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
};


const LeaveList = () => {
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [searchEID, setSearchEID] = useState("");
    const [editRecord, setEditRecord] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchLeaves = async () => {
        try {
            const response = await axios.get("http://localhost:5000/leave");
            const formattedData = response.data.map(record => ({
                ...record,
                FROM_DATE: formatDateForDisplay(record.FROM_DATE),
                TO_DATE: formatDateForDisplay(record.TO_DATE)
            }));
            setLeaves(formattedData);
            setFilteredLeaves(formattedData);
        } catch (error) {
            console.error("Error fetching leave records:", error);
            alert("Failed to fetch leave records");
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSearch = () => {
        if (!searchEID.trim()) {
            setFilteredLeaves(leaves);
            return;
        }
        const filtered = leaves.filter(record =>
            record.EID.toString().includes(searchEID.trim())
        );
        setFilteredLeaves(filtered);
        if (filtered.length === 0) {
            alert(`No leave records found for Employee ID: ${searchEID}`);
        }
    };

    const handleDelete = async (eid, fromDate) => {
        if (!window.confirm(`Are you sure you want to delete this leave record?`)) {
            return;
        }
        try {
            await axios.delete(`http://localhost:5000/leave/${eid}/${formatDateForMySQL(fromDate)}`);
            const updatedLeaves = leaves.filter(record => !(record.EID === eid && record.FROM_DATE === fromDate));
            setLeaves(updatedLeaves);
            setFilteredLeaves(updatedLeaves);
            alert("Leave record deleted successfully");
        } catch (error) {
            console.error("Error deleting leave record:", error);
            alert("Failed to delete leave record");
        }
    };

    const handleEdit = (record) => {
        setEditRecord({ ...record });
        setModalVisible(true);
    };

    const handleUpdate = async () => {
        try {
            const updatedRecord = {
                ...editRecord,
                FROM_DATE: formatDateForMySQL(editRecord.FROM_DATE),
                TO_DATE: formatDateForMySQL(editRecord.TO_DATE)
            };

            await axios.put(`http://localhost:5000/leave/${editRecord.EID}/${updatedRecord.FROM_DATE}`, updatedRecord);

            const updatedLeaves = leaves.map(record =>
                record.EID === editRecord.EID && record.FROM_DATE === editRecord.FROM_DATE
                    ? { ...editRecord }
                    : record
            );
            setLeaves(updatedLeaves);
            setFilteredLeaves(updatedLeaves);
            alert("Leave record updated successfully");
            setModalVisible(false);
        } catch (error) {
            console.error("Error updating leave record:", error);
            alert("Failed to update leave record");
        }
    };

    return (
        <div>
            <h2>Leave Records</h2>
            <input 
                type="text" 
                placeholder="Enter Employee ID" 
                value={searchEID} 
                onChange={(e) => setSearchEID(e.target.value)}
            />
            <button onClick={handleSearch} style={{ marginLeft: '10px' }}>Search</button>

            <table border="1" style={{ width: '100%', marginTop: '10px' }}>
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Leave Type</th>
                        <th>Approval</th>
                        <th>No. of Days</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLeaves.length > 0 ? (
                        filteredLeaves.map((record) => (
                            <tr key={`${record.EID}-${record.FROM_DATE}`}>
                                <td>{record.EID}</td>
                                <td>{record.LTYPE}</td>
                                <td>{record.APPROVAL}</td>
                                <td>{record.NO_OF_DAYS}</td>
                                <td>{record.FROM_DATE}</td>
                                <td>{record.TO_DATE}</td>
                                <td>
                                    <FaEdit 
                                        style={{ color: 'blue', cursor: 'pointer', marginRight: '10px' }} 
                                        onClick={() => handleEdit(record)} 
                                    />
                                    <FaTrash 
                                        style={{ color: 'red', cursor: 'pointer' }} 
                                        onClick={() => handleDelete(record.EID, record.FROM_DATE)} 
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center' }}>No leave records found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {modalVisible && editRecord && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white', padding: '20px', border: '1px solid black', zIndex: 1000
                }}>
                    <h3>Edit Leave</h3>
                    <label>Leave Type: </label>
                    <input 
                        type="text" 
                        value={editRecord.LTYPE} 
                        onChange={(e) => setEditRecord({...editRecord, LTYPE: e.target.value})} 
                    />
                    <br />
                    <label>Approval: </label>
                    <input 
                        type="text" 
                        value={editRecord.APPROVAL} 
                        onChange={(e) => setEditRecord({...editRecord, APPROVAL: e.target.value})} 
                    />
                    <br />
                    <label>No. of Days: </label>
                    <input 
                        type="number" 
                        value={editRecord.NO_OF_DAYS} 
                        onChange={(e) => setEditRecord({...editRecord, NO_OF_DAYS: e.target.value})} 
                    />
                    <br /><br />
                    <button onClick={handleUpdate}>Update</button>
                    <button onClick={() => setModalVisible(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                </div>
            )}
        </div>
    );
}

export default LeaveList;