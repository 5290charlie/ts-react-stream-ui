import React from 'react';
import { Container, Row, Col } from 'reactstrap';
import { Routes, Route, Link } from "react-router-dom";
import { Stream, Watch, Welcome } from './components';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.scss';

export const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="stream" element={<Stream />} />
        <Route path="watch" element={<Watch />} />
      </Routes>
    </div>
  );
}

export default App;
