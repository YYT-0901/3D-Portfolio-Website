<script setup>
import { computed, ref, watch } from 'vue'

const { project } = defineProps({
  project: {
    type: Object,
    required: true,
  },
})

const isOpen = ref(false)

watch(isOpen, (value) => {
  document.body.classList.toggle('project-drawer-open', value)
  document.documentElement.style.overflow = value ? 'hidden' : ''
  document.body.style.overflow = value ? 'hidden' : ''
}, { immediate: true })

const categoryList = computed(() => {
  if (!project.category) return []
  return project.category
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
})

function toggleDrawer() {
  isOpen.value = !isOpen.value
}

function closeDrawer() {
  isOpen.value = false
}
</script>

<template>
  <article
    class="project-card"
    :style="{
      '--accent': project.accent || '#ff6a3d',
      '--surface': project.surface || '#f7ead8',
      '--card-dark': '#2d76a5',
      '--card-on-dark': '#edf7ff',
    }"
  >
    <button type="button" class="project-card__trigger" @click="toggleDrawer" aria-label="Open project details">
      <div class="project-card__meta">
        <span>Project {{ project['modal-id'] }}</span>
        <span>{{ project['project-date'] }}</span>
      </div>

      <div class="project-card__thumb">
        <img :src="`/assets/projects/${project.img}`" :alt="project.alt || project.title" />
      </div>

      <div class="project-card__header">
        <div>
          <p>{{ project.subtitle }}</p>
          <h3>{{ project.title }}</h3>
        </div>
        <span class="project-card__pill">{{ project.format }}</span>
      </div>

      
    </button>

    <div class="project-card__drawer" :class="{ 'is-open': isOpen }" @click="closeDrawer">
      <div class="project-card__drawer-backdrop" aria-hidden="true"></div>

      <aside class="project-card__paper" @click.stop role="dialog" :aria-label="`${project.title} project details`">
        <button type="button" class="project-card__close" @click="closeDrawer" aria-label="Close project details">
          <span aria-hidden="true">×</span>
        </button>

        <div class="project-card__paper-inner">
          <div class="project-card__paper-top">
            <div>
              <span class="project-card__paper-kicker">{{ project['project-date'] }}</span>
              <h4>{{ project.title }}</h4>
            </div>
            <a
              v-if="project['watch-url']"
              class="project-card__watch-link"
              :href="project['watch-url']"
              target="_blank"
              rel="noreferrer"
            >
              Watch film
            </a>
          </div>

          <div class="project-card__paper-media" v-if="project.hero_media?.type === 'iframe'">
            <iframe
              :src="project.hero_media.src"
              :title="project.hero_media.title || project.title"
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>

          <div class="project-card__paper-media project-card__paper-media--image" v-else-if="project.hero_media?.src">
            <img :src="project.hero_media.src" :alt="project.hero_media.title || project.title" />
          </div>

          <div class="project-card__detail-copy">
            <div class="project-card__facts">
              <div>
                <span>Client</span>
                <strong>{{ project.client || 'Independent' }}</strong>
              </div>
              <div>
                <span>Role</span>
                <strong>{{ project['role-description'] || 'Creative lead' }}</strong>
              </div>
              <div>
                <span>Duration</span>
                <strong>{{ project.duration }}</strong>
              </div>
              <div>
                <span>Format</span>
                <strong>{{ project.format }}</strong>
              </div>
              <div>
                <span>Color</span>
                <strong>{{ project.color }}</strong>
              </div>
              <div>
                <span>Language</span>
                <strong>{{ project.language }}</strong>
              </div>
            </div>

            <p class="project-card__lede">{{ project.description }}</p>

            <ul v-if="categoryList.length" class="project-card__tags" aria-label="Project roles">
              <li v-for="role in categoryList" :key="role">{{ role }}</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  </article>
</template>
