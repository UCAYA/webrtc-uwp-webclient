import React, { Fragment } from 'react'

import {
  lifecycle, withState, compose
} from 'recompose'

// import {
//   getServer,
//   addEventListener as peerAddEventListener,
//   removeEventListener as peerRemoveEventListener,
//   signIn } from '../server'

import {
  addEventListener as webrtcAddEventListener,
  removeEventListener as webrtcRemoveEventListener,
  createLocalStream,
  connect } from '../webrtc'

const hookLocalVideo = lifecycle({
  componentDidMount () {
    createLocalStream()
    this._localStreamHanler = ({ stream }) => { this.props.setLocalStream(stream) }
    webrtcAddEventListener('localstreamcreated', this._localStreamHanler)
  },
  componentWillUnmount () {
    webrtcRemoveEventListener('localstreamcreated', this._localStreamHanler)
  }
})

const LocalVideo = ({ localStream }) => (
  <Fragment>
    {localStream &&
      <video
        muted
        autoPlay
        style={{ position: 'absolute', bottom: '10px', right: '10px', height: 100 }}
        ref={elt => { if (elt && elt.srcObject !== localStream) { elt.srcObject = localStream } }} />}
  </Fragment>)

export default compose(
  withState('localStream', 'setLocalStream', null),
  hookLocalVideo)
(LocalVideo)
