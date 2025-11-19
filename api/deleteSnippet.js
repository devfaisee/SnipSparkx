const SnippetStore = require('./_lib/store');
const verifyAuth = require('./_lib/auth');

module.exports = async (req, res) => {
  console.log('\n[DELETE SNIPPET] Request received');
  console.log('[DELETE SNIPPET] Method:', req.method);
  
  if (req.method !== 'DELETE') {
    console.log('[DELETE SNIPPET] ❌ Method not allowed:', req.method);
    res.statusCode = 405; res.setHeader('Allow', 'DELETE'); return res.json({ error: 'Method not allowed' });
  }

  try {
    console.log('[DELETE SNIPPET] Verifying authentication...');
    if(!verifyAuth(req)) { 
      console.log('[DELETE SNIPPET] ❌ Authentication failed');
      res.statusCode = 401; return res.json({ error: 'Unauthorized' }); 
    }
    console.log('[DELETE SNIPPET] ✓ Authentication successful');

    const { id } = req.query; // pass ID via query param ?id=...
    console.log('[DELETE SNIPPET] Snippet ID from query:', id);
    
    if(!id){ 
      console.log('[DELETE SNIPPET] ❌ Missing snippet ID');
      res.statusCode = 400; return res.json({ error: 'Missing id' }); 
    }

    const store = new SnippetStore(process.cwd());
    console.log('[DELETE SNIPPET] Deleting snippet ID:', id);
    await store.delete(id);
    console.log('[DELETE SNIPPET] ✓ Snippet deleted successfully');

    console.log('[DELETE SNIPPET] → Response sent: 200 OK');
    return res.json({ success: true });
  } catch (err) {
    console.error('[DELETE SNIPPET] ❌ Error:', err.message || err);
    res.statusCode = 500;
    console.log('[DELETE SNIPPET] → Response sent: 500 Error');
    return res.json({ error: String(err.message || err) });
  }
};
