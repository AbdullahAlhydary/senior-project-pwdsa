<!--
  This file is the public Privacy Policy referenced by the Google Play
  Store listing for the PWDSA Water Analyzer app. Google REQUIRES every
  Play Store app to expose a public-URL privacy policy, even apps that
  collect zero personal data.

  Hosting: this repo is on GitHub. Enable GitHub Pages on the `main`
  branch (Settings → Pages → Source: Deploy from a branch → main → /(root))
  and the file becomes reachable at:

      https://abdullahalhydary.github.io/senior-project-pwdsa/PRIVACY

  Paste that URL into Play Console's "Privacy policy URL" field.

  Tweak the contact email + last-updated date below before publishing.
-->

# Privacy Policy — PWDSA Water Analyzer

**Last updated:** 2026-05-03
**Contact:** abdullah.alhydary@example.com  <!-- replace with a real reachable email -->

## 1. Who we are

The PWDSA Water Analyzer ("the app") is a senior-project research tool
developed at King Fahd University of Petroleum & Minerals (KFUPM).
It recommends one of four produced-water management actions (Inject,
Treat then inject, Disposal, Injection not suitable) given a sample's
chemistry and reservoir properties.

## 2. Data we collect

**The app does not collect, store, or share any personally identifiable
information.** It does not require an account, does not contain trackers
or advertising SDKs, and does not access your contacts, location,
microphone, camera, photos, or files.

The only data the app sends off-device is the numeric form values you
type into the "Show Results" screen. These values describe a water
sample (e.g. TDS, pH, injection pressure) and contain no information
about you as a person.

## 3. Where the data goes

When you tap **"Show Results"**, the form values are sent over HTTPS
to our backend API hosted at `https://pwdsa-api.onrender.com`. The
backend computes a recommendation and returns it. The values are
processed in memory and **are not written to any database, log file, or
analytics service**.

When you additionally tap **"Deeper AI Analysis"**, those same form
values plus the predicted decision are forwarded to OpenAI's API
(`api.openai.com`) so a language model can produce a longer
explanation. OpenAI's data-handling for API requests is governed by
their [API Data Usage Policy](https://openai.com/policies/api-data-usage-policies);
they state that API inputs and outputs are not used to train their
models.

The "Visualize the Situation" screen and all other analyses run **fully
on-device** — no network calls are made.

## 4. Children

The app is a technical engineering tool. It is not directed at children
under 13 and does not knowingly collect data from them.

## 5. Third-party services

| Service       | Purpose                  | Data shared                           |
|--------------|--------------------------|---------------------------------------|
| Render.com   | Hosts the backend API    | Form values you submit (transient)    |
| OpenAI       | Generates the AI analysis| Form values + predicted decision (only when you tap "Deeper AI Analysis") |

## 6. Security

All network traffic is encrypted with HTTPS / TLS 1.2 or above. The
backend does not persist your inputs. The OpenAI API key used by the
backend is stored as an environment variable and never exposed to the
mobile app.

## 7. Your rights

Because we do not store any personal data, there is nothing to access,
correct, export, or delete. If you want to make sure no values are
forwarded to OpenAI, simply do not tap the "Deeper AI Analysis" button.

## 8. Changes to this policy

If this policy changes, the new version will be posted at the same URL
with an updated "Last updated" date.

## 9. Contact

Questions or concerns about this policy can be sent to the email
address at the top of this document.
