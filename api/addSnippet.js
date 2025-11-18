const fs = require('fs');
const path = require('path');

/**
 * SnippetStore — file-backed storage with optional GitHub-backed persistence.
 * If environment variables `GITHUB_TOKEN` and `GITHUB_REPO` (owner/repo)
 * are set, the function will try to update `public/snippets.json` in the
 * repository using the GitHub Contents API. Otherwise it falls back to
 * writing the file on the local filesystem (works for local `vercel dev`).
 */
class SnippetStore {
  constructor(rootDir){
    this.filePath = path.join(rootDir, 'public', 'snippets.json');
    this.githubToken = process.env.GITHUB_TOKEN || null;
    this.githubRepo = process.env.GITHUB_REPO || null; // expected format: owner/repo
    this.branch = process.env.GITHUB_BRANCH || 'main';
  }

  async read(){
    // Try local file first
    try{
      if(fs.existsSync(this.filePath)){
        const raw = fs.readFileSync(this.filePath, 'utf8') || '[]';
        return JSON.parse(raw);
      }
    }catch(e){
      // ignore and try GitHub below
    }

    // If not present locally and GitHub configured, attempt to fetch from GitHub
    if(this.githubToken && this.githubRepo){
      try{
        const [owner, repo] = this.githubRepo.split('/');
        const apiBase = 'https://api.github.com';
        const getUrl = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(path.relative(process.cwd(), this.filePath))}?ref=${this.branch}`;
        const headers = { 'Authorization': `Bearer ${this.githubToken}`, 'Accept': 'application/vnd.github+json', 'User-Agent': 'SnipSparkx-Server' };
        // Use global fetch
        const res = await fetch(getUrl, { headers });
        if(res.ok){
          const payload = await res.json();
          if(payload && payload.content){
            const buf = Buffer.from(payload.content, 'base64').toString('utf8');
            return JSON.parse(buf || '[]');
          }
        }
      }catch(e){
        // ignore and return empty
      }
    }

    return [];
  }

  write(data){
    try{
      const dir = path.dirname(this.filePath);
      if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    }catch(err){
      // If writing to the project filesystem fails (read-only), fall back to /tmp
      try{
        const tmp = path.join(require('os').tmpdir(), 'snippets.json');
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
        console.warn('Wrote snippets to tmp fallback:', tmp);
        return true;
      }catch(err2){
        console.error('Failed to write snippets locally and to tmp fallback', err2);
        throw err; // rethrow original
      }
    }
  }

  async add({title, description = '', code, html = ''}){
    const data = await this.read();
    const id = Date.now().toString();
    const snippet = { id, title, description, code, html };
    data.push(snippet);

    // Attempt GitHub-backed commit if configured
    if(this.githubToken && this.githubRepo){
      try{
        await this._commitToGitHub(data);
        return snippet;
      }catch(err){
        console.error('GitHub commit failed, falling back to local write:', err.message || err);
      }
    }

    // Fallback: local write (useful for `vercel dev` and local testing)
    this.write(data);
    return snippet;
  }

  async _commitToGitHub(data){
    // Use the GitHub Contents API to update the file
    const [owner, repo] = this.githubRepo.split('/');
    if(!owner || !repo) throw new Error('GITHUB_REPO must be in owner/repo format');

    const apiBase = 'https://api.github.com';
    const filePath = 'public/snippets.json';
    const getUrl = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${this.branch}`;

    const headers = {
      'Authorization': `Bearer ${this.githubToken}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'SnipSparkx-Server'
    };

    // 1) GET existing file to obtain SHA (if exists)
    let sha = null;
    const getRes = await fetch(getUrl, { headers });
    if(getRes.status === 200){
      const payload = await getRes.json();
      sha = payload.sha;
    } else if (getRes.status !== 404){
      const txt = await getRes.text().catch(()=>null);
      throw new Error(`Failed to fetch existing content: ${getRes.status} ${txt}`);
    }

    // 2) Prepare new content
    const contentStr = JSON.stringify(data, null, 2);
    const contentBase64 = Buffer.from(contentStr, 'utf8').toString('base64');

    const putUrl = `${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`;
    const body = {
      message: 'chore: add CSS snippet via SnipSparkx',
      content: contentBase64,
      branch: this.branch
    };
    if(sha) body.sha = sha;

    const putRes = await fetch(putUrl, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if(!putRes.ok){
      const errText = await putRes.text().catch(()=>null);
      throw new Error(`GitHub upload failed: ${putRes.status} ${errText}`);
    }

    // Optionally update local file as well for consistency
    this.write(data);
    return true;
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
    const { title, description = '', code, html = '' } = payload;
    if (!title || !code) {
      res.statusCode = 400;
      return res.json({ error: 'Missing required fields: title and code' });
    }

    const store = new SnippetStore(process.cwd());
    const snippet = await store.add({ title, description, code, html });

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(snippet));
  } catch (err) {
    console.error('addSnippet error', err);
    res.statusCode = 500;
    return res.json({ error: String(err.message || err) });
  }
};
