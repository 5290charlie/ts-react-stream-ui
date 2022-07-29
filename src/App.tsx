import React, { useRef, useEffect, useState, useCallback } from 'react';
import { io, Socket } from "socket.io-client";
import { Container, Row, Col, Button } from 'reactstrap';
import { Stream, Watch } from './components';
import { ClientRole, ServerToClientEvents, ClientToServerEvents } from './types';
import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const {
  REACT_APP_BACKEND_URL = 'http://localhost:8080'
} = process.env;

const createPeerConnection = () => {
  console.log('createPeerConnection');
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  peerConnection.onnegotiationneeded = async () => {
    console.log('onnegotiationneeded, run createAndSEndOffer()');
  };

  peerConnection.onicecandidate = (iceEvent) => {
    console.log('iceEvent', iceEvent);
  };

  peerConnection.ontrack = (event) => {
    // const video = document.getElementById('remote-view');
    // if (!video.srcObject) {
    //   video.srcObject = event.streams[0];
    // }
  };

  return peerConnection;
};

function App() {
  const [role, setRole] = useState<null|ClientRole>(null);
  const sockRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();

	const pcsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const localStreamRef = useRef<MediaStream>();

  const pc = createPeerConnection();

  useEffect(() => {
    const sendOffer = async () => {
      const localSdp = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      console.log('create offer success');

      if (sockRef.current) {
        await pc.setLocalDescription(new RTCSessionDescription(localSdp));
        sockRef.current.emit('offer', {
          sdp: localSdp,
          offerSendID: sockRef.current.id,
        });
      }
    };

    sendOffer();
  }, [ pc, sockRef ]);

  useEffect(() => {
    sockRef.current = io(REACT_APP_BACKEND_URL, {
      withCredentials: true
    });

    sockRef.current.on('offer', (data) => {
      console.log('Offer', data);
    });

    sockRef.current.on('answer', (data) => {
      console.log('Answer', data);
    });

    sockRef.current.on('candidate', (data) => {
      console.log('Candidate', data);
    });
  }, []);

  const startStreaming = useCallback(() => {
    setRole('streamer');
    if (sockRef.current) {
      sockRef.current.emit('reg', 'streamer');
    }
  }, [ sockRef ]);

  const startWatching = useCallback(() => {
    setRole('watcher');
    if (sockRef.current) {
      sockRef.current.emit('reg', 'watcher');
    }
  }, [ sockRef ]);

  return (
    <div className="App">
      <Container>
        <Row>
          <Col>
            <Button onClick={startStreaming} color='success'>Stream</Button>
          </Col>
          <Col>
            <Button onClick={startWatching} color='primary'>Watch</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            {role && (
              role === 'streamer' ? (
                <Stream />
              ) : (
                <Watch />
              )
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
