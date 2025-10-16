'use client'

import { useState, useEffect } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { AdminShell } from '@/components/admin/shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, Plus, Trash2, Edit, Loader2, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function ClientGroupsPage() {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [manageMembersOpen, setManageMembersOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [addingMember, setAddingMember] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [creatingUser, setCreatingUser] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/client-groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/client-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create group')

      toast.success('Group created successfully!')
      setCreateOpen(false)
      setFormData({ name: '', description: '' })
      fetchGroups()
    } catch (error) {
      console.error('Create error:', error)
      toast.error('Failed to create group')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      const response = await fetch(`/api/client-groups/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete group')

      toast.success('Group deleted successfully!')
      fetchGroups()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete group')
    }
  }

  const openManageMembers = async (group: any) => {
    setSelectedGroup(group)
    setManageMembersOpen(true)
    await fetchAvailableUsers()
  }

  const fetchAvailableUsers = async () => {
    try {
      // Fetch users from the client-groups users API
      const response = await fetch('/api/client-groups/users')
      if (response.ok) {
        const result = await response.json()
        const users = result.data || []
        console.log('Fetched users:', users) // Debug log
        setAvailableUsers(users)
        
        if (users.length === 0) {
          toast.info('No users found. Create some users first.')
        }
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        toast.error(`Failed to load users: ${errorData.error || 'Unknown error'}`)
        
        // Fallback: just show current user
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setAvailableUsers([{
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email || '',
          }])
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    }
  }

  const handleAddMember = async () => {
    if (!selectedUserId || !selectedGroup) return

    setAddingMember(true)
    try {
      const response = await fetch(`/api/client-groups/${selectedGroup.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add member')
      }

      const result = await response.json()
      toast.success('Member added successfully!')
      setSelectedUserId('')
      
      // Refresh group data to get updated member list
      await fetchGroups()
      
      // Update selected group with fresh data from the API
      const freshResponse = await fetch('/api/client-groups')
      if (freshResponse.ok) {
        const freshData = await freshResponse.json()
        const updatedGroup = freshData.data.find((g: any) => g.id === selectedGroup.id)
        if (updatedGroup) {
          setSelectedGroup(updatedGroup)
        }
      }
    } catch (error) {
      console.error('Add member error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add member')
    } finally {
      setAddingMember(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedGroup) return
    if (!confirm('Remove this member from the group?')) return

    try {
      const response = await fetch(`/api/client-groups/${selectedGroup.id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove member')
      }

      toast.success('Member removed successfully!')
      
      // Refresh group data
      await fetchGroups()
      
      // Update selected group with fresh data
      const freshResponse = await fetch('/api/client-groups')
      if (freshResponse.ok) {
        const freshData = await freshResponse.json()
        const updatedGroup = freshData.data.find((g: any) => g.id === selectedGroup.id)
        if (updatedGroup) {
          setSelectedGroup(updatedGroup)
        }
      }
    } catch (error) {
      console.error('Remove member error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    }
  }

  const handleCreateTestUser = async () => {
    if (!newUserEmail.trim()) {
      toast.error('Email is required')
      return
    }

    setCreatingUser(true)
    try {
      const response = await fetch('/api/client-groups/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          name: newUserName || newUserEmail,
        }),
      })

      if (!response.ok) throw new Error('Failed to create user')

      toast.success('Test user created!')
      setNewUserEmail('')
      setNewUserName('')
      setShowAddUser(false)
      
      // Refresh users list
      await fetchAvailableUsers()
    } catch (error) {
      console.error('Create user error:', error)
      toast.error('Failed to create test user')
    } finally {
      setCreatingUser(false)
    }
  }

  return (
    <AdminShell>
      <AdminHeader
        heading="Client Groups"
        description="Organize clients into groups for easier sharing"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Groups</CardTitle>
              <CardDescription>
                Manage your client groups and members
              </CardDescription>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Client Group</DialogTitle>
                  <DialogDescription>
                    Create a new group to organize your clients
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Group Name</Label>
                    <Input
                      placeholder="e.g., Premium Clients"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      placeholder="Description of this group..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No groups yet. Create one to get started!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell>{group.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {group._count?.members || 0} members
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {group._count?.shares || 0} shares
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {group.created_at ? new Date(group.created_at).toLocaleDateString() : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openManageMembers(group)}
                          title="Manage Members"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(group.id)}
                          title="Delete Group"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Manage Members Dialog */}
      <Dialog open={manageMembersOpen} onOpenChange={setManageMembersOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Members - {selectedGroup?.name}</DialogTitle>
            <DialogDescription>
              Add or remove members from this group
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Add Test User Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Quick Add Test User
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddUser(!showAddUser)}
                >
                  {showAddUser ? 'Hide' : 'Add User'}
                </Button>
              </div>
              
              {showAddUser && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      placeholder="client@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name (Optional)</Label>
                    <Input
                      placeholder="Client Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleCreateTestUser}
                    disabled={!newUserEmail.trim() || creatingUser}
                    size="sm"
                  >
                    {creatingUser && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Create Test User
                  </Button>
                </div>
              )}
            </div>

            {/* Add Member Section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member to Group
              </h3>
              <div className="flex gap-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.length === 0 ? (
                      <SelectItem value="no-users" disabled>
                        No users available. Create a test user above.
                      </SelectItem>
                    ) : (
                      availableUsers
                        .filter(
                          (user) =>
                            !selectedGroup?.group_members?.some(
                              (m: any) => m.user_id === user.id
                            )
                        )
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUserId || selectedUserId === 'no-users' || addingMember}
                >
                  {addingMember && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Add to Group
                </Button>
              </div>
            </div>

            {/* Current Members Section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Current Members ({selectedGroup?.group_members?.length || 0})
              </h3>
              {!selectedGroup?.group_members ||
              selectedGroup.group_members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No members yet</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedGroup.group_members.map((member: any) => {
                        const user = availableUsers.find(
                          (u) => u.id === member.user_id
                        )
                        console.log('Member data:', member) // Debug log
                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {user?.name || 'Unknown User'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {user?.email || member.user_id}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{member.role}</Badge>
                            </TableCell>
                            <TableCell>
                              {member.joined_at
                                ? new Date(member.joined_at).toLocaleDateString()
                                : 'Just now'}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setManageMembersOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}

