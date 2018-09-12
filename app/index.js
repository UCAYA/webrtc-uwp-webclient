import React from 'react'
import ReactDOM from 'react-dom'
import Home from './home'
let App = () => (<Home />)

ReactDOM.render(
  <App />,
  document.getElementById('root'),
  () => {
    // if (window.location.href.indexOf('/') > -1) {
    console.log('%cMade with love by UCAYA', 'font-size: 20px;')
    console.log('%c🤘😘', 'font-size: 60px')
    // }
  }
)
