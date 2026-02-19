import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../../lib/withAuth'
import { db } from '../../../lib/db'

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const settings = await db.settings.get()
    const { botToken, chatId } = settings.telegram
    if (!botToken || !chatId) {
      return NextResponse.json({ error: 'Telegram bot token and chat ID not configured' }, { status: 400 })
    }

    // Send a test message
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '✅ Test message from Dev Ops Dashboard! Everything is working.',
        parse_mode: 'HTML'
      })
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.description || data.error || 'Telegram API error')
    }

    return NextResponse.json({ message: 'Test message sent to Telegram!', result: data.result })
  } catch (error: any) {
    console.error('Test Telegram failed:', error)
    return NextResponse.json({ error: error.message || 'Failed to send test message' }, { status: 500 })
  }
})
