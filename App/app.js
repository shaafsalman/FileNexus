// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const os = require('os');
const routes = require('./src/routes');
const logger = require('./src/utils/logger');
const path = require('path');
const fs = require('fs').promises;

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.'
        });
    }
});
app.use(limiter);

// System status endpoint
app.get('/', async (req, res) => {
    try {
        // Calculate storage stats
        const storageDir = path.join(__dirname, 'storage');
        let totalFiles = 0;
        let totalStorage = 0;

        try {
            const files = await fs.readdir(path.join(storageDir, 'uploads'));
            totalFiles = files.filter(f => !f.endsWith('.json')).length;
            
            for (const file of files) {
                if (!file.endsWith('.json')) {
                    const stats = await fs.stat(path.join(storageDir, 'uploads', file));
                    totalStorage += stats.size;
                }
            }
        } catch (error) {
            logger.error('Error calculating storage stats:', error);
        }

        // System information
        const systemInfo = {
            status: 'operational',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            
            system: {
                platform: process.platform,
                nodeVersion: process.version,
                memory: {
                    total: os.totalmem(),
                    free: os.freemem(),
                    used: os.totalmem() - os.freemem(),
                    usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
                },
                cpu: {
                    cores: os.cpus().length,
                    model: os.cpus()[0].model,
                    loadAverage: os.loadavg()
                }
            },

            storage: {
                totalFiles,
                totalStorage: (totalStorage / 1024 / 1024).toFixed(2) + ' MB',
                uploadPath: path.join(storageDir, 'uploads')
            },

            server: {
                port: process.env.PORT || 3000,
                environment: process.env.NODE_ENV || 'development',
                corsEnabled: true,
                rateLimiting: {
                    windowMs: limiter.windowMs,
                    maxRequests: limiter.max
                }
            },

            endpoints: {
                upload: {
                    method: 'POST',
                    path: '/upload',
                    maxFileSize: '10 MB',
                    supportedFormats: ['PDF', 'DOC', 'DOCX']
                },
                view: {
                    method: 'GET',
                    path: '/view/:id'
                },
                download: {
                    method: 'GET',
                    path: '/download/:id'
                }
            }
        };

        // Format uptime
        const uptimeHours = Math.floor(systemInfo.uptime / 3600);
        const uptimeMinutes = Math.floor((systemInfo.uptime % 3600) / 60);
        const uptimeSeconds = Math.floor(systemInfo.uptime % 60);
        systemInfo.formattedUptime = `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

        logger.info(`System status checked by ${req.ip}`);
        res.json(systemInfo);
    } catch (error) {
        logger.error('Error generating system status:', error);
        res.status(500).json({ error: 'Failed to generate system status' });
    }
});

// Routes
app.use('/', routes);

// Error handling
app.use((err, req, res, next) => {
    logger.error('Application error:', err);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 1001;
app.listen(PORT, () => {
    logger.success(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});