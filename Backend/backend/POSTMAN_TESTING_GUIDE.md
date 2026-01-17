# Postman Testing Guide for Registration API

## Endpoint
**POST** `http://localhost:8080/api/auth/register`

## Setup Instructions

### 1. Start Your Spring Boot Application
Make sure your backend is running on port 8080.

### 2. Open Postman
Create a new request with the following settings:

## Request Configuration

### Method & URL
- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/register`

### Body Configuration
1. Click on the **Body** tab
2. Select **form-data** (NOT raw JSON)
3. Add the following fields:

---

## Test Case 1: Register as Software Company

### Fields to Add:
| Key | Type | Value |
|-----|------|-------|
| `email` | Text | `company@example.com` |
| `password` | Text | `password123` |
| `role` | Text | `company` |
| `firstName` | Text | `John` |
| `lastName` | Text | `Doe` |
| `companyName` | Text | `Tech Solutions Inc.` |
| `description` | Text | `We provide innovative software solutions` |
| `logo` | File | Select an image file from your PC |

**Note**: The `logo` field should be of type **File** (not Text). Click on the dropdown next to the key name and select "File", then click "Select Files" to choose an image.

---

## Test Case 2: Register as Individual Client

### Fields to Add:
| Key | Type | Value |
|-----|------|-------|
| `email` | Text | `individual@example.com` |
| `password` | Text | `password123` |
| `role` | Text | `client` |
| `clientType` | Text | `individual` |
| `firstName` | Text | `Jane` |
| `lastName` | Text | `Smith` |

**Note**: No logo needed for individual clients.

---

## Test Case 3: Register as Corporate Client

### Fields to Add:
| Key | Type | Value |
|-----|------|-------|
| `email` | Text | `corporate@example.com` |
| `password` | Text | `password123` |
| `role` | Text | `client` |
| `clientType` | Text | `corporate` |
| `firstName` | Text | `Bob` |
| `lastName` | Text | `Johnson` |
| `companyName` | Text | `Corporate Legal Services` |
| `description` | Text | `Legal services for corporations` |
| `logo` | File | Select an image file from your PC |

---

## Expected Responses

### Success Response (200 OK)
```json
{
  "userId": 1,
  "role": "SOFTWARE_COMPANY"
}
```

### Error Response (400 Bad Request)
```json
{
  "error": "Email already exists"
}
```

or

```json
{
  "error": "Company name is required for software company"
}
```

---

## Important Notes

1. **File Upload**: Make sure the `logo` field is set to type **File** (not Text) in Postman
2. **Image Files Only**: Only image files are accepted (jpg, png, gif, etc.)
3. **File Size**: Maximum file size is 10MB
4. **Email Uniqueness**: Each email can only be registered once
5. **Required Fields**: 
   - For `company` role: `email`, `password`, `role`, `companyName` are required
   - For `client` with `individual`: `email`, `password`, `role`, `clientType`, `firstName`, `lastName` are required
   - For `client` with `corporate`: `email`, `password`, `role`, `clientType`, `companyName` are required

---

## Step-by-Step Postman Setup

1. **Create New Request**
   - Click "New" → "HTTP Request"
   - Name it "Register User"

2. **Set Method and URL**
   - Method: `POST`
   - URL: `http://localhost:8080/api/auth/register`

3. **Configure Body**
   - Go to "Body" tab
   - Select "form-data"
   - Add fields as shown in test cases above
   - For logo field: Change type from "Text" to "File" using the dropdown
   - Click "Select Files" to choose an image

4. **Send Request**
   - Click "Send"
   - Check the response in the bottom panel

---

## Troubleshooting

### Error: "Failed to upload logo"
- Make sure you selected a file (not left it empty)
- Check that the file is an image (jpg, png, gif, etc.)
- Verify file size is under 10MB

### Error: "Email already exists"
- Try with a different email address
- Or delete the existing user from the database

### Error: "Required field missing"
- Check that all required fields for the selected role are filled

### Files are saved to:
- Location: `uploads/logos/` directory in your project root
- Access URL: `http://localhost:8080/uploads/logos/{filename}`
