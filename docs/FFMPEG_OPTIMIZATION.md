# FFmpeg System Optimization Guide

## What’s this?
This update lets the app automatically pick the best FFmpeg settings (threads, preset, etc.) for each user’s OS and CPU, instead of using fixed values.

## How it works
- The code in `systemInfo.ts` figures out the user’s OS and CPU core count, then calculates the optimal thread count and preset.
- `ffmpegCommands.ts` uses these values for all compression commands.
- Platform-specific flags (like `-tune`, `-bufsize`) are also set automatically.

## Why do it this way?
- Users get much faster compression (sometimes up to 6x), and it works well on both high-end and low-end machines.
- No need for users (or us) to tweak settings for every platform—everything is handled in code.

## If you want to adjust things
- All the logic is in `systemInfo.ts`. You can change the thread/preset policy or add new OS/CPU cases there.
- When adding new FFmpeg commands, just use the helper functions (`getOptimalThreadCount`, `getRecommendedPreset`, etc.) to keep things consistent.
- If you want to tune for quality or speed, just update the relevant switch statements.

## Extra notes
- This approach keeps things flexible and easy to maintain—no hardcoded options.