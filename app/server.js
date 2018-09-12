let server = 'http://127.0.0.1:8888'
export const getServer = () => server
export const setServer = (s) => { server = s }

const log =
  console.log ||
  function () {}

const fetchText = async (...args) => {
  const response = await window.fetch(...args)
  const text = await response.text()
  const from = response.headers.get('pragma')
  return { text, from }
}

const get = (url) => fetchText(`${server}/${url}`)
const post = (url, body) => fetchText(`${server}/${url}`, { method: 'POST', body, headers: { 'Content-Type': 'text/plain' } })
let myId = null

const parsePeers = (peersList) => {
  let r = /(.+),(\d+),(\d+)\n/gi
  let result = null
  let peers = []
  while (result = r.exec(peersList)) {
    const [_all, n, id, isActive] = result
    peers.push({ name: n, id, isActive })
  }
  return peers
  // peersList
  //   .split('\n')
  //   .map(line => {
  //     const [n, id, isActive] = /.+,\d+,\d+\n/gi.exec(line) line.split(',')
  //     return { name: n, id, isActive }
  //   })
}

export const quit = () => get('quit')
export const signIn = async (server, name) => {
  setServer(server)
  const { text, from } = await get(`sign_in?${encodeURI(name)}`)
  const peers = parsePeers(text)
  myId = from
  const me = peers.filter(x => x.id === from)[0]
  const otherPeers = peers.filter(x => x.id !== myId)
  dispatchEvent('signedin', { me, peers: otherPeers })
  dispatchEvent('peersupdated', { peers: otherPeers })

  setTimeout(async () => { await waitForMessage(myId) })
  return peers
}

export const signOut = () => get(`sign_out`)
export const sendMessageFromTo = (myId, peerId, message) => post(`message?peer_id=${encodeURI(myId)}&to=${encodeURI(peerId)}`, message)
export const sendMessageTo = (peerId, message) => sendMessageFromTo(myId, peerId, message)
export const wait = (myId) => get(`wait?peer_id=${encodeURI(myId)}`)

const eventListeners =
{
  signedin: [],
  peersupdated: [],
  peerconnected: [],
  messagefrompeer: [],
  addpeerstream: []
}

const dispatchEvent = (name, detail) => eventListeners[name] && eventListeners[name].forEach(handler => handler(detail))

const waitForMessage = async (myId) => {
  let message = null
  let fromPeerId = null
  try {
    const { text, from } = await wait(myId)
    message = text
    fromPeerId = from
  } catch (e) {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })
    await waitForMessage(myId)
    return
  }

  let msg = null
  if (message[0] === '{') {
    msg = JSON.parse(message)
  } else if (message[0] === '<') {
    return
  } else {
    const peers = parsePeers(message).filter(p => p.id !== myId)

    msg = { peers }
    dispatchEvent('peersupdated', { peers })
  }

  dispatchEvent('messagefrompeer', { message: msg, from: fromPeerId })
  await waitForMessage(myId)
}

export const addEventListener = (name, handler) => eventListeners[name] && eventListeners[name].push(handler)
export const removeEventListener = (name, handler) => eventListeners[name] && (eventListeners[name] = eventListeners[name].filter(x => x !== handler))
