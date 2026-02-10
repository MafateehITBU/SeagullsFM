# Deploy (no domain → add domain later)

Deploy **backend**, **cms**, and **moodfm-web** so they work by IP. You can add a domain later with one Nginx change.

---

## 1. Deploy without domain

Everything works over the server IP (e.g. `http://72.60.132.57`). No domain required.

### One-time server setup

1. **Clone and install**
   - Clone repo: `git clone https://github.com/MafateehITBU/SeagullsFM.git SeagullsFM` in `/var/www`, then `cd /var/www/SeagullsFM`.
   - Install Node 20, PM2, Nginx (see step-by-step in chat if needed).

2. **Backend (PM2)**  
   From repo root on the server:
   ```bash
   cd /var/www/SeagullsFM/backend
   npm install
   PORT=5000 pm2 start src/server.js --name backend
   pm2 save
   pm2 startup
   ```
   (Run the command `pm2 startup` prints.)

3. **Build web and CMS**
   ```bash
   cd /var/www/SeagullsFM/moodfm-web
   npm install && npm run build
   cd /var/www/SeagullsFM/cms
   npm install && npm run build
   ```

4. **Nginx**
   - Copy the included config and set your project path:
     ```bash
     sed 's|PROJECT_PATH|/var/www/SeagullsFM|g' /var/www/SeagullsFM/deploy/nginx-seagullsfm.conf > /etc/nginx/sites-available/seagullsfm
     ```
   - Enable it and reload:
     ```bash
     ln -sf /etc/nginx/sites-available/seagullsfm /etc/nginx/sites-enabled/
     rm -f /etc/nginx/sites-enabled/default
     nginx -t && systemctl reload nginx
     ```

5. **Deploy script (for auto-deploy)**
   ```bash
   chmod +x /var/www/SeagullsFM/scripts/deploy.sh
   ```

### What you get (no domain)

- **Website:** `http://YOUR_SERVER_IP/` (moodfm-web)
- **CMS:** `http://YOUR_SERVER_IP/cms/` (admin panel)
- **API:** `http://YOUR_SERVER_IP/api/...` (proxied to backend on port 5000)

---

## 2. Adding a domain later

When you have a domain (e.g. `moodfm.com`):

1. Point the domain’s DNS A record to your server IP.
2. Edit the Nginx config:
   ```bash
   nano /etc/nginx/sites-available/seagullsfm
   ```
3. Change the line:
   ```nginx
   server_name _;
   ```
   to (example):
   ```nginx
   server_name moodfm.com www.moodfm.com;
   ```
4. Reload Nginx:
   ```bash
   nginx -t && systemctl reload nginx
   ```
5. (Optional) Add HTTPS with Certbot:
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d moodfm.com -d www.moodfm.com
   ```

No code or build changes needed; only Nginx and DNS.

---

## 3. Auto-deploy from GitHub

When you push to `main` (or `master`), GitHub Actions runs `scripts/deploy.sh` on the server (pull, build web + cms, restart backend).

### GitHub secrets (Settings → Secrets and variables → Actions)

| Secret            | Value                    |
|-------------------|--------------------------|
| `SERVER_HOST`     | Server IP (e.g. `72.60.132.57`) |
| `SERVER_USER`     | `root` (or your SSH user) |
| `SSH_PRIVATE_KEY` | Full private key for SSH  |
| `PROJECT_PATH`    | `/var/www/SeagullsFM`    |

### Manual deploy

SSH in and run from the repo root:
```bash
./scripts/deploy.sh
```

---

## Summary

- **No domain:** Use `deploy/nginx-seagullsfm.conf` with `PROJECT_PATH` replaced by `/var/www/SeagullsFM`. Backend on port 5000, web at `/`, CMS at `/cms/`, API at `/api`.
- **With domain later:** Set `server_name yourdomain.com www.yourdomain.com` in the same Nginx config and reload; optionally add SSL with Certbot.
