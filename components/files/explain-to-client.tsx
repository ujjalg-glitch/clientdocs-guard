'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { MessageSquare, Loader2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ExplainToClientProps {
  fileId: string
  fileName: string
  documentContent: string
  trigger?: React.ReactNode
}

export function ExplainToClient({
  fileId,
  fileName,
  documentContent,
  trigger,
}: ExplainToClientProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [copied, setCopied] = useState(false)

  const generateExplanation = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentContent,
          messages: [
            {
              role: 'user',
              content: `Please provide a clear, simple explanation of this document that I can share with a client. Focus on:
1. What this document is about
2. Why it's important
3. Key actions they need to take (if any)
4. Next steps

Keep it professional but easy to understand for someone without technical knowledge.`,
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate explanation')
      }

      const data = await response.json()
      setExplanation(data.response)
    } catch (error) {
      console.error('Explanation error:', error)
      toast.error('Failed to generate explanation')
    } finally {
      setLoading(false)
    }
  }

  const copyExplanation = () => {
    navigator.clipboard.writeText(explanation)
    setCopied(true)
    toast.success('Explanation copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Explain to Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Explain Document to Client</DialogTitle>
          <DialogDescription>
            Generate a client-friendly explanation for "{fileName}"
          </DialogDescription>
        </DialogHeader>

        {!explanation ? (
          <div className="py-6">
            <p className="text-sm text-muted-foreground mb-4">
              AI will analyze your document and create a clear, professional
              explanation that you can share with your client.
            </p>
            <Button onClick={generateExplanation} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating explanation...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Generate Explanation
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="p-4 bg-muted">
              <div className="whitespace-pre-wrap text-sm">{explanation}</div>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyExplanation}
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setExplanation('')
                  generateExplanation()
                }}
              >
                Regenerate
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

