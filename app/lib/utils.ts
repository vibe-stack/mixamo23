export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function getFileNameWithoutExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '')
}

export interface FileNameOptions {
  replaceWhitespace?: boolean
  lowercase?: boolean
}

export function formatFileName(filename: string, options: FileNameOptions = {}): string {
  let formatted = filename

  if (options.replaceWhitespace) {
    formatted = formatted.replace(/\s+/g, '_')
  }

  if (options.lowercase) {
    formatted = formatted.toLowerCase()
  }

  return formatted
}
