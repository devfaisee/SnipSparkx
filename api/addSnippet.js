const SnippetStore = require('./_lib/store');
const verifyAuth = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405; res.setHeader('Allow', 'POST'); return res.json({ error: 'Method not allowed' });
  }

  try {
    // Auth Check
    if(!verifyAuth(req)) {
      res.statusCode = 401; return res.json({ error: 'Unauthorized' });
    }

    const { title, description = '', code, html = '' } = req.body || {};

    // Validation
    if(!title || !code){ res.statusCode = 400; return res.json({ error: 'Missing required fields' }); }

    // Smart Sanitization
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
