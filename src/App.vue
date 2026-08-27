<script setup>
import { computed, ref } from 'vue'
import AboutSection from './components/AboutSection.vue'
import HeroScene from './components/HeroScene.vue'
import ProjectCard from './components/ProjectCard.vue'
import { projects } from './data/projects'
import { siteConfig } from './data/siteConfig'

const selectedCategory = ref('All')

const categoryOptions = computed(() => {
  const values = projects.flatMap((project) => {
    if (!project.category) return []
    return project.category
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  })

  return ['All', ...new Set(values)]
})

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'All') return projects

  return projects.filter((project) => {
    const categories = (project.category || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    return categories.includes(selectedCategory.value)
  })
})
</script>

<template>
  <div id="top">
    <header class="site-nav">
      <a class="wordmark" href="#top" :aria-label="siteConfig.brand.homeLabel">
        <span>{{ siteConfig.brand.short }}</span>
        <small>{{ siteConfig.brand.tagline }}</small>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#top">{{ siteConfig.nav.home }}</a>
        <a href="#about">{{ siteConfig.nav.about }}</a>
        <a href="#portfolio">{{ siteConfig.nav.portfolio }}</a>
      </nav>
    </header>

    <main class="portfolio-page">
      <HeroScene />

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
          <ProjectCard v-for="project in filteredProjects" :key="project['modal-id']" :project="project" />
        </div>
      </section>
    </main>

    <footer>
      <span>{{ siteConfig.footer.copyright }}</span>
      <a href="#top">{{ siteConfig.footer.backToTop }}</a>
    </footer>
  </div>
</template>
