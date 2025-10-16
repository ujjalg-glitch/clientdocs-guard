import OpenAI from 'openai'

// Initialize OpenRouter client
const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'ClientDocs Guard',
  },
})

export interface DocumentAnalysisResult {
  summary: string
  keyPoints: string[]
  sentiment?: 'positive' | 'negative' | 'neutral'
  categories?: string[]
}

/**
 * Analyze document content using AI
 */
export async function analyzeDocument(
  content: string,
  options?: {
    model?: string
    includeKeyPoints?: boolean
    includeSentiment?: boolean
    includeCategories?: boolean
  }
): Promise<DocumentAnalysisResult> {
  const {
    model = 'anthropic/claude-3.5-sonnet',
    includeKeyPoints = true,
    includeSentiment = false,
    includeCategories = false,
  } = options || {}

  const prompt = `Analyze the following document and provide:
1. A concise summary (2-3 sentences)
${includeKeyPoints ? '2. Key points (bullet list)' : ''}
${includeSentiment ? '3. Overall sentiment (positive/negative/neutral)' : ''}
${includeCategories ? '4. Document categories/tags' : ''}

Document content:
${content}

Please format your response as JSON with the following structure:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "sentiment": "...",
  "categories": ["...", "..."]
}`

  const completion = await openrouter.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const response = completion.choices[0]?.message?.content
  if (!response) {
    throw new Error('No response from AI')
  }

  return JSON.parse(response)
}

/**
 * Extract specific information from document
 */
export async function extractInformation(
  content: string,
  query: string,
  model: string = 'anthropic/claude-3.5-sonnet'
): Promise<string> {
  const prompt = `Given the following document, answer this question: "${query}"

Document:
${content}

Please provide a concise and accurate answer based only on the information in the document.`

  const completion = await openrouter.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
  })

  return completion.choices[0]?.message?.content || 'No answer found'
}

/**
 * Generate document summary
 */
export async function summarizeDocument(
  content: string,
  maxLength: number = 200,
  model: string = 'anthropic/claude-3.5-sonnet'
): Promise<string> {
  const prompt = `Summarize the following document in approximately ${maxLength} words:

${content}

Summary:`

  const completion = await openrouter.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: Math.ceil(maxLength * 1.5),
  })

  return completion.choices[0]?.message?.content || 'Summary unavailable'
}

/**
 * Compare two documents
 */
export async function compareDocuments(
  doc1: string,
  doc2: string,
  model: string = 'anthropic/claude-3.5-sonnet'
): Promise<{
  similarities: string[]
  differences: string[]
  conclusion: string
}> {
  const prompt = `Compare the following two documents and identify:
1. Key similarities
2. Key differences
3. Overall conclusion

Document 1:
${doc1}

Document 2:
${doc2}

Format as JSON:
{
  "similarities": ["...", "..."],
  "differences": ["...", "..."],
  "conclusion": "..."
}`

  const completion = await openrouter.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const response = completion.choices[0]?.message?.content
  if (!response) {
    throw new Error('No response from AI')
  }

  return JSON.parse(response)
}

/**
 * Extract text from PDF for AI processing
 * Note: You'll need to convert PDF to text first using pdf-parse or similar
 */
export async function generateDocumentQA(
  content: string,
  model: string = 'anthropic/claude-3.5-sonnet'
): Promise<{ question: string; answer: string }[]> {
  const prompt = `Based on the following document, generate 5 important questions and their answers that would help someone understand the key information:

${content}

Format as JSON array:
[
  {"question": "...", "answer": "..."},
  ...
]`

  const completion = await openrouter.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const response = completion.choices[0]?.message?.content
  if (!response) {
    throw new Error('No response from AI')
  }

  const parsed = JSON.parse(response)
  return parsed.questions || []
}

/**
 * Chat with document
 */
export async function chatWithDocument(
  documentContent: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  model: string = 'anthropic/claude-3.5-sonnet'
): Promise<string> {
  const systemPrompt = `You are an AI assistant helping users understand and analyze documents. 
Here is the document content for reference:

${documentContent}

Answer questions about this document accurately and concisely.`

  const completion = await openrouter.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  })

  return completion.choices[0]?.message?.content || 'No response'
}

/**
 * Get available models
 */
export async function getAvailableModels() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    })
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching models:', error)
    return []
  }
}

