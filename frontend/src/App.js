import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CombinedEmployeeView from './components/CombinedEmployeeView'; // New combined view component
import EmployeeOnboarding from './components/EmployeeOnboarding';
import AddSalary from './components/addsalary';
import Salary from './components/Salary';
import AddLeave from './components/AddLeave';
import LeaveList from './components/LeaveList';
import AddPayroll from './components/AddPayroll';
import PayrollList from './components/PayrollList'; 
import DepartmentList from './components/DepartmentList';
import AddDepartment from './components/AddDepartment';
import AttendanceList from './components/AttendanceList';
import AddAttendance from './components/AddAttendance';
import Login from './components/Login';
import './Navbar.css';
import Navbar from './Navbar'; 
import { Carousel } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function Home() {
    return (
        <div>
            <div>
            <Carousel>
                <Carousel.Item interval={3000}>
                    <img
                        className="d-block w-100"
                        src="https://www.sahyadri.edu.in/_next/image?url=%2Fimages%2Fbgs%2Fhero-bg.jpg&w=1920&q=75"
                        alt="First slide"
                    />
                    <Carousel.Caption>
                        <h3>Welcome to HR Management System</h3>
                        <p>Streamline your HR processes with ease and efficiency</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item interval={3000}>
                    <img
                        className="d-block w-100"
                        src="https://theacademicinsights.com/wp-content/uploads/2020/02/Sahyadri-Campus.jpg"
                        alt="Second slide"
                    />
                </Carousel.Item>
                <Carousel.Item interval={3000}>
                    <img
                        className="d-block w-100"
                        src="https://www.sahyadri.edu.in/images/banners/home2.jpg"
                        alt="Third slide"
                    />
                </Carousel.Item>
            </Carousel>
            </div>
            <h1>Welcome to the Employee Management System</h1>
            <div className="button-container">
                <button>
                    <Link to="/employee">Employee</Link>
                </button>
                <button>
                    <Link to="/department">Department</Link>
                </button>
                <button>
                    <Link to="/attendance">Attendance</Link>
                </button>
                <button>
                    <Link to="/leavepage">Leave</Link>
                </button>
                <button>
                    <Link to="/salary">Salary</Link>
                </button>
            </div>
            <PageFooter/>
        </div>
    );
}

// Simplified EmployeePage with just two main options
function EmployeePage() {
    return (
        <div>
            <h1>Employee Management</h1>
            <div className="button-container">
                <button>
                    <Link to="/add-employee">Add New Employee</Link>
                </button>
                <button>
                    <Link to="/view-employees">View/Manage Employees</Link>
                </button>
            </div>
            <FixedFooter/>
        </div>
    );
}

function DepartmentPage() {
    return (
        <div>
            <h1>Department Page</h1>
            <div className='button-container'>
                <button>
                    <Link to="/add-department">Add Department</Link>
                </button>
                <button>
                    <Link to="/view-departments">View Department Details</Link>
                </button>
            </div>
            <FixedFooter/>
        </div>
    );
}

function AttendancePage() {
    return (
        <div>
            <h1>Attendance Page</h1>
            <div className='button-container'>
                <button>
                    <Link to="/add-attendance">Add Attendance</Link>
                </button>
                <button>
                    <Link to="/view-attendance">View Attendance Records</Link>
                </button>
            </div>
            <FixedFooter/>
        </div>
    );
}

function LeavePage() {
    return (
        <div>
            <h1>Leave Page</h1>
            <div className='button-container'>
                <button>
                    <Link to="/add-leave">Add Leave</Link>
                </button>
                <button>
                    <Link to="/leave">View Leave Details</Link>
                </button>
            </div>
            <FixedFooter/>
        </div>
    );
}

function SalaryPage() {
    return (
        <div>
            <h1>Salary Page</h1>
            <div className='button-container'>
                <button>
                    <Link to="/add-salary">Add Salary Details</Link>
                </button>
                <button>
                    <Link to="/view-salary/1">View Salary Details</Link>
                </button>
                <button>
                    <Link to="/add-payroll">Add Payroll</Link>
                </button>
                <button>
                    <Link to="/view-payroll">View Payroll</Link>
                </button>
            </div>
            <FixedFooter/>
        </div>
    );
}

function App() {
    return (
        <Router>
            <div>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/employee" element={<EmployeePage />} />
                    <Route path="/department" element={<DepartmentPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/salary" element={<SalaryPage />} />
                    <Route path="/leavepage" element={<LeavePage />} />
                    
                    {/* Updated employee routes */}
                    <Route path="/add-employee" element={<EmployeeOnboarding />} />
                    <Route path="/view-employees" element={<CombinedEmployeeView />} />
                    
                    {/* Removed individual view routes since they're now combined */}
                    
                    {/* Other department, attendance, etc. routes */}
                    <Route path="/add-department" element={<AddDepartment />} />
                    <Route path="/view-departments" element={<DepartmentList />} />
                    <Route path="/add-attendance" element={<AddAttendance />} />
                    <Route path="/view-attendance" element={<AttendanceList />} />
                    <Route path="/add-salary" element={<AddSalary />} />
                    <Route path="/view-salary/:eid" element={<Salary />} />
                    <Route path="/add-leave" element={<AddLeave />} />
                    <Route path="/leave" element={<LeaveList />} />
                    <Route path="/add-payroll" element={<AddPayroll />} />
                    <Route path="/view-payroll" element={<PayrollList />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
}

function FixedFooter() {
    return (
        <footer className="fixed-footer">
            <p>&copy; {new Date().getFullYear()} HR Management System. All Rights Reserved.</p>
        </footer>
    );
}

function PageFooter() {
    return (
        <footer className="page-footer">
            <p>&copy; {new Date().getFullYear()} HR Management System. All Rights Reserved.</p>
        </footer>
    );
}

export default App;