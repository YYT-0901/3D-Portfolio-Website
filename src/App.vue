<script setup>
import AboutSection from './components/AboutSection.vue';
import HeroScene from './components/HeroScene.vue'
import ProjectCard from './components/ProjectCard.vue'
import { projects } from './data/projects'
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
            <span class="section-index">01 / SELECTED WORK</span>
            <h2>Things made<br />to <em>matter.</em></h2>
          </div>
          <p>
            A selection of narrative films, campaigns and music visuals shaped from first treatment to final frame.
          </p>
        </div>

        <div class="projects-grid">
          <ProjectCard v-for="project in projects" :key="project.number" :project="project" />
        </div>
      </section>

      <section id="contact" class="contact-section section-shell">
        <span class="section-index">03 / CONTACT</span>
        <h2>Have a story to tell?</h2>
        <a href="mailto:hello@example.com">
          Let’s find the frame
          <span>↗</span>
        </a>
        <div class="contact-meta">
          <span>Kuala Lumpur · MY</span>
          <span>Open for selected productions</span>
        </div>
      </section>
    </main>

    <footer>
      <span>BOTKING © 2026</span>
      <a href="#top">Back to top ↑</a>
    </footer>
  </div>
</template>
