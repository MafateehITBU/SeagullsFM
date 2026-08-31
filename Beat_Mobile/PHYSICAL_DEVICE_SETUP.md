# Physical Device Setup Guide (Expo Go)

## Why data doesn't load on your phone

On a **physical device**, the app cannot use `localhost` — that points to the phone itself, not your computer. The app must call your **computer’s IP address** over Wi‑Fi.

## Checklist (do these in order)

### 1. Same Wi‑Fi

- Phone and computer must be on the **same Wi‑Fi network** (not mobile data, not a guest network).

### 2. Get your computer’s IP

**macOS:**
```bash
ipconfig getifaddr en0
```
Or: System Settings → Network → Wi‑Fi → Details → IP Address.

**Windows:** Run `ipconfig` and use the IPv4 address under your Wi‑Fi adapter.

Example: `192.168.1.26` or `10.0.0.5`.

### 3. Set the IP in the app

1. Open **`Mood_mobile/src/config/api.js`**.
2. Set `COMPUTER_IP` to your computer’s IP (from step 2):

```javascript
const COMPUTER_IP = '192.168.1.26'; // ← your IP here
```

3. Save the file.

### 4. Backend port

The backend runs on **port 5001**. The app is configured for port 5001 in `src/config/api.js`. If your backend uses a different port, change `API_PORT` there.

### 5. Start backend and allow network access

- Start the backend (e.g. from the `backend` folder).
- It must be reachable from other devices. If it only listens on `127.0.0.1`, change it to listen on `0.0.0.0` (all interfaces).

### 6. Restart Expo and reload the app

```bash
npx expo start --clear
```

Then reload the app on your phone (shake device → Reload, or press `r` in the Expo terminal).

### 7. Check the URL in the console

In the Metro/Expo terminal you should see something like:

`[API] Using baseURL: http://192.168.1.26:5001/api`

If the IP or port is wrong, fix it in `api.js` and reload again.

---

## Quick test from the phone

On your **phone’s browser**, open:

`http://YOUR_IP:5001/api/program`

(Replace `YOUR_IP` with your computer’s IP.)

- If you see JSON data → backend is reachable; the app should be able to fetch too.
- If it fails → check firewall (allow port 5001), Wi‑Fi, and that the backend is running and listening on `0.0.0.0`.
