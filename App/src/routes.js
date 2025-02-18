// src/routes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const config = require('./config');
const FileHandler = require('./fileHandler');
const logger = require('./utils/logger');

const router = express.Router();
const fileHandler = new FileHandler(path.join(__dirname, '..', 'storage'));

const upload = multer({
    dest: path.join(__dirname, '..', 'storage', 'temp'),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
            logger.info(`File type validated: ${file.mimetype}`);
        } else {
            logger.error(`Invalid file type: ${file.mimetype}`);
            cb(new Error('Invalid file type'));
        }
    }
});

// Log all requests
router.use((req, res, next) => {
    logger.request(req);
    next();
});

router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            logger.error('Upload attempted with no file');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        logger.info(`File upload started: ${req.file.originalname} (${req.file.size} bytes)`);
        const result = await fileHandler.saveFile(req.file);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        const response = {
            message: 'File uploaded successfully',
            viewUrl: `${baseUrl}/view/${result.id}`,
            downloadUrl: `${baseUrl}/download/${result.id}`,
            fileName: result.originalName
        };

        logger.success(`File uploaded successfully: ${result.originalName} (ID: ${result.id})`);
        res.json(response);
    } catch (error) {
        logger.error('Upload failed', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

router.get('/view/:id', async (req, res) => {
    try {
        logger.info(`View request for file ID: ${req.params.id}`);
        const file = await fileHandler.getFile(req.params.id);
        
        if (!file) {
            logger.warn(`File not found: ${req.params.id}`);
            return res.status(404).json({ error: 'File not found' });
        }

        logger.info(`Streaming file: ${file.originalName}`);
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
        
        const fs = require('fs');
        const stream = fs.createReadStream(file.path);
        stream.on('end', () => {
            logger.success(`File streamed successfully: ${file.originalName}`);
        });
        stream.pipe(res);
    } catch (error) {
        logger.error(`View failed for ID: ${req.params.id}`, error);
        res.status(500).json({ error: 'Failed to view file' });
    }
});

router.get('/download/:id', async (req, res) => {
    try {
        logger.info(`Download request for file ID: ${req.params.id}`);
        const file = await fileHandler.getFile(req.params.id);
        
        if (!file) {
            logger.warn(`File not found: ${req.params.id}`);
            return res.status(404).json({ error: 'File not found' });
        }

        logger.info(`Starting download: ${file.originalName}`);
        res.download(file.path, file.originalName, (err) => {
            if (err) {
                logger.error(`Download failed: ${file.originalName}`, err);
            } else {
                logger.success(`File downloaded successfully: ${file.originalName}`);
            }
        });
    } catch (error) {
        logger.error(`Download failed for ID: ${req.params.id}`, error);
        res.status(500).json({ error: 'Download failed' });
    }
});

module.exports = router;