const projectModules = import.meta.glob('./projects/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const projectFiles = Object.entries(projectModules)
  .sort(([leftPath], [rightPath]) => leftPath.localeCompare(rightPath))
  .map(([, source]) => source)

const parseFrontmatter = (markdown) => {
  const normalized = String(markdown || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  if (!normalized.startsWith('---')) {
    return { frontmatter: {}, body: normalized.trim() }
  }

  const frontmatterEnd = normalized.indexOf('\n---', 4)
  if (frontmatterEnd === -1) {
    return { frontmatter: {}, body: normalized.trim() }
  }

  const frontmatter = {}
  const rawFrontmatter = normalized.slice(4, frontmatterEnd).trim()

  for (const line of rawFrontmatter.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!match) continue
    frontmatter[match[1]] = match[2].trim()
  }

  return {
    frontmatter,
    body: normalized.slice(frontmatterEnd + 5).trim(),
  }
}

const createEmbedUrl = (watchUrl) => {
  if (!watchUrl) return ''

  try {
    const url = new URL(watchUrl)

    if (url.hostname === 'drive.google.com') {
      const fileMatch = url.pathname.match(/^\/file\/d\/([^/]+)/)
      if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`

      const folderMatch = url.pathname.match(/^\/drive\/folders\/([^/]+)/)
      if (folderMatch) {
        return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`
      }
    }

    if (url.hostname === 'youtu.be') {
      const videoId = url.pathname.split('/').filter(Boolean)[0]
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }

    if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
      const videoId = url.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
    }

    if (url.hostname === 'www.instagram.com' || url.hostname === 'instagram.com') {
      const reelMatch = url.pathname.match(/^\/reel\/([^/]+)/)
      if (reelMatch) return `https://www.instagram.com/reel/${reelMatch[1]}/embed`
    }

    if (url.hostname === 'xhslink.com') {
      url.protocol = 'https:'
      return url.toString()
    }

    return watchUrl
  } catch {
    return watchUrl
  }
}

const normalizeProject = (source, index) => {
  const { frontmatter, body } = parseFrontmatter(source)
  const imagePath = frontmatter.image || ''
  const watchUrl = frontmatter['watch-url'] || ''
  const embedUrl = createEmbedUrl(watchUrl)

  return {
    layout: 'default',
    'modal-id': index + 1,
    title: frontmatter.title || '',
    subtitle: frontmatter.subtitle || '',
    'project-date': frontmatter['project-date'] || '',
    category: frontmatter.category || '',
    'role-description': frontmatter['role-description'] || '',
    'act-as': frontmatter['act-as'] || '',
    'watch-url': watchUrl,
    image: imagePath,
    img: imagePath,
    alt: frontmatter.alt || '',
    client: frontmatter.client || '',
    description: frontmatter.description || body,
    duration: frontmatter.duration || '',
    format: frontmatter.format || '',
    color: frontmatter.color || '',
    language: frontmatter.language || '',
    hero_media: embedUrl
      ? {
          type: 'iframe',
          src: embedUrl,
          title: frontmatter.title || '',
        }
      : imagePath
        ? {
            type: 'image',
            src: imagePath,
            title: frontmatter.alt || frontmatter.title || '',
          }
        : null,
    accent: frontmatter.accent || '#ff6a3d',
    surface: frontmatter.surface || '#f7ead8',
  }
}

export const projects = projectFiles.map(normalizeProject)
