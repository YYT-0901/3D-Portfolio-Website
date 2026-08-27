<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { createPortfolioScene } from '../three/createPortfolioScene'
import AboutSection from './AboutSection.vue'

const emit = defineEmits(['progress-end-change'])

const hero = ref(null)
const canvas = ref(null)
const progress = ref(0)
const webglFailed = ref(false)
const reducedMotion = ref(false)

let experience = null
let targetProgress = 0
let animationFrame = 0
let pointerTarget = { x: 0, y: 0 }
let pointerCurrent = { x: 0, y: 0 }
let startedAt = 0
let sceneIsVisible = true
let sceneObserver = null
let isPastProgressEnd = false
let snapIsArmed = false
let hasSnappedToAbout = false
let suppressAboutSnap = false
let previousTargetProgress = 0
let restoreScrollBehaviorFrame = 0
let previousInlineScrollBehavior = ''

const ABOUT_SNAP_PROGRESS = 0.96

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const range = (value, start, end) => clamp((value - start) / (end - start))
const smoothStep = (value) => value * value * (3 - 2 * value)

const updateTarget = () => {
  if (!hero.value) return

  const rect = hero.value.getBoundingClientRect()

  const scrollableDistance = Math.max(
    hero.value.offsetHeight - window.innerHeight,
    1,
  )

  const isPastEnd = -rect.top > scrollableDistance

  if (isPastEnd !== isPastProgressEnd) {
    isPastProgressEnd = isPastEnd
    emit('progress-end-change', isPastEnd)
  }

  targetProgress = clamp(
    -rect.top / scrollableDistance,
  )

  if (targetProgress < 0.65) {
    snapIsArmed = true

    if (targetProgress < previousTargetProgress) {
      hasSnappedToAbout = false
      suppressAboutSnap = false
    }
  }

  previousTargetProgress = targetProgress
}

const snapToAbout = () => {
  const about = document.getElementById('about')
  if (!about) return

  hasSnappedToAbout = true
  snapIsArmed = false

  const root = document.documentElement
  previousInlineScrollBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'

  const targetTop = window.scrollY + about.getBoundingClientRect().top
  window.scrollTo({ top: targetTop, left: 0, behavior: 'auto' })
  window.history.replaceState(null, '', '#about')

  restoreScrollBehaviorFrame = requestAnimationFrame(() => {
    root.style.scrollBehavior = previousInlineScrollBehavior
    restoreScrollBehaviorFrame = 0
  })
}

const trackAnchorNavigation = (event) => {
  const link = event.target.closest?.('a[href^="#"]')
  if (!link) return

  const hash = new URL(link.href, window.location.href).hash
  suppressAboutSnap = hash !== '#about' && hash !== '#top'

  if (hash === '#top') {
    hasSnappedToAbout = false
  }
}

const updatePointer = (event) => {
  pointerTarget = {
    x: (event.clientX / window.innerWidth - 0.5) * 2,
    y: -(event.clientY / window.innerHeight - 0.5) * 2,
  }
}

const resetPointer = () => {
  pointerTarget = { x: 0, y: 0 }
}

const resize = () => {
  updateTarget()
  experience?.resize()
}

const renderFrame = (time) => {
  if (!startedAt) startedAt = time

  const progressDifference = targetProgress - progress.value
  progress.value += progressDifference * (reducedMotion.value ? 1 : 0.1)
  pointerCurrent.x += (pointerTarget.x - pointerCurrent.x) * 0.06
  pointerCurrent.y += (pointerTarget.y - pointerCurrent.y) * 0.06

  // if (
  //   snapIsArmed &&
  //   !hasSnappedToAbout &&
  //   !suppressAboutSnap &&
  //   targetProgress >= ABOUT_SNAP_PROGRESS &&
  //   progress.value >= ABOUT_SNAP_PROGRESS
  // ) {
  //   snapToAbout()
  // }

  if (sceneIsVisible) {
    experience?.render(progress.value, pointerCurrent, (time - startedAt) / 1000)
  }
  animationFrame = requestAnimationFrame(renderFrame)
}

const titleStyle = computed(() => ({
  opacity: 1 - smoothStep(range(progress.value, 0.15, 0.36)),
  transform: `translate3d(-50%, calc(-50% - ${70 * range(progress.value, 0.15, 0.36)}px), 0) scale(${1 + range(progress.value, 0.1, 0.36) * 0.08})`,
}))

const sceneStyle = computed(() => ({
  opacity: 1 - smoothStep(range(progress.value, 0.8, 0.94)),
}))

const cueStyle = computed(() => ({
  opacity: 1 - smoothStep(range(progress.value, 0.03, 0.16)),
}))

const aboutProgress = computed(() =>
  smoothStep(range(progress.value, 0.7, 0.9)),
)

const aboutStyle = computed(() => ({
  opacity: aboutProgress.value,

  transform: `
    translate3d(0, ${40 * (1 - aboutProgress.value)}px, 0)
    scale(${0.96 + aboutProgress.value * 0.04})
  `,

  pointerEvents: aboutProgress.value > 0 ? 'auto' : 'none',
}))

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  try {
    experience = createPortfolioScene(canvas.value, {
      reducedMotion: reducedMotion.value,
    })
  } catch (error) {
    console.error('Unable to initialize the WebGL portfolio scene.', error)
    webglFailed.value = true
  }

  window.addEventListener('scroll', updateTarget, { passive: true })
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', updatePointer, { passive: true })
  document.addEventListener('click', trackAnchorNavigation, true)
  document.documentElement.addEventListener('mouseleave', resetPointer)
  sceneObserver = new IntersectionObserver(([entry]) => {
    sceneIsVisible = entry.isIntersecting
  })
  sceneObserver.observe(hero.value)
  updateTarget()
  animationFrame = requestAnimationFrame(renderFrame)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateTarget)
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', updatePointer)
  document.removeEventListener('click', trackAnchorNavigation, true)
  document.documentElement.removeEventListener('mouseleave', resetPointer)
  sceneObserver?.disconnect()
  cancelAnimationFrame(animationFrame)

  if (restoreScrollBehaviorFrame) {
    cancelAnimationFrame(restoreScrollBehaviorFrame)
    document.documentElement.style.scrollBehavior = previousInlineScrollBehavior
  }

  experience?.dispose()
})
</script>

<template>
  <section ref="hero" class="hero-scroll" aria-label="3D scroll-driven portfolio entrance">
    <div class="hero-sticky">
      <div class="hero-scene-wrap" :style="sceneStyle" aria-hidden="true">
        <canvas ref="canvas" class="hero-webgl"></canvas>
      </div>

      <div class="hero-title" :style="titleStyle">
        <p>Selected films · 2023—2026</p>
        <h1 class="sr-only">Film director portfolio</h1>
        <strong>Shearmine</strong>
      </div>

      <div
        class="hero-about-layer"
        :style="aboutStyle"
      >
        <AboutSection />
      </div>

      <div class="scroll-cue" :style="cueStyle" aria-hidden="true">
        <span>Scroll to enter</span>
        <i></i>
      </div>

      <div class="hero-progress" aria-hidden="true">
        <span :style="{ transform: `scaleX(${progress})` }"></span>
      </div>
    </div>
  </section>

</template>
