import React, { useState } from 'react';
import axios from 'axios';
import './QualificationForm.css';

const QualificationForm = () => {
  const [qualificationData, setQualificationData] = useState({
    EID: '',
    INSTITUTION: '',
    PERCENTAGE: '',
    SPECIALIZATION: '',
    YOG: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQualificationData({ ...qualificationData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/add-qualification', qualificationData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Qualification added successfully!');
      setQualificationData({
        EID: '',
        INSTITUTION: '',
        PERCENTAGE: '',
        SPECIALIZATION: '',
        YOG: '',
      });
    } catch (error) {
      console.error('Error adding qualification:', error);
      alert('Failed to add qualification');
    }
  };

  return (
    <div className="qualification-form">
      <h1>Add Qualification Details</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Employee ID:</label>
          <input type="number" name="EID" value={qualificationData.EID} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Institution:</label>
          <input type="text" name="INSTITUTION" value={qualificationData.INSTITUTION} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Percentage:</label>
          <input type="number" name="PERCENTAGE" value={qualificationData.PERCENTAGE} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Specialization:</label>
          <input type="text" name="SPECIALIZATION" value={qualificationData.SPECIALIZATION} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Year of Graduation:</label>
          <input type="number" name="YOG" value={qualificationData.YOG} onChange={handleChange} required />
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default QualificationForm;