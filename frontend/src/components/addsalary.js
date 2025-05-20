// salary.js
import React, { useState } from 'react';
import axios from 'axios';
import './Salary.css';

const AddSalary = () => {
  const [salaryData, setSalaryData] = useState({
    EID: '',
    BASIC_SAL: '',
    AGP: '',
    ESI: '',
    LOAN: '',
    IT: '',
    SAL_DATE: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSalaryData({ ...salaryData, [name]: value });
  };

  // Helper function to format date from yyyy-mm-dd to dd-mm-yyyy
  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      ...salaryData
    };

    try {
      const response = await axios.post('http://localhost:5000/add-salary', formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Salary details added successfully');
      console.log(response.data);

      // Clear the form
      setSalaryData({
        EID: '',
        BASIC_SAL: '',
        AGP: '',
        ESI: '',
        LOAN: '',
        IT: '',
        SAL_DATE: '',
      });
    } catch (error) {
      console.error('Error adding salary details:', error);
      alert('Error adding salary details');
    }
  };

  return (
    <div className="salary-form">
      <h1>Enter Salary Details</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>EID</label>
          <input
            type="number"
            name="EID"
            value={salaryData.EID}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>Basic Salary</label>
          <input
            type="number"
            name="BASIC_SAL"
            value={salaryData.BASIC_SAL}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>AGP</label>
          <input
            type="number"
            name="AGP"
            value={salaryData.AGP}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>ESI</label>
          <input
            type="number"
            name="ESI"
            value={salaryData.ESI}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>Loan</label>
          <input
            type="number"
            name="LOAN"
            value={salaryData.LOAN}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>Income Tax</label>
          <input
            type="number"
            name="IT"
            value={salaryData.IT}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-group">
          <label>Salary Date</label>
          <input
            type="date"
            name="SAL_DATE"
            value={salaryData.SAL_DATE}
            onChange={handleChange}
            max={maxDate}
            required
          />
        </div>
        <button type="submit">Add Salary</button>
      </form>
    </div>
  );
};

export default AddSalary;