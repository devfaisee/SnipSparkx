const fs = require('fs');
const path = require('path');

class SnippetStore {
  constructor(rootDir){
    this.filePath = path.join(rootDir, 'public', 'snippets.json');
  }

  read(){
    if(!fs.existsSync(this.filePath)) return [];
    const raw = fs.readFileSync(this.filePath, 'utf8') || '[]';
    try{ return JSON.parse(raw); }catch(e){ return []; }
  }

  write(data){
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  add({title, description = '', code}){
    const data = this.read();
    const id = Date.now().toString();
    const snippet = { id, title, description, code };
    data.push(snippet);
    this.write(data);
    return snippet;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body || {};
    const { title, description = '', code } = payload;
    if (!title || !code) {
      res.statusCode = 400;
      return res.json({ error: 'Missing required fields: title and code' });
    }

    const store = new SnippetStore(process.cwd());
    const snippet = store.add({ title, description, code });

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(snippet));
  } catch (err) {
    console.error('addSnippet error', err);
    res.statusCode = 500;
    return res.json({ error: String(err.message || err) });
  }
};
