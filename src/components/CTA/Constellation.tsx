import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { animate } from 'animejs'
import { assetUrl } from '../../assetUrl'

type WallpaperFormat = 'desktop' | 'phone'
type Props = {
  color: string
  seed: number
  enabled: boolean
  exportScene: RefObject<((format?: WallpaperFormat) => Promise<void>) | null>
  onStatus: (status: 'loading' | 'ready' | 'unavailable') => void
}
type Point = { x: number; y: number; z: number }
const PATTERNS = [
  [[0, -.1], [-1.05, 1.1], [.6, 2], [.85, .65], [-2.1, .15], [-1.65, -1.65], [1.7, -.75], [2.05, 1.15], [.5, -2.05]],
  [[-.25, .05], [-1.75, 1.35], [-.15, 2.15], [1.1, 1.3], [-2.15, -.65], [-.9, -1.7], [1.05, -1.95], [2.1, -.25], [.85, -.25]],
  [[.2, .1], [-1.45, 1.9], [.4, 2.15], [1.8, 1.15], [-1.85, .3], [-1.95, -1.35], [-.3, -1.95], [1.65, -1.5], [.45, -1.05]],
  [[-.1, -.05], [-1.9, 1.1], [-.7, 2.15], [.8, 1.35], [-1.9, -1.15], [-.45, -1.35], [1.1, -2.1], [2.1, -.6], [1.95, .85]],
]
const noise = (n: number) => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value) }
function layout(seed: number): Point[] {
  return PATTERNS[seed % PATTERNS.length].map(([x, y], i) => ({
    x: x + (seed ? (noise(seed * 19 + i) - .5) * .23 : 0),
    y: y + (seed ? (noise(seed * 31 + i) - .5) * .23 : 0),
    z: i === 0 ? .5 : (noise(seed * 13 + i) - .5) * .75,
  }))
}
function connect(points: Point[]) {
  const visited = new Set([0]), edges: [number, number][] = []
  while (visited.size < points.length) {
    let nearest: [number, number] = [0, 1], shortest = Infinity
    for (const a of visited) {
      for (let b = 0; b < points.length; b++) {
        if (visited.has(b)) continue
        const distance = (points[a].x - points[b].x) ** 2 + (points[a].y - points[b].y) ** 2
        if (distance < shortest) { shortest = distance; nearest = [a, b] }
      }
    }
    visited.add(nearest[1]); edges.push(nearest)
  }
  return edges
}

export default function Constellation({ color, seed, enabled, exportScene, onStatus }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const initialSeed = useRef(seed)
  const settings = useRef({ color, enabled })
  const refresh = useRef(() => {})
  const restart = useRef(() => {})
  const shuffle = useRef((_seed: number) => {})

  useEffect(() => {
    settings.current = { color, enabled }
    restart.current(); refresh.current()
  }, [color, enabled])

  useEffect(() => {
    const container = host.current!
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }) }
    catch { onStatus('unavailable'); return }
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    const canvas = renderer.domElement
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', 'Nine luminous voxel stars, connected in a three-dimensional constellation with drifting stardust. Change the glow or shuffle to create another universe.')
    container.appendChild(canvas)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, .1, 40)
    camera.position.set(0, .08, 8.1)
    scene.add(new THREE.AmbientLight(0xc3d5ff, .85))
    const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(-3, 5, 5); scene.add(key)
    const rim = new THREE.DirectionalLight(0x8a91ff, 2.2); rim.position.set(3, -1, 3); scene.add(rim)

    const currentColor = new THREE.Color(settings.current.color)
    const targetColor = currentColor.clone(), white = new THREE.Color(0xffffff)
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ color: currentColor, emissive: currentColor, emissiveIntensity: .42, roughness: .32, metalness: .2 })
    // Small gaps and offset face tiles keep each star visibly voxel-built, even at mobile size.
    const cells = Array.from({ length: 27 }, (_, i) => new THREE.Vector3(i % 3 - 1, Math.floor(i / 3) % 3 - 1, Math.floor(i / 9) - 1)).filter(p => p.lengthSq() > 0)
    const stars = new THREE.InstancedMesh(geometry, material, 9 * cells.length)
    stars.instanceMatrix.setUsage(THREE.DynamicDrawUsage); stars.frustumCulled = false
    for (let i = 0; i < stars.count; i++) stars.setColorAt(i, new THREE.Color().setScalar(i % 7 === 0 ? 1.55 : i % 3 === 0 ? .75 : .34))
    scene.add(stars)
    const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xe9ffff, toneMapped: false })
    const cores = new THREE.InstancedMesh(geometry, coreMaterial, 9)
    cores.instanceMatrix.setUsage(THREE.DynamicDrawUsage); cores.frustumCulled = false; scene.add(cores)

    const strandGeometry = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true)
    const strandMaterial = new THREE.MeshBasicMaterial({ color: currentColor, transparent: true, opacity: .56, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending })
    const haloMaterial = new THREE.MeshBasicMaterial({ color: currentColor, transparent: true, opacity: .065, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending })
    const strands = new THREE.InstancedMesh(strandGeometry, strandMaterial, 8)
    const strandHalos = new THREE.InstancedMesh(strandGeometry, haloMaterial, 8)
    for (const mesh of [strands, strandHalos]) { mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; scene.add(mesh) }
    const sparkMaterial = new THREE.MeshBasicMaterial({ color: 0xd8ffff, transparent: true, opacity: .95, toneMapped: false })
    const sparks = new THREE.InstancedMesh(geometry, sparkMaterial, 16)
    sparks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); sparks.frustumCulled = false; scene.add(sparks)

    const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 128
    const glowContext = glowCanvas.getContext('2d')!
    const glow = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64)
    glow.addColorStop(0, '#ffffffdf'); glow.addColorStop(.12, '#ffffff76'); glow.addColorStop(.34, '#ffffff18'); glow.addColorStop(1, '#ffffff00')
    glowContext.fillStyle = glow; glowContext.fillRect(0, 0, 128, 128)
    const glowTexture = new THREE.CanvasTexture(glowCanvas)
    const glowMaterial = new THREE.SpriteMaterial({ map: glowTexture, color: currentColor, transparent: true, opacity: .72, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending })
    const glows = Array.from({ length: 9 }, (_, i) => {
      const sprite = new THREE.Sprite(glowMaterial); sprite.scale.setScalar(i ? 1.25 : 1.8); scene.add(sprite); return sprite
    })
    const dustMaterial = new THREE.MeshBasicMaterial({ color: currentColor, transparent: true, opacity: .64, toneMapped: false })
    const dust = new THREE.InstancedMesh(geometry, dustMaterial, 84)
    dust.instanceMatrix.setUsage(THREE.DynamicDrawUsage); dust.frustumCulled = false
    const dustPoints = Array.from({ length: dust.count }, (_, i) => {
      const angle = noise(i + 90) * Math.PI * 2, radius = .8 + noise(i + 180) * 2.1
      dust.setColorAt(i, new THREE.Color(i % 5 === 0 ? '#ffffff' : i % 3 === 0 ? '#b59aff' : '#8fd4e5'))
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: (noise(i + 250) - .5) * 2.5, size: .012 + noise(i + 340) * .023 }
    })
    scene.add(dust)
    const orbitGeometry = new THREE.RingGeometry(2.74, 2.75, 120)
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x7692bc, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false })
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial); orbit.rotation.x = -Math.PI / 2; orbit.position.y = -2.52; scene.add(orbit)

    const star = new THREE.Object3D(), tile = new THREE.Object3D(), matrix = new THREE.Matrix4()
    const direction = new THREE.Vector3(), unitDirection = new THREE.Vector3(), axis = new THREE.Vector3(0, 1, 0)
    const points = layout(initialSeed.current), from = points.map(p => ({ ...p }))
    let targets = layout(initialSeed.current), edges = connect(targets), currentSeed = initialSeed.current
    const displayed = points.map(() => new THREE.Vector3())
    const transition = { progress: 1 }
    let transitionAnimation: ReturnType<typeof animate> | null = null, transitionTime = 0
    let visible = false, lost = false, disposed = false, exporting = false, elapsed = 0, previous = 0

    const settle = () => {
      transitionAnimation?.cancel(); transitionAnimation = null; transition.progress = 1
      points.forEach((p, i) => Object.assign(p, targets[i]))
    }
    const render = (time: number) => {
      if (lost || disposed) return
      const delta = settings.current.enabled && previous && !exporting ? Math.min((time - previous) / 1000, .05) : 0
      previous = time; elapsed += delta
      if (transitionAnimation && !exporting) {
        transitionTime += delta * 1000; transitionAnimation.seek(transitionTime)
        if (transitionTime >= transitionAnimation.duration) settle()
      }
      targetColor.set(settings.current.color)
      if (!settings.current.enabled || exporting) currentColor.copy(targetColor)
      else currentColor.lerp(targetColor, 1 - Math.exp(-delta * 7))
      material.color.copy(currentColor); material.emissive.copy(currentColor)
      coreMaterial.color.copy(currentColor).lerp(white, .86)
      strandMaterial.color.copy(currentColor); haloMaterial.color.copy(currentColor); glowMaterial.color.copy(currentColor); dustMaterial.color.copy(currentColor)
      sparkMaterial.color.copy(currentColor).lerp(white, .7)

      const progress = exporting ? 1 : transition.progress
      const burst = Math.sin(progress * Math.PI) ** 2
      strandMaterial.opacity = .56 * (1 - burst * .94)
      haloMaterial.opacity = .065 * (1 - burst)
      sparks.visible = burst < .45
      points.forEach((point, i) => {
        if (transitionAnimation) {
          point.x = THREE.MathUtils.lerp(from[i].x, targets[i].x, progress)
          point.y = THREE.MathUtils.lerp(from[i].y, targets[i].y, progress)
          point.z = THREE.MathUtils.lerp(from[i].z, targets[i].z, progress)
        }
        const source = exporting ? targets[i] : point
        const drift = settings.current.enabled ? Math.sin(elapsed * .5 + i * 1.3) * .045 : 0
        displayed[i].set(source.x, source.y + drift, source.z)
        star.position.copy(displayed[i]); star.rotation.set(.38 + i * .11, .62 + elapsed * .055, .13 + i * .035)
        const size = i === 0 ? .59 : .34 + (i % 3) * .085
        star.scale.setScalar(size); star.updateMatrix()
        cells.forEach((cell, j) => {
          const scatter = burst * (.48 + noise(i * 31 + j) * .9)
          tile.position.copy(cell).multiplyScalar(.36 + scatter)
          if (j % 7 === 0) tile.position.multiplyScalar(1.11)
          tile.rotation.set(scatter * 1.4, scatter * (j % 3), 0)
          tile.scale.setScalar(.315 * (1 - burst * .17)); tile.updateMatrix()
          matrix.multiplyMatrices(star.matrix, tile.matrix); stars.setMatrixAt(i * cells.length + j, matrix)
        })
        tile.position.set(0, 0, 0); tile.rotation.set(0, 0, 0); tile.scale.setScalar(.77); tile.updateMatrix()
        matrix.multiplyMatrices(star.matrix, tile.matrix); cores.setMatrixAt(i, matrix)
        glows[i].position.copy(displayed[i])
      })
      edges.forEach(([a, b], i) => {
        direction.subVectors(displayed[b], displayed[a])
        tile.position.copy(displayed[a]).addScaledVector(direction, .5)
        tile.quaternion.setFromUnitVectors(axis, unitDirection.copy(direction).normalize())
        tile.scale.set(.008, direction.length(), .008); tile.updateMatrix(); strands.setMatrixAt(i, tile.matrix)
        tile.scale.x = tile.scale.z = .031; tile.updateMatrix(); strandHalos.setMatrixAt(i, tile.matrix)
        for (let j = 0; j < 2; j++) {
          const travel = (elapsed * .13 + i * .17 + j * .5) % 1
          tile.position.copy(displayed[a]).addScaledVector(direction, travel)
          tile.rotation.set(.3, elapsed * .1 + i, .4); tile.scale.setScalar(j ? .021 : .036); tile.updateMatrix(); sparks.setMatrixAt(i * 2 + j, tile.matrix)
        }
      })
      dustPoints.forEach((point, i) => {
        tile.position.set(point.x + Math.sin(elapsed * .06 + i) * .08, point.y + Math.sin(elapsed * .09 + i * .8) * .11, point.z)
        tile.rotation.set(i * .7, elapsed * .04 + i, .5)
        tile.scale.setScalar(point.size * (.82 + Math.sin(elapsed * .7 + i) * .18)); tile.updateMatrix(); dust.setMatrixAt(i, tile.matrix)
      })
      for (const mesh of [stars, cores, strands, strandHalos, sparks, dust]) mesh.instanceMatrix.needsUpdate = true
      renderer.render(scene, camera)
    }
    refresh.current = () => { if (visible && !document.hidden) render(performance.now()) }
    const loop = () => {
      previous = 0
      if (!settings.current.enabled) settle()
      renderer.setAnimationLoop(visible && !document.hidden && !lost && settings.current.enabled ? render : null)
      refresh.current()
    }
    restart.current = loop
    shuffle.current = nextSeed => {
      if (nextSeed === currentSeed) return
      currentSeed = nextSeed
      transitionAnimation?.cancel()
      points.forEach((point, i) => Object.assign(from[i], point))
      targets = layout(nextSeed); edges = connect(targets); transition.progress = 0; transitionTime = 0
      // A paused Anime timeline advances only on the visible scene's own clock.
      // This freezes the burst itself, not just drawing, off-screen and in hidden tabs.
      if (settings.current.enabled) transitionAnimation = animate(transition, { progress: 1, duration: 1700, ease: 'inOut(3)', autoplay: false })
      else settle()
      refresh.current()
    }
    const fitCamera = (aspect: number) => {
      camera.aspect = aspect; camera.position.set(0, .08, Math.max(8.1, 8.1 / aspect)); camera.updateProjectionMatrix()
    }
    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height || lost) return
      fitCamera(width / height); renderer.setSize(width, height); render(performance.now())
    }
    resize()
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; loop() }); observer.observe(container)
    const resizer = new ResizeObserver(resize); resizer.observe(container)
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; loop(); onStatus('unavailable') }
    const restored = () => { lost = false; resize(); onStatus('ready'); loop() }
    canvas.addEventListener('webglcontextlost', contextLost); canvas.addEventListener('webglcontextrestored', restored)
    document.addEventListener('visibilitychange', loop)

    exportScene.current = async (format = 'desktop') => {
      if (lost || disposed) throw new Error('WebGL unavailable')
      const background = new Image(); background.src = assetUrl('night-sky.webp'); await background.decode()
      if (lost || disposed || !container.isConnected) throw new Error('Scene unavailable')
      const output = document.createElement('canvas')
      output.width = format === 'phone' ? 1440 : 2560; output.height = format === 'phone' ? 2560 : 1440
      const context = output.getContext('2d')!
      const scale = Math.max(output.width / background.width, output.height / background.height)
      context.drawImage(background, (output.width - background.width * scale) / 2, (output.height - background.height * scale) / 2, background.width * scale, background.height * scale)
      context.fillStyle = '#040a1824'; context.fillRect(0, 0, output.width, output.height)
      const dpr = renderer.getPixelRatio(), savedColor = currentColor.clone()
      try {
        exporting = true; orbit.visible = false
        renderer.setPixelRatio(1); renderer.setSize(output.width, output.height, false)
        fitCamera(output.width / output.height)
        if (format === 'phone') camera.position.y = -.25
        else camera.position.z = 9.15
        camera.updateProjectionMatrix()
        render(performance.now()); context.drawImage(canvas, 0, 0)
      } finally {
        exporting = false; orbit.visible = true; currentColor.copy(savedColor)
        renderer.setPixelRatio(dpr); previous = 0; resize()
      }
      const blob = await new Promise<Blob>((resolve, reject) => output.toBlob(value => value ? resolve(value) : reject(new Error('PNG export failed')), 'image/png'))
      if (disposed) throw new Error('Scene unavailable')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a'); link.href = url; link.download = `my-voxel-universe-${format}.png`
      document.body.appendChild(link); link.click(); link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    onStatus('ready')
    return () => {
      disposed = true; transitionAnimation?.cancel()
      renderer.setAnimationLoop(null); observer.disconnect(); resizer.disconnect(); document.removeEventListener('visibilitychange', loop)
      canvas.removeEventListener('webglcontextlost', contextLost); canvas.removeEventListener('webglcontextrestored', restored)
      for (const mesh of [stars, cores, strands, strandHalos, sparks, dust]) mesh.dispose()
      geometry.dispose(); strandGeometry.dispose(); orbitGeometry.dispose()
      for (const mat of [material, coreMaterial, strandMaterial, haloMaterial, sparkMaterial, glowMaterial, dustMaterial, orbitMaterial]) mat.dispose()
      glowTexture.dispose(); renderer.dispose(); canvas.remove()
      exportScene.current = null; refresh.current = () => {}; restart.current = () => {}; shuffle.current = () => {}
    }
  }, [exportScene, onStatus])

  useEffect(() => { shuffle.current(seed) }, [seed])
  return <div className="constellation-canvas" ref={host} />
}
