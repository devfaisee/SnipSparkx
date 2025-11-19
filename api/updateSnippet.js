const SnippetStore = require('./_lib/store');
const verifyAuth = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'PUT') {
    res.statusCode = 405; res.setHeader('Allow', 'PUT'); return res.json({ error: 'Method not allowed' });
  }

  try {
    if(!verifyAuth(req)) { res.statusCode = 401; return res.json({ error: 'Unauthorized' }); }

    const { id, title, description, code, html } = req.body || {};
    if(!id){ res.statusCode = 400; return res.json({ error: 'Missing id' }); }

    const cleanHtml = html !== undefined ? SnippetStore.cleanHtml(html) : undefined;

    const store = new SnippetStore(process.cwd());
    const updated = await store.update(id, { title, description, code, html: cleanHtml });

    return res.json(updated);
  } catch (err) {
    console.error('updateSnippet error', err);
    res.statusCode = 500;
    return res.json({ error: String(err.message || err) });
  }
};
