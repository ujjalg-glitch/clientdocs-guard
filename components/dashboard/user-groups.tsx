'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, User } from 'lucide-react'

interface UserGroup {
  id: string
  name: string
  description: string
  role: string
  joinedAt: string
  createdAt: string
  creator: {
    id: string
    email: string
    user_metadata: any
  }
}

export function UserGroups() {
  const [groups, setGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserGroups()
  }, [])

  const fetchUserGroups = async () => {
    try {
      setError(null)
      console.log('Fetching user groups...')
      const response = await fetch('/api/user/groups')
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Groups data:', data)
        setGroups(data.data || [])
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData)
        setError(errorData.error || 'Failed to fetch groups')
      }
    } catch (error) {
      console.error('Error fetching user groups:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Groups
          </CardTitle>
          <CardDescription>Groups you're a member of</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading groups...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          My Groups ({groups.length})
        </CardTitle>
        <CardDescription>Groups you're a member of</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Debug information */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
          <p><strong>🔍 Debug Info:</strong></p>
          <p>Loading: {loading.toString()}</p>
          <p>Groups count: {groups.length}</p>
          <p>Error: {error || 'None'}</p>
          <p>Groups data: {JSON.stringify(groups, null, 2)}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <strong>Error:</strong> {error}
          </div>
        )}

        {groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No group memberships yet</p>
            <p className="text-sm mt-2">You'll see groups here when you're added to them</p>
            <p className="text-xs mt-2 text-red-600">
              Check debug info above and browser console for details
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{group.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {group.role}
                      </Badge>
                    </div>
                    {group.description && (
                      <p className="text-sm text-muted-foreground">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>
                          Created by {group.creator.user_metadata?.name || group.creator.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {formatDate(group.joinedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
