// Cloudflare Pages Function: /api/auth
// Initiates the GitHub OAuth flow for Decap CMS.
//
// Decap CMS opens this in a popup with ?provider=github&scope=repo
// We redirect the popup to GitHub's authorize URL; GitHub then sends
// the user back to /api/callback with a temporary code.
//
// Env vars required (set in Cloudflare Pages → Settings → Environment variables):
//   GITHUB_CLIENT_ID       (public, from your GitHub OAuth App)

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider') || 'github';
  const scope = url.searchParams.get('scope') || 'repo';

  if (provider !== 'github') {
    return new Response('Unsupported OAuth provider', { status: 400 });
  }

  if (!env.GITHUB_CLIENT_ID) {
    return new Response(
      'Missing GITHUB_CLIENT_ID environment variable on the Cloudflare project. ' +
        'Set it in Pages → Settings → Environment variables.',
      { status: 500 }
    );
  }

  const redirectUri = `${url.origin}/api/callback`;
  const state = crypto.randomUUID();

  const githubAuthorize = new URL('https://github.com/login/oauth/authorize');
  githubAuthorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  githubAuthorize.searchParams.set('redirect_uri', redirectUri);
  githubAuthorize.searchParams.set('scope', scope);
  githubAuthorize.searchParams.set('state', state);

  return Response.redirect(githubAuthorize.toString(), 302);
};
