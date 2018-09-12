import { addEventListener as peerAddEventListener, sendMessageTo } from './server'
window.adapter = require('webrtc-adapter')

const log =
  console.log ||
  function () {}

const eventListeners =
{
  peertrackadded: [],
  peertrackremoved: [],
  localstreamcreated: []
}
const dispatchEvent = (name, detail) => eventListeners[name] && eventListeners[name].forEach(handler => handler(detail))
let peerConnection = null
let localStream = null

let createPeerConnection = (to) => {
  peerConnection = new RTCPeerConnection({
    iceServers: [ // Information about ICE servers - Use your own!
      {
        urls: 'stun:stun.stunprotocol.org'
      }
    ]
  })

  peerConnection.onicecandidate = (evt) => {
    if (evt.candidate) {
      sendMessageTo(to, JSON.stringify({
        sdpMid: evt.candidate.sdpMid,
        sdpMLineIndex: evt.candidate.sdpMLineIndex,
        candidate: evt.candidate.candidate }))
    }
  }

  peerConnection.onconnectionstatechange = (evt) => {
    log('peer connection state', peerConnection.connectionState)
  }

  peerConnection.oniceconnectionstatechange = (evt) => {
    log('peer connection ice state', peerConnection.iceConnectionState)
  }

  peerConnection.ontrack = (evt) => {
    log('track received', to)
    dispatchEvent('peertrackadded', { peerId: to, track: evt.track })
  }

  peerConnection.onremovetrack = (evt) => {
    log('track removed', to)
    dispatchEvent('peertrackremoved', { peerId: to, track: evt.track })
  }

  return peerConnection
}

let createAnswer = async (sdp, to) => {
  const peerConnection = createPeerConnection(to)
  log('creating answer', to)

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream))

  await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)

  const answerResponse = { type: 'answer', sdp: peerConnection.localDescription.sdp }
  await sendMessageTo(to, JSON.stringify(answerResponse))
}

const completeOffer = (sdp) => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
}

peerAddEventListener('messagefrompeer', async ({ message, from }) => {
  if (message.candidate) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(message))
    } catch (e) {
      console.error('Error adding ice candidate', message, e)
    }
  } else if (message.type === 'offer') {
    createAnswer(message, from)
  } else if (message.type === 'answer') {
    completeOffer(message)
  }
})

export const connect = async (to) => {
  const peerConnection = createPeerConnection(to)
  log('creating offer', to)

  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream))

  const answer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(answer)

  const offerResponse = { type: 'offer', sdp: peerConnection.localDescription.sdp }
  await sendMessageTo(to, JSON.stringify(offerResponse))
}

export const createLocalStream = async () => {
  const mediaConstraints = {
    audio: true, // We want an audio track
    video: true // ...and we want a video track
  }

  localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints)
  dispatchEvent('localstreamcreated', { stream: localStream })
}

export const addEventListener = (name, handler) => eventListeners[name] && eventListeners[name].push(handler)
export const removeEventListener = (name, handler) => eventListeners[name] && (eventListeners[name] = eventListeners[name].filter(x => x !== handler))
