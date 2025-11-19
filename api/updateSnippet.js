const SnippetStore = require('./_lib/store');
const verifyAuth = require('./_lib/auth');

module.exports = async (req, res) => {
  console.log('\n[UPDATE SNIPPET] Request received');
  console.log('[UPDATE SNIPPET] Method:', req.method);
  
  if (req.method !== 'PUT') {
    console.log('[UPDATE SNIPPET] ❌ Method not allowed:', req.method);
    res.statusCode = 405; res.setHeader('Allow', 'PUT'); return res.json({ error: 'Method not allowed' });
  }

  try {
    console.log('[UPDATE SNIPPET] Verifying authentication...');
    if(!verifyAuth(req)) { 
      console.log('[UPDATE SNIPPET] ❌ Authentication failed');
      res.statusCode = 401; return res.json({ error: 'Unauthorized' }); 
    }
    console.log('[UPDATE SNIPPET] ✓ Authentication successful');

    const { id, title, description, code, html } = req.body || {};
    console.log('[UPDATE SNIPPET] Payload received:', { id, title, descriptionLength: description?.length || 0, codeLength: code?.length || 0, htmlLength: html?.length || 0 });
    
    if(!id){ 
      console.log('[UPDATE SNIPPET] ❌ Missing snippet ID');
      res.statusCode = 400; return res.json({ error: 'Missing id' }); 
    }

    console.log('[UPDATE SNIPPET] Sanitizing HTML input...');
    const cleanHtml = html !== undefined ? SnippetStore.cleanHtml(html) : undefined;
    console.log('[UPDATE SNIPPET] ✓ HTML sanitized');

    const store = new SnippetStore(process.cwd());
    console.log('[UPDATE SNIPPET] Updating snippet ID:', id);
    const updated = await store.update(id, { title, description, code, html: cleanHtml });
    console.log('[UPDATE SNIPPET] ✓ Snippet updated successfully');

    console.log('[UPDATE SNIPPET] → Response sent: 200 OK');
    return res.json(updated);
  } catch (err) {
    console.error('[UPDATE SNIPPET] ❌ Error:', err.message || err);
    res.statusCode = 500;
    console.log('[UPDATE SNIPPET] → Response sent: 500 Error');
    return res.json({ error: String(err.message || err) });
  }
};
