onRecordAfterCreateSuccess((e) => {
  function encodeBase64(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let out = '',
      i = 0,
      len = str.length
    while (i < len) {
      const c1 = str.charCodeAt(i++) & 0xff
      if (i === len) {
        out += chars.charAt(c1 >> 2) + chars.charAt((c1 & 0x3) << 4) + '=='
        break
      }
      const c2 = str.charCodeAt(i++)
      if (i === len) {
        out +=
          chars.charAt(c1 >> 2) +
          chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4)) +
          chars.charAt((c2 & 0xf) << 2) +
          '='
        break
      }
      const c3 = str.charCodeAt(i++)
      out +=
        chars.charAt(c1 >> 2) +
        chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4)) +
        chars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6)) +
        chars.charAt(c3 & 0x3f)
    }
    return out
  }

  const record = e.record
  const usuarioId = record.get('usuario_id')

  let email = ''
  let nome = 'Paciente'
  let telefone = ''

  try {
    const user = $app.findRecordById('users', usuarioId)
    email = user.get('email')
    nome = user.get('name') || 'Paciente'
    telefone = user.get('telefone') || ''
  } catch (err) {
    $app.logger().warn('Usuário não encontrado para notificação', 'usuarioId', usuarioId)
  }

  const data = record.get('data_agendamento')
  const hora = record.get('hora_agendamento')
  const tipo = record.get('tipo_consulta')

  const dataFormatada = data.split(' ')[0] // simplistic format for SMS/Email

  // 1. Send SMS via Twilio API
  // PocketBase self-hosted: usar $os.getenv (NÃO $secrets, que não existe).
  const twilioSid = $os.getenv('TWILIO_ACCOUNT_SID')
  const twilioToken = $os.getenv('TWILIO_AUTH_TOKEN')
  const twilioFrom = $os.getenv('TWILIO_FROM_NUMBER')

  if (twilioSid && twilioToken && telefone) {
    try {
      const auth = 'Basic ' + encodeBase64(twilioSid + ':' + twilioToken)

      const payload = {
        To: telefone,
        From: twilioFrom || '+1234567890',
        Body: `Sua consulta foi agendada para ${dataFormatada} às ${hora}. Clínica Canever.`,
      }

      const bodyStr = Object.keys(payload)
        .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(payload[k]))
        .join('&')

      const res = $http.send({
        url: `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: auth,
        },
        body: bodyStr,
        timeout: 15,
      })
      $app.logger().info('SMS notification request sent', 'status', res.statusCode)
    } catch (err) {
      $app.logger().error('Twilio SMS notification failed', 'error', err.message)
    }
  } else {
    $app.logger().info('Twilio secrets or phone missing, skipping SMS')
  }

  // 2. Send Email via Compatible API (Resend)
  const resendKey = $os.getenv('RESEND_API_KEY')
  if (resendKey && email) {
    try {
      const htmlContent = `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Consulta Agendada - Clínica Canever</h2>
          <p>Olá, ${nome},</p>
          <p>Sua consulta foi agendada com sucesso.</p>
          <ul>
            <li><strong>Data:</strong> ${dataFormatada}</li>
            <li><strong>Hora:</strong> ${hora}</li>
            <li><strong>Tipo:</strong> ${tipo}</li>
          </ul>
          <p>Instruções:</p>
          <ul>
            <li>Chegue 10 minutos antes.</li>
            <li>Dúvidas? Contate o suporte.</li>
          </ul>
          <p>Obrigado!</p>
        </div>
      `
      const res = $http.send({
        url: 'https://api.resend.com/emails',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + resendKey,
        },
        body: JSON.stringify({
          from: $os.getenv('RESEND_FROM') || 'Clínica Canever <no-reply@clinicacanever.com.br>',
          to: [email],
          subject: 'Consulta Agendada - Clínica Canever',
          html: htmlContent,
        }),
        timeout: 15,
      })
      $app.logger().info('Email notification request sent', 'status', res.statusCode)
    } catch (err) {
      $app.logger().error('Email notification failed', 'error', err.message)
    }
  } else {
    $app.logger().info('Resend API key or email missing, skipping Email')
  }

  return e.next()
}, 'agendamentos')
