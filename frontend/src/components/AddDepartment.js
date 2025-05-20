import React, { useState } from 'react';
import axios from 'axios';
import './AddDepartment.css';

const DepartmentForm = () => {
  const [formData, setFormData] = useState({
    DID: '',
    DNAME: '',
    DHEAD: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/add-department', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Department added successfully!');
      console.log(response.data);
    } catch (error) {
      console.error('Error adding department:', error);
      alert('Failed to add department');
    }
  };

  return (
    <div>
      <h1>Add Department</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Department ID:</label>
          <input type="number" name="DID" value={formData.DID} onChange={handleChange} required />
        </div>
        <div>
          <label>Department Name:</label>
          <input type="text" name="DNAME" value={formData.DNAME} onChange={handleChange} required />
        </div>
        <div>
          <label>Department Head:</label>
          <input type="text" name="DHEAD" value={formData.DHEAD} onChange={handleChange} required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default DepartmentForm;