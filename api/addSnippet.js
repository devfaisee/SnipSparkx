const SnippetStore = require('./_lib/store');
const verifyAuth = require('./_lib/auth');

// API endpoint to create new snippets
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405; res.setHeader('Allow', 'POST'); return res.json({ error: 'Method not allowed. This endpoint only accepts POST requests' });
  }

  try {
    // Need these headers for local development
    if(!verifyAuth(req)) {
      res.statusCode = 401; return res.json({ error: 'Unauthorized' });
    }

    const { title, description = '', code, html = '' } = req.body || {};

    // Check that we have the required fields
    if(!title || !code){ res.statusCode = 400; return res.json({ error: 'Missing required fields' }); }

    // Clean up the HTML to remove dangerous stuff
    const cleanHtml = SnippetStore.cleanHtml(html);

    const store = new SnippetStore(process.cwd());
    const snippet = await store.add({ title, description, code, html: cleanHtml });

    res.statusCode = 201;
    return res.json(snippet);
  } catch (err) {
    console.error('addSnippet error', err);
    res.statusCode = 500;
    return res.json({ error: String(err.message || err) });
  }
};
