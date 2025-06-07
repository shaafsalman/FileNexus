// src/config.js
const path = require('path');

module.exports = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
    },

    // File Upload Configuration
    fileUpload: {
        // Maximum file size (10MB as per your current routes)
        maxFileSize: 10 * 1024 * 1024, // 10MB

        // Allowed file types
        allowedMimeTypes: [
            'application/pdf', 
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        ],

        // Storage paths
        storagePaths: {
            // Base storage directory
            base: path.join(__dirname, '..', 'storage'),
            
            // Temporary upload directory
            temp: path.join(__dirname, '..', 'storage', 'temp')
        }
    },

    // Logging Configuration
    logging: {
        // Log levels: debug, info, warn, error
        level: process.env.LOG_LEVEL || 'info',
        
        // Log file path (optional)
        logFile: path.join(__dirname, '..', 'logs', 'app.log')
    },

    // Security Configuration
    security: {
        // Enable rate limiting
        rateLimitEnabled: true,
        
        // Maximum number of uploads per IP in a time window
        maxUploadsPerIP: 10,
        
        // Time window for rate limiting (in minutes)
        rateLimitWindowMinutes: 15
    },

    // Environment-specific configurations
    environments: {
        development: {
            debug: true,
            corsEnabled: true
        },
        production: {
            debug: false,
            corsEnabled: false
        },
        test: {
            debug: true,
            corsEnabled: false
        }
    },

    // Get current environment configuration
    getEnvConfig: function() {
        const env = process.env.NODE_ENV || 'development';
        return this.environments[env];
    }
};