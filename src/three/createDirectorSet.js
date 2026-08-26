import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

const createBeam = (start, end, radius, material, radialSegments = 8) => {
  const direction = new THREE.Vector3().subVectors(end, start)
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  const geometry = new THREE.CylinderGeometry(radius, radius, direction.length(), radialSegments)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(midpoint)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
  return mesh
}

const createCinemaCamera = (isCompact) => {
  const group = new THREE.Group()
  const matteMaterial = new THREE.MeshStandardMaterial({
    color: '#171b1e',
    roughness: 0.48,
    metalness: 0.62,
  })
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#2d3337',
    roughness: 0.38,
    metalness: 0.72,
  })
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: '#a94032',
    roughness: 0.4,
    metalness: 0.52,
  })
  const rubberMaterial = new THREE.MeshStandardMaterial({
    color: '#080b0d',
    roughness: 0.8,
  })
  const screenMaterial = new THREE.MeshStandardMaterial({
    color: '#18374d',
    emissive: '#2aa4cc',
    emissiveIntensity: 1.5,
    roughness: 0.2,
  })

  const body = new THREE.Mesh(new RoundedBoxGeometry(4.4, 2.7, 3, 5, 0.26), bodyMaterial)
  body.position.set(0, 4.45, 0.2)
  group.add(body)

  const sidePanel = new THREE.Mesh(new RoundedBoxGeometry(4.48, 1.55, 2.7, 4, 0.16), matteMaterial)
  sidePanel.position.set(0, 4.45, 0.38)
  group.add(sidePanel)

  for (const x of [-2.2, 2.2]) {
    const accent = new THREE.Mesh(new RoundedBoxGeometry(0.1, 2.2, 2.35, 2, 0.04), edgeMaterial)
    accent.position.set(x, 4.45, 0.45)
    group.add(accent)
  }

  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.58, 2.5, 48, 1, false),
    matteMaterial,
  )
  barrel.rotation.x = Math.PI / 2
  barrel.position.set(0, 4.45, 2.05)
  group.add(barrel)

  const focusRing = new THREE.Mesh(
    new THREE.CylinderGeometry(1.53, 1.53, 0.42, 48),
    rubberMaterial,
  )
  focusRing.rotation.x = Math.PI / 2
  focusRing.position.set(0, 4.45, 2.65)
  group.add(focusRing)

  const frontRing = new THREE.Mesh(new THREE.TorusGeometry(1.37, 0.15, 14, 56), matteMaterial)
  frontRing.position.set(0, 4.45, 3.34)
  group.add(frontRing)

  const iris = new THREE.Mesh(
    new THREE.CircleGeometry(1.18, 64),
    new THREE.MeshBasicMaterial({ color: '#020508' }),
  )
  iris.position.set(0, 4.45, 3.35)
  group.add(iris)

  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: '#081722',
    emissive: '#06283d',
    emissiveIntensity: 0.2,
    metalness: 0.22,
    roughness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.97,
  })
  const lens = new THREE.Mesh(new THREE.CircleGeometry(1.08, 64), lensMaterial)
  lens.position.set(0, 4.45, 3.39)
  group.add(lens)

  const lensCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.34, 48),
    new THREE.MeshBasicMaterial({ color: '#02070c' }),
  )
  lensCore.position.set(0, 4.45, 3.405)
  group.add(lensCore)

  const coatingRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.018, 8, 48),
    new THREE.MeshBasicMaterial({ color: '#2f94b3', transparent: true, opacity: 0.42 }),
  )
  coatingRing.position.set(0, 4.45, 3.414)
  group.add(coatingRing)

  const lensGlint = new THREE.Mesh(
    new THREE.CircleGeometry(0.11, 24),
    new THREE.MeshBasicMaterial({ color: '#bde9ff', transparent: true, opacity: 0.82 }),
  )
  lensGlint.position.set(-0.32, 4.78, 3.42)
  group.add(lensGlint)

  const matteBoxParts = [
    { size: [4.45, 0.16, 1.28], position: [0, 6.02, 2.85], rotation: [-0.18, 0, 0] },
    { size: [4.45, 0.16, 1.28], position: [0, 2.88, 2.85], rotation: [0.18, 0, 0] },
    { size: [0.16, 3.2, 1.28], position: [-2.08, 4.45, 2.85], rotation: [0, 0.18, 0] },
    { size: [0.16, 3.2, 1.28], position: [2.08, 4.45, 2.85], rotation: [0, -0.18, 0] },
  ]

  for (const part of matteBoxParts) {
    const flap = new THREE.Mesh(new THREE.BoxGeometry(...part.size), matteMaterial)
    flap.position.set(...part.position)
    flap.rotation.set(...part.rotation)
    group.add(flap)
  }

  const handle = new THREE.Mesh(new RoundedBoxGeometry(2.3, 0.35, 0.55, 3, 0.1), rubberMaterial)
  handle.position.set(0, 6.35, -0.1)
  group.add(handle)
  group.add(
    createBeam(new THREE.Vector3(-0.85, 5.75, -0.1), new THREE.Vector3(-0.85, 6.25, -0.1), 0.09, bodyMaterial),
    createBeam(new THREE.Vector3(0.85, 5.75, -0.1), new THREE.Vector3(0.85, 6.25, -0.1), 0.09, bodyMaterial),
  )

  const monitorArm = createBeam(
    new THREE.Vector3(2.1, 5.08, 0.4),
    new THREE.Vector3(2.8, 5.34, 0.75),
    0.08,
    bodyMaterial,
  )
  group.add(monitorArm)

  const monitor = new THREE.Mesh(new RoundedBoxGeometry(1.65, 1.05, 0.18, 3, 0.1), matteMaterial)
  monitor.position.set(3.1, 5.48, 0.95)
  monitor.rotation.y = -0.18
  group.add(monitor)

  const monitorScreen = new THREE.Mesh(new RoundedBoxGeometry(1.38, 0.77, 0.05, 2, 0.06), screenMaterial)
  monitorScreen.position.set(3.08, 5.48, 1.06)
  monitorScreen.rotation.y = -0.18
  group.add(monitorScreen)

  const railMaterial = new THREE.MeshStandardMaterial({ color: '#626b6f', metalness: 0.8, roughness: 0.25 })
  for (const x of [-0.72, 0.72]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 4.5, 10), railMaterial)
    rail.rotation.x = Math.PI / 2
    rail.position.set(x, 2.95, 0.95)
    group.add(rail)
  }

  const tripodHead = new THREE.Mesh(new RoundedBoxGeometry(2.05, 0.65, 1.45, 3, 0.12), bodyMaterial)
  tripodHead.position.set(0, 2.62, 0)
  group.add(tripodHead)

  const tripodHub = new THREE.Vector3(0, 2.35, 0)
  const tripodMaterial = new THREE.MeshStandardMaterial({ color: '#24292c', metalness: 0.72, roughness: 0.34 })
  const feet = [
    new THREE.Vector3(-3.1, 0.06, 2.35),
    new THREE.Vector3(3.1, 0.06, 2.35),
    new THREE.Vector3(0.2, 0.06, -2.45),
  ]
  group.add(createBeam(new THREE.Vector3(0, 1.0, 0), tripodHub, 0.16, tripodMaterial, 12))
  for (const foot of feet) {
    group.add(createBeam(tripodHub, foot, 0.12, tripodMaterial, 12))
    const pad = new THREE.Mesh(new RoundedBoxGeometry(0.65, 0.14, 0.36, 2, 0.08), rubberMaterial)
    pad.position.copy(foot)
    group.add(pad)
  }

  const lensGlow = new THREE.PointLight('#3bbcff', isCompact ? 2.5 : 4, 8, 2)
  lensGlow.position.set(0, 4.45, 4.1)
  group.add(lensGlow)

  return {
    group,
    lensGlow,
    lensMaterial,
    lensCenter: new THREE.Vector3(0, 4.45, 3.42),
  }
}

const createStudioLight = () => {
  const group = new THREE.Group()
  const metalMaterial = new THREE.MeshStandardMaterial({ color: '#24292c', metalness: 0.74, roughness: 0.35 })
  const housingMaterial = new THREE.MeshStandardMaterial({ color: '#171a1c', roughness: 0.55 })
  const lampMaterial = new THREE.MeshStandardMaterial({
    color: '#fff1ce',
    emissive: '#ffb45c',
    emissiveIntensity: 4.5,
    roughness: 0.25,
  })

  const base = new THREE.Vector3(-7, 0.08, 0)
  const standTop = new THREE.Vector3(-7, 5.15, 0)
  group.add(createBeam(base, standTop, 0.1, metalMaterial, 10))
  for (const foot of [
    new THREE.Vector3(-8.4, 0.05, 1.2),
    new THREE.Vector3(-5.6, 0.05, 1.2),
    new THREE.Vector3(-7, 0.05, -1.4),
  ]) {
    group.add(createBeam(new THREE.Vector3(-7, 0.5, 0), foot, 0.07, metalMaterial, 8))
  }

  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 1.15, 1.7, 32, 1, true), housingMaterial)
  housing.rotation.x = Math.PI / 2
  housing.position.set(-7, 5.85, 0.75)
  group.add(housing)

  const lamp = new THREE.Mesh(new THREE.CircleGeometry(0.82, 40), lampMaterial)
  lamp.position.set(-7, 5.85, 1.63)
  group.add(lamp)

  const doorParts = [
    { size: [2.1, 0.12, 1.25], position: [-7, 7.0, 1.48], rotation: [-0.35, 0, 0] },
    { size: [2.1, 0.12, 1.25], position: [-7, 4.7, 1.48], rotation: [0.35, 0, 0] },
    { size: [0.12, 2.05, 1.25], position: [-8.1, 5.85, 1.48], rotation: [0, 0.35, 0] },
    { size: [0.12, 2.05, 1.25], position: [-5.9, 5.85, 1.48], rotation: [0, -0.35, 0] },
  ]
  for (const part of doorParts) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(...part.size), housingMaterial)
    door.position.set(...part.position)
    door.rotation.set(...part.rotation)
    group.add(door)
  }

  const spot = new THREE.SpotLight('#ffc36f', 48, 28, Math.PI / 5.5, 0.55, 1.5)
  spot.position.set(-7, 5.85, 2.1)
  spot.target.position.set(0, 3.2, 0)
  group.add(spot, spot.target)

  return group
}

const createAudioStation = () => {
  const group = new THREE.Group()
  const caseMaterial = new THREE.MeshStandardMaterial({ color: '#252b2e', roughness: 0.55, metalness: 0.4 })
  const panelMaterial = new THREE.MeshStandardMaterial({ color: '#111618', roughness: 0.72 })
  const metalMaterial = new THREE.MeshStandardMaterial({ color: '#6d7476', roughness: 0.32, metalness: 0.84 })
  const displayMaterial = new THREE.MeshStandardMaterial({
    color: '#21485a',
    emissive: '#4ec6dd',
    emissiveIntensity: 1.8,
  })

  const recorder = new THREE.Mesh(new RoundedBoxGeometry(3.1, 2.05, 1.8, 4, 0.18), caseMaterial)
  recorder.position.set(6.2, 1.15, 0.8)
  group.add(recorder)

  const panel = new THREE.Mesh(new RoundedBoxGeometry(2.72, 1.65, 0.12, 3, 0.1), panelMaterial)
  panel.position.set(6.2, 1.15, 1.75)
  group.add(panel)

  const display = new THREE.Mesh(new RoundedBoxGeometry(1.38, 0.48, 0.05, 2, 0.04), displayMaterial)
  display.position.set(6.1, 1.55, 1.84)
  group.add(display)

  for (const x of [5.35, 6.2, 7.05]) {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 20), metalMaterial)
    knob.rotation.x = Math.PI / 2
    knob.position.set(x, 0.75, 1.86)
    group.add(knob)
  }

  const antenna = createBeam(
    new THREE.Vector3(7.22, 2.1, 0.9),
    new THREE.Vector3(7.65, 4.05, 0.7),
    0.035,
    metalMaterial,
    8,
  )
  group.add(antenna)

  const boomMaterial = new THREE.MeshStandardMaterial({ color: '#1b2022', roughness: 0.62, metalness: 0.5 })
  const boomBase = new THREE.Vector3(8.2, 0.05, -0.4)
  const boomPivot = new THREE.Vector3(6.6, 6.6, -0.2)
  const boomTip = new THREE.Vector3(2.7, 6.35, 0.85)
  group.add(
    createBeam(boomBase, boomPivot, 0.07, boomMaterial, 10),
    createBeam(boomPivot, boomTip, 0.055, boomMaterial, 10),
  )

  const microphone = createBeam(
    new THREE.Vector3(2.1, 6.31, 1.0),
    new THREE.Vector3(3.0, 6.36, 0.8),
    0.16,
    panelMaterial,
    16,
  )
  group.add(microphone)

  return group
}

const createClapperboard = () => {
  const group = new THREE.Group()
  group.position.set(3.75, 1.35, 3.5)
  group.rotation.set(-0.04, -0.18, -0.08)

  const blackMaterial = new THREE.MeshStandardMaterial({ color: '#111517', roughness: 0.7 })
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: '#ece6d6', roughness: 0.68 })
  const board = new THREE.Mesh(new RoundedBoxGeometry(2.65, 1.55, 0.16, 3, 0.08), blackMaterial)
  group.add(board)

  for (const y of [-0.3, 0.05, 0.38]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.035, 0.03), whiteMaterial)
    line.position.set(0, y, 0.1)
    group.add(line)
  }

  const slate = new THREE.Mesh(new RoundedBoxGeometry(2.8, 0.42, 0.2, 2, 0.06), blackMaterial)
  slate.position.set(0, 1.0, 0)
  slate.rotation.z = -0.13
  group.add(slate)

  for (let index = 0; index < 5; index += 1) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.025), whiteMaterial)
    stripe.position.set(-1.08 + index * 0.55, 1.0, 0.12)
    stripe.rotation.z = -0.48
    group.add(stripe)
  }

  return group
}

const createCable = () => {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(6.3, 0.08, 1.3),
    new THREE.Vector3(5.1, 0.1, 3.1),
    new THREE.Vector3(2.1, 0.12, 4.3),
    new THREE.Vector3(-1.4, 0.1, 3.8),
    new THREE.Vector3(-3.1, 0.09, 5.2),
  ])
  const geometry = new THREE.TubeGeometry(curve, 48, 0.035, 6, false)
  const material = new THREE.MeshStandardMaterial({ color: '#111416', roughness: 0.85 })
  return new THREE.Mesh(geometry, material)
}

export const createDirectorSet = (isCompact, groundHeight) => {
  const group = new THREE.Group()
  const setScale = 1.08
  group.position.y = groundHeight
  group.scale.setScalar(setScale)

  const cinemaCamera = createCinemaCamera(isCompact)
  group.add(
    cinemaCamera.group,
    createStudioLight(),
    createAudioStation(),
    createClapperboard(),
    createCable(),
  )

  group.traverse((child) => {
    if (!child.isMesh) return
    child.castShadow = !isCompact
    child.receiveShadow = true
  })

  return {
    group,
    lensGlow: cinemaCamera.lensGlow,
    lensMaterial: cinemaCamera.lensMaterial,
    lensCenter: cinemaCamera.lensCenter
      .clone()
      .multiplyScalar(setScale)
      .add(new THREE.Vector3(0, groundHeight, 0)),
  }
}
