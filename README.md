# Salzburg Citizen Report

A React Native + Expo prototype for a multilingual citizen reporting app for Stadt Salzburg.

## Features

- Welcome landing page with Stadt Salzburg branding
- Voice/report flow with waveform, transcript review, and edit
- Mock AI processing for transcription, translation, and authority routing
- Success confirmation in multiple languages
- Issue progress dashboard
- Mock authority dashboard
- Attachments: take a photo, choose a photo, or attach a file

## Run locally

Install dependencies:

```bash
npm install
```

Start Expo for browser/local development:

```bash
npm start
```

Use the npm scripts instead of `npx expo start -c`; the scripts pin the project to the local Expo CLI and Node 20, which avoids Metro start issues on this machine.

## Open With Expo Go

1. Install **Expo Go** on your phone.
2. Run the phone-friendly tunnel server:

```bash
npm run start:phone
```

3. Scan the QR code shown in the terminal.

Tunnel mode is slower than local web mode, but it is the most reliable option when the phone cannot reach the Mac over the local network. If your phone and Mac are on the same Wi-Fi and the QR still does not open, try:

```bash
npm run start:lan
```

## Open In Browser

```bash
npm run web
```

Then open the local URL Expo prints, usually:

```txt
http://localhost:8081
```

If that port is busy, Expo may choose another one.

## Notes

- The app uses mock AI data only.
- Photo and file attachments work on Expo Web and Android/Expo Go.
- Browser speech recognition works best in Chrome or Edge.
- On Expo Go mobile, speech recognition falls back to the editable transcript field.
