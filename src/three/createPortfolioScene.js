import * as THREE from 'three'
import { createDirectorSet } from './createDirectorSet'

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))
const range = (value, start, end) => clamp((value - start) / (end - start))
const smoothStep = (value) => value * value * (3 - 2 * value)

const terrainHeight = (x, z) => {
  const centerHill = 1.15 * Math.exp(-(x * x + z * z * 0.65) / 95)
  const foregroundHill = 0.28 * Math.exp(-((x + 2) ** 2 + (z - 14) ** 2) / 60)
  const undulation = Math.sin(x * 0.38) * 0.16 + Math.cos(z * 0.31) * 0.12
  const detail = Math.sin((x + z) * 0.7) * 0.06

  return centerHill + foregroundHill + undulation + detail - 0.2
}

const createRandom = (initialSeed) => {
  let seed = initialSeed

  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

const createSky = () => {
  const geometry = new THREE.SphereGeometry(92, 36, 20)
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    vertexShader: `
      varying float vHeight;

      void main() {
        vHeight = position.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying float vHeight;

      void main() {
        vec3 horizon = vec3(0.29, 0.58, 0.78);
        vec3 zenith = vec3(0.008, 0.10, 0.29);
        float gradient = smoothstep(-28.0, 58.0, vHeight);
        gl_FragColor = vec4(mix(horizon, zenith, gradient), 1.0);
      }
    `,
  })

  return new THREE.Mesh(geometry, material)
}

const createTerrain = () => {
  const geometry = new THREE.PlaneGeometry(110, 110, 128, 128)
  const positions = geometry.attributes.position
  const colors = []
  const darkGreen = new THREE.Color('#173e2a')
  const lightGreen = new THREE.Color('#5d8d3d')
  const color = new THREE.Color()

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const z = -positions.getY(index)
    const height = terrainHeight(x, z)
    const blend = clamp((height + 0.4) / 1.8)

    positions.setZ(index, height)
    color.copy(darkGreen).lerp(lightGreen, blend)
    colors.push(color.r, color.g, color.b)
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
  geometry.rotateX(-Math.PI / 2)
  geometry.computeVertexNormals()

  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 0.96,
    metalness: 0,
  })
  const terrain = new THREE.Mesh(geometry, material)
  terrain.receiveShadow = true

  return terrain
}

const createDistantHills = () => {
  const group = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({ color: '#244f3a', roughness: 1 })
  const hills = [
    { position: [-26, -2.5, -31], scale: [2.4, 0.42, 1] },
    { position: [21, -3.5, -34], scale: [2.8, 0.5, 1] },
    { position: [0, -5, -42], scale: [4, 0.48, 1] },
  ]

  for (const hill of hills) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(12, 22, 12), material)
    mesh.position.set(...hill.position)
    mesh.scale.set(...hill.scale)
    group.add(mesh)
  }

  return group
}

const createBackdropTitle = (renderer) => {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 2048

  const context = canvas.getContext('2d')
  context.clearRect(0, 0, canvas.width, canvas.height)
  const title = 'PORTFOLIO'
  context.textAlign = 'center'
  context.textBaseline = 'alphabetic'
  context.font = '900 820px Arial Black, Arial, sans-serif'

  const metrics = context.measureText(title)
  const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
  const scaleX = (canvas.width) / metrics.width
  const scaleY = (canvas.height) / textHeight
  const baselineY = (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2

  context.save()
  context.translate(canvas.width / 2, canvas.height / 2 + 120)
  context.scale(scaleX, scaleY)
  context.lineWidth = 7
  context.strokeStyle = 'rgba(214, 235, 255, 0.32)'
  context.fillStyle = '#a9cff2'
  context.strokeText(title, 0, baselineY)
  context.fillText(title, 0, baselineY)
  context.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.46,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
  const forward = new THREE.Vector3()
  const up = new THREE.Vector3()

  const layout = (camera) => {
    const depth = 84
    const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * depth
    const visibleWidth = visibleHeight * camera.aspect

    camera.getWorldDirection(forward)
    up.set(0, 1, 0).applyQuaternion(camera.quaternion)
    mesh.position
      .copy(camera.position)
      .addScaledVector(forward, depth)
      .addScaledVector(up, visibleHeight * 0.20)
    mesh.quaternion.copy(camera.quaternion)
    mesh.scale.set(visibleWidth * 0.9, visibleHeight * 0.5, 1)
  }

  return { layout, material, mesh, texture }
}

const createMeadow = (isCompact) => {
  const group = new THREE.Group()
  const random = createRandom(7319)
  const dummy = new THREE.Object3D()
  const grassCount = isCompact ? 1200 : 3600
  const flowerCount = isCompact ? 140 : 420
  const rockCount = isCompact ? 8 : 16

  const grassGeometry = new THREE.ConeGeometry(0.035, 0.62, 3)
  const grassMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
  const grass = new THREE.InstancedMesh(grassGeometry, grassMaterial, grassCount)
  const grassColors = [
    new THREE.Color('#1f5533'),
    new THREE.Color('#3e7736'),
    new THREE.Color('#76a545'),
    new THREE.Color('#244b2c'),
  ]

  for (let index = 0; index < grassCount; index += 1) {
    let x = (random() - 0.5) * 52
    const z = random() * 34 - 11

    if (Math.abs(x) < 4.2 && z > -2 && z < 5) x += x < 0 ? -4.5 : 4.5

    const height = terrainHeight(x, z)
    const scale = 0.55 + random() * 1.25
    dummy.position.set(x, height + 0.25 * scale, z)
    dummy.rotation.set((random() - 0.5) * 0.18, random() * Math.PI, (random() - 0.5) * 0.16)
    dummy.scale.set(0.7 + random() * 0.8, scale, 0.7 + random() * 0.8)
    dummy.updateMatrix()
    grass.setMatrixAt(index, dummy.matrix)
    grass.setColorAt(index, grassColors[Math.floor(random() * grassColors.length)])
  }

  grass.instanceMatrix.needsUpdate = true
  grass.instanceColor.needsUpdate = true
  group.add(grass)

  const stemGeometry = new THREE.CylinderGeometry(0.012, 0.018, 0.5, 4)
  const stemMaterial = new THREE.MeshStandardMaterial({ color: '#416b35', roughness: 0.9 })
  const headGeometry = new THREE.IcosahedronGeometry(0.095, 1)
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 })
  const stems = new THREE.InstancedMesh(stemGeometry, stemMaterial, flowerCount)
  const heads = new THREE.InstancedMesh(headGeometry, headMaterial, flowerCount)
  const flowerColors = [
    new THREE.Color('#fff4d8'),
    new THREE.Color('#ff9e91'),
    new THREE.Color('#f5c2d5'),
    new THREE.Color('#ffd166'),
    new THREE.Color('#d6d4ff'),
  ]

  for (let index = 0; index < flowerCount; index += 1) {
    let x = (random() - 0.5) * 46
    const z = random() * 31 - 8

    if (Math.abs(x) < 4.5 && z > -2 && z < 5) x += x < 0 ? -5 : 5

    const ground = terrainHeight(x, z)
    const height = 0.32 + random() * 0.62

    dummy.position.set(x, ground + height / 2, z)
    dummy.rotation.set(0, random() * Math.PI, (random() - 0.5) * 0.16)
    dummy.scale.set(1, height / 0.5, 1)
    dummy.updateMatrix()
    stems.setMatrixAt(index, dummy.matrix)

    dummy.position.set(x, ground + height, z)
    dummy.rotation.set(random() * 0.4, random() * Math.PI, random() * 0.4)
    dummy.scale.setScalar(0.72 + random() * 0.75)
    dummy.updateMatrix()
    heads.setMatrixAt(index, dummy.matrix)
    heads.setColorAt(index, flowerColors[Math.floor(random() * flowerColors.length)])
  }

  stems.instanceMatrix.needsUpdate = true
  heads.instanceMatrix.needsUpdate = true
  heads.instanceColor.needsUpdate = true
  group.add(stems, heads)

  const rockGeometry = new THREE.DodecahedronGeometry(1, 0)
  const rockMaterial = new THREE.MeshStandardMaterial({ color: '#253d37', roughness: 1 })
  const rocks = new THREE.InstancedMesh(rockGeometry, rockMaterial, rockCount)

  for (let index = 0; index < rockCount; index += 1) {
    const x = (random() - 0.5) * 31
    const z = 8 + random() * 19
    const scale = 0.35 + random() * 1.05
    dummy.position.set(x, terrainHeight(x, z) + scale * 0.25, z)
    dummy.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI)
    dummy.scale.set(scale * (1.2 + random()), scale * 0.55, scale)
    dummy.updateMatrix()
    rocks.setMatrixAt(index, dummy.matrix)
  }

  rocks.instanceMatrix.needsUpdate = true
  rocks.castShadow = !isCompact
  group.add(rocks)

  return group
}

const disposeObject = (object) => {
  object.traverse((child) => {
    child.geometry?.dispose()
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose())
    else child.material?.dispose()
  })
}

export const createPortfolioScene = (canvas, { reducedMotion = false } = {}) => {
  const isCompact = window.innerWidth < 768
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.AgXToneMapping
  renderer.toneMappingExposure = 1.12
  renderer.shadowMap.enabled = !isCompact
  renderer.shadowMap.type = THREE.PCFShadowMap

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2('#4f83a0', 0.017)
  const camera = new THREE.PerspectiveCamera(43, 1, 0.07, 180)
  const world = new THREE.Group()
  scene.add(world)

  const sky = createSky()
  const terrain = createTerrain()
  const distantHills = createDistantHills()
  const backdropTitle = createBackdropTitle(renderer)
  const meadow = createMeadow(isCompact)
  const directorSet = createDirectorSet(isCompact, terrainHeight(0, 0))
  world.add(sky, backdropTitle.mesh, distantHills, terrain, meadow, directorSet.group)

  scene.add(new THREE.HemisphereLight('#a9d9ff', '#25371d', 2.5))

  const sunLight = new THREE.DirectionalLight('#ffd2a0', 4.8)
  sunLight.position.set(14, 22, 16)
  sunLight.castShadow = !isCompact
  sunLight.shadow.mapSize.set(1536, 1536)
  sunLight.shadow.camera.left = -20
  sunLight.shadow.camera.right = 20
  sunLight.shadow.camera.top = 20
  sunLight.shadow.camera.bottom = -20
  sunLight.shadow.camera.near = 1
  sunLight.shadow.camera.far = 55
  sunLight.shadow.bias = -0.00025
  scene.add(sunLight)

  const rimLight = new THREE.DirectionalLight('#75a8ff', 2)
  rimLight.position.set(-18, 8, -14)
  scene.add(rimLight)

  const cameraPath = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(0.5, 7.6, 27),
      new THREE.Vector3(-0.35, 6.7, 19),
      new THREE.Vector3(0.25, 5.65, 11.5),
      new THREE.Vector3(-0.08, 4.85, 6.4),
      new THREE.Vector3(0, directorSet.lensCenter.y + 0.08, 5.15),
      new THREE.Vector3(0, directorSet.lensCenter.y, 2.15),
    ],
    false,
    'catmullrom',
    0.22,
  )
  const position = new THREE.Vector3()
  const lookTarget = new THREE.Vector3()
  let backdropLayoutDirty = true

  const resize = () => {
    const width = Math.max(canvas.clientWidth, 1)
    const height = Math.max(canvas.clientHeight, 1)
    const pixelRatio = Math.min(window.devicePixelRatio || 1, isCompact ? 1.35 : 1.75)

    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    backdropLayoutDirty = true
  }

  const render = (progress, pointer, elapsedTime) => {
    const travel = reducedMotion ? 0 : smoothStep(range(progress, 0.03, 0.82))
    cameraPath.getPointAt(travel, position)

    const pointerStrength = (1 - travel) * (reducedMotion ? 0 : 1)
    position.x += pointer.x * 0.9 * pointerStrength
    position.y += pointer.y * 0.42 * pointerStrength
    camera.position.copy(position)

    const targetTravel = smoothStep(range(progress, 0.58, 0.88))
    lookTarget.set(
      pointer.x * 0.22 * pointerStrength,
      directorSet.lensCenter.y + pointer.y * 0.16 * pointerStrength,
      THREE.MathUtils.lerp(directorSet.lensCenter.z - 0.7, -6, targetTravel),
    )
    camera.lookAt(lookTarget)

    if (backdropLayoutDirty) {
      backdropTitle.layout(camera)
      backdropLayoutDirty = false
    }

    directorSet.lensMaterial.emissiveIntensity = THREE.MathUtils.lerp(0.2, 1.1, travel)
    directorSet.lensGlow.intensity = THREE.MathUtils.lerp(isCompact ? 1.5 : 2.5, isCompact ? 7 : 10, travel)
    backdropTitle.material.opacity = 0.46 * (1 - smoothStep(range(progress, 0.14, 0.4)))
    meadow.rotation.y = Math.sin(elapsedTime * 0.08) * 0.002
    renderer.render(scene, camera)
  }

  const dispose = () => {
    disposeObject(scene)
    backdropTitle.texture.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }

  resize()
  render(0, { x: 0, y: 0 }, 0)

  return { dispose, render, resize }
}
