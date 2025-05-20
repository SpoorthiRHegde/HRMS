import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";

// Convert MySQL date format (YYYY-MM-DD) to Display format (DD-MM-YYYY)
const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`;
};

// Convert Display date format (DD-MM-YYYY) to MySQL format (YYYY-MM-DD)
const formatDateForMySQL = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
};

const PayrollList = () => {
    const [payrolls, setPayrolls] = useState([]);
    const [filteredPayrolls, setFilteredPayrolls] = useState([]);
    const [searchEID, setSearchEID] = useState("");
    const [editRecord, setEditRecord] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchPayrolls = async () => {
        try {
            const response = await axios.get("http://localhost:5000/payroll");
            const formattedData = response.data.map((record) => ({
                ...record,
                P_DATE: formatDateForDisplay(record.P_DATE),
            }));
            setPayrolls(formattedData);
            setFilteredPayrolls(formattedData);
        } catch (error) {
            console.error("Error fetching payroll data:", error);
            alert("Failed to fetch payroll records");
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const handleSearch = () => {
        const trimmedSearchEID = searchEID.trim();

        if (!trimmedSearchEID) {
            setFilteredPayrolls(payrolls); // Show all records if search is empty
            return;
        }

        const filtered = payrolls.filter(
            (record) => record.EID.toString() === trimmedSearchEID
        );

        setFilteredPayrolls(filtered);

        if (filtered.length === 0) {
            alert(`⚠️ No payroll records found for Employee ID: ${trimmedSearchEID}`);
        }
    };

    const handleDelete = async (eid, p_date) => {
        if (!window.confirm(`Are you sure you want to delete payroll for Employee ID ${eid} on ${p_date}?`)) {
            return;
        }
        try {
            await axios.delete(`http://localhost:5000/payroll/${eid}/${formatDateForMySQL(p_date)}`);

            // Update state immediately
            const updatedPayrolls = payrolls.filter(
                (record) => !(record.EID === eid && record.P_DATE === p_date)
            );
            setPayrolls(updatedPayrolls);
            setFilteredPayrolls(updatedPayrolls);

            alert(`✅ Payroll record deleted successfully`);
        } catch (error) {
            console.error("Error deleting payroll record:", error);
            alert("❌ Failed to delete payroll record");
        }
    };

    const handleEdit = (record) => {
        setEditRecord(record);
        setModalVisible(true);
    };

    const handleUpdate = async () => {
        try {
            const updatedRecord = {
                ...editRecord,
                P_DATE: formatDateForMySQL(editRecord.P_DATE),
            };

            await axios.put(
                `http://localhost:5000/payroll/${editRecord.EID}/${updatedRecord.P_DATE}`,
                updatedRecord
            );

            const updatedPayrolls = payrolls.map((record) =>
                record.EID === editRecord.EID && record.P_DATE === editRecord.P_DATE
                    ? { ...editRecord }
                    : record
            );
            setPayrolls(updatedPayrolls);
            setFilteredPayrolls(updatedPayrolls);
            alert("✅ Payroll updated successfully");
            setModalVisible(false);
        } catch (error) {
            console.error("Error updating payroll:", error);
            alert("❌ Failed to update payroll");
        }
    };

    return (
        <div>
            <h2>Payroll Records</h2>
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
                        <th>No. of Days Worked</th>
                        <th>Provident Fund (PF)</th>
                        <th>Vacation Allowance (VA)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPayrolls.length > 0 ? (
                        filteredPayrolls.map((record) => (
                            <tr key={`${record.EID}-${record.P_DATE}`}>
                                <td>{record.EID}</td>
                                <td>{record.P_DATE}</td>
                                <td>{record.NO_OF_DAYS}</td>
                                <td>{record.PF}</td>
                                <td>{record.VA}</td>
                                <td>
                                    <FaEdit
                                        style={{ color: "blue", cursor: "pointer", marginRight: "10px" }}
                                        onClick={() => handleEdit(record)}
                                    />
                                    <FaTrash
                                        style={{ color: "red", cursor: "pointer" }}
                                        onClick={() => handleDelete(record.EID, record.P_DATE)}
                                    />
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center" }}>No payroll records found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {modalVisible && editRecord && (
                <div style={{
                    position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    backgroundColor: "white", padding: "20px", border: "1px solid black", zIndex: 1000
                }}>
                    <h3>Edit Payroll</h3>
                    <label>No. of Days Worked: </label>
                    <input
                        type="number"
                        value={editRecord.NO_OF_DAYS}
                        onChange={(e) => setEditRecord({ ...editRecord, NO_OF_DAYS: e.target.value })}
                    />
                    <br />
                    <label>Provident Fund (PF): </label>
                    <input
                        type="number"
                        value={editRecord.PF}
                        onChange={(e) => setEditRecord({ ...editRecord, PF: e.target.value })}
                    />
                    <br />
                    <label>Vacation Allowance (VA): </label>
                    <input
                        type="number"
                        value={editRecord.VA}
                        onChange={(e) => setEditRecord({ ...editRecord, VA: e.target.value })}
                    />
                    <br /><br />
                    <button onClick={handleUpdate}>Update</button>
                    <button onClick={() => setModalVisible(false)} style={{ marginLeft: "10px" }}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default PayrollList;