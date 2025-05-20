import React, { useState } from 'react';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        alert(`Username: ${username}, Password: ${password}`);
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>Username: </label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <br />
                <label>Password: </label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
