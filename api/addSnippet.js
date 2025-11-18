const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.json({ error: 'Method not allowed' });
  }

  try {
    const { title, description = '', code } = req.body || {};
    if (!title || !code) {
      res.statusCode = 400;
      return res.json({ error: 'Missing required fields: title and code' });
    }

    const filePath = path.join(process.cwd(), 'public', 'snippets.json');
    let data = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(raw || '[]');
    }

    const id = Date.now().toString();
    const snippet = { id, title, description, code };
    data.push(snippet);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(snippet));
  } catch (err) {
    console.error('addSnippet error', err);
    res.statusCode = 500;
    return res.json({ error: String(err.message || err) });
  }
};
