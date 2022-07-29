import React, { useRef, useEffect, useState } from 'react';
import { Routes, Route, Link } from "react-router-dom";
import { Button } from 'reactstrap';

export const Welcome = () => {
  return (
    <div className='Welcome'>
      <Link to="/watch">Watch</Link>
      <Link to="/stream">Stream</Link>
    </div>
  );
};

export default Welcome;
