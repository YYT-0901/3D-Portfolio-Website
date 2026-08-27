const projectModules = import.meta.glob('./projects/*.md', {
  eager: true,
  as: 'raw',
})

const markdownFiles = Object.entries(projectModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, source]) => ({
    key: path.split('/').pop().replace(/\.md$/, ''),
    source,
  }))

const parseFrontmatter = (markdown) => {
  const normalized = String(markdown || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  if (!normalized.startsWith('---')) {
    return { frontmatter: {}, body: normalized }
  }

  const endOfFrontmatter = normalized.indexOf('\n---', 4)
  if (endOfFrontmatter === -1) {
    return { frontmatter: {}, body: normalized }
  }

  const rawFrontmatter = normalized.slice(4, endOfFrontmatter).trim()
  const body = normalized.slice(endOfFrontmatter + 5).trim()

  const frontmatter = {}

  for (const line of rawFrontmatter.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!match) continue
    const [, key, value] = match
    frontmatter[key] = value.trim()
  }

  return { frontmatter, body }
}

const renderMarkdownToHtml = (markdown) => {
  const lines = (markdown || '').split('\n').map((line) => line.trim())
  const blocks = []
  let currentParagraph = []

  const flushParagraph = () => {
    if (!currentParagraph.length) return
    const text = currentParagraph.join(' ').trim()
    if (text) {
      blocks.push(`<p>${text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`)
    }
    currentParagraph = []
  }

  for (const line of lines) {
    if (!line) {
      flushParagraph()
      continue
    }

    if (line.startsWith('### ')) {
      flushParagraph()
      blocks.push(`<h3>${line.replace('### ', '')}</h3>`)
      continue
    }

    if (line.startsWith('- ')) {
      flushParagraph()
      blocks.push(`<li>${line.replace('- ', '')}</li>`)
      continue
    }

    currentParagraph.push(line)
  }

  flushParagraph()

  const listItems = blocks.filter((block) => block.startsWith('<li>'))
  if (listItems.length) {
    const wrapped = `<ul>${listItems.join('')}</ul>`
    const withoutListItems = blocks.filter((block) => !block.startsWith('<li>'))
    blocks.splice(0, blocks.length, ...withoutListItems, wrapped)
  }

  return blocks.join('')
}

const normalizeProject = (source, index) => {
  const { frontmatter, body } = parseFrontmatter(source)

  const markdownHtml = renderMarkdownToHtml(body)
  const description = frontmatter.description || body.replace(/[#>*_\-`]/g, '').trim().split('\n\n')[0] || 'Project overview.'

  const imagePath = frontmatter.image || `/assets/projects/${frontmatter.title?.toLowerCase().replace(/\s+/g, '-') || index}.svg`

  return {
    layout: 'default',
    'modal-id': index + 1,
    date: frontmatter.date || '',
    img: imagePath,
    image: imagePath,
    alt: frontmatter.alt || frontmatter.title || 'Project artwork',
    title: frontmatter.title || 'Untitled project',
    'project-date': frontmatter['project-date'] || frontmatter.date || '',
    subtitle: frontmatter.subtitle || frontmatter.title || 'Untitled project',
    client: frontmatter.client || 'Independent',
    category: frontmatter.category || 'General',
    description,
    'role-description': frontmatter['role-description'] || '',
    duration: frontmatter.duration || '',
    color: frontmatter.color || '',
    language: frontmatter.language || 'English',
    format: frontmatter.format || 'Short Film',
    'watch-url': frontmatter['watch-url'] || '',
    hero_media: frontmatter['watch-url']
      ? {
          type: 'iframe',
          provider: 'external',
          src: frontmatter['watch-url'].includes('drive.google.com')
            ? frontmatter['watch-url'].replace('/view', '/preview')
            : frontmatter['watch-url'],
          title: frontmatter.title || 'Project film',
          aspect_ratio: '16 / 9',
        }
      : {
          type: 'image',
          src: imagePath,
          title: frontmatter.title || 'Project still',
        },
    accent: frontmatter.accent || '#ff6a3d',
    surface: frontmatter.surface || '#f7ead8',
    markdownHtml,
  }
}

export const projects = markdownFiles.map(({ source }, index) => normalizeProject(source, index))
