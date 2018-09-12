import React, { Fragment } from 'react'

import {
  lifecycle, withState, compose
} from 'recompose'

import {
  getServer,
  addEventListener as peerAddEventListener,
  removeEventListener as peerRemoveEventListener,
  signIn } from '../server'

import {
  connect } from '../webrtc'

const hookPeerList = lifecycle({
  componentDidMount () {
    this._setPeersHandler = ({ peers }) => { this.props.setPeers(peers) }
    this._setSignedInHandler = ({ me }) => { this.props.setMe(me) }
    peerAddEventListener('signedin', this._setSignedInHandler)
    peerAddEventListener('peersupdated', this._setPeersHandler)
  },
  componentWillUnmount () {
    peerRemoveEventListener('signedin', this._setSignedInHandler)
    peerRemoveEventListener('peersupdated', this._setPeersHandler)
  }
})

const PeerList = ({ peers, me, setSelectedPeer, selectedPeer, setServer, server, className }) => (
  <div className={'container ' + className}>
    <input type='url' onChange={evt => { setServer(e.target.value) }} value={server} />
    <button className='button is-primary' onClick={() => { signIn(server, 'www') }}>Connect to server</button>
    <div>
    Me: { me && `${me.name} (${me.id})` }
    </div>
    <div className='select is-multiple'>
      <select multiple size='8' style={{ minWidth: '150px' }} onChange={(evt) => setSelectedPeer(evt.target.value)}>
        { peers.map(({ id, name }) => <option key={`peer_${id}`} value={id}>{`${name} (${id})`}</option>) }
      </select>
      <button
        className='button is-secondary'
        disabled={!selectedPeer}
        onClick={() => connect(selectedPeer)}>Connect to peer</button>
    </div>
  </div>)

const Peers = compose(
  withState('peers', 'setPeers', []),
  withState('me', 'setMe', null),
  withState('server', 'setSever', getServer()),
  withState('selectedPeer', 'setSelectedPeer', null),
  hookPeerList)
(PeerList)

export default Peers
