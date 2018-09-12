import React from 'react'

import {
  lifecycle, withState, compose
} from 'recompose'

import {
  addEventListener as webrtcAddEventListener,
  removeEventListener as webrtcRemoveEventListener } from '../webrtc'

const hookPeerVideo = lifecycle({
  componentDidMount () {
    this._peertrackaddedHanler = ({ peerId, track }) => {
      if (track.kind === 'video') {
        this.props.setStreams({ ...this.props.streams, [peerId]: new MediaStream([track]) })
      }
    }
    webrtcAddEventListener('peertrackadded', this._peertrackaddedHanler)
  },
  componentWillUnmount () {
    webrtcRemoveEventListener('peertrackadded', this._peertrackaddedHanler)
  }
})

const PeerVideo = ({ className, streams }) => (
  <div className={className}>
    {Object.keys(streams).map(peerId => {
      let stream = streams[peerId]
      return (
        <video
          key={`video_${peerId}`}
          muted
          autoPlay
          ref={elt => {
            if (elt && elt.srcObject !== stream) {
              elt.srcObject = stream
            }
          }} />)
    })}
  </div>)

export default compose(
  withState('streams', 'setStreams', {}),
  hookPeerVideo)
(PeerVideo)
