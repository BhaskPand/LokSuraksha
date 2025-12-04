# Citizen Safety API Specification

## Base URL

```
http://localhost:3001
```

## Authentication

Admin endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <ADMIN_TOKEN>
```

## Endpoints

### GET /api/ping

Health check endpoint.

**Response:**
```json
{
  "ok": true
}
```

---

### GET /api/issues

Get a list of issues.

**Query Parameters:**
- `limit` (optional, number): Maximum number of issues to return
- `category` (optional, string): Filter by category
- `since` (optional, string): Filter issues created after this date (ISO format)

**Response:**
```json
{
  "issues": [
    {
      "id": 1,
      "title": "Pothole on Main Street",
      "description": "Large pothole near the intersection",
      "category": "Roads",
      "location_lat": 40.7128,
      "location_lng": -74.006,
      "images": ["data:image/jpeg;base64,..."],
      "contact_name": "John Doe",
      "contact_phone": "+1234567890",
      "status": "open",
      "created_at": "2024-01-15T10:30:00Z",
      "notes": null
    }
  ],
  "total": 1,
  "limit": 100
}
```

---

### GET /api/issues/:id

Get a single issue by ID.

**Response:**
```json
{
  "id": 1,
  "title": "Pothole on Main Street",
  "description": "Large pothole near the intersection",
  "category": "Roads",
  "location_lat": 40.7128,
  "location_lng": -74.006,
  "images": ["data:image/jpeg;base64,..."],
  "contact_name": "John Doe",
  "contact_phone": "+1234567890",
  "status": "open",
  "created_at": "2024-01-15T10:30:00Z",
  "notes": null
}
```

**Error Responses:**
- `404`: Issue not found
- `400`: Invalid issue ID

---

### POST /api/issues

Create a new issue.

**Request Body:**
```json
{
  "title": "Broken Streetlight",
  "description": "Streetlight not working on 5th Avenue",
  "category": "Infrastructure",
  "location_lat": 40.7589,
  "location_lng": -73.9851,
  "images": ["data:image/jpeg;base64,..."],
  "contact_name": "Jane Smith",
  "contact_phone": "+1234567890"
}
```

**Required Fields:**
- `title` (string)
- `description` (string)
- `category` (string)
- `location_lat` (number)
- `location_lng` (number)

**Optional Fields:**
- `images` (array of strings, max 3): Base64 data URLs
- `contact_name` (string)
- `contact_phone` (string)

**Response:**
```json
{
  "id": 2,
  "title": "Broken Streetlight",
  "description": "Streetlight not working on 5th Avenue",
  "category": "Infrastructure",
  "location_lat": 40.7589,
  "location_lng": -73.9851,
  "images": ["data:image/jpeg;base64,..."],
  "contact_name": "Jane Smith",
  "contact_phone": "+1234567890",
  "status": "open",
  "created_at": "2024-01-15T11:00:00Z",
  "notes": null
}
```

**Status Codes:**
- `201`: Created successfully
- `400`: Validation error

---

### PATCH /api/issues/:id

Update an issue (Admin only).

**Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Assigned to maintenance team"
}
```

**Optional Fields:**
- `status` (string): One of `open`, `in_progress`, `resolved`
- `notes` (string): Admin notes

**Response:**
```json
{
  "id": 1,
  "title": "Pothole on Main Street",
  "description": "Large pothole near the intersection",
  "category": "Roads",
  "location_lat": 40.7128,
  "location_lng": -74.006,
  "images": [],
  "contact_name": "John Doe",
  "contact_phone": "+1234567890",
  "status": "in_progress",
  "created_at": "2024-01-15T10:30:00Z",
  "notes": "Assigned to maintenance team"
}
```

**Status Codes:**
- `200`: Updated successfully
- `401`: Unauthorized (missing or invalid admin token)
- `404`: Issue not found

---

### GET /api/issues/export.csv

Export all issues as CSV (Admin only).

**Response:**
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename=issues-export.csv`

**Status Codes:**
- `200`: CSV file
- `401`: Unauthorized (missing or invalid admin token)

---

### GET /api/issues/:id/image/:index

Get an image from an issue.

**Path Parameters:**
- `id`: Issue ID
- `index`: Image index (0-based)

**Response:**
- Content-Type: Image MIME type (e.g., `image/jpeg`)
- Body: Image binary data

**Status Codes:**
- `200`: Image data
- `404`: Issue or image not found

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "message": "Optional detailed message"
}
```

**Common Status Codes:**
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing authentication)
- `403`: Forbidden (invalid token)
- `404`: Not Found
- `500`: Internal Server Error




