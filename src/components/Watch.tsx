import React, { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from "socket.io-client";
import { Container, Row, Col } from 'reactstrap';
import { ClockLoader } from 'react-spinners';
import { ClientRole, ServerToClientEvents, ClientToServerEvents, RtcClient, RtcMsg } from '../types';

const {
  REACT_APP_BACKEND_URL = 'http://localhost:8080'
} = process.env;
const pc_config = {
	iceServers: [
		// {
		//   urls: 'stun:[STUN_IP]:[PORT]',
		//   'credentials': '[YOR CREDENTIALS]',
		//   'username': '[USERNAME]'
		// },
		{
			urls: 'stun:stun.l.google.com:19302',
		},
	],
};
// const createPeerConnection = () => {
//   console.log('createPeerConnection');
//   const peerConnection = new RTCPeerConnection({
//     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
//   });

//   peerConnection.onnegotiationneeded = async () => {
//     console.log('onnegotiationneeded, run createAndSEndOffer()');
//   };

//   peerConnection.onicecandidate = (iceEvent) => {
//     console.log('iceEvent', iceEvent);
//   };

//   peerConnection.ontrack = (event) => {
//     // const video = document.getElementById('remote-view');
//     // if (!video.srcObject) {
//     //   video.srcObject = event.streams[0];
//     // }
//   };

//   return peerConnection;
// };

export const Watch = () => {
  const [client, setClient] = useState<RtcClient | null>(null);
  const [role, setRole] = useState<ClientRole | null>(null);
  const sockRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents>>();

  const pcsRef = useRef<{ [socketId: string]: RTCPeerConnection }>({});
  const localVideoRef = useRef<HTMLVideoElement>(null);

	const createPeerConnection = useCallback(() => {
		try {
			const pc = new RTCPeerConnection(pc_config);

			pc.onicecandidate = (e) => {
				if (!(sockRef.current && e.candidate && client)) return;
				console.log('onicecandidate');
				sockRef.current.emit('candidate', {
          client,
          data: {
            type: 'candidate',
            candidate: e.candidate
          }
        });
			};

			pc.oniceconnectionstatechange = (e) => {
				console.log(e);
			};

			pc.ontrack = (e) => {
				console.log('ontrack success');
				// setUsers((oldUsers) =>
				// 	oldUsers
				// 		.filter((user) => user.id !== socketID)
				// 		.concat({
				// 			id: socketID,
				// 			email,
				// 			stream: e.streams[0],
				// 		}),
				// );
			};

			// if (localStreamRef.current) {
			// 	console.log('localstream add');
			// 	localStreamRef.current.getTracks().forEach((track) => {
			// 		if (!localStreamRef.current) return;
			// 		pc.addTrack(track, localStreamRef.current);
			// 	});
			// } else {
			// 	console.log('no local stream');
			// }

			return pc;
		} catch (e) {
			console.error(e);
			return undefined;
		}
	}, []);

  useEffect(() => {
    if (!(sockRef.current && sockRef.current.id)) {
      console.error('BAIL', sockRef.current);
      return;
    }

    const sendOffer = async () => {
      const pc = createPeerConnection();

      if (pc && sockRef.current && client) {
        const localSdp = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        console.log('create offer success');

        await pc.setLocalDescription(new RTCSessionDescription(localSdp));
        sockRef.current.emit('reg', 'watcher');
        sockRef.current.emit('offer', {
          client,
          data: {
            type: 'offer',
            sdp: localSdp
          }
        });
      }
    };

    sendOffer();
  }, [sockRef, client]);

  const handleOffer = useCallback((msg: RtcMsg) => {
    const respondOffer = async () => {
      const pc = createPeerConnection();

      if (sockRef.current && pc && msg.data.type === 'offer' && msg.client && msg.data.sdp) {
				pcsRef.current = { ...pcsRef.current, [msg.client.id]: pc };
        await pc.setRemoteDescription(msg.data.sdp);
        console.log('answer set remote description success');
        const localSdp = await pc.createAnswer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: true,
        });
        await pc.setLocalDescription(new RTCSessionDescription(localSdp));
        sockRef.current.emit('answer', {
          client: msg.client,
          data: {
            type: 'answer',
            sdp: localSdp
          }
        });
      } else {
        console.warn('twats', sockRef.current, pc, msg);
      }
    };

    respondOffer();
  }, []);

  const handleAnswer = useCallback((msg: RtcMsg) => {
    const respondAnswer = async () => {
      const pc = pcsRef.current[msg.client.id];
      if (sockRef.current && client && pc && msg.data.type === 'answer' && msg.data.sdp) {
        pc.setRemoteDescription(new RTCSessionDescription(msg.data.sdp));
      }
    };

    respondAnswer();
  }, []);

  const handleCandidate = useCallback((msg: RtcMsg) => {
    const respondCandidate = async () => {
      const pc = pcsRef.current[msg.client.id];
      if (sockRef.current && client && pc && msg.data.type === 'candidate' && msg.data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(msg.data.candidate));
				console.log('candidate add success');
      }
    };

    respondCandidate();
  }, []);

  useEffect(() => {
    sockRef.current = io(REACT_APP_BACKEND_URL, {
      withCredentials: true
    });

    setTimeout(() => {
      if (sockRef.current?.id) {
        setClient({
          id: sockRef.current.id,
          role: 'watcher',
          name: 'Watcher'
        });
      } else {
        console.error('wtf wheres id?', sockRef.current);
      }
    }, 250);

    sockRef.current.on('offer', (msg) => {
      console.log('Offer', msg);
      handleOffer(msg);
    });

    sockRef.current.on('answer', (msg) => {
      console.log('Answer', msg);
      handleAnswer(msg);
    });

    sockRef.current.on('candidate', (msg) => {
      console.log('Candidate', msg);
      handleCandidate(msg);
    });
  }, []);

  return (
    <div className="App">
      <Container>
        <Row>
          <Col>
            <h1>Watcher</h1>
            <video
              style={{
                width: 960,
                height: 540,
                margin: 5,
                backgroundColor: 'black',
              }}
              muted
              ref={localVideoRef}
              autoPlay
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Watch;
