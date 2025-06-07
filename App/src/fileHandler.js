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
        const dirs = ['uploads', 'temp'];
        for (const dir of dirs) {
            await fs.mkdir(path.join(this.basePath, dir), { recursive: true });
        }
    }

    generateUniqueId() {
        const timestamp = new Date().getTime();
        const random = Math.random().toString(36).substring(2, 15);
        return `${timestamp}-${random}`;
    }

    async saveFile(file) {
        const uniqueId = this.generateUniqueId();
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uniqueId}${fileExtension}`;
        const filePath = path.join(this.basePath, 'uploads', fileName);

        await fs.rename(file.path, filePath);

        const metadata = {
            id: uniqueId,
            originalName: file.originalname,
            fileName: fileName,
            mimeType: file.mimetype,
            size: file.size,
            uploadDate: new Date().toISOString()
        };

        await fs.writeFile(
            path.join(this.basePath, 'uploads', `${uniqueId}.json`),
            JSON.stringify(metadata)
        );

        return {
            id: uniqueId,
            fileName: fileName,
            originalName: file.originalname
        };
    }

    async getFile(fileId) {
        try {
            const metadataPath = path.join(this.basePath, 'uploads', `${fileId}.json`);
            const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            const filePath = path.join(this.basePath, 'uploads', metadata.fileName);

            return {
                ...metadata,
                path: filePath
            };
        } catch (error) {
            return null;
        }
    }
}

module.exports = FileHandler;