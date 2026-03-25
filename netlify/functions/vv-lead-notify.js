exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  let lead;
  try { lead = JSON.parse(event.body); } 
  catch { return { statusCode: 400, body: 'Invalid JSON' }; }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#05000F;color:#fff;padding:32px;border-radius:12px">
      <h2 style="color:#9B30FF;margin-bottom:4px">New VividVerse TV Submission</h2>
      <p style="color:rgba(255,255,255,0.5);font-size:13px;margin-bottom:24px">Submitted via vividversetv.com</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${Object.entries(lead).filter(([k])=>k!=='source').map(([k,v])=>`
          <tr>
            <td style="padding:8px 12px;color:rgba(255,255,255,0.5);text-transform:capitalize;border-bottom:1px solid rgba(255,255,255,0.06);width:140px">${k.replace(/_/g,' ')}</td>
            <td style="padding:8px 12px;color:#fff;border-bottom:1px solid rgba(255,255,255,0.06)">${v||'—'}</td>
          </tr>`).join('')}
      </table>
      <p style="margin-top:24px;font-size:12px;color:rgba(255,255,255,0.3)">Managed by New Urban Influence · newurbaninfluence.com</p>
    </div>`;

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.VV_SMTP_HOST || 'smtpout.secureserver.net',
      port: Number(process.env.VV_SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.VV_SMTP_USER,
        pass: process.env.VV_SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"VividVerse TV" <${process.env.VV_SMTP_USER}>`,
      to: 'upload@vividversetv.com',
      subject: `New Submission: ${lead.full_name || lead.email || 'VividVerse TV'}`,
      html
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Email error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
