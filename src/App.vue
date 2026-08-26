<script setup>
import { computed, ref } from 'vue'
import AboutSection from './components/AboutSection.vue';
import HeroScene from './components/HeroScene.vue'
import ProjectCard from './components/ProjectCard.vue'
import { projects } from './data/projects'

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
      <a class="wordmark" href="#top" aria-label="BotKing home">
        <span>BK</span>
        <small>Film director</small>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#top">Home</a>
        <a href="#about">About</a>
        <a href="#portfolio">Portfolio</a>
      </nav>
    </header>

    <main class="portfolio-page">
      <HeroScene />

      <section id="portfolio" class="work-section section-shell">
        <div class="section-heading">
          <div>
            <span class="section-index">SELECTED WORK</span>
            <h2>Things made<br />to <em>matter.</em></h2>
          </div>
          <p>
            A selection of narrative films, campaigns and music visuals shaped from first treatment to final frame.
          </p>
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
      <span>BOTKING © 2026</span>
      <a href="#top">Back to top ↑</a>
    </footer>
  </div>
</template>
