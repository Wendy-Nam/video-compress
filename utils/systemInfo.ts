/**
 * System information utilities for optimal FFmpeg configuration
 * Cross-platform compatible for Windows, macOS, and Linux
 */

/**
 * Detect the operating system
 */
export function getOperatingSystem(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  
  if (userAgent.includes('Win')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (platform.includes('Win')) return 'Windows';
  if (platform.includes('Mac')) return 'macOS';
  if (platform.includes('Linux')) return 'Linux';
  
  return 'unknown';
}

/**
 * Get the optimal number of threads for FFmpeg based on system capabilities
 * @returns Optimal thread count for FFmpeg encoding
 */
export function getOptimalThreadCount(): number {
  // Get the number of logical CPU cores
  const coreCount = navigator.hardwareConcurrency || 4; // Fallback to 4 if not available
  const os = getOperatingSystem();
  
  // Different strategies for different OS
  let reservedCores: number;
  let threadMultiplier: number;
  
  switch (os) {
    case 'Windows':
      // Windows has more overhead, reserve more cores
      reservedCores = coreCount <= 4 ? 1 : (coreCount <= 8 ? 2 : 3);
      threadMultiplier = 1.0; // Conservative approach for Windows
      break;
    case 'macOS':
      // macOS handles threading well, especially Apple Silicon
      reservedCores = coreCount <= 4 ? 1 : 2;
      threadMultiplier = 1.2; // Can handle more threads
      break;
    case 'Linux':
      // Linux has good threading support
      reservedCores = coreCount <= 4 ? 1 : 2;
      threadMultiplier = 1.1;
      break;
    default:
      // Conservative defaults for unknown systems
      reservedCores = coreCount <= 4 ? 1 : 2;
      threadMultiplier = 1.0;
  }
  
  const availableCores = Math.max(2, coreCount - reservedCores);
  const optimalThreads = Math.min(
    Math.round(availableCores * threadMultiplier),
    coreCount + 2 // Don't exceed cores + 2
  );
  
  return Math.max(2, optimalThreads); // Minimum 2 threads
}

/**
 * Get system information for performance optimization
 */
export function getSystemInfo() {
  const coreCount = navigator.hardwareConcurrency || 4;
  const optimalThreads = getOptimalThreadCount();
  const os = getOperatingSystem();
  
  return {
    platform: os,
    totalCores: coreCount,
    optimalThreads,
    reservedCores: coreCount <= 4 ? 1 : (os === 'Windows' ? 3 : 2),
    availableCores: Math.max(2, coreCount - (coreCount <= 4 ? 1 : 2))
  };
}

/**
 * Get recommended preset based on system performance and platform
 */
export function getRecommendedPreset(): string {
  const coreCount = navigator.hardwareConcurrency || 4;
  const os = getOperatingSystem();
  
  // Platform-specific preset recommendations
  if (os === 'Windows') {
    // Windows: More conservative due to overhead
    if (coreCount >= 16) return "fast";
    if (coreCount >= 8) return "veryfast";
    if (coreCount >= 4) return "superfast";
    return "ultrafast";
  } else if (os === 'macOS') {
    // macOS: Can handle more aggressive settings, especially Apple Silicon
    if (coreCount >= 10) return "fast";
    if (coreCount >= 6) return "veryfast";
    if (coreCount >= 4) return "veryfast";
    return "superfast";
  } else if (os === 'Linux') {
    // Linux: Good balance
    if (coreCount >= 12) return "fast";
    if (coreCount >= 8) return "veryfast";
    if (coreCount >= 4) return "veryfast";
    return "superfast";
  } else {
    // Unknown systems: Most conservative
    if (coreCount >= 8) return "veryfast";
    if (coreCount >= 4) return "superfast";
    return "ultrafast";
  }
}

/**
 * Get platform-specific FFmpeg optimizations
 */
export function getPlatformOptimizations(): {
  tune: string;
  additionalFlags: string[];
} {
  const os = getOperatingSystem();
  const coreCount = navigator.hardwareConcurrency || 4;
  
  switch (os) {
    case 'Windows':
      return {
        tune: "film", // Balanced for Windows
        additionalFlags: coreCount <= 4 ? ["-bufsize", "1M"] : []
      };
    case 'macOS':
      return {
        tune: "film", // Good for macOS
        additionalFlags: [] // macOS handles memory well
      };
    case 'Linux':
      return {
        tune: "film", // Good balance
        additionalFlags: []
      };
    default:
      return {
        tune: "zerolatency", // Safe fallback
        additionalFlags: ["-bufsize", "1M"] // Conservative memory usage
      };
  }
}
