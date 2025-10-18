# Background Music for Landing Page

To add background music to the landing page:

1. Add your background music file to this directory
2. Name it `background-music.mp3` (or update the filename in LandingPage.tsx)
3. Supported formats: MP3, WAV, OGG, M4A

## Recommended Music:

- Upbeat, professional instrumental music
- Duration: 2-5 minutes (will loop automatically)
- Volume: Keep it subtle (currently set to 30% volume)

## File Requirements:

- File size: Keep under 5MB for good loading performance
- Format: MP3 is recommended for best browser compatibility
- Quality: 128kbps is sufficient for background music

## Current Implementation:

- Music starts automatically after 1 second (if autoplay is allowed)
- User can click anywhere on the page to start music if autoplay is blocked
- Music control button in top-left corner
- Music stops when entering the Shark Tank
- Loops continuously while on landing page

## To Change the Music File:

Edit the `audio.src` line in `components/LandingPage.tsx`:

```typescript
audio.src = "/audio/your-music-file.mp3";
```
