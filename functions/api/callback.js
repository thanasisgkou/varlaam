// Cloudflare Pages Function: /api/callback
// Handles GitHub's OAuth redirect back to us. Exchanges the temporary
// code for an access token, then posts the token to the Decap CMS
// popup opener via window.postMessage and closes the popup.
//
// Env vars required:
//   GITHUB_CLIENT_ID       (public)
//   GITHUB_CLIENT_SECRET   (sensitive — set as a Secret in Cloudflare)

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    return renderResult({
      kind: 'error',
      message: url.searchParams.get('error_description') || errorParam,
    });
  }

  if (!code) {
    return renderResult({
      kind: 'error',
      message: 'Missing authorization code from GitHub.',
    });
  }

  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return renderResult({
      kind: 'error',
      message:
        'Server is missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET. ' +
        'Set them in the Cloudflare project Settings → Environment variables.',
    });
  }

  // Exchange the code for an access token.
  let tokenJson;
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Varlaam-Decap-OAuth-Proxy',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    tokenJson = await tokenRes.json();
  } catch (err) {
    return renderResult({
      kind: 'error',
      message: `Network error talking to GitHub: ${err.message}`,
    });
  }

  if (tokenJson.error) {
    return renderResult({
      kind: 'error',
      message: `${tokenJson.error}: ${tokenJson.error_description || ''}`,
    });
  }

  if (!tokenJson.access_token) {
    return renderResult({
      kind: 'error',
      message: 'GitHub did not return an access_token.',
    });
  }

  return renderResult({
    kind: 'success',
    token: tokenJson.access_token,
  });
};

// Decap CMS listens for window.postMessage events from the popup and
// expects them in this exact format. The first "authorizing:github"
// message is a handshake; the success/error message carries the token.
function renderResult({ kind, token, message }) {
  const payload =
    kind === 'success'
      ? { token, provider: 'github' }
      : { message: message || 'Unknown error' };

  const messageString =
    kind === 'success'
      ? `authorization:github:success:${JSON.stringify(payload)}`
      : `authorization:github:error:${JSON.stringify(payload)}`;

  // We don't know the opener's origin until the handshake — '*' is the
  // standard pattern recommended in Decap's own oauth-provider examples
  // for popup-flow auth. The opener verifies the message format.
  const html = `<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="utf-8" />
<title>Σύνδεση Decap CMS</title>
<style>
  body{margin:0;display:grid;place-items:center;min-height:100vh;
    background:#FAF7F0;color:#2C2C2C;
    font-family:system-ui,-apple-system,sans-serif;}
  .box{padding:24px 28px;text-align:center;max-width:420px;}
  h1{font-family:Georgia,serif;font-style:italic;font-weight:600;
    font-size:20px;margin:0 0 8px;color:#7A2E1F;}
  p{font-size:14px;color:#6F6450;margin:0;}
</style>
</head>
<body>
<div class="box">
  <h1>${kind === 'success' ? 'Συνδέθηκες ✓' : 'Σφάλμα'}</h1>
  <p>${
    kind === 'success'
      ? 'Επιστρέφεις στο /admin/...'
      : 'Δες την κονσόλα για λεπτομέρειες.'
  }</p>
</div>
<script>
  (function () {
    var msg = ${JSON.stringify(messageString)};
    function send(targetOrigin) {
      window.opener && window.opener.postMessage(msg, targetOrigin);
    }
    function receiveMessage(e) {
      // Decap sends "authorizing:github" — reply with our result to its origin.
      if (typeof e.data === 'string' && e.data.indexOf('authorizing:') === 0) {
        send(e.origin);
      }
    }
    window.addEventListener('message', receiveMessage, false);
    // Initial handshake — Decap is waiting for this.
    if (window.opener) {
      window.opener.postMessage('authorizing:github', '*');
    }
    // Auto-close on success after a moment.
    if (${kind === 'success' ? 'true' : 'false'}) {
      setTimeout(function () {
        try { window.close(); } catch (_) {}
      }, 600);
    }
  })();
</script>
</body>
</html>`;

  return new Response(html, {
    status: kind === 'success' ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
