// src/fileHandler.js
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

class FileHandler {
    constructor(basePath) {
        this.basePath = basePath;
        this.initializeDirectories();
    }

    async initializeDirectories() {
        const dirs = ['pdf', 'word'];
        for (const dir of dirs) {
            await fs.mkdir(path.join(this.basePath, dir), { recursive: true });
        }
    }

    generateUniqueId() {
        return crypto.randomBytes(32).toString('hex');
    }

    getFileType(mimeType) {
        if (mimeType === 'application/pdf') return 'pdf';
        if (mimeType === 'application/msword' || 
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return 'word';
        }
        throw new Error('Unsupported file type');
    }

    async saveFile(file, customFolder = '') {
        const fileType = this.getFileType(file.mimetype);
        const uniqueId = this.generateUniqueId();
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uniqueId}${fileExtension}`;
        
        let filePath;
        if (customFolder) {
            const folderPath = path.join(this.basePath, fileType, customFolder);
            await fs.mkdir(folderPath, { recursive: true });
            filePath = path.join(folderPath, fileName);
        } else {
            filePath = path.join(this.basePath, fileType, fileName);
        }

        // Move file from temp upload to final location
        await fs.rename(file.path, filePath);

        // Create a shorter access token for the URL
        const accessToken = crypto.randomBytes(16).toString('hex');

        // Store file metadata in a JSON file
        const metadata = {
            originalName: file.originalname,
            fileName,
            accessToken,
            filePath,
            mimeType: file.mimetype,
            size: file.size,
            uploadDate: new Date().toISOString(),
            customFolder
        };

        const metadataPath = `${filePath}.meta.json`;
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

        return {
            accessToken,
            fileName,
            originalName: file.originalname
        };
    }

    async getFileByToken(accessToken) {
        const directories = ['pdf', 'word'];
        
        for (const dir of directories) {
            const basePath = path.join(this.basePath, dir);
            const files = await this.getAllFilesRecursively(basePath);
            
            for (const file of files) {
                if (file.endsWith('.meta.json')) {
                    const metadataContent = await fs.readFile(file, 'utf8');
                    const metadata = JSON.parse(metadataContent);
                    
                    if (metadata.accessToken === accessToken) {
                        const filePath = metadata.filePath;
                        if (await this.fileExists(filePath)) {
                            return {
                                path: filePath,
                                originalName: metadata.originalName,
                                mimeType: metadata.mimeType
                            };
                        }
                    }
                }
            }
        }
        return null;
    }

    async getAllFilesRecursively(dir) {
        const files = await fs.readdir(dir, { withFileTypes: true });
        const allFiles = [];
        
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                const subFiles = await this.getAllFilesRecursively(fullPath);
                allFiles.push(...subFiles);
            } else {
                allFiles.push(fullPath);
            }
        }
        
        return allFiles;
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = FileHandler;