# Server setup: mood.fm + cms.watar.fm + remove mobile

Do these on the server (SSH as root: `ssh root@72.60.132.57`). Replace `PROJECT_PATH` with `/var/www/SeagullsFM` if different.

---

## 1. Remove the mobile app from the server

The mobile app (Mood_Mobile) is not served by the server; it’s built and distributed via app stores. You can delete it to save space.

```bash
# If mobile is inside the main project:
cd /var/www/SeagullsFM
rm -rf Mood_Mobile

# If you cloned it in a separate directory (e.g. /var/www/Mood_Mobile):
# rm -rf /var/www/Mood_Mobile
```

---

## 2. DNS (do this first)

At the place where you manage **mood.fm** and **watar.fm**:

| Type  | Name | Value       | TTL |
|-------|------|-------------|-----|
| A     | @    | 72.60.132.57 | 300 |
| A     | www  | 72.60.132.57 | 300 |
| A     | cms  | 72.60.132.57 | 300 |

- **mood.fm**: A record for `@` (and optionally `www`) → `72.60.132.57`
- **cms.watar.fm**: A record for `cms` on domain **watar.fm** → `72.60.132.57`

Wait until DNS propagates (e.g. 5–30 min). Check:

```bash
# From your laptop:
dig mood.fm +short
dig cms.watar.fm +short
# Both should return 72.60.132.57
```

---

## 3. Nginx: mood.fm (website) + cms.watar.fm (CMS)

On the server, create one config that:

- Serves **mood.fm** (and www) with the main site and API.
- Serves **cms.watar.fm** with the CMS only (same build as before, different host).

### 3.1 Create the config file

```bash
nano /etc/nginx/sites-available/seagullsfm
```

Paste the content below. Replace `PROJECT_PATH` with your actual path (e.g. `/var/www/SeagullsFM`). Then save (Ctrl+O, Enter, Ctrl+X).

```nginx
# mood.fm – main website + API
server {
    listen 80;
    listen [::]:80;
    server_name mood.fm www.mood.fm;

    root PROJECT_PATH/moodfm-web/build;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# cms.watar.fm – CMS only
server {
    listen 80;
    listen [::]:80;
    server_name cms.watar.fm;

    root PROJECT_PATH/cms/build;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optional: if CMS calls /api, proxy to backend (use mood.fm API)
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Replace every `PROJECT_PATH` with `/var/www/SeagullsFM` (or your path):

```bash
sed -i 's|PROJECT_PATH|/var/www/SeagullsFM|g' /etc/nginx/sites-available/seagullsfm
```

### 3.2 Enable and test

```bash
ln -sf /etc/nginx/sites-available/seagullsfm /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 3.3 HTTPS with Let’s Encrypt

```bash
apt update
apt install certbot python3-certbot-nginx -y
certbot --nginx -d mood.fm -d www.mood.fm -d cms.watar.fm
```

Follow the prompts (email, agree to terms). Certbot will adjust the config and reload Nginx. After that:

- **https://mood.fm/** → main website  
- **https://cms.watar.fm/** → CMS

---

## 4. CMS app: API base URL

If the CMS frontend calls your API, it must use the main domain (e.g. `https://mood.fm/api`), not `cms.watar.fm/api`. If you have an env or config in the **cms** project for `API_URL` or `REACT_APP_API`, set it to `https://mood.fm` (or `https://mood.fm/api` depending on how it’s used), then rebuild the CMS and redeploy so the build on the server uses that URL.

---

## 5. Optional: keep /cms on mood.fm

If you also want **https://mood.fm/cms** to open the CMS (in addition to cms.watar.fm), add this inside the first `server { ... }` block for mood.fm (before the closing `}`):

```nginx
    location = /cms {
        return 302 /cms/;
    }
    location /cms/static/ {
        alias PROJECT_PATH/cms/build/static/;
    }
    location /cms/ {
        alias PROJECT_PATH/cms/build/;
        try_files $uri $uri/ /cms/index.html;
    }
```

Then run `sed` again to replace `PROJECT_PATH` and `nginx -t && systemctl reload nginx`.

---

## Summary

| URL                  | Serves        |
|----------------------|---------------|
| https://mood.fm/     | Main website  |
| https://mood.fm/api  | Backend API   |
| https://cms.watar.fm/ | CMS only   |

Mobile app removed from server; DNS and Nginx point mood.fm and cms.watar.fm to this server; HTTPS via Certbot.