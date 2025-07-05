import { VideoFormats, VideoInputSettings } from "~/types";
import { getFileExtension } from "./convert";
import { getOptimalThreadCount, getRecommendedPreset, getPlatformOptimizations } from "./systemInfo";

export const twitterCompressionCommand = (input: string, output: string) => {
  const optimalThreads = getOptimalThreadCount();
  
  return [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-level:v",
    "4.2",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "192k",
    "-movflags",
    "faststart",
    "-r",
    "30",
    "-maxrate",
    "5000k",
    "-bufsize",
    "5000k",
    "-preset",
    "superfast", // Fastest practical setting
    "-threads",
    "0", // Use all CPU cores
    "-crf",
    "28", // Fast compression CRF
    output,
  ];
};

export const customVideoCompressionCommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
): string[] => {
  const inputType = getFileExtension(input);
  if (inputType === "mp4") {
    return getMp4ToMp4Command(input, output, videoSettings);
  } else {
    switch (videoSettings.videoType) {
      case VideoFormats.MP4:
        return getMp4Command(input, output, videoSettings);
      case VideoFormats.WEBM:
        return getWebMCommand(input, output, videoSettings);
      case VideoFormats.AVI:
        return getAVICommand(input, output, videoSettings);
      case VideoFormats.FLV:
        return getFLVCommand(input, output, videoSettings);
      case VideoFormats.MKV:
        return getMKVCommand(input, output, videoSettings);
      case VideoFormats.MOV:
        return getMOVCommand(input, output, videoSettings);
      default:
        return ["-i", input, output];
    }
  }
};

const getMp4ToMp4Command = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
) => {
  const ffmpegCommand = [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-crf",
    "28", // Fast compression
    "-preset",
    "superfast", // Fastest practical setting
    "-threads",
    "0", // Use all CPU cores
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "faststart",
    output,
  ];
  return ffmpegCommand;
};

const getWebMCommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
): string[] => {
  const audioOptions = videoSettings.removeAudio ? [] : ["-c:a", "libvorbis"];
  return [
    "-i",
    input,
    "-c:v",
    "libvpx",
    "-crf",
    videoSettings.quality,
    "-b:v",
    "1M",
    ...audioOptions,
    "-vf",
    `trim=start=${videoSettings.customStartTime}:end=${videoSettings.customEndTime}`,
    output,
  ];
};

const getMKVCommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
): string[] => {
  const audioOptions = videoSettings.removeAudio ? [] : ["-c:a", "aac"];
  
  return [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-crf",
    "28", // Fast compression
    "-preset",
    "superfast", // Fastest practical setting
    "-threads",
    "0", // Use all CPU cores
    ...audioOptions,
    "-vf",
    `trim=start=${videoSettings.customStartTime}:end=${videoSettings.customEndTime}`,
    output,
  ];
};

const getAVICommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
): string[] => {
  const audioOptions = videoSettings.removeAudio ? [] : ["-c:a", "mp3"];
  
  return [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-crf",
    "28", // Fast compression
    "-preset",
    "superfast", // Fastest practical setting
    "-threads",
    "0", // Use all CPU cores
    ...audioOptions,
    "-vf",
    `trim=start=${videoSettings.customStartTime}:end=${videoSettings.customEndTime}`,
    output,
  ];
};

const getFLVCommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
): string[] => {
  const audioOptions = videoSettings.removeAudio ? [] : ["-c:a", "aac"];
  
  return [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-crf",
    "28", // Fast compression
    "-preset",
    "superfast", // Fastest practical setting
    "-threads",
    "0", // Use all CPU cores
    ...audioOptions,
    "-vf",
    `trim=start=${videoSettings.customStartTime}:end=${videoSettings.customEndTime}`,
    output,
  ];
};

const getMOVCommand = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
): string[] => {
  const audioOptions = videoSettings.removeAudio ? [] : ["-c:a", "aac"];
  
  return [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-crf",
    "28", // Fast compression
    "-preset",
    "superfast", // Fastest practical setting
    "-threads",
    "0", // Use all CPU cores
    ...audioOptions,
    "-vf",
    `trim=start=${videoSettings.customStartTime}:end=${videoSettings.customEndTime}`,
    output,
  ];
};

const getMp4Command = (
  input: string,
  output: string,
  videoSettings: VideoInputSettings
) => {
  const ffmpegCommand = [
    "-i",
    input,
    "-c:v",
    "libx264",
    "-profile:v",
    "high",
    "-level:v",
    "4.2",
    "-pix_fmt",
    "yuv420p",
    "-r",
    "30",
    "-maxrate",
    "5000k",
    "-bufsize",
    "5000k",
    "-ss",
    videoSettings.customStartTime.toString(),
    "-to",
    videoSettings.customEndTime.toString(),
    "-q:v",
    videoSettings.quality,
    "-c:v",
    "libx264",
    "-crf",
    "28", // Fast compression
    "-preset",
    "superfast", // Fastest practical setting
    "-threads",
    "0", // Use all CPU cores
    "-f",
    videoSettings.videoType,
  ];

  if (!videoSettings.removeAudio) {
    ffmpegCommand.push("-c:a", "aac", "-b:a", "192k", "-movflags", "faststart");
  } else {
    ffmpegCommand.push("-an");
  }
  ffmpegCommand.push(output);
  return ffmpegCommand;
};
