'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

interface NextStepHintsProps {
  fileId: string
}

export function NextStepHints({ fileId }: NextStepHintsProps) {
  const [hints, setHints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    hintText: '',
    actionType: 'review',
    priority: '1',
  })

  useEffect(() => {
    fetchHints()
  }, [fileId])

  const fetchHints = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/hints?fileId=${fileId}`)
      if (response.ok) {
        const data = await response.json()
        setHints(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching hints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.hintText.trim()) {
      toast.error('Hint text is required')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/hints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId,
          hintText: formData.hintText,
          actionType: formData.actionType,
          priority: parseInt(formData.priority),
        }),
      })

      if (!response.ok) throw new Error('Failed to create hint')

      toast.success('Hint created successfully!')
      setCreateOpen(false)
      setFormData({ hintText: '', actionType: 'review', priority: '1' })
      fetchHints()
    } catch (error) {
      console.error('Create error:', error)
      toast.error('Failed to create hint')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/hints/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete hint')

      toast.success('Hint deleted successfully!')
      fetchHints()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete hint')
    }
  }

  const getActionBadgeVariant = (actionType: string) => {
    const variants: Record<string, any> = {
      sign: 'destructive',
      review: 'default',
      approve: 'secondary',
      comment: 'outline',
    }
    return variants[actionType] || 'default'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Next Steps
            </CardTitle>
            <CardDescription>
              Action items and hints for this document
            </CardDescription>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Hint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Next Step Hint</DialogTitle>
                <DialogDescription>
                  Create an action item or hint for this document
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Hint Text</Label>
                  <Input
                    placeholder="e.g., Please review and sign by Friday"
                    value={formData.hintText}
                    onChange={(e) =>
                      setFormData({ ...formData, hintText: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select
                    value={formData.actionType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, actionType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="sign">Sign</SelectItem>
                      <SelectItem value="approve">Approve</SelectItem>
                      <SelectItem value="comment">Comment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Low</SelectItem>
                      <SelectItem value="2">Medium</SelectItem>
                      <SelectItem value="3">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
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
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : hints.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No next steps yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {hints.map((hint) => (
              <div
                key={hint.id}
                className="flex items-start justify-between p-3 border rounded-lg bg-muted/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getActionBadgeVariant(hint.actionType)}>
                      {hint.actionType}
                    </Badge>
                    {hint.priority === 3 && (
                      <Badge variant="destructive">High Priority</Badge>
                    )}
                  </div>
                  <p className="text-sm">{hint.hintText}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Added by {hint.creator.name || hint.creator.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(hint.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

