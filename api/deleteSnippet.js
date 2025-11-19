const SnippetStore = require('./_lib/store');
const verifyAuth = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') {
    res.statusCode = 405; res.setHeader('Allow', 'DELETE'); return res.json({ error: 'Method not allowed' });
  }

  try {
    if(!verifyAuth(req)) { res.statusCode = 401; return res.json({ error: 'Unauthorized' }); }

    const { id } = req.query; // pass ID via query param ?id=...
    if(!id){ res.statusCode = 400; return res.json({ error: 'Missing id' }); }

    const store = new SnippetStore(process.cwd());
    await store.delete(id);

    return res.json({ success: true });
  } catch (err) {
    console.error('deleteSnippet error', err);
    res.statusCode = 500;
    return res.json({ error: String(err.message || err) });
  }
};
