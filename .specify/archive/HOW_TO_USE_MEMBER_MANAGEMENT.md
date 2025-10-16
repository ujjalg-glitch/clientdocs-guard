# 👥 How to Use Member Management in Client Groups

## Overview
You can now fully manage members in your client groups! This feature allows you to add users to groups and remove them as needed.

## Step-by-Step Guide

### 1. Access Client Groups
1. Log in to your admin panel
2. Click **"Client Groups"** in the sidebar
3. You'll see a list of all your client groups

### 2. Create a Client Group (If Needed)
1. Click the **"Create Group"** button
2. Enter:
   - **Group Name**: e.g., "Premium Clients"
   - **Description**: e.g., "High-value clients with priority access"
3. Click **"Create"**

### 3. Manage Members
1. Find the group you want to manage
2. Click the **Users icon (👥)** in the Actions column
3. A dialog will open showing:
   - **Add Member** section at the top
   - **Current Members** list below

### 4. Add a Member
1. In the "Add Member" section:
   - Click the dropdown to see available users
   - Select a user from the list
   - Click **"Add"** button
2. The user will be added immediately
3. You'll see a success message
4. The member will appear in the "Current Members" list

### 5. View Members
The "Current Members" section shows:
- **User Name** and **Email**
- **Role** (typically "member")
- **Joined Date** - when they were added to the group
- **Remove button** (X icon)

### 6. Remove a Member
1. Find the member in the "Current Members" list
2. Click the **X button** in their row
3. Confirm the removal
4. The member will be removed immediately

### 7. Use Groups When Sharing Files
1. Go to **"My Files"** in the dashboard
2. Click **"Share"** on any file
3. In the share dialog:
   - You'll see a **"Share with Group"** dropdown
   - Select the group you created
   - All members of that group will have access to the share link

## Visual Guide

```
Client Groups Page
├── Group List Table
│   ├── Name
│   ├── Description
│   ├── Members Count (shows number)
│   ├── Shares Count
│   ├── Created Date
│   └── Actions
│       ├── 👥 Manage Members ← Click this!
│       └── 🗑️ Delete Group
│
└── Manage Members Dialog (opens when you click 👥)
    ├── Add Member Section
    │   ├── User Dropdown (shows all available users)
    │   └── Add Button
    │
    └── Current Members List
        └── For each member:
            ├── Name & Email
            ├── Role Badge
            ├── Joined Date
            └── ❌ Remove Button
```

## Features

### ✅ What You Can Do
- Create unlimited client groups
- Add multiple users to each group
- Remove users from groups
- See who's in each group
- See when members joined
- Share files with entire groups
- Track group activity

### 🔐 Security
- Only group owners can add/remove members
- All actions are logged
- Database-level security with RLS policies
- Member changes are tracked

## Common Use Cases

### Use Case 1: Premium Clients
```
Group: "Premium Clients"
Members: john@company.com, jane@corp.com, bob@business.com
Usage: Share high-value deliverables only with premium clients
```

### Use Case 2: Project Teams
```
Group: "Project Alpha Team"
Members: All stakeholders for Project Alpha
Usage: Share project-specific documents
```

### Use Case 3: Department Access
```
Group: "Legal Department"
Members: All legal team members
Usage: Share legal documents and contracts
```

## Troubleshooting

### Problem: No users appear in the dropdown
**Solution**: 
- Make sure you have created users in your system
- Check that users are properly registered in Supabase Auth
- Try refreshing the page

### Problem: Can't remove a member
**Solution**:
- Make sure you're the group owner
- Check your internet connection
- Try refreshing the page and trying again

### Problem: Member count doesn't update
**Solution**:
- Refresh the page
- The count updates automatically when you add/remove members
- Check browser console for any errors

## API Endpoints Used

- **GET** `/api/admin/users` - Fetch available users
- **GET** `/api/client-groups` - Fetch all groups
- **POST** `/api/client-groups/{id}/members` - Add member
- **DELETE** `/api/client-groups/{id}/members` - Remove member

## Database Tables

### client_groups
Stores group information

### group_members
Stores member relationships with:
- `group_id` - The group they belong to
- `user_id` - The user's ID
- `role` - Their role (default: "member")
- `joined_at` - When they joined

## Tips & Best Practices

1. **Organize by Purpose**: Create groups based on client type, project, or department
2. **Regular Cleanup**: Remove inactive members periodically
3. **Clear Names**: Use descriptive group names
4. **Add Descriptions**: Help future you remember what the group is for
5. **Monitor Activity**: Check the shares count to see how active each group is

## Next Steps

After setting up your groups:
1. Upload documents
2. Share them with specific groups
3. Track engagement in Analytics
4. Adjust group membership as needed

---

**You're all set!** Start organizing your clients into groups for easier document sharing. 🎉
