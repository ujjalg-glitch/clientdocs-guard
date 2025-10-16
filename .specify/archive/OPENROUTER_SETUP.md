# 🔑 OpenRouter API Key Setup Guide

## ⚠️ **THIS IS OPTIONAL!**

**Your app works perfectly without OpenRouter!** Only set this up if you want AI-powered features like document chat and automatic summarization.

---

## 🎯 What You Get With OpenRouter

### AI Features (With API Key):
- 💬 Chat with your documents
- 📝 Automatic document summarization
- 🔍 Smart question answering
- 📊 Document analysis and insights
- 🔄 Compare multiple documents
- ❓ Auto-generate Q&A from documents

### Without API Key (Still Available):
- ✅ All PDF viewing and editing features
- ✅ File upload and management
- ✅ User authentication
- ✅ Admin dashboard
- ✅ PDF watermarking, merging, rotation
- ✅ Everything except AI features

---

## 📝 Step-by-Step Setup

### Step 1: Visit OpenRouter

Go to: **https://openrouter.ai/**

```
┌─────────────────────────────────────┐
│  OpenRouter                         │
│  AI Models at Your Fingertips       │
│                                     │
│  [Sign Up]  [Sign In]              │
└─────────────────────────────────────┘
```

---

### Step 2: Create Account

1. Click **"Sign Up"** or **"Sign In"**
2. You can use:
   - Google account
   - GitHub account
   - Email & password

---

### Step 3: Get Free Credits

- New accounts get **$1-5 in free credits**
- Perfect for testing the features
- AI calls are cheap (usually $0.001-0.01 per request)

---

### Step 4: Create API Key

1. **Click on your profile** (top right corner)
2. Select **"Keys"** or **"API Keys"** from the dropdown
3. Click **"Create Key"** button
4. Give it a name: `ClientDocs Guard`
5. **Copy the key** immediately (you won't see it again!)

```
Your API key will look like:
sk-or-v1-1234567890abcdefghijklmnopqrstuvwxyz...
```

---

### Step 5: Add to Your .env File

1. Open your `.env` file in the project
2. Add this line:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

**Example:**
```env
# Environment Variables for the browser
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ... other variables ...

# OpenRouter AI (Optional)
OPENROUTER_API_KEY=sk-or-v1-1234567890abcdefghijklmnopqrstuvwxyz
```

3. **Save the file**
4. **Restart your dev server**

```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

---

## 🧪 Test the AI Features

Once set up, you can test:

### 1. Document Analysis
- Go to `/admin/upload`
- Upload a PDF
- The AI can analyze it automatically

### 2. Document Chat
- Use the `DocumentChat` component
- Ask questions about your PDFs
- Get intelligent responses

### 3. Summarization
- Get automatic summaries of long documents
- Extract key points

---

## 💰 Pricing

### Free Tier:
- $1-5 free credits for new users
- Enough for hundreds of requests
- No credit card required initially

### Paid Usage:
- Pay-as-you-go
- Typical costs:
  - Simple question: ~$0.001 (1/10th of a cent)
  - Document summary: ~$0.01 (1 cent)
  - Long chat: ~$0.05 (5 cents)

### Models Available:
- GPT-4, GPT-3.5 (OpenAI)
- Claude 3 Opus, Sonnet, Haiku (Anthropic)
- Llama, Mistral (Open source)
- Many more!

---

## 🔒 Security

### Keep Your API Key Safe:
- ✅ Never commit `.env` to git
- ✅ Don't share your key publicly
- ✅ Regenerate if compromised
- ✅ Use environment variables only

### Already Protected:
- `.env` is in `.gitignore`
- Key is only used server-side
- Not exposed to client

---

## ❌ What If I Don't Want AI Features?

**No problem!** Simply:

1. **Don't create an API key**
2. **Leave out the OPENROUTER_API_KEY line**
3. **Your app works 100% fine**

The AI components will show a friendly message:
```
"OpenRouter API key not configured. 
Add OPENROUTER_API_KEY to use AI features."
```

---

## 🔍 Verify It's Working

### Test 1: Check Environment Variable

Create a test API route:
```typescript
// app/api/test-openrouter/route.ts
export async function GET() {
  const hasKey = !!process.env.OPENROUTER_API_KEY
  return Response.json({ 
    configured: hasKey,
    message: hasKey ? 'API key is set!' : 'No API key found'
  })
}
```

Visit: http://localhost:3000/api/test-openrouter

### Test 2: Try AI Analysis

1. Upload a document
2. Try the analysis feature
3. Should get AI-powered insights

---

## 🐛 Troubleshooting

### Issue: "API key not configured"
**Solution:**
- Make sure you added the key to `.env`
- Check for typos
- Restart the dev server
- Make sure it starts with `sk-or-v1-`

### Issue: "Invalid API key"
**Solution:**
- Copy the key again from OpenRouter
- Make sure you copied the entire key
- Regenerate the key if needed

### Issue: "Rate limit exceeded"
**Solution:**
- You've used your free credits
- Add payment method to OpenRouter
- Or wait for rate limit to reset

### Issue: "No response from AI"
**Solution:**
- Check your internet connection
- Verify the API key is correct
- Check OpenRouter status page

---

## 📚 Useful Links

- **OpenRouter Dashboard**: https://openrouter.ai/dashboard
- **API Documentation**: https://openrouter.ai/docs
- **Pricing**: https://openrouter.ai/pricing
- **Model Comparison**: https://openrouter.ai/models

---

## ✅ Quick Checklist

- [ ] Visited https://openrouter.ai/
- [ ] Created account
- [ ] Got free credits
- [ ] Created API key
- [ ] Copied the key
- [ ] Added to `.env` file
- [ ] Restarted dev server
- [ ] Tested AI features

---

## 🎯 Recommended Models

For best results with ClientDocs Guard:

### For Chat & Q&A:
- **claude-3-sonnet** (Best quality/price balance)
- **gpt-3.5-turbo** (Fastest, cheapest)
- **llama-3-8b** (Free, good quality)

### For Analysis:
- **claude-3-opus** (Most accurate)
- **gpt-4** (Very capable)
- **claude-3-sonnet** (Good balance)

### For Summaries:
- **claude-3-haiku** (Fast & cheap)
- **gpt-3.5-turbo** (Quick summaries)

---

## 💡 Pro Tips

1. **Start Small**: Test with the free credits first
2. **Choose Right Model**: Use cheaper models for simple tasks
3. **Monitor Usage**: Check your OpenRouter dashboard
4. **Set Limits**: Set spending limits in OpenRouter settings
5. **Cache Results**: Save AI responses to avoid repeat calls

---

**Remember: OpenRouter is completely optional. Your app is fully functional without it!** 🚀

