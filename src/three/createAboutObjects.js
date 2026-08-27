import * as THREE from 'three'

const createRoundedShape = (width, height, radius) => {
  const shape = new THREE.Shape()
  const left = -width / 2
  const right = width / 2
  const bottom = -height / 2
  const top = height / 2

  shape.moveTo(left + radius, bottom)
  shape.lineTo(right - radius, bottom)
  shape.quadraticCurveTo(right, bottom, right, bottom + radius)
  shape.lineTo(right, top - radius)
  shape.quadraticCurveTo(right, top, right - radius, top)
  shape.lineTo(left + radius, top)
  shape.quadraticCurveTo(left, top, left, top - radius)
  shape.lineTo(left, bottom + radius)
  shape.quadraticCurveTo(left, bottom, left + radius, bottom)
  return shape
}

const createRoundedExtrusion = (width, height, radius, depth) => {
  const geometry = new THREE.ExtrudeGeometry(createRoundedShape(width, height, radius), {
    depth,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.055,
    bevelThickness: 0.055,
    curveSegments: 12,
    steps: 1,
  })
  geometry.center()
  return geometry
}

const configureRenderer = (canvas) => {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.AgXToneMapping
  renderer.toneMappingExposure = 1.15
  return renderer
}

const createBadgeTexture = async (profile) => {
  const canvas = document.createElement('canvas')

  canvas.width = 900
  canvas.height = 1280

  const context = canvas.getContext('2d')

  context.fillStyle = '#f3efe6'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.strokeStyle = '#111111'
  context.lineWidth = 24
  context.strokeRect(22, 22, canvas.width - 44, canvas.height - 44)
  
  const image = new Image()
  image.src = profile.image || '/assets/avatar.jpg'

  try {
    await image.decode()

    const x = 62
    const y = 50
    const width = 776
    const height = 770

    const imageRatio = image.width / image.height
    const targetRatio = width / height

    let sx = 0
    let sy = 0
    let sw = image.width
    let sh = image.height

    if (imageRatio > targetRatio) {
      sw = image.height * targetRatio
      sx = (image.width - sw) / 2
    } else {
      sh = image.width / targetRatio
      sy = (image.height - sh) / 2
    }

    context.drawImage(
      image,
      sx,
      sy,
      sw,
      sh,
      x,
      y,
      width,
      height,
    )
  } catch (error) {
    console.warn('Badge avatar failed to load, falling back to a generated placeholder.', error)

    const fallbackGradient = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    fallbackGradient.addColorStop(0, '#f7d66b')
    fallbackGradient.addColorStop(1, '#f2efe8')
    context.fillStyle = fallbackGradient
    context.fillRect(62, 154, 776, 640)

    context.fillStyle = '#111111'
    context.font = '900 120px Arial, sans-serif'
    context.textAlign = 'center'
    context.fillText((profile.name || 'ME').slice(0, 2).toUpperCase(), canvas.width / 2, 540)
    context.textAlign = 'left'
  }

  // 底部信息
  context.fillStyle = '#111111'
  context.fillRect(62, 824, 776, 390)

  context.fillStyle = '#ffffff'
  context.font = '900 92px Arial, sans-serif'
  context.fillText(profile.name.toUpperCase(), 100, 930)

  context.fillStyle = '#ffc400'
  context.fillRect(96, 974, 708, 68)

  context.fillStyle = '#111111'
  context.font = '900 38px Arial, sans-serif'
  context.fillText(profile.role.toUpperCase(), 122, 1022)

  context.fillStyle = '#ffffff'
  context.font = '700 28px Arial, sans-serif'
  context.fillText(profile.location.toUpperCase(), 100, 1112)

  context.fillStyle = '#ffc400'
  context.font = '900 24px Arial, sans-serif'
  context.fillText('FRAME · LIGHT · PERFORMANCE', 100, 1170)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8

  return texture
}

const drawPhoneTexture = (context, canvas, profile, active) => {
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#050505'
  context.fillRect(0, 0, canvas.width, canvas.height)

  if (!active) {
    const reflection = context.createLinearGradient(0, 0, canvas.width, canvas.height)
    reflection.addColorStop(0, 'rgba(255,255,255,0.08)')
    reflection.addColorStop(0.32, 'rgba(255,255,255,0)')
    reflection.addColorStop(1, 'rgba(255,255,255,0.025)')
    context.fillStyle = reflection
    context.fillRect(0, 0, canvas.width, canvas.height)
    return
  }

  context.fillStyle = '#f7f3ea'
  context.font = '700 28px Arial, sans-serif'
  context.fillText(new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  }), 56, 70)
  context.textAlign = 'left'

  context.fillStyle = '#ffc400'
  context.font = '900 58px Arial, sans-serif'
  context.fillText('CONTACT', 56, 180)
  context.fillStyle = '#f7f3ea'
  context.font = '900 78px Arial, sans-serif'
  context.fillText(profile.name.toUpperCase(), 56, 280)
  context.fillStyle = '#ffc400'
  context.font = '800 34px Arial, sans-serif'
  context.fillText(profile.role.toUpperCase(), 56, 340)

  context.fillStyle = '#f7f3ea'
  context.font = '700 28px Arial, sans-serif'
  context.fillText(profile.availability.toUpperCase(), 56, 1208)
  context.fillStyle = '#ffc400'
  context.fillRect(56, 1255, canvas.width - 112, 10)
}

const disposeScene = (scene, renderer, textures = []) => {
  scene.traverse((child) => {
    child.geometry?.dispose()
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose())
    else child.material?.dispose()
  })
  textures.forEach((texture) => texture.dispose())
  renderer.dispose()
  renderer.forceContextLoss()
}

export const createBadgeScene = async (canvas, profile) => {
  const renderer = configureRenderer(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60)
  camera.position.set(0, 0.25, 14.5)

  scene.add(new THREE.HemisphereLight('#ffffff', '#425060', 2.5))
  const keyLight = new THREE.DirectionalLight('#fff0cf', 4.8)
  keyLight.position.set(-5, 7, 8)
  scene.add(keyLight)
  const rimLight = new THREE.DirectionalLight('#ffc400', 2.4)
  rimLight.position.set(6, 1, -4)
  scene.add(rimLight)

  const badgeTexture = await createBadgeTexture(profile)
  badgeTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)

  const root = new THREE.Group()
  const hangingGroup = new THREE.Group()
  const strapAnchor = new THREE.Vector2(0, 6.45)
  const restAttachment = new THREE.Vector2(0, 2.65)
  const attachmentPosition = restAttachment.clone()
  const attachmentVelocity = new THREE.Vector2()
  const dragTarget = restAttachment.clone()
  const dragStartPosition = new THREE.Vector2()
  const sceneOrigin = new THREE.Vector2()
  const strapDirection = new THREE.Vector3()
  const verticalAxis = new THREE.Vector3(0, 1, 0)

  root.add(hangingGroup)
  scene.add(root)

  const strapMaterial = new THREE.MeshStandardMaterial({ color: '#0b0b0c', roughness: 0.72 })
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: '#26282c',
    metalness: 0.82,
    roughness: 0.22,
  })
  const cardMaterial = new THREE.MeshStandardMaterial({ color: '#f3efe6', roughness: 0.38 })
  const badgeFaceMaterial = new THREE.MeshStandardMaterial({
    map: badgeTexture,
    roughness: 0.34,
    metalness: 0.02,
  })
  const edgeMaterial = new THREE.MeshStandardMaterial({ color: '#d9d6d0', roughness: 0.48 })

  const strap = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1, 0.18), strapMaterial)
  root.add(strap)

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.095, 10, 32), metalMaterial)
  ring.position.y = 0.21
  ring.scale.y = 0.72
  hangingGroup.add(ring)

  const clip = new THREE.Mesh(createRoundedExtrusion(0.72, 1.12, 0.18, 0.22), metalMaterial)
  clip.position.y = -0.27
  hangingGroup.add(clip)

  const badge = new THREE.Mesh(
    createRoundedExtrusion(4.75, 6.45, 0.34, 0.24),
    [cardMaterial, edgeMaterial],
  )
  badge.position.y = -3.8
  hangingGroup.add(badge)

  const badgeFace = new THREE.Mesh(new THREE.PlaneGeometry(4.58, 6.28), badgeFaceMaterial)
  badgeFace.position.set(0, -3.8, 0.19)
  hangingGroup.add(badgeFace)

  let disposed = false
  let activated = false
  let activationTime = 0
  let animationFrame = 0

  let isDragging = false
  let pointerStartX = 0
  let pointerStartY = 0
  let badgeRotation = 0
  let badgeAngularVelocity = 0
  let previousFrameTime = 0
  let activePointerId = null
  let originX = null
  let originY = null

  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const interactionRoot = canvas.closest('.about-section')
  const pointerListenerOptions = { capture: true, passive: false }

  const updateStrap = () => {
    strapDirection.set(
      attachmentPosition.x - strapAnchor.x,
      attachmentPosition.y - strapAnchor.y,
      0,
    )

    const strapLength = Math.max(strapDirection.length(), 0.001)
    strapDirection.divideScalar(strapLength)

    strap.position.set(
      (strapAnchor.x + attachmentPosition.x) / 2,
      (strapAnchor.y + attachmentPosition.y) / 2,
      0,
    )
    strap.scale.y = strapLength
    strap.quaternion.setFromUnitVectors(verticalAxis, strapDirection)
  }

  const updateBadgeTransform = () => {
    hangingGroup.position.set(attachmentPosition.x, attachmentPosition.y, 0)
    hangingGroup.rotation.z = badgeRotation
    updateStrap()
  }

  updateBadgeTransform()

  const resize = (origin) => {
    if (Number.isFinite(origin?.x) && Number.isFinite(origin?.y)) {
      originX = origin.x
      originY = origin.y
    }

    const width = Math.max(canvas.clientWidth, 1)
    const height = Math.max(canvas.clientHeight, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    const worldSize = getVisibleWorldSize()
    const screenX = originX ?? width / 2
    const screenY = originY ?? height / 2

    sceneOrigin.set(
      camera.position.x + (screenX / width - 0.5) * worldSize.width,
      camera.position.y + (0.5 - screenY / height) * worldSize.height,
    )
  }

  const getVisibleWorldSize = () => {
    const distance = Math.abs(camera.position.z)

    const visibleHeight =
      2 *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
      distance

    const visibleWidth = visibleHeight * camera.aspect

    return {
      width: visibleWidth,
      height: visibleHeight,
    }
  }

  const isPointerOverBadge = (event) => {
    const rect = canvas.getBoundingClientRect()
    const isInsideCanvas =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom

    if (!isInsideCanvas) return false

    pointer.x =
      ((event.clientX - rect.left) / rect.width) * 2 - 1

    pointer.y =
      -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)
    scene.updateMatrixWorld(true)

    const intersections = raycaster.intersectObject(
      hangingGroup,
      true,
    )

    return intersections.length > 0
  }

  const onPointerDown = (event) => {
    if (event.button !== 0 || event.isPrimary === false || !isPointerOverBadge(event)) return

    isDragging = true
    activePointerId = event.pointerId

    pointerStartX = event.clientX
    pointerStartY = event.clientY

    dragStartPosition.copy(attachmentPosition)
    dragTarget.copy(attachmentPosition)
    attachmentVelocity.multiplyScalar(0.35)

    event.preventDefault()
    event.stopPropagation()
    canvas.classList.add('is-dragging')
    interactionRoot?.classList.add('is-badge-dragging')
  }

  const onPointerMove = (event) => {
    if (!isDragging) {
      if (event.pointerType === 'mouse') {
        interactionRoot?.classList.toggle('is-badge-hovered', isPointerOverBadge(event))
      }
      return
    }

    if (event.pointerId !== activePointerId) return

    event.preventDefault()
    event.stopPropagation()

    const rect = canvas.getBoundingClientRect()
    const worldSize = getVisibleWorldSize()

    const deltaX = event.clientX - pointerStartX
    const deltaY = event.clientY - pointerStartY

    dragTarget.set(
      dragStartPosition.x + (deltaX / rect.width) * worldSize.width,
      dragStartPosition.y - (deltaY / rect.height) * worldSize.height,
    )
  }

  const endDrag = (event) => {
    if (
      !isDragging ||
      (event?.pointerId !== undefined && event.pointerId !== activePointerId)
    ) {
      return
    }

    isDragging = false
    activePointerId = null

    if (event?.cancelable) {
      event.preventDefault()
    }
    event?.stopPropagation()

    canvas.classList.remove('is-dragging')
    interactionRoot?.classList.remove('is-badge-hovered')
    interactionRoot?.classList.remove('is-badge-dragging')
  }

  const preventTouchScroll = (event) => {
    if (isDragging) event.preventDefault()
  }

  window.addEventListener('pointerdown', onPointerDown, pointerListenerOptions)
  window.addEventListener('pointermove', onPointerMove, pointerListenerOptions)
  window.addEventListener('pointerup', endDrag, pointerListenerOptions)
  window.addEventListener('pointercancel', endDrag, pointerListenerOptions)
  window.addEventListener('touchmove', preventTouchScroll, pointerListenerOptions)
  window.addEventListener('blur', endDrag)

  const simulateBadge = (deltaTime) => {
    const frameTime = Math.min(deltaTime, 1 / 30)
    const stepCount = Math.max(1, Math.ceil(frameTime / (1 / 120)))
    const stepTime = frameTime / stepCount

    for (let step = 0; step < stepCount; step += 1) {
      const springTarget = isDragging ? dragTarget : restAttachment
      const springStiffness = isDragging ? 105 : 46
      const springDamping = isDragging ? 18 : 9.5
      const homeTension = isDragging ? 7 : 0

      const accelerationX =
        (springTarget.x - attachmentPosition.x) * springStiffness +
        (restAttachment.x - attachmentPosition.x) * homeTension -
        attachmentVelocity.x * springDamping
      const accelerationY =
        (springTarget.y - attachmentPosition.y) * springStiffness +
        (restAttachment.y - attachmentPosition.y) * homeTension -
        attachmentVelocity.y * springDamping

      attachmentVelocity.x += accelerationX * stepTime
      attachmentVelocity.y += accelerationY * stepTime
      attachmentPosition.addScaledVector(attachmentVelocity, stepTime)

      const offsetFromAnchorX = attachmentPosition.x - strapAnchor.x
      const offsetFromAnchorY = attachmentPosition.y - strapAnchor.y
      const strapAngle = Math.atan2(offsetFromAnchorX, -offsetFromAnchorY)
      const inertialLean = THREE.MathUtils.clamp(attachmentVelocity.x * 0.018, -0.14, 0.14)
      const rotationTarget = THREE.MathUtils.clamp(strapAngle + inertialLean, -0.9, 0.9)
      const rotationStiffness = isDragging ? 72 : 58
      const rotationDamping = isDragging ? 14 : 9
      const angularAcceleration =
        (rotationTarget - badgeRotation) * rotationStiffness -
        badgeAngularVelocity * rotationDamping

      badgeAngularVelocity += angularAcceleration * stepTime
      badgeRotation += badgeAngularVelocity * stepTime
    }

    if (
      !isDragging &&
      attachmentPosition.distanceToSquared(restAttachment) < 0.000001 &&
      attachmentVelocity.lengthSq() < 0.000001 &&
      Math.abs(badgeRotation) < 0.0005 &&
      Math.abs(badgeAngularVelocity) < 0.0005
    ) {
      attachmentPosition.copy(restAttachment)
      attachmentVelocity.set(0, 0)
      badgeRotation = 0
      badgeAngularVelocity = 0
    }

    updateBadgeTransform()
  }

  const render = (time) => {
    if (disposed) return

    const deltaTime = previousFrameTime === 0 ? 0 : (time - previousFrameTime) / 1000
    previousFrameTime = time
    simulateBadge(deltaTime)

    let entrance = 0

    if (activated) {
      const elapsed = Math.max(
        0,
        (time - activationTime) / 1000,
      )

      entrance =
        1 -
        Math.exp(-4.4 * elapsed) *
        Math.cos(elapsed * 8.5)
    }

    root.position.set(
      sceneOrigin.x,
      sceneOrigin.y + (1 - entrance) * 10.5,
      0,
    )

    renderer.render(scene, camera)
    animationFrame = requestAnimationFrame(render)
  }

  const setActive = (active) => {
    if (!active || activated) return
    activated = true
    activationTime = performance.now()
  }

  const dispose = () => {
    disposed = true

    cancelAnimationFrame(animationFrame)

    window.removeEventListener(
      'pointerdown',
      onPointerDown,
      pointerListenerOptions,
    )

    window.removeEventListener(
      'pointermove',
      onPointerMove,
      pointerListenerOptions,
    )

    window.removeEventListener(
      'pointerup',
      endDrag,
      pointerListenerOptions,
    )

    window.removeEventListener(
      'pointercancel',
      endDrag,
      pointerListenerOptions,
    )

    window.removeEventListener(
      'touchmove',
      preventTouchScroll,
      pointerListenerOptions,
    )

    window.removeEventListener('blur', endDrag)
    interactionRoot?.classList.remove('is-badge-hovered')
    interactionRoot?.classList.remove('is-badge-dragging')

    disposeScene(scene, renderer, [badgeTexture])
  }

  resize()
  animationFrame = requestAnimationFrame(render)
  return { dispose, resize, setActive }
}

export const createPhoneScene = (canvas, profile) => {
  const renderer = configureRenderer(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40)
  camera.position.set(0, 0.1, 12.5)

  scene.add(new THREE.HemisphereLight('#ffffff', '#30343d', 2.2))
  const keyLight = new THREE.DirectionalLight('#ffffff', 4.5)
  keyLight.position.set(-5, 7, 8)
  scene.add(keyLight)
  const rimLight = new THREE.DirectionalLight('#ffc400', 3.2)
  rimLight.position.set(5, -2, -2)
  scene.add(rimLight)

  const phoneGroup = new THREE.Group()
  phoneGroup.rotation.set(-0.06, -0.22, -0.045)
  scene.add(phoneGroup)

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#111216',
    metalness: 0.78,
    roughness: 0.22,
  })
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: '#383b42',
    metalness: 0.9,
    roughness: 0.16,
  })
  const body = new THREE.Mesh(
    createRoundedExtrusion(3.55, 7.15, 0.5, 0.38),
    [bodyMaterial, edgeMaterial],
  )
  phoneGroup.add(body)

  const screenCanvas = document.createElement('canvas')
  screenCanvas.width = 720
  screenCanvas.height = 1440
  const screenContext = screenCanvas.getContext('2d')
  drawPhoneTexture(screenContext, screenCanvas, profile, false)
  const screenTexture = new THREE.CanvasTexture(screenCanvas)
  screenTexture.colorSpace = THREE.SRGBColorSpace
  screenTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)

  const screenMaterial = new THREE.MeshStandardMaterial({
    map: screenTexture,
    emissive: '#000000',
    emissiveIntensity: 0,
    roughness: 0.18,
    metalness: 0.05,
  })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.12, 6.55), screenMaterial)
  screen.position.z = 0.255
  phoneGroup.add(screen)

  const speaker = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.52, 4, 12), bodyMaterial)
  speaker.rotation.z = Math.PI / 2
  speaker.position.set(0, 3.08, 0.31)
  phoneGroup.add(speaker)

  const sideButtonGeometry = new THREE.BoxGeometry(0.09, 0.82, 0.18)
  const volumeButton = new THREE.Mesh(sideButtonGeometry, edgeMaterial)
  volumeButton.position.set(-1.84, 1.1, 0)
  phoneGroup.add(volumeButton)
  const powerButton = new THREE.Mesh(sideButtonGeometry, edgeMaterial)
  powerButton.position.set(1.84, 0.75, 0)
  phoneGroup.add(powerButton)

  let active = false
  let disposed = false
  let animationFrame = 0

  const resize = () => {
    const width = Math.max(canvas.clientWidth, 1)
    const height = Math.max(canvas.clientHeight, 1)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const render = (time) => {
    if (disposed) return
    const seconds = time / 1000
    phoneGroup.position.y = Math.sin(seconds * 1.15) * 0.09
    phoneGroup.rotation.y += ((active ? -0.08 : -0.22) + Math.sin(seconds * 0.7) * 0.025 - phoneGroup.rotation.y) * 0.06
    phoneGroup.rotation.z = -0.045 + Math.sin(seconds * 0.85) * 0.012
    screenMaterial.emissiveIntensity += ((active ? 0.48 : 0) - screenMaterial.emissiveIntensity) * 0.08
    renderer.render(scene, camera)
    animationFrame = requestAnimationFrame(render)
  }

  const setActive = (nextActive) => {
    active = nextActive
    drawPhoneTexture(screenContext, screenCanvas, profile, active)
    screenTexture.needsUpdate = true
    screenMaterial.emissive.set(active ? '#5f4a00' : '#000000')
  }

  const dispose = () => {
    disposed = true
    cancelAnimationFrame(animationFrame)
    disposeScene(scene, renderer, [screenTexture])
  }

  resize()
  animationFrame = requestAnimationFrame(render)
  return { dispose, resize, setActive }
}
