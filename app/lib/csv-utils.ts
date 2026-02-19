// CSV export utilities

export function convertToCSV(data: any[], headers: { key: string; label: string }[]): string {
  if (!data.length) return ''
  const rows = data.map(item => 
    headers.map(header => {
      const value = item[header.key] ?? ''
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  )
  const headerRow = headers.map(h => h.label).join(',')
  return [headerRow, ...rows].join('\n')
}

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
