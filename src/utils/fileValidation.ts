
// Magic number validation and file header verification
const FILE_SIGNATURES = {
  jpeg: [
    [0xFF, 0xD8, 0xFF],
    [0xFF, 0xD8, 0xFF, 0xE0],
    [0xFF, 0xD8, 0xFF, 0xE1],
    [0xFF, 0xD8, 0xFF, 0xE2],
    [0xFF, 0xD8, 0xFF, 0xE3],
    [0xFF, 0xD8, 0xFF, 0xE8]
  ],
  png: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  webp: [[0x52, 0x49, 0x46, 0x46]],
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]
  ]
};

export interface FileValidationResult {
  isValid: boolean;
  detectedType?: string;
  errors: string[];
  warnings: string[];
  metadata?: {
    actualMimeType: string;
    hasEXIF: boolean;
    fileSize: number;
    dimensions?: { width: number; height: number };
  };
}

// Read file header bytes
const readFileHeader = async (file: File, bytesToRead: number = 16): Promise<Uint8Array> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      resolve(new Uint8Array(arrayBuffer));
    };
    reader.readAsArrayBuffer(file.slice(0, bytesToRead));
  });
};

// Verify magic number matches expected file type
const verifyMagicNumber = (header: Uint8Array, fileType: string): boolean => {
  const signatures = FILE_SIGNATURES[fileType.toLowerCase() as keyof typeof FILE_SIGNATURES];
  if (!signatures) return false;

  return signatures.some(signature => 
    signature.every((byte, index) => header[index] === byte)
  );
};

// Detect actual file type from magic number
const detectFileType = (header: Uint8Array): string | null => {
  for (const [type, signatures] of Object.entries(FILE_SIGNATURES)) {
    if (signatures.some(signature => 
      signature.every((byte, index) => header[index] === byte)
    )) {
      return type;
    }
  }
  return null;
};

// Validate file extension matches content
export const validateFileHeader = async (file: File): Promise<FileValidationResult> => {
  const result: FileValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    metadata: {
      actualMimeType: file.type,
      hasEXIF: false,
      fileSize: file.size
    }
  };

  try {
    // Read file header
    const header = await readFileHeader(file);
    
    // Detect actual file type
    const detectedType = detectFileType(header);
    result.detectedType = detectedType || 'unknown';

    if (!detectedType) {
      result.isValid = false;
      result.errors.push('Unable to detect valid image file type from file header');
      return result;
    }

    // Validate MIME type matches detected type
    const expectedMimeTypes = {
      jpeg: ['image/jpeg', 'image/jpg'],
      png: ['image/png'],
      webp: ['image/webp'],
      gif: ['image/gif']
    };

    const expectedTypes = expectedMimeTypes[detectedType as keyof typeof expectedMimeTypes];
    if (!expectedTypes?.includes(file.type)) {
      result.isValid = false;
      result.errors.push(`File extension/MIME type (${file.type}) doesn't match detected file type (${detectedType})`);
    }

    // Check for EXIF data (JPEG files)
    if (detectedType === 'jpeg' && header.length >= 6) {
      const hasEXIF = header[4] === 0x45 && header[5] === 0x78; // Check for "Ex"
      result.metadata!.hasEXIF = hasEXIF;
      
      if (hasEXIF) {
        result.warnings.push('Image contains EXIF data which will be preserved');
      }
    }

    // Validate file size is reasonable
    if (file.size === 0) {
      result.isValid = false;
      result.errors.push('File is empty');
    } else if (file.size > 50 * 1024 * 1024) { // 50MB limit
      result.isValid = false;
      result.errors.push('File is too large (max 50MB)');
    }

    console.log('File header validation completed:', {
      fileName: file.name,
      detectedType,
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings
    });

  } catch (error) {
    result.isValid = false;
    result.errors.push(`File header validation failed: ${error}`);
  }

  return result;
};

// Calculate file entropy to detect suspicious content
export const calculateFileEntropy = async (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const frequency = new Array(256).fill(0);
      
      // Count byte frequencies
      for (let i = 0; i < data.length; i++) {
        frequency[data[i]]++;
      }
      
      // Calculate entropy
      let entropy = 0;
      for (let i = 0; i < 256; i++) {
        if (frequency[i] > 0) {
          const probability = frequency[i] / data.length;
          entropy -= probability * Math.log2(probability);
        }
      }
      
      resolve(entropy);
    };
    
    // Read first 64KB for entropy analysis
    reader.readAsArrayBuffer(file.slice(0, 65536));
  });
};
