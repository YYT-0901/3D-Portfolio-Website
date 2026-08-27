<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import AboutSection from './components/AboutSection.vue'
import HeroScene from './components/HeroScene.vue'
import ProjectCard from './components/ProjectCard.vue'
import { loadAllProjects } from './data/projects'
import { siteConfig } from './data/siteConfig'

const selectedCategory = ref('All')
const navHasBackground = ref(false)

const allProjects = ref([])
const loadingProjects = ref(false)

const currentPage = ref(1)
const perPage = 6

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProjects.value.length / perPage)))

const categoryOptions = computed(() => {
  const values = allProjects.value.flatMap((project) => {
    if (!project || !project.category) return []
    return project.category
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  })

  return ['All', ...new Set(values)]
})

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'All') return allProjects.value

  return allProjects.value.filter((project) => {
    const categories = (project.category || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    return categories.includes(selectedCategory.value)
  })
})

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredProjects.value.slice(start, start + perPage)
})

function goToPage(page) {
  currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  window.scrollTo({ top: document.getElementById('portfolio').offsetTop - 80, behavior: 'smooth' })
}

let io = null
onMounted(() => {
  const section = document.getElementById('portfolio')
  if (!section) return

  io = new IntersectionObserver(async (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && !allProjects.value.length && !loadingProjects.value) {
        loadingProjects.value = true
        const loaded = await loadAllProjects()
        allProjects.value = loaded
        loadingProjects.value = false
      }
    }
  }, { root: null, threshold: 0.1 })

  io.observe(section)
})

onBeforeUnmount(() => {
  if (io) io.disconnect()
})
</script>

<template>
  <div id="top">
    <header class="site-nav" :class="{ 'has-background': navHasBackground }">
      <a class="wordmark" href="#top" :aria-label="siteConfig.brand.homeLabel">
        <span>{{ siteConfig.brand.short }}</span>
        <p>{{ siteConfig.brand.tagline }}</p>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#top">{{ siteConfig.nav.home }}</a>
        <a href="#about">{{ siteConfig.nav.about }}</a>
        <a href="#portfolio">{{ siteConfig.nav.portfolio }}</a>
      </nav>
    </header>

    <main class="portfolio-page">
      <HeroScene @progress-end-change="navHasBackground = $event" />

      <section id="portfolio" class="work-section section-shell">
        <div class="section-heading">
          <div>
            <span class="section-index">{{ siteConfig.portfolio.kicker }}</span>
            <h2>{{ siteConfig.portfolio.titleLine1 }}<br />{{ siteConfig.portfolio.titleLine2Start }} <em>{{ siteConfig.portfolio.titleLine2Em }}</em></h2>
          </div>
          <p>{{ siteConfig.portfolio.description }}</p>
        </div>

        <div class="project-filter" aria-label="Project categories">
          <button
            v-for="category in categoryOptions"
            :key="category"
            type="button"
            class="project-filter__button"
            :class="{ 'is-active': selectedCategory === category }"
            @click="selectedCategory = category"
          >
            {{ category }}
          </button>
        </div>

        <div class="projects-grid">
          <template v-if="!allProjects.length && loadingProjects">
            <p>Loading projects…</p>
          </template>

          <template v-else>
            <ProjectCard v-for="project in paginatedProjects" :key="project['modal-id']" :project="project" />
          </template>
        </div>

        <div class="pagination" v-if="allProjects.length">
          <button type="button" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">Prev</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button type="button" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Next</button>
        </div>
      </section>
    </main>

    <footer>
      <span>{{ siteConfig.footer.copyright }}</span>
      <a href="#top">{{ siteConfig.footer.backToTop }}</a>
    </footer>
  </div>
</template>
