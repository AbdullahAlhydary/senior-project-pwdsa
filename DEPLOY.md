<!--
  Deployment runbook for the PWDSA project.
  Tracks the exact paid services, costs, and step-by-step commands you
  used so you (or a future maintainer) can re-deploy from scratch.
-->

# PWDSA Deployment Runbook

| Component        | Service              | Plan         | Monthly cost     |
|------------------|----------------------|--------------|------------------|
| Backend hosting  | Render.com           | Starter      | $7 (~26 SAR)     |
| Mobile build     | Expo EAS             | Free         | $0               |
| App distribution | Google Play Console  | One-time fee | $25 (~94 SAR)    |
| LLM API          | OpenAI (gpt-5.4-mini)| Pay-as-go    | ~$3 (~11 SAR)    |
| Privacy page     | GitHub Pages         | Free         | $0               |
| **Total year 1** |                      |              | **~$145 (~545 SAR)** |
| **Total month 2+ onwards** |            |              | **~$10/month (~38 SAR)** |

## 1. Files this repo already contains for deployment

| File                                 | Purpose                                     |
|--------------------------------------|---------------------------------------------|
| `code/backend/render.yaml`           | Render Blueprint config (region, plan, etc) |
| `code/backend/.python-version`       | Pin Python 3.10.13 for Render's builder     |
| `code/backend/requirements.txt`      | Python deps incl. gunicorn for production   |
| `code/mobile/eas.json`               | EAS Build profiles + Play Store submit cfg  |
| `code/mobile/app.json`               | App name, package id, version, icon paths   |
| `PRIVACY.md`                         | Public privacy policy required by Play Store|

## 2. URLs you'll need

* GitHub repo:      https://github.com/AbdullahAlhydary/senior-project-pwdsa
* Render dashboard: https://dashboard.render.com
* Expo dashboard:   https://expo.dev
* Google Play:      https://play.google.com/console
* OpenAI usage:     https://platform.openai.com/usage

## 3. After-deployment URLs (fill in once live)

* Backend API:      https://pwdsa-api.onrender.com   (returned by Render)
* Privacy policy:   https://abdullahalhydary.github.io/senior-project-pwdsa/PRIVACY
* Play listing:     https://play.google.com/store/apps/details?id=com.abdullahalhydary.pwdsa
