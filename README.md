# Family World – Thimar OSMAR

A family game by OSMAR Ecosystems, available in Arabic, English, and Simplified Chinese.

## Play now

Open the public game at [Family World](https://osamaelsehimy.github.io/family-world-thimar-osmar/) and choose **Play the demo**. No account or installation is required. You can share that link with anyone.

Demo points and activity are temporary. The current MVP does not save game progress or family member profiles; accounts have a private sign-in profile.

## Install on a phone or PC

The site is an installable web app (PWA), not an APK or `.exe`.

- On Windows, open the HTTPS site in Chrome or Edge and choose **Install Family World** in the address bar or browser menu. Windows adds an app icon and launches it in its own window.
- On Android, open the site in Chrome and choose **Install app** or **Add to Home screen**.
- On iPhone or iPad, open the site in Safari and choose **Share → Add to Home Screen**.

The app icon is included in the site manifest. After installation, it opens like an app; an internet connection is needed for the online site and Supabase sign-in.

## Accounts and privacy

Email and password accounts use Supabase Auth and require an adult parent or guardian affirmation. Email confirmation is enabled. Account sign-in currently does not save game progress. The public guest demo remains available without signing in.

The app uses a public Supabase publishable key, which is intended for browser applications. The private `profiles` table has row-level security; each account can read only its own profile. Never put a service-role key in browser code.

Do not enter children's full names, contact details, photos, or sensitive information.

## Run or publish the source

For local development, install Node.js 20 or later, then run:

```sh
npm install
npm run dev
```

To build the static site, run `npm run build`; the output is in `dist/`. A push to `main` runs the GitHub Pages workflow. In repository settings, Pages must use **GitHub Actions**.
