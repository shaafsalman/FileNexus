// src/routes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const FileHandler = require('./fileHandler');

const upload = multer({
    dest: 'temp/',
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

const fileHandler = new FileHandler(path.join(__dirname, '../storage'));

router.post('/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const folder = req.body.folder || '';
        const result = await fileHandler.saveFile(req.file, folder);

        const downloadUrl = `${req.protocol}://${req.get('host')}/download/${result.accessToken}`;
        
        res.json({
            message: 'File uploaded successfully',
            downloadUrl,
            originalName: result.originalName
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

router.get('/download/:token', async (req, res) => {
    try {
        const file = await fileHandler.getFileByToken(req.params.token);
        
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.download(file.path, file.originalName);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

module.exports = router;