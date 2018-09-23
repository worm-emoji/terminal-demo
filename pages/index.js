import React from 'react'
import { get } from 'axios'
import Head from '../components/head'
import Nav from '../components/nav'

class Home extends React.Component {
  async componentDidMount() {
    window.fetchToken = async () => {
      const res = await get('http://localhost:3001')
      return res.data.secret
    }
    window.terminal = await window.StripeTerminal.create({
      onFetchConnectionToken: fetchToken,
    })

    const connectReader = discoverResult => {
      // Just select the first reader here.
      var selectedReader = discoverResult.discoveredReaders[0]
      window.terminal
        .connectReader(selectedReader)
        .then(function(connectResult) {
          if (connectResult.error) {
            console.log('Failed to connect: ', connectResult.error)
          } else {
            console.log(
              'Connected to reader: ',
              connectResult.connection.reader.label
            )
          }
        })
    }

    const discoverResult = await window.terminal.discoverReaders()
    if (discoverResult.error) {
      console.log('Failed to discover: ', discoverResult.error)
    } else if (discoverResult.discoveredReaders.length === 0) {
      console.log('No available readers.')
    } else {
      // You should show the list of discoveredReaders to the
      // cashier here and let them select which to connect to (see below).
      connectReader(discoverResult)
    }
  }

  order = async () => {
    const res = await get('http://localhost:3001/new_pi')
    const piSecret = res.data.secret
    const result = await window.terminal.collectPaymentMethod(piSecret)

    const confirmResult = await window.terminal.confirmPaymentIntent(
      result.paymentIntent
    )
    if (confirmResult.error) {
      alert('Confirm failed: ' + confirmResult.error.message)
    } else if (confirmResult.paymentIntent) {
      await get('http://localhost:3001/capture_pi/' + result.paymentIntent.id)
      alert('Success!')
    }
  }

  render() {
    return (
      <div>
        <Head title="Home" />
        <Nav />

        <div className="hero">
          <h1 className="title">Welcome to the ylukem store.</h1>

          <div className="row">
            <a onClick={this.order} className="card">
              <h3>Give ylukem $1 &rarr;</h3>
              <p>It's like charity, but I get the money.</p>
            </a>
          </div>
        </div>

        <style jsx>{`
          .hero {
            width: 100%;
            color: #333;
          }
          .row:hover {
            cursor: pointer;
          }
          .title {
            margin: 0;
            width: 100%;
            padding-top: 80px;
            line-height: 1.15;
            font-size: 48px;
          }
          .title,
          .description {
            text-align: center;
          }
          .row {
            max-width: 880px;
            margin: 80px auto 40px;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
          }
          .card {
            padding: 18px 18px 24px;
            width: 220px;
            text-align: left;
            text-decoration: none;
            color: #434343;
            border: 1px solid #9b9b9b;
          }
          .card:hover {
            border-color: #067df7;
          }
          .card h3 {
            margin: 0;
            color: #067df7;
            font-size: 18px;
          }
          .card p {
            margin: 0;
            padding: 12px 0 0;
            font-size: 13px;
            color: #333;
          }
        `}</style>
      </div>
    )
  }
}

export default Home
