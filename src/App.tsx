import React, { useRef, useEffect, useState } from 'react';
import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { io, Socket } from "socket.io-client";

const {
  REACT_APP_BACKEND_URL = 'http://localhost:8080'
} = process.env;

function App() {
  const sockRef = useRef<Socket>();

  useEffect(() => {
    sockRef.current = io(REACT_APP_BACKEND_URL, {
      withCredentials: true
    });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
