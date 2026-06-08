# Salzburg Citizen Report

A React Native + Expo prototype for a multilingual citizen reporting app for Stadt Salzburg.

## Features

- Welcome landing page with Stadt Salzburg branding
- Voice/report flow with waveform, transcript review, and edit
- Mock AI processing for transcription, translation, and authority routing
- Success confirmation in multiple languages
- Issue progress dashboard
- Mock authority dashboard

## Run locally

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm start
```

## Open With Expo Go

1. Install **Expo Go** on your phone.
2. Run `npm start`.
3. Scan the QR code shown in the terminal.

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
- Browser speech recognition works best in Chrome or Edge.
- On Expo Go mobile, speech recognition falls back to the editable transcript field.
