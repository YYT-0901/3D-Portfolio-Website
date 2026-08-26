<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { profile } from '../data/profile'
import { createBadgeScene, createPhoneScene } from '../three/createAboutObjects'

const section = ref(null)
const badgeCanvas = ref(null)
const phoneCanvas = ref(null)
const hasEntered = ref(false)
const phoneIsActive = ref(false)
const webglFailed = ref(false)

let badgeScene = null
let phoneScene = null
let sectionObserver = null
let badgeResizeObserver = null
let phoneResizeObserver = null

const badgePanel = ref(null)
const BADGE_ORIGIN_VERTICAL_OFFSET = 0.15

const syncBadgeStagePosition = () => {
  if (!section.value || !badgePanel.value) return

  const sectionRect = section.value.getBoundingClientRect()
  const panelRect = badgePanel.value.getBoundingClientRect()

  const centerX =
    panelRect.left -
    sectionRect.left +
    panelRect.width / 2

  const centerY =
    panelRect.top -
    sectionRect.top +
    panelRect.height / 2

  badgeScene?.resize({
    x: centerX,
    y: centerY - panelRect.height * BADGE_ORIGIN_VERTICAL_OFFSET,
  })
}

const togglePhone = () => {
  phoneIsActive.value = !phoneIsActive.value
  phoneScene?.setActive(phoneIsActive.value)
}

onMounted(async () => {
  await nextTick()

  if (!badgeCanvas.value || !phoneCanvas.value) {
    console.error('WebGL canvas refs are not ready.', {
      badgeCanvas: badgeCanvas.value,
      phoneCanvas: phoneCanvas.value,
    })
    return
  }

  try {
    try {
      badgeScene = await createBadgeScene(badgeCanvas.value, profile)
    } catch (error) {
      console.error('Unable to initialize the badge scene.', error)
      badgeScene = null
    }

    phoneScene = createPhoneScene(phoneCanvas.value, profile)
    badgeResizeObserver = new ResizeObserver(syncBadgeStagePosition)
    phoneResizeObserver = new ResizeObserver(() => phoneScene?.resize())
    badgeResizeObserver.observe(badgePanel.value)
    phoneResizeObserver.observe(phoneCanvas.value)

    window.addEventListener('resize', syncBadgeStagePosition)
    syncBadgeStagePosition()
  } catch (error) {
    console.error('Unable to initialize the About 3D objects.', error)
    webglFailed.value = true
  }

  sectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || hasEntered.value) return
      hasEntered.value = true
      badgeScene?.setActive(true)
      sectionObserver?.disconnect()
    },
    { threshold: 0.24 },
  )
  sectionObserver.observe(section.value)


})

onBeforeUnmount(() => {
  sectionObserver?.disconnect()
  badgeResizeObserver?.disconnect()
  phoneResizeObserver?.disconnect()
  badgeScene?.dispose()
  phoneScene?.dispose()
  window.removeEventListener('resize', syncBadgeStagePosition)
})

</script>

<template>
  <section
    id="about"
    ref="section"
    class="about-section"
    :class="{ 'has-entered': hasEntered }"
    aria-labelledby="about-title"
  >
    <div class="about-kicker" aria-hidden="true">
    </div>


    <div class="badge-stage">
      <canvas
        ref="badgeCanvas"
        class="about-webgl badge-webgl"
      ></canvas>
    </div>


    <div class="comic-layout">
      <article ref="badgePanel" class="comic-panel badge-panel" aria-label="Director identification badge">
        <div class="badge-panel__comic" aria-hidden="true">
          <div class="comic-speed-lines"></div>
        </div>
      </article>

      <article class="comic-panel bio-panel">
        <div class="halftone" aria-hidden="true"></div>
        <div class="bio-panel__inner">
          <span class="comic-label">THE STORY SO FAR</span>
          <h2 id="about-title">ABOUT ME!</h2>
          <span class="brush-label">DIRECTOR'S NOTE</span>

          <p class="bio-intro">
            Hello, I’m <strong>{{ profile.name }}</strong> — a
            <mark>{{ profile.role }}</mark> shaping human stories through performance,
            atmosphere and precise visual language.
          </p>
          <p>{{ profile.intro }}</p>
          <p>{{ profile.approach }}</p>

          <ul class="discipline-list" aria-label="Directing disciplines">
            <li v-for="(discipline, index) in profile.disciplines" :key="discipline">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              {{ discipline }}
            </li>
          </ul>

          <div class="comic-burst" aria-hidden="true">ACTION!</div>
        </div>
      </article>

      <article class="comic-panel phone-panel">
        <div class="comic-speed-lines comic-speed-lines--phone" aria-hidden="true"></div>
        <button
          type="button"
          class="phone-stage"
          :class="{ 'is-active': phoneIsActive }"
          :aria-pressed="phoneIsActive"
          @click="togglePhone"
        >
          <canvas ref="phoneCanvas" class="about-webgl phone-webgl"></canvas>
          <span class="phone-hint">
            {{ phoneIsActive ? 'Tap to hide contact' : 'Tap phone to reveal contact' }}
          </span>
          <span v-if="phoneIsActive" class="sr-only">
            Email {{ profile.email }}. Phone {{ profile.phone }}. Based in {{ profile.location }}.
          </span>
        </button>
      </article>
    </div>
  </section>
</template>
