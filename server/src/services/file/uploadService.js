const multer = require('multer');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const { FileUploadError, ValidationError } = require('../../errors/AppError');
const { businessLogger } = require('../../middleware/logger');

/**
 * 파일 업로드 서비스
 */
class UploadService {
  constructor() {
    this.allowedMimeTypes = {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
    };
    
    this.maxFileSizes = {
      image: 10 * 1024 * 1024, // 10MB
      document: 50 * 1024 * 1024, // 50MB
      audio: 100 * 1024 * 1024, // 100MB
      video: 500 * 1024 * 1024, // 500MB
    };
    
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.tempDir = path.join(this.uploadDir, 'temp');
    
    this.initializeDirectories();
  }

  /**
   * 디렉토리 초기화
   */
  async initializeDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'documents'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'audio'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'video'), { recursive: true });
    } catch (error) {
      console.error('디렉토리 초기화 실패:', error);
    }
  }

  /**
   * Multer 설정
   */
  getMulterConfig(fileType = 'image', maxFiles = 1) {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.tempDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomUUID();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    });

    const fileFilter = (req, file, cb) => {
      if (this.isAllowedFileType(file, fileType)) {
        cb(null, true);
      } else {
        cb(new FileUploadError(`허용되지 않는 파일 형식입니다: ${file.mimetype}`));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSizes[fileType] || this.maxFileSizes.image,
        files: maxFiles,
      },
    });
  }

  /**
   * 파일 타입 검증
   */
  isAllowedFileType(file, fileType) {
    const allowedTypes = this.allowedMimeTypes[fileType];
    if (!allowedTypes) {
      return false;
    }

    return allowedTypes.includes(file.mimetype);
  }

  /**
   * 이미지 처리 및 최적화
   */
  async processImage(filePath, options = {}) {
    try {
      const {
        width = 1200,
        height = 1200,
        quality = 85,
        format = 'jpeg',
        generateThumbnail = true,
      } = options;

      const processedImage = await sharp(filePath)
        .resize(width, height, { 
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toBuffer();

      // 썸네일 생성
      let thumbnail = null;
      if (generateThumbnail) {
        thumbnail = await sharp(filePath)
          .resize(300, 300, { 
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ quality: 80 })
          .toBuffer();
      }

      return {
        processed: processedImage,
        thumbnail,
        metadata: await sharp(filePath).metadata(),
      };
    } catch (error) {
      throw new FileUploadError(`이미지 처리 실패: ${error.message}`);
    }
  }

  /**
   * 파일 보안 검사
   */
  async scanFile(filePath) {
    try {
      // 파일 크기 검사
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        throw new FileUploadError('빈 파일은 업로드할 수 없습니다');
      }

      // 파일 헤더 검사 (매직 넘버)
      const buffer = await fs.readFile(filePath, { start: 0, end: 1023 });
      const fileType = this.detectFileType(buffer);
      
      if (!fileType) {
        throw new FileUploadError('알 수 없는 파일 형식입니다');
      }

      // 악성 코드 패턴 검사 (간단한 예시)
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /onload=/i,
        /onerror=/i,
      ];

      const content = buffer.toString('utf8', 0, Math.min(buffer.length, 10000));
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          throw new FileUploadError('보안상 위험한 파일입니다');
        }
      }

      return {
        fileType,
        size: stats.size,
        isSafe: true,
      };
    } catch (error) {
      if (error instanceof FileUploadError) {
        throw error;
      }
      throw new FileUploadError(`파일 검사 실패: ${error.message}`);
    }
  }

  /**
   * 파일 타입 감지 (매직 넘버 기반)
   */
  detectFileType(buffer) {
    const signatures = {
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'image/gif': [0x47, 0x49, 0x46],
      'image/webp': [0x52, 0x49, 0x46, 0x46],
      'application/pdf': [0x25, 0x50, 0x44, 0x46],
      'audio/mpeg': [0xFF, 0xFB],
      'video/mp4': [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    };

    for (const [mimeType, signature] of Object.entries(signatures)) {
      if (this.bufferStartsWith(buffer, signature)) {
        return mimeType;
      }
    }

    return null;
  }

  /**
   * 버퍼 시작 부분 검사
   */
  bufferStartsWith(buffer, signature) {
    if (buffer.length < signature.length) {
      return false;
    }

    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 파일 저장
   */
  async saveFile(file, fileType, userId) {
    try {
      const tempPath = file.path;
      
      // 파일 보안 검사
      const scanResult = await this.scanFile(tempPath);
      
      // 파일 타입별 처리
      let finalPath;
      let processedData = null;

      if (fileType === 'image') {
        // 이미지 처리
        const imageData = await this.processImage(tempPath);
        processedData = imageData;
        
        // 처리된 이미지 저장
        const filename = this.generateFilename(file.originalname, 'jpg');
        finalPath = path.join(this.uploadDir, 'images', filename);
        await fs.writeFile(finalPath, imageData.processed);
        
        // 썸네일 저장
        if (imageData.thumbnail) {
          const thumbnailPath = path.join(this.uploadDir, 'images', 'thumbnails', filename);
          await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });
          await fs.writeFile(thumbnailPath, imageData.thumbnail);
        }
      } else {
        // 다른 파일 타입은 그대로 저장
        const filename = this.generateFilename(file.originalname);
        const subDir = this.getSubDirectory(fileType);
        finalPath = path.join(this.uploadDir, subDir, filename);
        await fs.copyFile(tempPath, finalPath);
      }

      // 임시 파일 삭제
      await fs.unlink(tempPath);

      // 파일 정보 반환
      const fileInfo = {
        id: crypto.randomUUID(),
        filename: path.basename(finalPath),
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: scanResult.size,
        path: finalPath,
        url: this.generateFileUrl(finalPath),
        uploadedBy: userId,
        uploadedAt: new Date(),
        metadata: {
          fileType: scanResult.fileType,
          processed: !!processedData,
          ...processedData?.metadata,
        },
      };

      businessLogger.funding.projectCreated(userId, null, {
        action: 'file_upload',
        fileId: fileInfo.id,
        fileType,
        size: scanResult.size,
      });

      return fileInfo;
    } catch (error) {
      // 임시 파일 정리
      try {
        await fs.unlink(file.path);
      } catch (cleanupError) {
        console.error('임시 파일 정리 실패:', cleanupError);
      }
      
      throw error;
    }
  }

  /**
   * 파일명 생성
   */
  generateFilename(originalName, extension = null) {
    const ext = extension || path.extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}_${random}${ext}`;
  }

  /**
   * 서브 디렉토리 반환
   */
  getSubDirectory(fileType) {
    const directories = {
      image: 'images',
      document: 'documents',
      audio: 'audio',
      video: 'video',
    };
    
    return directories[fileType] || 'others';
  }

  /**
   * 파일 URL 생성
   */
  generateFileUrl(filePath) {
    const relativePath = path.relative(this.uploadDir, filePath);
    const baseUrl = process.env.FILE_BASE_URL || 'http://localhost:5000/uploads';
    return `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
  }

  /**
   * 파일 삭제
   */
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      
      // 썸네일도 삭제 (이미지인 경우)
      if (filePath.includes('/images/')) {
        const thumbnailPath = filePath.replace('/images/', '/images/thumbnails/');
        try {
          await fs.unlink(thumbnailPath);
        } catch (error) {
          // 썸네일이 없어도 에러가 아님
        }
      }
      
      return true;
    } catch (error) {
      throw new FileUploadError(`파일 삭제 실패: ${error.message}`);
    }
  }

  /**
   * 파일 정보 조회
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      return {
        exists: false,
      };
    }
  }

  /**
   * 디스크 사용량 조회
   */
  async getDiskUsage() {
    try {
      const stats = await this.getDirectorySize(this.uploadDir);
      return {
        totalSize: stats.size,
        fileCount: stats.count,
        directories: stats.directories,
      };
    } catch (error) {
      throw new FileUploadError(`디스크 사용량 조회 실패: ${error.message}`);
    }
  }

  /**
   * 디렉토리 크기 계산
   */
  async getDirectorySize(dirPath) {
    let totalSize = 0;
    let fileCount = 0;
    const directories = {};

    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          const subStats = await this.getDirectorySize(itemPath);
          totalSize += subStats.size;
          fileCount += subStats.count;
          directories[item.name] = subStats;
        } else {
          const stats = await fs.stat(itemPath);
          totalSize += stats.size;
          fileCount++;
        }
      }
    } catch (error) {
      // 디렉토리를 읽을 수 없는 경우 무시
    }

    return { size: totalSize, count: fileCount, directories };
  }
}

module.exports = new UploadService();
