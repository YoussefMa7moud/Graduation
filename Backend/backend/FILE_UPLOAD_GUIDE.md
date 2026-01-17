# File Upload Guide

## Overview
The backend now supports file uploads for company logos and corporate client logos. Files are stored on the server and accessible via HTTP URLs.

## How It Works

1. **File Upload**: Client sends file as `multipart/form-data`
2. **File Storage**: Server saves file to `uploads/logos/` directory
3. **URL Generation**: Server returns URL like `/uploads/logos/uuid-filename.jpg`
4. **File Access**: Files are served via `/uploads/**` endpoint

## API Endpoint

### Registration with File Upload

**Endpoint:** `POST /api/auth/register`

**Content-Type:** `multipart/form-data`

**Required Fields:**
- `email` (string)
- `password` (string)
- `role` (string: "company" or "client")
- `logo` (file: image file from your PC)

**Optional Fields:**
- `clientType` (string: "individual" or "corporate" - required if role is "client")
- `firstName` (string)
- `lastName` (string)
- `companyName` (string: required for companies and corporate clients)
- `description` (string)

## Testing with Postman

### Step 1: Create New Request
1. Method: **POST**
2. URL: `http://localhost:8080/api/auth/register`

### Step 2: Configure Body
1. Go to **Body** tab
2. Select **form-data** (NOT raw or x-www-form-urlencoded)
3. Add fields:

| Key | Type | Value | Required |
|-----|------|-------|----------|
| email | Text | user@example.com | Yes |
| password | Text | password123 | Yes |
| role | Text | company | Yes |
| companyName | Text | My Company | Yes (for companies) |
| description | Text | Company description | No |
| logo | **File** | [Select file from PC] | Yes (for companies/corporate) |

**Important:** 
- The `logo` field must be of type **File** (not Text)
- Click the dropdown next to "logo" and select "File"
- Click "Select Files" to choose an image from your PC

### Step 3: Select File
1. Click "Select Files" next to the logo field
2. Choose an image file (JPG, PNG, GIF, etc.)
3. File size limit: 10MB

### Step 4: Send Request
Click "Send" and check the response.

## Testing with cURL

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -F "email=company@example.com" \
  -F "password=password123" \
  -F "role=company" \
  -F "companyName=My Software Company" \
  -F "description=We build great software" \
  -F "logo=@/path/to/your/image.jpg"
```

## Testing with JavaScript/Frontend

### Using Fetch API

```javascript
const formData = new FormData();
formData.append('email', 'company@example.com');
formData.append('password', 'password123');
formData.append('role', 'company');
formData.append('companyName', 'My Company');
formData.append('description', 'Company description');

// Get file from input element
const fileInput = document.getElementById('logoInput');
const file = fileInput.files[0];
formData.append('logo', file);

const response = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  body: formData
  // Don't set Content-Type header - browser will set it automatically with boundary
});

const data = await response.json();
console.log(data);
```

### Using Axios

```javascript
import axios from 'axios';

const formData = new FormData();
formData.append('email', 'company@example.com');
formData.append('password', 'password123');
formData.append('role', 'company');
formData.append('companyName', 'My Company');
formData.append('description', 'Company description');

// Get file from input element
const fileInput = document.getElementById('logoInput');
const file = fileInput.files[0];
formData.append('logo', file);

const response = await axios.post(
  'http://localhost:8080/api/auth/register',
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
);

console.log(response.data);
```

### React Example

```jsx
import { useState } from 'react';

function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'company',
    companyName: '',
    description: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('role', formData.role);
      data.append('companyName', formData.companyName);
      data.append('description', formData.description);
      
      if (logoFile) {
        data.append('logo', logoFile);
      }

      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        body: data
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      console.log('Registration successful:', result);
      // Redirect or show success message
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        placeholder="Password"
        required
      />
      <input
        type="text"
        value={formData.companyName}
        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
        placeholder="Company Name"
        required
      />
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        placeholder="Description"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setLogoFile(e.target.files[0])}
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}
```

## File Requirements

- **File Types**: Only image files (JPG, JPEG, PNG, GIF, WebP, etc.)
- **File Size**: Maximum 10MB
- **Storage Location**: `uploads/logos/` directory (relative to project root)
- **URL Format**: `/uploads/logos/{uuid}-{original-extension}`

## Accessing Uploaded Files

After upload, the server returns a URL like:
```
/uploads/logos/550e8400-e29b-41d4-a716-446655440000.jpg
```

To access the file:
```
http://localhost:8080/uploads/logos/550e8400-e29b-41d4-a716-446655440000.jpg
```

## Common Issues and Solutions

### Issue 1: "Only image files are allowed"
**Solution:** Make sure you're uploading an image file (JPG, PNG, GIF, etc.), not a document or other file type.

### Issue 2: "File size exceeds 10MB limit"
**Solution:** Compress or resize your image before uploading.

### Issue 3: "Logo file upload is required"
**Solution:** 
- For companies: Logo is mandatory
- For corporate clients: Logo is mandatory
- For individual clients: Logo is optional

### Issue 4: File not accessible after upload
**Solution:** 
- Check that the `uploads` directory exists in your project root
- Verify file permissions
- Check server logs for errors

### Issue 5: 403 Forbidden when accessing uploaded file
**Solution:** 
- Make sure `FileStorageConfig` is properly configured
- Check that the file path in the database matches the actual file location
- Verify the upload directory path is correct

### Issue 6: "Failed to upload logo"
**Solution:**
- Check server logs for detailed error messages
- Verify disk space is available
- Check file permissions on the upload directory
- Ensure the upload directory is writable

## Configuration

### application.properties
```properties
# File upload configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=uploads
```

### Changing Upload Directory
To change where files are stored, update `file.upload-dir` in `application.properties`:
```properties
file.upload-dir=/var/www/uploads
# or
file.upload-dir=C:/uploads
```

## Database Storage

The database stores the **URL path** to the file, not the file itself:
- Example: `/uploads/logos/uuid-filename.jpg`
- Full URL: `http://localhost:8080/uploads/logos/uuid-filename.jpg`

## Security Considerations

1. **File Type Validation**: Only image files are accepted
2. **File Size Limit**: 10MB maximum
3. **Unique Filenames**: UUID prevents filename conflicts
4. **Path Normalization**: Prevents directory traversal attacks
5. **Content Type Check**: Validates actual file type, not just extension

## Production Deployment

For production:
1. Use absolute paths for upload directory
2. Store files outside the application directory
3. Use cloud storage (AWS S3, Azure Blob, etc.) for better scalability
4. Set up proper backup strategy
5. Configure CDN for file serving
6. Implement file cleanup for unused files

## Testing Checklist

- [ ] Upload JPG image - should work
- [ ] Upload PNG image - should work
- [ ] Upload GIF image - should work
- [ ] Upload non-image file - should fail with error
- [ ] Upload file > 10MB - should fail with error
- [ ] Register company without logo - should fail
- [ ] Register company with logo - should succeed
- [ ] Access uploaded file via URL - should display image
- [ ] Register individual client without logo - should succeed
- [ ] Register corporate client without logo - should fail
