# mobileocrweb 
This website is designed for business card scanning.

## System Architecture

### Overview
This is a Progressive Web Application (PWA) for scanning and managing business cards at trade shows and exhibitions. The system uses OCR (Optical Character Recognition) to extract information from business card images and syncs data to Firebase cloud storage.

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **OCR Engine**: Azure Vision API
- **Cloud Storage**: Firebase Firestore & Firebase Storage
- **Data Export**: SheetJS (xlsx) for Excel generation
- **Image Processing**: HEIC2ANY for image format conversion
- **UI Framework**: Material Icons

### Core Modules

#### 1. **app.js** - Main Application Logic
- Image upload and preview
- OCR processing via Azure Vision API
- Business card data extraction and parsing
- Form management and validation
- Local storage management

#### 2. **translations.js** - Multi-language Support
- Supports 7 languages: English, German, Dutch, Japanese, Korean, Simplified Chinese, Traditional Chinese
- Dynamic UI text updating based on language selection
- Translation keys for all UI elements

#### 3. **syncCloud.js** - Cloud Synchronization
- Manages Firebase Firestore sync operations
- Tracks synced/unsynced records
- Batch upload to cloud storage
- Real-time sync status monitoring
- User identity and exhibition tracking

#### 4. **scanHistory.js** - History Management
- Display scan history in popup dialog
- Statistics tracking (total, synced, unsynced)
- Time-based formatting (relative time display)
- Local storage persistence

#### 5. **initDialog.js** - User Setup
- Initial user configuration dialog
- Office and tradeshow selection
- User name input and validation
- User identity generation (Office + Name format)

#### 6. **firebaseExport.js** - Cloud Export
- Download Excel reports from Firebase
- Filter data by exhibition and user
- Generate formatted Excel files with all business card data

#### 7. **adminVerification.js** - Admin Access
- Admin user authentication
- Employee ID verification (TSID format)
- Secure access to admin features

#### 8. **ocrKeywords.js** - OCR Enhancement
- Keyword mapping for better OCR accuracy
- Field-specific pattern matching
- Data normalization and cleaning

### Data Flow

```
1. User Setup
   └─> initDialog.js → localStorage (userIdentity, userOffice, exhibitionId)

2. Image Capture
   └─> app.js → Camera/File Input → HEIC Conversion → Preview

3. OCR Processing
   └─> Google Cloud Vision API → app.js → ocrKeywords.js → Form Fields

4. Data Storage
   └─> app.js → localStorage (businessCardHistory)

5. Cloud Sync
   └─> syncCloud.js → Firebase Firestore (exhibition_cards collection)

6. Export
   └─> firebaseExport.js → Firebase Query → Excel Generation
```

### Key Features

1. **Multi-language Support**: 7 languages with complete UI translation
2. **Offline Capability**: Local storage for offline scanning
3. **Cloud Sync**: Automatic/manual sync to Firebase
4. **History Tracking**: View scan history with sync status
5. **Admin Panel**: Secure admin access for data management
6. **Excel Export**: Generate Excel reports from local or cloud data
7. **Exhibition Tracking**: Associate scans with specific trade shows
8. **User Identity**: Track who scanned each card

### Storage Structure

#### LocalStorage
```javascript
{
  "userSetupComplete": "true",
  "userIdentity": "TW-John",
  "userOffice": "TW",
  "userRealName": "John",
  "exhibitionId": "2026event",
  "businessCardHistory": [
    {
      "name": "...",
      "company": "...",
      "email": "...",
      "timestamp": 1234567890,
      "synced": true,
      "cloudId": "firebase-doc-id"
    }
  ]
}
```

#### Firebase Firestore Collection: `exhibition_cards`
```javascript
{
  "name": "Contact Name",
  "companyName": "Company Name",
  "companyAddress": "Address",
  "companyWebsite": "URL",
  "jobTitle": "Job Title",
  "department": "Department",
  "phone": "Phone Number",
  "mobile": "Mobile Number",
  "fax": "Fax Number",
  "email": "Email Address",
  "taxId": "Tax ID",
  "note": "Notes",
  "scannedBy": "John",
  "scannedByOffice": "TW",
  "exhibitionId": "2026event",
  "scannedAt": Timestamp
}
```



