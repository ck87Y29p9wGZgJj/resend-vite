import './style.css'

const app = document.getElementById('app')

app.innerHTML = `
  <main class="container">
    <header>
      <div class="logo">R</div>
      <div>
        <h1 class="title">Enviar correo con Resend</h1>
        <div class="subtitle">Servidor local + Vite — prueba rápida</div>
      </div>
    </header>

    <form id="sendForm">
      <label>Para (email)<br><input id="to" type="email" required placeholder="recipient@example.com"></label>
      <label>Asunto<br><input id="subject" type="text" placeholder="Asunto"></label>
      <label>Mensaje (HTML)<br><textarea id="html" rows="6">&lt;p>Hola desde Resend + Vite!</p></textarea></label>

      <div class="actions">
        <button type="submit">Enviar</button>
        <button id="mockSend" type="button">Enviar (mock)</button>
      </div>

      <div id="status" class="status" hidden></div>
    </form>

    <div class="footer">Asegúrate de configurar <code>RESEND_API_KEY</code> y <code>SENDER_EMAIL</code> en <code>.env</code></div>
  </main>
`

const form = document.getElementById('sendForm')
const status = document.getElementById('status')

const submitButton = form.querySelector('button[type="submit"]')
const mockButton = document.getElementById('mockSend')
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const showStatus = (htmlContent, kind = 'info') => {
  status.hidden = false
  if (kind === 'ok') status.innerHTML = `<div class="ok">${htmlContent}</div>`
  else if (kind === 'err') status.innerHTML = `<div class="err">${htmlContent}</div>`
  else status.innerHTML = htmlContent
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  status.textContent = ''

  const to = document.getElementById('to').value.trim()
  const subject = document.getElementById('subject').value
  const html = document.getElementById('html').value

  // Client-side validation
  if (!isValidEmail(to)) {
    showStatus(`Dirección de correo inválida: ${to}`, 'err')
    return
  }

  submitButton.disabled = true
  showStatus('Enviando...')

  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html })
    })

    const json = await res.json()
    if (!res.ok) {
      showStatus(`Error: ${JSON.stringify(json, null, 2)}`, 'err')
      return
    }

    showStatus(`Correo enviado. Respuesta: ${JSON.stringify(json, null, 2)}`, 'ok')
  } catch (err) {
    showStatus(err.message, 'err')
  } finally {
    submitButton.disabled = false
  }
})

// mock send button (no external call)
mockButton.addEventListener('click', async () => {
  const to = document.getElementById('to').value.trim()
  if (!isValidEmail(to)) {
    showStatus(`Dirección de correo inválida: ${to}`, 'err')
    return
  }

  showStatus('Enviando (mock)...')
  try {
    const res = await fetch('/api/send?mock=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-mock': 'true' },
      body: JSON.stringify({ to, subject: 'Mock', html: '<p>Mock</p>' })
    })
    const json = await res.json()
    if (!res.ok) showStatus(`Error: ${JSON.stringify(json, null, 2)}`, 'err')
    else showStatus(`Mock enviado. Respuesta: ${JSON.stringify(json, null, 2)}`, 'ok')
  } catch (err) {
    showStatus(err.message, 'err')
  }
})
