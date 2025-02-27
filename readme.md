# 🚀 FileNexus

**Powerful, Lightweight Document Management System Built for Developers**

Securely host, share and distribute files through an elegant API

---

## ✨ Features

- 📤 **One-Click Uploads**: Simple API for document upload with secure processing
- 🔐 **Secure Storage**: Files stored with unique IDs and separated metadata
- 👁️ **Direct Viewing**: View documents in-browser with streaming support
- 🔗 **Simple Sharing**: Generate clean URLs for viewing and downloading
- 🛡️ **Enterprise Security**: Rate limiting, CORS, Helmet.js, and file validation
- 📊 **System Metrics**: Real-time monitoring and performance tracking

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🔧 Installation

```bash
# Clone the repository
git clone https://github.com/shaafsalman/FileNexus.git
cd file-nexus

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Create storage directories
mkdir -p storage/uploads storage/temp

# Start the server
npm start
```

## 🚀 Quick Start

### Add to your application

```javascript
// Using fetch API
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('document', file);
  
  const response = await fetch('http://localhost:1001/upload', {
    method: 'POST',
    body: formData,
  });
  
  return await response.json();
};
```

### Upload via cURL

```bash
curl -X POST \
  http://localhost:1001/upload \
  -H 'Content-Type: multipart/form-data' \
  -F 'document=@/path/to/your/file.pdf'
```

## 🔌 API Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `POST` | `/upload` | Upload a file | `{message, viewUrl, downloadUrl, fileName}` |
| `GET` | `/view/:id` | Stream file to browser | File content with appropriate headers |
| `GET` | `/download/:id` | Download a file | File with download headers |
| `GET` | `/` | System status | System metrics and configuration |

## 📚 Documentation

### Upload Response Example

```json
{
  "message": "File uploaded successfully",
  "viewUrl": "http://localhost:1001/view/1645783426789-ab2c7d",
  "downloadUrl": "http://localhost:1001/download/1645783426789-ab2c7d",
  "fileName": "presentation.pdf"
}
```

### Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `1001` |
| `NODE_ENV` | Environment | `development` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |
| `MAX_FILE_SIZE` | Maximum file size | `10485760` (10MB) |
| `UPLOAD_PATH` | Storage directory | `./storage` |

## 🔒 Security Features

- **Randomized Storage**: Files stored with cryptographically secure unique IDs
- **Metadata Separation**: File information stored separately from content
- **Request Limiting**: Protection against brute force and DoS attacks
- **Content Validation**: Strict file type checking (PDF, DOC, DOCX)
- **Security Headers**: Comprehensive HTTP security with Helmet.js

## 🛠️ Troubleshooting

### Common Issues

- **ENOENT: no such file or directory**: Create the storage directories
- **Upload failed**: Check file size (max 10MB) and type (PDF, DOC, DOCX)
- **File not found**: Verify file ID in URL matches upload response

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**FileNexus** — Developed with ❤️ by Shaaf Salman