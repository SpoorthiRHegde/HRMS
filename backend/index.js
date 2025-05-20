const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');  // Import the db.js file

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your React app's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
  }));
app.use(bodyParser.json());

function convertToMySQLDate(dateString) {
    if (!dateString) return null;

    // If the date is already in YYYY-MM-DD format, return it as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    // Otherwise, assume it's in DD-MM-YYYY format and convert it
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
}

// Example endpoint in index.js
app.get('/employees', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection(); // Using the exported pool
    
    const [employees] = await connection.query('SELECT * FROM EMPLOYEE');
    const [qualifications] = await connection.query('SELECT * FROM QUALIFICATION');
    const [accounts] = await connection.query('SELECT * FROM EMPLOYEEDETAILS');
    const [families] = await connection.query('SELECT * FROM FAMILY');

    res.json({
      success: true,
      employees: employees.map(formatDates),
      qualifications,
      accounts,
      families: families.map(formatDates)
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch employee data',
      detailedError: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});


// API endpoint to get all qualifications
app.get('/qualifications', (req, res) => {
    const sql = 'SELECT * FROM QUALIFICATION';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// API endpoint to get all employee accounts
app.get('/employee-accounts', (req, res) => {
    const sql = 'SELECT * FROM EMPLOYEEDETAILS';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// API endpoint to get all family details
app.get('/families', (req, res) => {
    const sql = 'SELECT * FROM FAMILY';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results.map(fam => ({
                ...fam,
                F_DOB: fam.F_DOB ? fam.F_DOB.toISOString().split('T')[0] : null,
                M_DOB: fam.M_DOB ? fam.M_DOB.toISOString().split('T')[0] : null
            })));
        }
    });
});

app.post('/add-employee', (req, res) => {
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Database connection error' });
        }

        connection.beginTransaction(err => {
            if (err) {
                connection.release();
                console.error('Transaction error:', err);
                return res.status(500).json({ error: 'Transaction error' });
            }

            const {
                EID, INITIAL, FIRSTNAME, MIDDLENAME, LASTNAME, DESIGNATION,
                DOB, DATE_OF_JOIN, FTYPE, NATIONALITY, PHONE, EMAIL,
                CASTE, DOORNO, CITY, STATE, PINCODE, GENDER,
                PROFEXP_DESIGNATION, PPROFEXP_FROM, PPROFEXP_TO,
                LEAVE_ML, LEAVE_LOP, LEAVE_RH, LEAVE_OOD, LEAVE_CL, DID,
                INSTITUTION, PERCENTAGE, SPECIALIZATION, YOG,
                BIOMETRIC_CARD_NO, AADHAR, BANK_ACC, PAN,
                FNAME, F_DOB, MNAME, M_DOB
            } = req.body;

            // 1. Insert into EMPLOYEE
            connection.query('INSERT INTO EMPLOYEE SET ?', {
                EID, INITIAL, FIRSTNAME, MIDDLENAME, LASTNAME, DESIGNATION,
                DOB: convertToMySQLDate(DOB),
                DATE_OF_JOIN: convertToMySQLDate(DATE_OF_JOIN),
                FTYPE, NATIONALITY, PHONE, EMAIL,
                CASTE, DOORNO, CITY, STATE, PINCODE, GENDER,
                PROFEXP_DESIGNATION,
                PPROFEXP_FROM: convertToMySQLDate(PPROFEXP_FROM),
                PPROFEXP_TO: convertToMySQLDate(PPROFEXP_TO),
                LEAVE_ML, LEAVE_LOP, LEAVE_RH, LEAVE_OOD, LEAVE_CL, DID
            }, (err) => {
                if (err) {
                    return rollback(connection, res, err);
                }

                // 2. Insert qualification if provided
                if (INSTITUTION) {
                    connection.query(
                        'INSERT INTO QUALIFICATION (EID, INSTITUTION, PERCENTAGE, SPECIALIZATION, YOG) VALUES (?, ?, ?, ?, ?)',
                        [EID, INSTITUTION, PERCENTAGE, SPECIALIZATION, YOG],
                        (err) => {
                            if (err) {
                                return rollback(connection, res, err);
                            }
                            insertAccountDetails();
                        }
                    );
                } else {
                    insertAccountDetails();
                }

                function insertAccountDetails() {
                    // 3. Insert account details if provided
                    if (BIOMETRIC_CARD_NO) {
                        connection.query(
                            'INSERT INTO EMPLOYEEDETAILS (EID, BIOMETRIC_CARD_NO, AADHAR, BANK_ACC, PAN) VALUES (?, ?, ?, ?, ?)',
                            [EID, BIOMETRIC_CARD_NO, AADHAR, BANK_ACC, PAN],
                            (err) => {
                                if (err) {
                                    return rollback(connection, res, err);
                                }
                                insertFamilyDetails();
                            }
                        );
                    } else {
                        insertFamilyDetails();
                    }
                }

                function insertFamilyDetails() {
                    // 4. Insert family details if provided
                    if (FNAME) {
                        connection.query(
                            'INSERT INTO FAMILY (EID, FNAME, F_DOB, MNAME, M_DOB) VALUES (?, ?, ?, ?, ?)',
                            [EID, FNAME, convertToMySQLDate(F_DOB), MNAME, convertToMySQLDate(M_DOB)],
                            (err) => {
                                if (err) {
                                    return rollback(connection, res, err);
                                }
                                commitTransaction();
                            }
                        );
                    } else {
                        commitTransaction();
                    }
                }

                function commitTransaction() {
                    connection.commit((err) => {
                        if (err) {
                            return rollback(connection, res, err);
                        }
                        connection.release();
                        res.json({ success: true, message: 'Employee added successfully' });
                    });
                }
            });
        });
    });
});

function rollback(connection, res, err) {
    connection.rollback(() => {
        connection.release();
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database operation failed', details: err.message });
    });
}

// In your backend (index.js)


function formatDates(item) {
  // Format date fields to ISO strings
  const dateFields = ['DOB', 'DATE_OF_JOIN', 'PPROFEXP_FROM', 'PPROFEXP_TO', 'F_DOB', 'M_DOB'];
  const result = { ...item };
  
  dateFields.forEach(field => {
    if (result[field] instanceof Date) {
      result[field] = result[field].toISOString().split('T')[0];
    }
  });
  
  return result;
}

// API endpoint to delete an employee
app.delete('/employees/:eid', (req, res) => {
    const { eid } = req.params;
    const sqlDelete = 'DELETE FROM EMPLOYEE WHERE EID = ?';
    db.query(sqlDelete, [eid], (err, result) => {
        if (err) {
            console.error('Error deleting employee:', err);
            return res.status(500).send({ message: 'Failed to delete employee', error: err.message });
        }
        res.status(200).json({ message: 'Employee and related records deleted successfully' });
    });
});

// API endpoint to update an employee
app.put('/employees/:eid', (req, res) => {
    const { eid } = req.params;

    // Convert dates from dd-mm-yyyy to yyyy-mm-dd
    const formattedData = {
        ...req.body,
        DOB: convertToMySQLDate(req.body.DOB),
        DATE_OF_JOIN: convertToMySQLDate(req.body.DATE_OF_JOIN),
        PPROFEXP_FROM: convertToMySQLDate(req.body.PPROFEXP_FROM),
        PPROFEXP_TO: convertToMySQLDate(req.body.PPROFEXP_TO),
    };

    const sql = 'UPDATE EMPLOYEE SET ? WHERE EID = ?';
    db.query(sql, [formattedData, eid], (err, result) => {
        if (err) {
            console.error('Error updating employee:', err);
            return res.status(500).send({ message: 'Failed to update employee', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee updated successfully' });
    });
});




//API to display all department
app.get('/departments', (req, res) => {
    const sql = 'SELECT * FROM DEPARTMENT';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            res.status(500).send('Error fetching departments');
        } else {
            res.json(results);
        }
    });
});
//API to add department
app.post('/add-department', (req, res) => {
    const { DID, DNAME, DHEAD } = req.body;  // Ensure correct structure of data
    const sql = 'INSERT INTO DEPARTMENT (DID, DNAME, DHEAD) VALUES (?, ?, ?)';
    const values = [DID, DNAME, DHEAD];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error adding department:', err); // Log the error
            res.status(500).send(err);
        } else {
            res.json({ message: 'Department added successfully', id: result.insertId });
        }
    });
});
//API to delete a department
app.delete('/departmentS/:did', (req, res) => {
    const { did } = req.params;
    const sqlDelete = 'DELETE FROM DEPARTMENT WHERE DID = ?';
    db.query(sqlDelete, [did], (err, result) => {
      if (err) {
        console.error('Error deleting department:', err);
        return res.status(500).send({ message: 'Failed to delete department', error: err.message });
      }
      res.status(200).json({ message: 'Department deleted successfully' });
    });
  });

//API to search department
app.get('/departments/search', (req, res) => {
    const { DID, DNAME } = req.query;
    let sql = 'SELECT * FROM DEPARTMENT WHERE 1';
    let values = [];
    if (DID) {
        sql += ' AND DID = ?';
        values.push(DID);
    }
    if (DNAME) {
        sql += ' AND DNAME = ?';
        values.push(DNAME);
    }
    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error searching for department:', err);
            return res.status(500).send('Error searching for department');
        }
        res.json(results);
    });
});
//API to Update department details
app.put('/departments/:did', (req, res) => {
    const { did } = req.params;
    const { DNAME, DHEAD } = req.body;
    const sql = 'UPDATE DEPARTMENT SET DNAME = ?, DHEAD = ? WHERE DID = ?';
    const values = [DNAME, DHEAD, did];
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating department:', err);
            return res.status(500).send('Error updating department');
        }
        if (result.affectedRows > 0) {
            res.send('Department updated successfully');
        } else {
            res.status(404).send('Department not found');
        }
    });
});

//API to get attendance list
app.get('/attendance', (req, res) => {
    
    const sql = 'SELECT * FROM attendance';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching attendance:', err);
            res.status(500).send(err);
        } else {
            const formattedResults = results.map(attendance => ({
                ...attendance,
                A_DATE: attendance.A_DATE.toISOString().split('T')[0] // Convert to yyyy-mm-dd
            }));
            res.json(results);
        }
    });
});
//API to add attendance
app.post('/add-attendance', (req, res) => {
    console.log(req.body);
    const { EID, A_DATE, STATUS, LOGIN, LOGOUT } = req.body;
    const formattedData = {
        ...req.body,
        A_DATE: convertToMySQLDate(req.body.A_DATE)
    };
    console.log("Received Data:", { EID, A_DATE, STATUS, LOGIN, LOGOUT }); // Debugging

    if (!EID || !A_DATE || !STATUS) {
        console.error("Missing required fields");
        return res.status(400).json({ message: "EID, A_DATE, and STATUS are required!" });
    }
    const sql = 'INSERT INTO ATTENDANCE (EID, A_DATE, STATUS, LOGIN, LOGOUT) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [EID, A_DATE, STATUS, LOGIN, LOGOUT], (err, result) => {
        if (err) {
            console.error("Error adding attendance:", err.code, err.message); 
            return res.status(500).json({ message: "Failed to add attendance", error: err.message });
        }
        res.json({ message: "Attendance added successfully", id: result.insertId });
    });
});
   // const moment = require('moment');

app.delete('/attendance/:eid', (req, res) => {
    const { eid } = req.params;

    if (!eid) {
        return res.status(400).json({ message: 'EID is required' });
    }

    console.log("Deleting attendance for EID:", eid);

    const sqlDelete = 'DELETE FROM ATTENDANCE WHERE EID = ?';
    db.query(sqlDelete, [eid], (err, result) => {
        if (err) {
            console.error('Error deleting attendance record:', err);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No attendance record found' });
        }
        res.status(200).json({ message: 'Attendance record deleted successfully' });
    });
});

  
const moment = require('moment');
app.put('/attendance/:eid/:date', (req, res) => {
    const { eid, date } = req.params;
    const { status, login, logout, STATUS, LOGIN, LOGOUT } = req.body;

    // Convert date to MySQL DATETIME format (YYYY-MM-DD HH:mm:ss)
    const formattedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');

    console.log(`🔍 Updating attendance for EID: ${eid}, Date: ${formattedDate}`);

    let updateFields = [];
    let values = [];

    if (status || STATUS) {
        updateFields.push("STATUS = ?");
        values.push(status || STATUS);
    }
    if (login || LOGIN) {
        updateFields.push("LOGIN = ?");
        values.push(login || LOGIN);
    }
    if (logout || LOGOUT) {
        updateFields.push("LOGOUT = ?");
        values.push(logout || LOGOUT);
    }

    values.push(eid, formattedDate);

    const sqlUpdate = `UPDATE ATTENDANCE SET ${updateFields.join(", ")} WHERE EID = ? AND A_DATE = ?`;

    db.query(sqlUpdate, values, (err, result) => {
        if (err) {
            console.error('❌ Database error:', err);
        } else if (result.affectedRows === 0) {
            console.warn('⚠️ No attendance record found.');
        } else {
            console.log('✅ Attendance record updated successfully.');
        }
    });
});



app.get('/qualifications/:eid', (req, res) => {
    const { eid } = req.params;
    db.query('CALL FilterQualificationByEID(?)', [eid], (err, results) => {
        if (err) {
            console.error('Error executing procedure:', err);
            return res.status(500).send('Error fetching family details');
        }
        if (results.length > 0 && results[0].length > 0) {
            res.json(results[0]); 
        } else {
            res.status(404).send('No qualification details found for the given EID');
        }
    });
});

app.put("/qualifications", async (req, res) => {
    const {
      oldEID,
      oldINSTITUTION,
      oldPERCENTAGE,
      oldSPECIALIZATION,
      oldYOG,
      newINSTITUTION,
      newPERCENTAGE,
      newSPECIALIZATION,
      newYOG
    } = req.body;
  
    try {
      const updateSQL = `
        UPDATE QUALIFICATION
        SET INSTITUTION = ?, PERCENTAGE = ?, SPECIALIZATION = ?, YOG = ?
        WHERE EID = ? AND INSTITUTION = ? AND PERCENTAGE = ? AND SPECIALIZATION = ? AND YOG = ?;
      `;
  
      const [result] = await db.promise().query(updateSQL, [
        newINSTITUTION,
        newPERCENTAGE,
        newSPECIALIZATION,
        newYOG,
        oldEID,
        oldINSTITUTION,
        oldPERCENTAGE,
        oldSPECIALIZATION,
        oldYOG
      ]);
  
      if (result.affectedRows > 0) {
        res.json({ message: "Qualification details updated successfully" });
      } else {
        res.status(404).json({ error: "Record not found" });
      }
    } catch (error) {
      console.error("Error updating qualification details:", error);
      res.status(500).json({ error: "Failed to update qualification details" });
    }
  });

//API to delete qualifications
app.delete('/qualifications/:eid', (req, res) => {
    const { eid } = req.params;
    const sqlDelete = 'DELETE FROM QUALIFICATION WHERE EID = ?';
    db.query(sqlDelete, [eid], (err, result) => {
      if (err) {
        console.error('Error deleting  record:', err);
        return res.status(500).send({ message: 'Failed to delete record', error: err.message });
      }
      res.status(200).json({ message: ' record deleted successfully' });
    });
  });





app.get('/employee-accounts/:eid', (req, res) => {
    const { eid } = req.params;
    const sql = 'SELECT * FROM EMPLOYEEDETAILS WHERE EID = ?';
    db.query(sql, [eid], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error fetching employee account details');
        } else {
            res.json(results);
        }
    });
});

app.put('/employee-accounts/:eid', (req, res) => {
    const { eid } = req.params;
    const { BIOMETRIC_CARD_NO, AADHAR, BANK_ACC, PAN } = req.body;
    const query = `
        UPDATE EMPLOYEEDETAILS
        SET BIOMETRIC_CARD_NO = ?, AADHAR = ?, BANK_ACC = ?, PAN = ?
        WHERE EID = ?
    `;
    db.query(query, [BIOMETRIC_CARD_NO, AADHAR, BANK_ACC, PAN, eid], (err, results) => {
        if (err) {
            console.error('Error updating employee account details:', err);
            return res.status(500).send('Failed to update employee account details');
        }
        if (results.affectedRows > 0) {
            res.send('Employee account details updated successfully');
        } else {
            res.status(404).send('No employee account details found for the given EID');
        }
    });
});

//API to delete employee account details
app.delete('/employee-accounts/:eid', (req, res) => {
    const { eid } = req.params; 
    const sqlDelete = 'DELETE FROM EMPLOYEEDETAILS WHERE EID = ?';
    db.query(sqlDelete, [eid], (err, result) => {
      if (err) {
        console.error('Error deleting  record:', err);
        return res.status(500).send({ message: 'Failed to delete record', error: err.message });
      }
      res.status(200).json({ message: ' record deleted successfully' });
    });
  });

//API to add salary details
// ===================== Salary Endpoints =====================

// Get all salaries
app.get('/salaries', (req, res) => {
    const sql = 'SELECT * FROM SALARY';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching salaries:', err);
            return res.status(500).send(err);
        }
        const formattedResults = results.map(salary => ({
            ...salary,
            SAL_DATE: salary.SAL_DATE ? salary.SAL_DATE.toISOString().split('T')[0] : null,  // Convert DATE to yyyy-mm-dd
        }));
        res.json(formattedResults);
    });
});

app.post('/add-salary', (req, res) => {
    console.log('Received Salary Data:', req.body);

    // Validate required fields
    const { EID, BASIC_SAL, AGP, ESI, LOAN, IT, SAL_DATE } = req.body;
    if (!EID || !BASIC_SAL || !AGP || !ESI || !LOAN || !IT || !SAL_DATE) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate DATE format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(SAL_DATE)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }

    // Prepare data for insertion
    const formattedData = {
        EID: parseInt(EID),
        BASIC_SAL: parseFloat(BASIC_SAL),
        AGP: parseFloat(AGP),
        ESI: parseFloat(ESI),
        LOAN: parseFloat(LOAN),
        IT: parseFloat(IT),
        SAL_DATE: SAL_DATE // Already in YYYY-MM-DD format
    };

    // Log the SQL query
    const sql = 'INSERT INTO SALARY SET ?';
    console.log('Executing SQL Query:', sql, formattedData);

    // Execute the query
    db.query(sql, formattedData, (err, result) => {
        if (err) {
            console.error('Error adding salary:', err);
            return res.status(500).json({ error: 'Failed to add salary record', details: err });
        }
        res.json({ message: 'Salary record added successfully', id: result.insertId });
    });
});

// Update a salary record (by EID)
app.put('/salaries/:eid', (req, res) => {
    const { eid } = req.params;

    const formattedData = {
        ...req.body,
        SAL_DATE: convertToMySQLDate(req.body.SAL_DATE)
    };


    const sql = 'UPDATE SALARY SET ? WHERE EID = ?';
    db.query(sql, [formattedData, eid], (err, result) => {
        if (err) {
            console.error('Error updating salary:', err);
            return res.status(500).send(err);
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Salary record not found' });
        }
        res.json({ message: 'Salary record updated successfully' });
    });
});

// Delete a salary record (by ID)
app.delete('/salaries/:eid', (req, res) => {
    const { eid } = req.params;

    const sql = 'DELETE FROM SALARY WHERE EID = ?';
    db.query(sql, [eid], (err, result) => {
        if (err) {
            console.error('Error deleting salary:', err);
            return res.status(500).send(err);
        }
        res.json({ message: 'Salary record deleted successfully' });
    });
});



//API to get family details based on EID
app.get('/families/:eid', (req, res) => {
    const { eid } = req.params;
    db.query('CALL FilterFamilyByEID(?)', [eid], (err, results) => {
        if (err) {
            console.error('Error executing procedure:', err);
            return res.status(500).send('Error fetching family details');
        }
        if (results.length > 0 && results[0].length > 0) {
            res.json(results[0]); 
        } else {
            res.status(404).send('No family details found for the given EID');
        }
    });
});
//API to update family details
app.put('/families/:eid', (req, res) => {
    const { eid } = req.params;
    const { FNAME, F_DOB, MNAME, M_DOB } = req.body;
    const formattedFDOB = new Date(F_DOB).toISOString().split('T')[0];
    const formattedMDOB = new Date(M_DOB).toISOString().split('T')[0];
    const query = `
        UPDATE family
        SET FNAME = ?, F_DOB = ?, MNAME = ?, M_DOB = ?
        WHERE EID = ?
    `;
    db.query(query, [FNAME, formattedFDOB, MNAME, formattedMDOB, eid], (err, results) => {
        if (err) {
            console.error('Error updating family details:', err);
            return res.status(500).send('Failed to update family details');
        }
        if (results.affectedRows > 0) {
            res.send('Family details updated successfully');
        } else {
            res.status(404).send('No family details found for the given EID');
        }
    });
});

//API to delete family detail
app.delete('/families/:eid', (req, res) => {
    const { eid } = req.params;
    const sqlDelete = 'DELETE FROM FAMILY WHERE EID = ?';
    db.query(sqlDelete, [eid], (err, result) => {
        if (err) {
            console.error('Error deleting family details:', err);
            return res.status(500).send({ message: 'Failed to delete family details', error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Family details not found' });
        }
        res.status(200).json({ message: 'Family details deleted successfully' });
    });
});



// API to fetch leave data
app.get('/leave', (req, res) => {
    const sql = 'SELECT * FROM LEAVES';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(results);
        }
    });
});

// API to add a new leave entry
app.post('/add-leave', (req, res) => {
    const { EID, LTYPE, APPROVAL, NO_OF_DAYS, FROM_DATE, TO_DATE } = req.body;

    // Validate required fields
    if (!EID || !LTYPE || !NO_OF_DAYS || !FROM_DATE || !TO_DATE) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Ensure EID and NO_OF_DAYS are integers
    const employeeID = parseInt(EID);
    const days = parseInt(NO_OF_DAYS);

    if (isNaN(employeeID) || isNaN(days) || days < 1) {
        return res.status(400).json({ error: 'Invalid Employee ID or Number of Days' });
    }

    // Format dates correctly (yyyy-mm-dd for MySQL)
    const formatDate = (date) => {
        const parts = date.split('-');
        return parts.length === 3 ? `${parts[0]}-${parts[1]}-${parts[2]}` : null;
    };

    const formattedData = {
        EID: employeeID,
        LTYPE,
        APPROVAL: APPROVAL || 'PENDING', // Default to "PENDING" if not provided
        NO_OF_DAYS: days,
        FROM_DATE: formatDate(FROM_DATE),
        TO_DATE: formatDate(TO_DATE),
    };

    // Insert into database
    const sql = 'INSERT INTO LEAVES SET ?';
    db.query(sql, formattedData, (err, result) => {
        if (err) {
            console.error('Failed to add leave:', err);
            return res.status(500).json({ error: 'Database insertion failed', details: err });
        }
        res.json({ message: 'Leave added successfully', id: result.insertId });
    });
});

// API to update leave data
app.put('/leave/:eid/:date', async (req, res) => {
    try {
        const { eid, date } = req.params;
        let { LTYPE, APPROVAL, NO_OF_DAYS, FROM_DATE, TO_DATE } = req.body;

        console.log('🔹 Received Params:', { eid, date });
        console.log('🔹 Received Body:', req.body);

        // If FROM_DATE is missing, use the URL param date
        if (!FROM_DATE) {
            FROM_DATE = date;
            console.log('⚠️ FROM_DATE was missing in request. Using date param instead.');
        }

        if (!eid || !date || !LTYPE || !APPROVAL || !NO_OF_DAYS || !FROM_DATE || !TO_DATE) {
            return res.status(400).json({ message: '❌ Missing required fields' });
        }

        const formattedFromDate = FROM_DATE.split('T')[0];
        const formattedToDate = TO_DATE.split('T')[0];
        const formattedParamDate = date.split('T')[0];

        console.log('📅 Formatted Dates:', { formattedFromDate, formattedToDate, formattedParamDate });

        const checkSql = 'SELECT * FROM LEAVES WHERE EID = ? AND FROM_DATE = ?';
        const [checkResult] = await db.promise().query(checkSql, [eid, formattedParamDate]);

        if (checkResult.length === 0) {
            return res.status(404).json({ message: '⚠️ No leave record found to update' });
        }

        const updateSQL = `
            UPDATE LEAVES 
            SET LTYPE = ?, APPROVAL = ?, NO_OF_DAYS = ?, FROM_DATE = ?, TO_DATE = ?
            WHERE EID = ? AND FROM_DATE = ?
        `;

        const [result] = await db.promise().query(updateSQL, [
            LTYPE, APPROVAL, NO_OF_DAYS, formattedFromDate, formattedToDate, eid, formattedParamDate,
        ]);

        console.log('✅ Update Result:', result);

        if (result.affectedRows > 0) {
            res.json({ message: '✅ Leave record updated successfully' });
        } else {
            res.status(404).json({ message: '⚠️ No leave record found to update' });
        }
    } catch (error) {
        console.error('❌ Error updating leave record:', error);
        res.status(500).json({ message: '❌ Failed to update leave record', error: error.message });
    }
});

// API to delete leave data
app.delete('/leave/:eid/:from_date', (req, res) => {
    const { eid, from_date } = req.params;

    if (!eid || !from_date) {
        return res.status(400).json({ message: 'EID and From Date are required' });
    }

    console.log(`🔍 Deleting leave for EID: ${eid}, From Date: ${from_date}`);

    const sqlDelete = 'DELETE FROM LEAVES WHERE EID = ? AND From_Date = ? LIMIT 1';

    db.query(sqlDelete, [eid, from_date], (err, result) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            console.warn('⚠️ No leave record found.');
            return res.status(404).json({ message: 'No leave record found' });
        }
        console.log('✅ Leave record deleted successfully.');
        res.status(200).json({ message: 'Leave record deleted successfully' });
    });
});



function getEmployeeDetails(EID) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT DATE_OF_JOIN FROM EMPLOYEE WHERE EID = ?';
        db.query(sql, [EID], (err, results) => {
            if (err) {
                reject(err);
            } else if (results.length === 0) {
                reject(new Error('Employee not found'));
            } else {
                // Convert DATE_OF_JOIN to YYYY-MM-DD format
                const joiningDate = results[0].DATE_OF_JOIN;
                const [day, month, year] = joiningDate.split('-');
                const formattedJoiningDate = `${year}-${month}-${day}`;
                console.log('Original Joining Date:', joiningDate);
                console.log('Formatted Joining Date:', formattedJoiningDate);
                resolve(formattedJoiningDate);
            }
        });
    });
}


app.get('/payroll', (req, res) => {
    const sql = 'SELECT * FROM PAYROLL';
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }

        // Convert P_DATE to yyyy-mm-dd format before sending to frontend
        const formattedResults = results.map(record => ({
            ...record,
            P_DATE: record.P_DATE ? record.P_DATE.toISOString().split('T')[0] : null,
        }));
        res.json(formattedResults);
    });
});

app.post('/add-payroll', async (req, res) => {
    console.log('Received data:', req.body);

    const { EID, P_DATE } = req.body;

    try {
        // Fetch the employee's joining date
        const joiningDate = await getEmployeeDetails(EID);

        // Convert dates to Date objects for comparison
        const payrollDate = new Date(P_DATE);
        const employeeJoiningDate = new Date(joiningDate);

        console.log('Payroll Date (from frontend):', P_DATE);
        console.log('Payroll Date (converted):', payrollDate);
        console.log('Joining Date (from database):', joiningDate);
        console.log('Joining Date (converted):', employeeJoiningDate);

        // Check if payroll date is after joining date
        if (payrollDate <= employeeJoiningDate) {
            console.log('Validation failed: Payroll date is before or equal to joining date');
            return res.status(400).json({ message: 'Payroll date must be after the employee joining date' });
        }

        console.log('Validation passed: Payroll date is after joining date');

        // Proceed to add payroll record
        const formattedData = {
            ...req.body,
            P_DATE: convertToMySQLDate(P_DATE)
        };

        const sql = 'INSERT INTO PAYROLL SET ?';
        db.query(sql, formattedData, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Failed to add payroll', error: err.message });
            }
            res.status(200).json({ message: 'Payroll record added successfully', id: result.insertId });
        });
    } catch (error) {
        console.error('Error fetching employee details:', error);
        res.status(500).json({ message: 'Failed to add payroll', error: error.message });
    }
});

// 3. Delete payroll record (by EID and P_DATE — date acts like part of the composite key)
app.delete('/payroll/:eid/:p_date', (req, res) => {
    const { eid, p_date } = req.params;

    if (!eid || !p_date) {
        return res.status(400).json({ message: '❌ EID and Payroll Date are required' });
    }

    console.log(`🔍 Deleting payroll record for EID: ${eid}, Payroll Date: ${p_date}`);

    const sqlDelete = 'DELETE FROM PAYROLL WHERE EID = ? AND P_DATE = ? LIMIT 1';

    db.query(sqlDelete, [eid, p_date], (err, result) => {
        if (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ message: 'Database error', error: err.message });
        }
        if (result.affectedRows === 0) {
            console.warn('⚠️ No payroll record found.');
            return res.status(404).json({ message: 'No payroll record found' });
        }
        console.log('✅ Payroll record deleted successfully.');
        res.status(200).json({ message: '✅ Payroll record deleted successfully' });
    });
  });


app.put("/payroll/:eid/:p_date", async (req, res) => {
    try {
        const { eid, p_date } = req.params;
        let { NO_OF_DAYS, PF, VA } = req.body;

        console.log("🔹 Received Params:", { eid, p_date });
        console.log("🔹 Received Body:", req.body);

        if (!eid || !p_date || NO_OF_DAYS === undefined || PF === undefined || VA === undefined) {
            return res.status(400).json({ message: "❌ Missing required fields" });
        }

        const formattedPDate = p_date.split("T")[0];

        console.log("📅 Formatted Payroll Date:", formattedPDate);

        const checkSql = "SELECT * FROM PAYROLL WHERE EID = ? AND P_DATE = ?";
        const [checkResult] = await db.promise().query(checkSql, [eid, formattedPDate]);

        if (checkResult.length === 0) {
            return res.status(404).json({ message: "⚠️ No payroll record found to update" });
        }

        const updateSQL = `
            UPDATE PAYROLL 
            SET NO_OF_DAYS = ?, PF = ?, VA = ?
            WHERE EID = ? AND P_DATE = ?
        `;

        const [result] = await db.promise().query(updateSQL, [
            NO_OF_DAYS, PF, VA, eid, formattedPDate
        ]);

        console.log("✅ Update Result:", result);

        if (result.affectedRows > 0) {
            res.json({ message: "✅ Payroll record updated successfully" });
        } else {
            res.status(404).json({ message: "⚠️ No payroll record found to update" });
        }
    } catch (error) {
        console.error("❌ Error updating payroll record:", error);
        res.status(500).json({ message: "❌ Failed to update payroll record", error: error.message });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});