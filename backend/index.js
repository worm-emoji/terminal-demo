const express = require('express')
const http = require('request-promise-native')
const cors = require('cors')
const api_key = process.env.API_KEY
const stripe = require('stripe')(api_key)

const app = express()
const port = 3001

const getToken = () =>
  http({
    url: 'https://api.stripe.com/v1/terminal/connection_tokens',
    method: 'POST',
    auth: {
      user: api_key,
    },
  })

app.use(cors())

app.get('/', async (req, res) => {
  const token = await getToken()
  res.type('json')
  res.send(token)
})

app.get('/new_pi', async (req, res) => {
  const pi = await stripe.paymentIntents.create({
    amount: 100,
    currency: 'usd',
    allowed_source_types: ['card_present'],
    capture_method: 'manual',
  })
  res.json({ secret: pi.client_secret })
})

app.get('/capture_pi/:pi', async (req, res) => {
  const pi = req.params.pi
  const pi_res = await stripe.paymentIntents.capture(pi, { amount: 100 })
  res.json(pi_res)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
