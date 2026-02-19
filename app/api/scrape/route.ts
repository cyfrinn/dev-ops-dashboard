import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '../../lib/withAuth'
import { db } from '../../lib/db'
import Parser from 'rss-parser'
import { randomUUID } from 'crypto'
import type { Opportunity } from '../../types'

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const settings = await db.settings.get()
    const sources = settings.sources || []
    const parser = new Parser()
    let opportunities = await db.opportunities.get()
    let addedCount = 0

    for (const source of sources) {
      if (source.type !== 'rss') continue
      try {
        const feed = await parser.parseURL(source.url)
        // Take up to 10 newest items per source
        const items = feed.items.slice(0, 10)
        for (const item of items) {
          const title = item.title?.trim()
          const url = item.link || item.guid || ''
          if (!title || !url) continue

          // Check for duplicates by URL or title+source
          const isDuplicate = opportunities.some(opp => opp.url === url || (opp.title === title && opp.source === source.name))
          if (isDuplicate) continue

          const newOpp: Opportunity = {
            _id: randomUUID(),
            title,
            source: source.name,
            url,
            relevance: 'medium',
            notes: (item.contentSnippet || item.content || '').substring(0, 500),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          opportunities.push(newOpp)
          addedCount++
        }
      } catch (err) {
        console.error(`Failed to scrape source ${source.name}:`, err)
      }
    }

    await db.opportunities.set(opportunities)
    return NextResponse.json({ message: `Added ${addedCount} new opportunities`, added: addedCount })
  } catch (error) {
    console.error('Scraping failed:', error)
    return NextResponse.json({ error: 'Scraping failed' }, { status: 500 })
  }
})
