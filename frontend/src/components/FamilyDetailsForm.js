import React, { useState } from 'react';
import axios from 'axios';
import './FamilyDetailsForm.css';

const FamilyDetailsForm = () => {
  const [familyData, setFamilyData] = useState({
    EID: '',
    FNAME: '',
    F_DOB: '',
    MNAME: '',
    M_DOB: '',
  });

  // Update the state with the input field values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFamilyData({ ...familyData, [name]: value });
  };

  // Helper function to format date from yyyy-mm-dd to dd-mm-yyyy
  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  const minDOB = new Date();
  minDOB.setFullYear(minDOB.getFullYear() - 100); // Minimum DOB: 100 years ago
  const maxDOB = new Date();
  maxDOB.setFullYear(maxDOB.getFullYear() - 35); 
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Format the dates before sending to the backend
    const formattedData = {
      ...familyData,
      F_DOB: formatDate(familyData.F_DOB),
      M_DOB: formatDate(familyData.M_DOB),
    };

    try {
      const response = await axios.post('http://localhost:5000/add-family', formattedData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Family details added successfully!');
      console.log(response.data);

      // Clear the form after successful submission
      setFamilyData({
        EID: '',
        FNAME: '',
        F_DOB: '',
        MNAME: '',
        M_DOB: '',
      });
    } catch (error) {
      console.error('Error adding family details:', error);
      alert('Failed to add family details');
    }
  };

  return (
    <div className="family-details-form">
      <h1>Add Employee Family Details</h1>
      <form onSubmit={handleSubmit}>
        {/* Employee ID Input */}
        <div className="form-group">
          <label htmlFor="EID">Employee ID:</label>
          <input
            type="number"
            id="EID"
            name="EID"
            value={familyData.EID}
            onChange={handleChange}
            required
          />
        </div>

        {/* Family Member Name Input */}
        <div className="form-group">
          <label htmlFor="FNAME">Father Name:</label>
          <input
            type="text"
            id="FNAME"
            name="FNAME"
            value={familyData.FNAME}
            onChange={handleChange}
            required
          />
        </div>

        {/* Family Member DOB Input */}
        <div className="form-group">
          <label htmlFor="F_DOB">Father DOB:</label>
          <input
            type="date"
            id="F_DOB"
            name="F_DOB"
            value={familyData.F_DOB}
            onChange={handleChange}
            min={minDOB.toISOString().split('T')[0]} // Minimum DOB: 100 years ago
            max={maxDOB.toISOString().split('T')[0]}
            required
          />
        </div>

        {/* Mother's Name Input */}
        <div className="form-group">
          <label htmlFor="MNAME">Mother's Name:</label>
          <input
            type="text"
            id="MNAME"
            name="MNAME"
            value={familyData.MNAME}
            onChange={handleChange}
          />
        </div>

        {/* Mother's DOB Input */}
        <div className="form-group">
          <label htmlFor="M_DOB">Mother's DOB:</label>
          <input
            type="date"
            id="M_DOB"
            name="M_DOB"
            value={familyData.M_DOB}
            onChange={handleChange}
            min={minDOB.toISOString().split('T')[0]} // Minimum DOB: 100 years ago
            max={maxDOB.toISOString().split('T')[0]}
          />
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn">
          Submit
        </button>
      </form>
    </div>
  );
};

export default FamilyDetailsForm;