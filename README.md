# DeSaka - Environmental Monitoring System

<div align="center">

![DeSaka Logo](./public/favicon.ico)

_Advanced IoT-based environmental monitoring solution for agriculture and environmental science_

</div>

## 📋 Project Overview

DeSaka is a comprehensive environmental monitoring system that collects, processes, and visualizes data from various sensors. The system provides real-time insights into soil and air conditions, enabling data-driven decision making for agricultural and environmental applications.

## 🏗️ System Architecture

![Example Image](./github/example.png)

DeSaka uses a simplified architecture where the ESP32 communicates directly with the web client, eliminating the need for a separate server. Data is stored locally on the client, making the system more efficient and easier to deploy in remote locations.

## API References

This document provides an overview of the API endpoints available in the Google Drive integration server.

### Base URL

```
https://desaka-api.vercel.app
```

### Authentication

The server uses Google Service Account credentials for authentication with Google Drive API. The credentials are provided as a base64-encoded JSON string through the `GOOGLE_SERVICE_ACCOUNT_BASE64` environment variable.

### Environment Variables

- `PORT`: Server port (defaults to 3000)
- `GOOGLE_SERVICE_ACCOUNT_BASE64`: Base64-encoded Google Service Account credentials
- `GOOGLE_FOLDER_ID`: ID of the Google Drive folder to access

### Endpoints

#### GET /files

- **Description**: List all files in the specified Google Drive folder.
- **Response**: Array of file metadata including `id`, `name`, `mimeType`, and `modifiedTime`.

**Example Response:**

```json
{
  "files": [
    {
      "id": "1abc123def456",
      "name": "sensor_data.json",
      "mimeType": "application/json",
      "modifiedTime": "2023-11-15T10:30:00.000Z"
    },
    {
      "id": "2xyz789uvw321",
      "name": "air_quality.json",
      "mimeType": "application/json",
      "modifiedTime": "2023-11-15T11:15:00.000Z"
    }
  ]
}
```

#### GET /file/:id

- **Description**: Stream the contents of a JSON file by file ID.
- **Parameters**:
  - `id` (string): Google Drive file ID.
- **Response**: Streams the JSON content of the file.

**Example Request:**

```
GET /file/1abc123def456
```

#### POST /file/:id

- **Description**: Append new time-value entries to specific sensor histories in a JSON file.
- **Parameters**:
  - `id` (string): Google Drive file ID.
- **Body**: One or more keys (e.g., "pm25") with { time, value } to append.
- **Response**: Status message indicating success.

**Example Request:**

```json
POST /file/1abc123def456
Content-Type: application/json

{
  "temperature": {
    "time": "2023-11-15T11:00:00",
    "value": 25.1
  },
  "humidity": {
    "time": "2023-11-15T11:00:00",
    "value": 46
  }
}
```

**Example Response:**

```json
{
  "status": "appended"
}
```

**Error Response (400):**

```json
{
  "error": "Key 'temperature' does not exist or has no history array"
}
```

### Error Handling

All endpoints return a JSON object with an `error` field in case of an error. The server uses a global error handler to catch and format errors.

**Example Error Response (500):**

```json
{
  "error": "Error message details"
}
```

### JSON Data Format for Sensors

When working with this API, you need to format your sensor data according to the following specifications.

#### Sensor Data Format

```json
{
  "temperature": {
    "unit": "°C",
    "history": [
      { "time": "2023-11-15T08:00:00", "value": 23.8 },
      { "time": "2023-11-15T09:00:00", "value": 24.2 },
      { "time": "2023-11-15T10:00:00", "value": 24.5 }
    ]
  },
  "humidity": {
    "unit": "%",
    "history": [
      { "time": "2023-11-15T08:00:00", "value": 44 },
      { "time": "2023-11-15T09:00:00", "value": 45 },
      { "time": "2023-11-15T10:00:00", "value": 45 }
    ]
  }
}
```

#### Appending Data

When using the POST /file/:id endpoint to append data, ensure that:

1. The key you're appending to already exists in the file
2. The key has a `history` array
3. Your request includes both `time` (string) and `value` (any type) fields

**Example of Appending Multiple Sensor Values:**

```json
{
  "temperature": {
    "time": "2023-11-15T11:00:00",
    "value": 25.1
  },
  "humidity": {
    "time": "2023-11-15T11:00:00",
    "value": 46
  }
}
```
