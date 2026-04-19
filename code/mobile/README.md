# PWDSA Mobile (Expo Go)

React Native app that calls the FastAPI decision classifier. Designed to
run from **Expo Go** on your phone while the Python backend runs on your
PC — no emulator, no Flutter, no app-store upload needed.

## Layout

```
mobile/
  App.js
  index.js
  app.json
  src/
    i18n/           # EN + AR catalogs + React context
    services/       # config.js (API URL) + api.js (fetch wrapper)
    components/     # FormField, SegmentedSelect, Card
    screens/
      DashboardScreen.js
```

## How to run (phone + PC on the same network)

### 0. Prerequisites
- Node.js (already on this PC).
- The backend trained + runnable (see `../backend/README.md`).
- Expo Go installed on your phone (from Play Store / App Store).

### 1. Network — put phone and PC on the same LAN
Easiest: **enable Personal Hotspot on your phone, connect the PC to that
hotspot Wi-Fi**. Now the phone and PC are on the same subnet with the
phone as the gateway.

### 2. Find your PC's IP on the hotspot network
In PowerShell:
```powershell
ipconfig
```
Look under "Wireless LAN adapter Wi-Fi" → `IPv4 Address`. It will look
like `192.168.43.12` or `172.20.10.3`. **Write it down.**

### 3. Start the backend, bound to all interfaces
```powershell
cd "D:/Desktop/Final SP implementation/backend"
./.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
> The key difference from before is `--host 0.0.0.0` (not `127.0.0.1`).
> This lets the phone reach it. Keep this window open.

**Windows firewall prompt:** the first time you run this, Windows will
ask to allow Python through the firewall. **Tick "Private networks"
and click Allow.** If you missed the prompt, run in an admin PowerShell:
```powershell
New-NetFirewallRule -DisplayName "PWDSA API" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
```

### 4. Start Expo (in a second terminal)
```powershell
cd "D:/Desktop/Final SP implementation/mobile"
# Optional: pre-bake the API URL. Replace with your PC IP from step 2.
$env:EXPO_PUBLIC_API_URL = "http://192.168.43.12:8000"
npx expo start
```
You'll see a QR code in the terminal.

### 5. On the phone
- Open **Expo Go** → **Scan QR code** → point at the terminal QR.
- Grant permission if asked.
- The app loads over your hotspot/LAN. It will fetch JavaScript from
  the PC's Metro bundler (port 8081), and fetch predictions from the
  PC's FastAPI (port 8000).

### 6. Set the backend URL inside the app (if you skipped step 4's env var)
- Tap the ⚙︎ button in the top-right of the dashboard.
- Enter `http://<PC-IP>:8000` and tap **Save**.

### 7. Use it
Fill all fields → **Show Results** → you'll see the predicted decision,
confidence, a 1–2 sentence plain-language explanation (English or
Arabic — toggle with the language button), and per-class probabilities.

## Troubleshooting

| Symptom | Fix |
|---|---|
| "Could not reach the backend" in the app | Double-check your PC IP in ⚙︎. Make sure backend is running with `--host 0.0.0.0`. Make sure Windows firewall allowed port 8000 for private networks. |
| Expo Go says "Something went wrong" loading the bundle | Phone and PC aren't on the same LAN. Re-check the hotspot connection, or use `npx expo start --tunnel` (slower but works across different networks). |
| QR code scan opens the camera but nothing happens | Try `npx expo start --tunnel` — tunnel mode routes through Expo's servers. |
| Arabic looks garbled | Make sure you're on the latest Expo Go — SDK 54 is required. |
