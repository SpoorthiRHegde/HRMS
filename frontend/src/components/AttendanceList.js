import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

// Convert MySQL date (YYYY-MM-DD) to Display format (DD-MM-YYYY)
const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;
};

// Convert Display date (DD-MM-YYYY) to MySQL format (YYYY-MM-DD)
const formatDateForMySQL = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
};

// Format Time (HH:MM:SS)
const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString; // Directly return the correct time format
};

const AttendanceList = () => {
    const [attendance, setAttendance] = useState([]);
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [searchEID, setSearchEID] = useState("");
    const [editRecord, setEditRecord] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Fetch Attendance Data from Backend
    const fetchAttendance = async () => {
        try {
            const response = await axios.get("http://localhost:5000/attendance");
            const formattedData = response.data.map((record) => ({
                ...record,
                A_DATE: formatDateForDisplay(record.A_DATE),
            }));
            setAttendance(formattedData);
            setFilteredAttendance(formattedData);
        } catch (error) {
            console.error("❌ Error fetching attendance:", error);
            alert("Failed to fetch attendance records");
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    // Search Attendance by Employee ID
    const handleSearch = () => {
        if (!searchEID.trim()) {
            setFilteredAttendance(attendance);
            return;
        }
        const filtered = attendance.filter((record) =>
            record.EID.toString().includes(searchEID.trim())
        );
        setFilteredAttendance(filtered);
        if (filtered.length === 0) {
            alert(`⚠️ No attendance records found for Employee ID: ${searchEID}`);
        }
    };

    // Delete Attendance Record
    const handleDelete = async (eid, a_date) => {
        if (!window.confirm(`Are you sure you want to delete attendance for Employee ID ${eid} on ${a_date}?`)) {
            return;
        }
        try {
            await axios.delete(`http://localhost:5000/attendance/${eid}/${formatDateForMySQL(a_date)}`);
            
            // Update state immediately
            const updatedAttendance = attendance.filter(
                (record) => !(record.EID === eid && record.A_DATE === a_date)
            );
            setAttendance(updatedAttendance);
            setFilteredAttendance(updatedAttendance);

            alert(`✅ Attendance record deleted successfully`);
        } catch (error) {
            console.error("❌ Error deleting attendance record:", error);
            alert("Failed to delete attendance record");
        }
    };

    // Edit Attendance Record
    const handleEdit = (record) => {
        setEditRecord(record);
        setModalVisible(true);
    };

    // Update Attendance Record
    const handleUpdate = async () => {
        try {
            const updatedRecord = {
                status: editRecord.STATUS,
                login: editRecord.LOGIN,
                logout: editRecord.LOGOUT,
            };

            const formattedDate = formatDateForMySQL(editRecord.A_DATE);

            const response = await axios.put(
                `http://localhost:5000/attendance/${editRecord.EID}/${formattedDate}`,
                updatedRecord
            );

            if (response.status === 200) {
                const updatedAttendance = attendance.map((record) =>
                    record.EID === editRecord.EID && record.A_DATE === editRecord.A_DATE
                        ? { ...editRecord }
                        : record
                );
                setAttendance(updatedAttendance);
                setFilteredAttendance(updatedAttendance);
                alert("✅ Attendance updated successfully");
                setModalVisible(false);
            } else {
                alert("⚠️ Failed to update attendance");
            }
        } catch (error) {
            console.error("❌ Error updating attendance:", error);
            alert("Failed to update attendance");
        }
    };

    return (
        <div>
            <h2>Attendance Records</h2>
            <input
                type="text"
                placeholder="Enter Employee ID"
                value={searchEID}
                onChange={(e) => setSearchEID(e.target.value)}
            />
            <button onClick={handleSearch} style={{ marginLeft: "10px" }}>Search</button>

            <table border="1" style={{ width: "100%", marginTop: "10px" }}>
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Login</th>
                        <th>Logout</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAttendance.length > 0 ? (
                        filteredAttendance.map((record) => (
                            <tr key={`${record.EID}-${record.A_DATE}`}>
                                <td>{record.EID}</td>
                                <td>{record.A_DATE}</td>
                                <td>{record.STATUS}</td>
                                <td>{formatTime(record.LOGIN)}</td>
                                <td>{formatTime(record.LOGOUT)}</td>
                                <td>
                                    <FaEdit
                                        style={{ color: "blue", cursor: "pointer", marginRight: "10px" }}
                                        onClick={() => handleEdit(record)}
                                    />
                                    <FaTrash
                                        style={{ color: "red", cursor: "pointer" }}
                                        onClick={() => handleDelete(record.EID, record.A_DATE)}
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center" }}>No attendance records found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {modalVisible && editRecord && (
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "white",
                        padding: "20px",
                        border: "1px solid black",
                        zIndex: 1000,
                    }}
                >
                    <h3>Edit Attendance</h3>
                    <label>Status: </label>
                    <select
                        value={editRecord.STATUS}
                        onChange={(e) => setEditRecord({ ...editRecord, STATUS: e.target.value })}
                    >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Leave">Leave</option>
                    </select>
                    <br />
                    <label>Login Time: </label>
                    <input
                        type="time"
                        value={editRecord.LOGIN}
                        onChange={(e) => setEditRecord({ ...editRecord, LOGIN: e.target.value })}
                    />
                    <br />
                    <label>Logout Time: </label>
                    <input
                        type="time"
                        value={editRecord.LOGOUT}
                        onChange={(e) => setEditRecord({ ...editRecord, LOGOUT: e.target.value })}
                    />
                    <br /><br />
                    <button onClick={handleUpdate}>Update</button>
                    <button onClick={() => setModalVisible(false)} style={{ marginLeft: "10px" }}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default AttendanceList;