const SnippetStore = require('./_lib/store');
const verifyAuth = require('./_lib/auth');

// API endpoint to create new snippets
module.exports = async (req, res) => {
  console.log('\n[ADD SNIPPET] Request received');
  console.log('[ADD SNIPPET] Method:', req.method);
  
  if (req.method !== 'POST') {
    console.log('[ADD SNIPPET] ❌ Method not allowed:', req.method);
    res.statusCode = 405; res.setHeader('Allow', 'POST'); return res.json({ error: 'Method not allowed. This endpoint only accepts POST requests' });
  }

  try {
    // Need these headers for local development
    console.log('[ADD SNIPPET] Verifying authentication...');
    if(!verifyAuth(req)) {
      console.log('[ADD SNIPPET] ❌ Authentication failed');
      res.statusCode = 401; return res.json({ error: 'Unauthorized' });
    }
    console.log('[ADD SNIPPET] ✓ Authentication successful');

    const { title, description = '', code, html = '' } = req.body || {};
    console.log('[ADD SNIPPET] Payload received:', { title, descriptionLength: description?.length || 0, codeLength: code?.length || 0, htmlLength: html?.length || 0 });

    // Check that we have the required fields
    if(!title || !code){ 
      console.log('[ADD SNIPPET] ❌ Missing required fields');
      res.statusCode = 400; return res.json({ error: 'Missing required fields' }); 
    }

    // Clean up the HTML to remove dangerous stuff
    console.log('[ADD SNIPPET] Sanitizing HTML input...');
    const cleanHtml = SnippetStore.cleanHtml(html);
    console.log('[ADD SNIPPET] ✓ HTML sanitized');

    const store = new SnippetStore(process.cwd());
    console.log('[ADD SNIPPET] Saving to SnippetStore...');
    const snippet = await store.add({ title, description, code, html: cleanHtml });
    console.log('[ADD SNIPPET] ✓ Snippet saved successfully. ID:', snippet.id);

    res.statusCode = 201;
    console.log('[ADD SNIPPET] → Response sent: 201 Created');
    return res.json(snippet);
  } catch (err) {
    console.error('[ADD SNIPPET] ❌ Error:', err.message || err);
    res.statusCode = 500;
    console.log('[ADD SNIPPET] → Response sent: 500 Error');
    return res.json({ error: String(err.message || err) });
  }
};
