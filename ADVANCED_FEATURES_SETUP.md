# Advanced Features Setup Guide

All advanced document sharing and analytics features have been implemented! This guide will help you set them up.

## 🎉 Features Implemented

### ✅ **Core Features**
1. **Deliverable Sharing** - Share documents with secure links
2. **Signed URLs** - Time-limited, secure access tokens
3. **Link Expiry** - Auto-expiring share links (7, 30, 90 days, etc.)
4. **Client Groups** - Organize clients for easy bulk sharing
5. **Access Logs** - Track every view, download, and action
6. **View Analytics** - Real-time insights on document engagement
7. **Watermarked PDF Viewer** - Display PDFs with custom watermarks
8. **File Q&A** - AI-powered chat to answer questions about documents
9. **Explain-to-Client** - Generate client-friendly document explanations
10. **Next-Step Hints** - Action items and reminders for documents

## 📋 Setup Steps

### Step 1: Install Required Dependencies

```bash
npm install nanoid
```

### Step 2: Update Database Schema

Run the Prisma migration to add all new tables:

```bash
npx prisma migrate dev --name add_advanced_features
```

Or manually run the SQL if using Supabase directly (see `MIGRATION.sql` file).

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Environment Variables

Make sure you have these in your `.env`:

```env
# OpenRouter API for AI features
OPENROUTER_API_KEY=your_openrouter_key_here

# App URL for share links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Update Navigation

Add these new pages to your admin navigation:

```typescript
// In your navigation config
{
  title: "Client Groups",
  href: "/admin/client-groups",
  icon: Users,
},
{
  title: "Analytics",
  href: "/admin/analytics",
  icon: BarChart3,
}
```

## 🚀 How to Use Each Feature

### 1. **Document Sharing with Signed URLs**

**From Files Page:**
- Click the Share icon (🔗) next to any file
- Configure:
  - Expiry time (1, 7, 30, 90 days, or never)
  - Client group (optional)
  - Max downloads
  - Watermark (on/off)
  - View-only mode
- Copy the generated link
- Share with clients

**Access Shared Document:**
- Recipients visit: `https://yourapp.com/share/{token}`
- They can view, download (if allowed), and interact with the document
- All access is logged automatically

### 2. **File Upload with Watermark & Expiry**

**Upload Page (`/dashboard/upload`):**
- Select file
- Toggle "Enable Watermark" and enter text (e.g., "CONFIDENTIAL")
- Select auto-delete period (optional)
- Upload

The watermark will be visible when documents are shared.

### 3. **Client Groups Management**

**Create Groups (`/admin/client-groups`):**
```
Click "Create Group"
→ Enter name and description
→ Add members
→ Use in sharing dialog
```

**Benefits:**
- Share documents with entire groups at once
- Organize clients by project, company, or category
- Track group-level analytics

### 4. **View Analytics**

**Overall Analytics (`/admin/analytics`):**
- Total files, views, downloads, shares
- Top performing files
- Recent activity log
- IP tracking for security

**File-Specific Analytics:**
- Click analytics icon (📊) on any file
- See detailed metrics:
  - Views over time
  - Download counts
  - Unique visitors
  - Access patterns

### 5. **File Q&A Chat**

**On Shared Document Page:**
- Tab: "Q&A"
- Ask questions like:
  - "What is this document about?"
  - "Summarize the key points"
  - "What are the deadlines mentioned?"
- AI analyzes the document and responds

### 6. **Explain-to-Client**

**From Files Page:**
- Click message icon (💬) next to file
- Click "Generate Explanation"
- AI creates a client-friendly summary with:
  - What the document is
  - Why it's important
  - Key actions needed
  - Next steps
- Copy and send to client

### 7. **Next-Step Hints**

**On Shared Document Page:**
- Tab: "Next Steps"
- Add hints like:
  - "Please sign by Friday"
  - "Review section 3 carefully"
  - "Approval needed from legal team"
- Set priority (Low/Medium/High)
- Set action type (Review/Sign/Approve/Comment)

### 8. **Access Logs**

**Automatic Tracking:**
All actions are logged:
- Document views
- Downloads
- Share link creation
- Comments

**View Logs:**
- In analytics dashboard
- See IP addresses, user agents, timestamps
- Export for compliance/auditing

## 📁 New API Endpoints

All API routes are ready to use:

```
POST   /api/shares              - Create share link
GET    /api/shares              - List all shares
PATCH  /api/shares/[id]         - Update share
DELETE /api/shares/[id]         - Deactivate share
GET    /api/shares/access/[token] - Access shared doc

POST   /api/client-groups       - Create group
GET    /api/client-groups       - List groups
PATCH  /api/client-groups/[id]  - Update group
DELETE /api/client-groups/[id]  - Delete group
POST   /api/client-groups/[id]/members - Add member
DELETE /api/client-groups/[id]/members - Remove member

GET    /api/analytics           - Get analytics
POST   /api/analytics/log       - Log action

POST   /api/hints               - Create hint
GET    /api/hints               - Get hints
PATCH  /api/hints/[id]          - Update hint
DELETE /api/hints/[id]          - Delete hint

POST   /api/files/[id]/comments - Add comment
GET    /api/files/[id]/comments - Get comments
```

## 🎨 New Components

All UI components are ready:

```typescript
// Share dialog
<ShareDialog fileId={id} fileName={name} />

// Watermarked PDF viewer
<WatermarkedPDFViewer 
  url={url} 
  watermarkText="CONFIDENTIAL"
  allowDownload={true}
/>

// File Q&A chat
<FileQAChat 
  fileId={id}
  fileName={name}
  documentContent={content}
/>

// Explain to client
<ExplainToClient 
  fileId={id}
  fileName={name}
  documentContent={content}
/>

// Next step hints
<NextStepHints fileId={id} />
```

## 📊 Database Tables Added

All tables have been added to the Prisma schema:

- `DocumentShare` - Share links and access control
- `ClientGroup` - Client organization
- `GroupMember` - Group membership
- `AccessLog` - Activity tracking
- `DocumentComment` - Q&A and comments
- `NextStepHint` - Action items

## 🔐 Security Features

- **Signed URLs**: Secure token-based access
- **Expiration**: Time-limited access
- **Download Limits**: Max download enforcement
- **View-Only Mode**: Prevent downloads
- **IP Tracking**: Security monitoring
- **Watermarks**: Visual document protection
- **Access Logs**: Full audit trail

## 🎯 Next Steps

1. Run database migration
2. Install dependencies
3. Test file upload with watermark
4. Create a share link
5. Test the shared document page
6. Create a client group
7. View analytics dashboard

## 💡 Tips

- Enable watermarks for sensitive documents
- Use expiry dates for temporary access
- Create client groups for recurring collaborations
- Check analytics regularly for engagement insights
- Use "Explain-to-Client" for complex documents
- Add next-step hints to guide clients

## 🐛 Troubleshooting

**Share links not working?**
- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Ensure token hasn't expired

**AI features not working?**
- Verify `OPENROUTER_API_KEY` is set
- Check API key has credits

**Analytics not showing?**
- Views/downloads only track after share links are used
- Direct file access doesn't increment counters

**Watermarks not visible?**
- Only works with PDF files
- Check watermark text is not empty
- Verify `watermark_enabled` is true in share

## 📝 License

All features are part of your existing project license.

