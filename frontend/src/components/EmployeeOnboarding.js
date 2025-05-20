import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeForm from './AddEmployee';
import QualificationForm from './QualificationForm';
import EmployeeDetailsForm from './EmployeeDetailsForm';
import FamilyDetailsForm from './FamilyDetailsForm';
import './EmployeeOnboarding.css';

const EmployeeOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [employeeData, setEmployeeData] = useState({});
  const navigate = useNavigate();

  const nextStep = (data) => {
    setEmployeeData({ ...employeeData, ...data });
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = () => {
    navigate('/view-employees');
  };

  return (
    <div className="onboarding-container">
      <div className="progress-bar">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Employee Details</div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. Qualifications</div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Account Details</div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. Family Details</div>
      </div>

      <div className="form-container">
        {currentStep === 1 && (
          <EmployeeForm 
            initialData={employeeData} 
            onNext={nextStep} 
          />
        )}
        {currentStep === 2 && (
          <QualificationForm 
            initialData={employeeData} 
            onNext={nextStep} 
            onPrev={prevStep} 
          />
        )}
        {currentStep === 3 && (
          <EmployeeDetailsForm 
            initialData={employeeData} 
            onNext={nextStep} 
            onPrev={prevStep} 
          />
        )}
        {currentStep === 4 && (
          <FamilyDetailsForm 
            initialData={employeeData} 
            onComplete={handleComplete} 
            onPrev={prevStep} 
          />
        )}
      </div>
    </div>
  );
};

export default EmployeeOnboarding;