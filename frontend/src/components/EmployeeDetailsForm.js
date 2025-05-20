import React, { useState } from 'react';
import axios from 'axios';
import './EmployeeDetailsForm.css';

const EmployeeDetailsForm = () => {
  const [employeeDetails, setEmployeeDetails] = useState({
    EID: '',
    BIOMETRIC_CARD_NO: '',
    AADHAR: '',
    BANK_ACC: '',
    PAN: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeDetails({ ...employeeDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/add-employee-details', employeeDetails, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Employee details added successfully!');
      setEmployeeDetails({
        EID: '',
        BIOMETRIC_CARD_NO: '',
        AADHAR: '',
        BANK_ACC: '',
        PAN: '',
      });
    } catch (error) {
      console.error('Error adding employee details:', error);
      alert('Failed to add employee details');
    }
  };

  return (
    <div className="employee-details-form">
      <h1>Add Employee Details</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Employee ID:</label>
          <input type="number" name="EID" value={employeeDetails.EID} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Biometric Card Number:</label>
          <input type="text" name="BIOMETRIC_CARD_NO" value={employeeDetails.BIOMETRIC_CARD_NO} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Aadhar:</label>
          <input type="number" name="AADHAR" value={employeeDetails.AADHAR} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Bank Account:</label>
          <input type="text" name="BANK_ACC" value={employeeDetails.BANK_ACC} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>PAN:</label>
          <input type="text" name="PAN" value={employeeDetails.PAN} onChange={handleChange} required />
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default EmployeeDetailsForm;