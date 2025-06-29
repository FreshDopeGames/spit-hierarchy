
import { ThreatScanResult } from './types';

// Check for embedded scripts or suspicious content in image metadata - made less aggressive
export const scanForEmbeddedThreats = async (file: File, isAdminUpload: boolean = false): Promise<ThreatScanResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const threats: string[] = [];
    
    reader.onload = () => {
      const content = reader.result as string;
      
      // More lenient patterns for admin uploads
      const criticalScriptPatterns = [
        /<script[^>]*>/i,
        /javascript:\s*[^;\s]/i,
        /vbscript:\s*[^;\s]/i,
        /<iframe[^>]*>/i,
        /<object[^>]*>/i,
        /<embed[^>]*>/i,
        /eval\s*\([^)]/i
      ];

      // Only check for critical threats for admin uploads
      const patternsToCheck = isAdminUpload ? criticalScriptPatterns : [
        ...criticalScriptPatterns,
        /on\w+\s*=/i,
        /document\./i,
        /window\./i
      ];

      patternsToCheck.forEach((pattern) => {
        if (pattern.test(content)) {
          threats.push(`Suspicious script pattern detected: ${pattern.toString()}`);
        }
      });

      // For admin uploads, only flag URLs if they look suspicious
      if (!isAdminUpload) {
        const urlPattern = /https?:\/\/[^\s"'<>]+/gi;
        const urls = content.match(urlPattern);
        if (urls && urls.length > 3) { // Only flag if many URLs
          threats.push(`Multiple embedded URLs detected: ${urls.length} URLs found`);
        }
      }

      resolve({
        hasThreats: threats.length > 0,
        threats
      });
    };

    reader.onerror = () => {
      resolve({ hasThreats: false, threats: [] });
    };

    // Read as text to scan for embedded content
    reader.readAsText(file.slice(0, 1024 * 1024)); // First 1MB
  });
};
