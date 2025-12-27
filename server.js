import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000

// POST /api/send
// body: { to, subject, html }
// Uses RESEND_API_KEY and SENDER_EMAIL from environment variables
app.post('/api/send', async (req, res) => {
  const { to, subject, html } = req.body
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.SENDER_EMAIL

  // Simple config checks
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured in environment' })
  }
  if (!from) {
    return res.status(500).json({ error: 'SENDER_EMAIL not configured in environment' })
  }
  if (!to) {
    return res.status(400).json({ error: 'Missing recipient `to` in request body' })
  }

  // Server-side email format validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!isValidEmail(to)) {
    return res.status(400).json({ error: 'Invalid recipient email format' })
  }

  const payload = {
    from,
    to,
    subject: subject || 'Test email from Resend',
    html: html || '<p>Test message from Resend + Vite app</p>'
  }

  // Mock mode: quick success response without calling external API
  // Usage: add query param `?mock=true` or header `x-mock: true` for local testing
  const isMock = req.query.mock === 'true' || req.headers['x-mock'] === 'true' || process.env.DISABLE_EXTERNAL_CALLS === 'true'
  if (isMock) {
    return res.json({ success: true, data: { mocked: true, payload } })
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    const data = await r.json()
    if (!r.ok) {
      return res.status(r.status).json({ error: data })
    }

    return res.json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() })
})

app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`))
