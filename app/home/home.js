import React from 'react'

import Peers from './peers'
import LocalVideo from './localVideo'
import PeerVideo from './peerVideo'

export default () => (
  <div>
    <div className='columns'>
      <Peers className='column is-one-fifth' />
      <PeerVideo className='column' />
    </div>

    <LocalVideo />
  </div>
)
