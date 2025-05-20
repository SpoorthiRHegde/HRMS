import axios from 'axios';
import './AddEmployee.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Employee Details
    EID: '',
    INITIAL: '',
    FIRSTNAME: '',
    MIDDLENAME: '',
    LASTNAME: '',
    DESIGNATION: '',
    DOB: '',
    DATE_OF_JOIN: '',
    FTYPE: '',
    NATIONALITY: '',
    PHONE: '',
    EMAIL: '',
    CASTE: '',
    DOORNO: '',
    CITY: '',
    STATE: '',
    PINCODE: '',
    GENDER: '',
    PROFEXP_DESIGNATION: '',
    PPROFEXP_FROM: '',
    PPROFEXP_TO: '',
    LEAVE_ML: '',
    LEAVE_LOP: '',
    LEAVE_RH: '',
    LEAVE_OOD: '',
    LEAVE_CL: '',
    DID: '',
    // Qualification Details
    INSTITUTION: '',
    PERCENTAGE: '',
    SPECIALIZATION: '',
    YOG: '',
    // Employee Account Details
    BIOMETRIC_CARD_NO: '',
    AADHAR: '',
    BANK_ACC: '',
    PAN: '',
    // Family Details
    FNAME: '',
    F_DOB: '',
    MNAME: '',
    M_DOB: ''
  });

  const [error, setError] = useState("");
  const [existingIds, setExistingIds] = useState([]);

  // Date constraints
  const currentDate = new Date().toISOString().split('T')[0];
  const minDOB = new Date();
  minDOB.setFullYear(minDOB.getFullYear() - 100);
  const maxDOB = new Date();
  maxDOB.setFullYear(maxDOB.getFullYear() - 18);
  const minDateOfJoin = formData.DOB ? new Date(formData.DOB) : null;
  if (minDateOfJoin) minDateOfJoin.setFullYear(minDateOfJoin.getFullYear() + 18);

  useEffect(() => {
    axios.get("http://localhost:5000/employee-ids")
      .then(response => {
        setExistingIds(response.data);
        generateUniqueEmployeeId(response.data);
      })
      .catch(error => {
        console.error("Error fetching employee IDs:", error);
        generateUniqueEmployeeId([]);
      });
  }, []);

  const generateUniqueEmployeeId = (existingIds) => {
    let newId;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      newId = generateRandomId();
      attempts++;
      
      if (attempts >= maxAttempts) {
        setError("Could not generate a unique ID after multiple attempts. Please try again.");
        return;
      }
    } while (existingIds.includes(newId));
    
    setFormData(prev => ({ ...prev, EID: newId }));
  };

  const generateRandomId = () => {
    const digits = [];
    while (digits.length < 5) {
      const digit = Math.floor(Math.random() * 10);
      if (!digits.includes(digit)) {
        digits.push(digit);
      }
    }
    return digits.join('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate Professional Experience Dates
    if (new Date(formData.PPROFEXP_FROM) > new Date(formData.PPROFEXP_TO)) {
      alert('Professional Experience From must be before Professional Experience To');
      return;
    }

    try {
      // Submit employee data
      await axios.post('http://localhost:5000/add-employee', {
        ...formData,
        DOB: formatDate(formData.DOB),
        DATE_OF_JOIN: formatDate(formData.DATE_OF_JOIN),
        PPROFEXP_FROM: formatDate(formData.PPROFEXP_FROM),
        PPROFEXP_TO: formatDate(formData.PPROFEXP_TO)
      });

      // Submit qualification data if exists
      if (formData.INSTITUTION) {
        await axios.post('http://localhost:5000/add-qualification', {
          EID: formData.EID,
          INSTITUTION: formData.INSTITUTION,
          PERCENTAGE: formData.PERCENTAGE,
          SPECIALIZATION: formData.SPECIALIZATION,
          YOG: formData.YOG
        });
      }

      // Submit employee details if exists
      if (formData.BIOMETRIC_CARD_NO) {
        await axios.post('http://localhost:5000/add-employee-details', {
          EID: formData.EID,
          BIOMETRIC_CARD_NO: formData.BIOMETRIC_CARD_NO,
          AADHAR: formData.AADHAR,
          BANK_ACC: formData.BANK_ACC,
          PAN: formData.PAN
        });
      }

      // Submit family details if exists
      if (formData.FNAME) {
        await axios.post('http://localhost:5000/add-family', {
          EID: formData.EID,
          FNAME: formData.FNAME,
          F_DOB: formatDate(formData.F_DOB),
          MNAME: formData.MNAME,
          M_DOB: formatDate(formData.M_DOB)
        });
      }

      alert('Employee added successfully!');
      navigate('/view-employees');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee');
    }
  };
  const ProgressStep = ({ step, label, current }) => (
    <div 
      className={`step ${current >= step ? 'active' : ''}`}
      onClick={() => goToStep(step)}
    >
      {label}
    </div>
  );
    const goToStep = (step) => {
    setCurrentStep(step);
  };
  return (
    <div className="onboarding-container">
      <h1>Employee Onboarding</h1>
      
      {/* Progress Bar */}
      <div className="progress-bar">
        <ProgressStep step={1} label="1. Employee Details" current={currentStep} />
        <ProgressStep step={2} label="2. Qualifications" current={currentStep} />
        <ProgressStep step={3} label="3. Account Details" current={currentStep} />
        <ProgressStep step={4} label="4. Family Details" current={currentStep} />
      </div>

      {/* Form Steps */}
      <form onSubmit={handleSubmit} className="form-container">
        {/* Step 1: Employee Details */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Employee Details</h2>
            
            <div className="form-group">
              <label>Employee ID:</label>
              <input type="text" name="EID" value={formData.EID} onChange={handleChange} readOnly />
            </div>

            <div className="form-group">
              <label>Initial:</label>
              <select name="INITIAL" value={formData.INITIAL} onChange={handleChange} required>
                <option value="">Select Initial</option>
                <option value="DR">DR</option>
                <option value="MISS">MISS</option>
                <option value="MR">MR</option>
                <option value="MRS">MRS</option>
                <option value="PROF">PROF</option>
              </select>
            </div>

            <div className="form-group">
              <label>First Name:</label>
              <input type="text" name="FIRSTNAME" value={formData.FIRSTNAME} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Middle Name:</label>
              <input type="text" name="MIDDLENAME" value={formData.MIDDLENAME} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Last Name:</label>
              <input type="text" name="LASTNAME" value={formData.LASTNAME} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Designation:</label>
              <select name="DESIGNATION" value={formData.DESIGNATION} onChange={handleChange} required>
                <option value="">Select Designation</option>
                <option value="Professor">Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Head of Department (HoD)">Head of Department (HoD)</option>
                <option value="Principal">Principal</option>
                <option value="Vice Principal">Vice Principal</option>
                <option value="Training & Placement Officer (TPO)">Training & Placement Officer (TPO)</option>
                <option value="Librarian">Librarian</option>
                <option value="Lab Instructor">Lab Instructor</option>
                <option value="Administrative Officer">Administrative Officer</option>
                <option value="Clerk">Clerk</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date of Birth:</label>
              <input
                type="date"
                name="DOB"
                value={formData.DOB}
                onChange={handleChange}
                min={minDOB.toISOString().split('T')[0]}
                max={maxDOB.toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Joining:</label>
              <input
                type="date"
                name="DATE_OF_JOIN"
                value={formData.DATE_OF_JOIN}
                onChange={handleChange}
                min={minDateOfJoin ? minDateOfJoin.toISOString().split('T')[0] : ''}
                max={currentDate}
                required
              />
            </div>

            <div className="form-group">
              <label>Employee Type:</label>
              <select name="FTYPE" value={formData.FTYPE} onChange={handleChange} required>
                <option value="">Select Employee Type</option>
                <option value="TEACHING">TEACHING</option>
                <option value="NON TEACHING">NON TEACHING</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nationality:</label>
              <input type="text" name="NATIONALITY" value={formData.NATIONALITY} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Phone:</label>
              <input type="tel" name="PHONE" value={formData.PHONE} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="EMAIL" value={formData.EMAIL} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Caste:</label>
              <input type="text" name="CASTE" value={formData.CASTE} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Door No:</label>
              <input type="text" name="DOORNO" value={formData.DOORNO} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>City:</label>
              <input type="text" name="CITY" value={formData.CITY} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>State:</label>
              <input type="text" name="STATE" value={formData.STATE} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Pincode:</label>
              <input type="number" name="PINCODE" value={formData.PINCODE} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Gender:</label>
              <select name="GENDER" value={formData.GENDER} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Professional Experience Designation:</label>
              <input type="text" name="PROFEXP_DESIGNATION" value={formData.PROFEXP_DESIGNATION} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Professional Experience From:</label>
              <input
                type="date"
                name="PPROFEXP_FROM"
                value={formData.PPROFEXP_FROM}
                onChange={handleChange}
                max={formData.PPROFEXP_TO || currentDate}
              />
            </div>

            <div className="form-group">
              <label>Professional Experience To:</label>
              <input
                type="date"
                name="PPROFEXP_TO"
                value={formData.PPROFEXP_TO}
                onChange={handleChange}
                min={formData.PPROFEXP_FROM}
                max={currentDate}
              />
            </div>

            <div className="form-group">
              <label>Leave ML:</label>
              <input type="number" name="LEAVE_ML" value={formData.LEAVE_ML} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Leave LOP:</label>
              <input type="number" name="LEAVE_LOP" value={formData.LEAVE_LOP} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Leave RH:</label>
              <input type="number" name="LEAVE_RH" value={formData.LEAVE_RH} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Leave OOD:</label>
              <input type="number" name="LEAVE_OOD" value={formData.LEAVE_OOD} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Leave CL:</label>
              <input type="number" name="LEAVE_CL" value={formData.LEAVE_CL} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Department ID:</label>
              <input type="number" name="DID" value={formData.DID} onChange={handleChange} required />
            </div>

            <div className="form-actions">
              <button type="button" className="next-btn" onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Qualification Details */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>Qualification Details</h2>
            
            <div className="form-group">
              <label>Institution:</label>
              <input type="text" name="INSTITUTION" value={formData.INSTITUTION} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Percentage:</label>
              <input type="number" name="PERCENTAGE" value={formData.PERCENTAGE} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Specialization:</label>
              <input type="text" name="SPECIALIZATION" value={formData.SPECIALIZATION} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Year of Graduation:</label>
              <input type="number" name="YOG" value={formData.YOG} onChange={handleChange} />
            </div>

            <div className="form-actions">
              <button type="button" className="prev-btn" onClick={prevStep}>
                Previous
              </button>
              <button type="button" className="next-btn" onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Employee Account Details */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2>Employee Account Details</h2>
            
            <div className="form-group">
              <label>Biometric Card Number:</label>
              <input type="text" name="BIOMETRIC_CARD_NO" value={formData.BIOMETRIC_CARD_NO} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Aadhar:</label>
              <input type="number" name="AADHAR" value={formData.AADHAR} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Bank Account:</label>
              <input type="text" name="BANK_ACC" value={formData.BANK_ACC} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>PAN:</label>
              <input type="text" name="PAN" value={formData.PAN} onChange={handleChange} />
            </div>

            <div className="form-actions">
              <button type="button" className="prev-btn" onClick={prevStep}>
                Previous
              </button>
              <button type="button" className="next-btn" onClick={nextStep}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Family Details */}
        {currentStep === 4 && (
          <div className="form-step">
            <h2>Family Details</h2>
            
            <div className="form-group">
              <label>Father's Name:</label>
              <input type="text" name="FNAME" value={formData.FNAME} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Father's DOB:</label>
              <input
                type="date"
                name="F_DOB"
                value={formData.F_DOB}
                onChange={handleChange}
                min={minDOB.toISOString().split('T')[0]}
                max={maxDOB.toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Mother's Name:</label>
              <input type="text" name="MNAME" value={formData.MNAME} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Mother's DOB:</label>
              <input
                type="date"
                name="M_DOB"
                value={formData.M_DOB}
                onChange={handleChange}
                min={minDOB.toISOString().split('T')[0]}
                max={maxDOB.toISOString().split('T')[0]}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="prev-btn" onClick={prevStep}>
                Previous
              </button>
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddEmployee;