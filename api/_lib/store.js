const fs = require('fs');
const path = require('path');

// This class handles all the snippet storage stuff
// I made it work with both local JSON files and GitHub as backup
class SnippetStore {
  constructor(rootDir){
    this.filePath = path.join(rootDir, 'public', 'snippets.json');
    this.githubToken = process.env.GITHUB_TOKEN || null;
    this.githubRepo = process.env.GITHUB_REPO || null; // expected format: owner/repo
    this.branch = process.env.GITHUB_BRANCH || 'main';
  }

  // This method cleans up HTML that users submit
  // Had to learn about security stuff the hard way!
  static cleanHtml(html) {
    if (!html) return '';
    let clean = html.toString();
    // First, try to get just the body content if someone pasted a full HTML page
    if (/<!doctype|html|body/i.test(clean)) {
       // Try to extract content inside <body>...</body>
       const bodyMatch = clean.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
       if (bodyMatch && bodyMatch[1]) {
         clean = bodyMatch[1];
       } else {
         // Fallback: strip known wrappers
         clean = clean.replace(/<!doctype[^>]*>/gi, '')
                      .replace(/<html[^>]*>/gi, '')
                      .replace(/<\/html>/gi, '')
                      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
                      .replace(/<body[^>]*>/gi, '')
                      .replace(/<\/body>/gi, '');
       }
    }

    // Now remove anything dangerous
    // No script tags allowed!
    clean = clean.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    // Also remove onclick and other event handlers
    clean = clean.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    
    return clean.trim();
  }

  // Try to load snippets from local file first
  async read(){
    try{
      if(fs.existsSync(this.filePath)){
        const raw = fs.readFileSync(this.filePath, 'utf8') || '[]';
        return JSON.parse(raw);
      }
    }catch(e){}

    // If local file doesn't exist, try GitHub as backup
    if(this.githubToken && this.githubRepo){
      try{
        const [owner, repo] = this.githubRepo.split('/');
        const apiBase = 'https://api.github.com';
        const getUrl = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(path.relative(process.cwd(), this.filePath))}?ref=${this.branch}`;
        const headers = { 'Authorization': `Bearer ${this.githubToken}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'SnipSparkx-Server' };
        const res = await fetch(getUrl, { headers });
        if(res.ok){
          const payload = await res.json();
          if(payload && payload.content){
            const buf = Buffer.from(payload.content, 'base64').toString('utf8');
            return JSON.parse(buf || '[]');
          }
        }
      }catch(e){}
    }
    return [];
  }

  // Save data to local JSON file
  write(data){
    try{
      const dir = path.dirname(this.filePath);
      if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    }catch(err){
      // If that fails, try writing to temp directory as backup
      try{
        const tmp = path.join(require('os').tmpdir(), 'snippets.json');
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
        console.warn('Wrote snippets to tmp fallback:', tmp);
        return true;
      }catch(err2){
        console.error('Failed to write snippets locally', err2);
        throw err;
      }
    }
  }

  // Save data locally and optionally to GitHub
  async _save(data, message){
     // Try to sync with GitHub if configured
     if(this.githubToken && this.githubRepo){
       try{
         await this._commitToGitHub(data, message);
       }catch(err){
         console.error('GitHub commit failed:', err);
       }
     }
     // Always save locally too
     this.write(data);
  }

  // Add a new snippet
  async add({title, description = '', code, html = ''}){
    const data = await this.read();
    const id = Date.now().toString(); // Simple ID using timestamp
    const snippet = { id, title, description, code, html };
    data.push(snippet);
    await this._save(data, `feat: add snippet "${title}"`);
    return snippet;
  }

  // Update an existing snippet
  async update(id, {title, description, code, html}){
    const data = await this.read();
    const idx = data.findIndex(s => s.id === id);
    if(idx === -1) throw new Error('Snippet not found');
    
    const old = data[idx];
    const updated = { 
        ...old, 
        title: title || old.title,
        description: description !== undefined ? description : old.description,
        code: code || old.code,
        html: html !== undefined ? html : old.html
    };
    
    data[idx] = updated;
    await this._save(data, `fix: update snippet "${updated.title}"`);
    return updated;
  }

  // Delete a snippet
  async delete(id){
    let data = await this.read();
    const exists = data.find(s => s.id === id);
    if(!exists) throw new Error('Snippet not found');
    
    data = data.filter(s => s.id !== id);
    await this._save(data, `chore: delete snippet "${exists.title}"`);
    return true;
  }

  // This was fun to figure out - commits directly to GitHub!
  async _commitToGitHub(data, message){
    const [owner, repo] = this.githubRepo.split('/');
    const apiBase = 'https://api.github.com';
    const filePath = 'public/snippets.json';
    const getUrl = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${this.branch}`;
    const headers = {
      'Authorization': `Bearer ${this.githubToken}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'SnipSparkx-Server'
    };

    let sha = null;
    const getRes = await fetch(getUrl, { headers });
    if(getRes.status === 200){
      const payload = await getRes.json();
      sha = payload.sha;
    }

    const contentBase64 = Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64');
    const putUrl = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`;
    const body = { message: message || 'update snippets', content: contentBase64, branch: this.branch };
    if(sha) body.sha = sha;

    const putRes = await fetch(putUrl, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if(!putRes.ok) throw new Error(`GitHub upload failed: ${putRes.status}`);
    return true;
  }
}

module.exports = SnippetStore;
