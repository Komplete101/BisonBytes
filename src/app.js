import React, { useState } from 'react';
import './App.css';
import LoginForm from './LoginForm';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('token');
  };

  return (
    <div className="App">
      {loggedIn ? (
        <div>
          <h1>Welcome, {localStorage.getItem('token')}</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
