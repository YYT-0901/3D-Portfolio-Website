<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article
    class="project-card"
    :style="{
      '--accent': project.accent,
      '--surface': project.surface,
    }"
  >
    <div class="project-card__meta">
      <span>Project {{ project.number }}</span>
      <span>{{ project.year }}</span>
    </div>

    <div class="project-card__visual" :class="`project-card__visual--${project.type}`">
      <div class="visual-window">
        <div class="visual-window__bar"><i></i><i></i><i></i></div>

        <template v-if="project.type === 'platform'">
          <div class="visual-platform__rail"></div>
          <div class="visual-platform__copy">
            <small>{{ project.visualKicker }}</small>
            <strong>{{ project.visualTitle }}</strong>
          </div>
          <div class="visual-platform__orb"></div>
        </template>

        <template v-else-if="project.type === 'commerce'">
          <span class="visual-commerce__word">{{ project.visualTitle }}</span>
          <div class="visual-commerce__product"></div>
          <div class="visual-commerce__caption">{{ project.visualCaption }}</div>
        </template>

        <template v-else>
          <div class="visual-console__nav">{{ project.visualKicker }}</div>
          <div class="visual-console__metric">{{ project.visualMetric }}</div>
          <svg viewBox="0 0 520 170" aria-hidden="true">
            <path d="M0 132 C62 128 69 79 121 88 S190 151 236 101 299 29 350 63 401 126 520 25" />
          </svg>
          <div class="visual-console__grid"></div>
        </template>
      </div>
    </div>

    <div class="project-card__body">
      <div>
        <h3>{{ project.title }}</h3>
        <p>{{ project.description }}</p>
      </div>
      <ul aria-label="Project details">
        <li v-for="tag in project.tags" :key="tag">{{ tag }}</li>
      </ul>
    </div>
  </article>
</template>
