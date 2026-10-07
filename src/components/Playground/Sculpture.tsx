import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { animate } from 'animejs'

interface SculptureProps {
  shape: 'knot' | 'sphere' | 'cube'; scattered: boolean; resetRevision: number; enabled: boolean
  onStatus: (status: 'loading' | 'ready' | 'unavailable') => void
}
export default function Sculpture({ shape, scattered, resetRevision, enabled, onStatus }: SculptureProps) {
  const host = useRef<HTMLDivElement>(null)
  const values = useRef({ blend: shape === 'sphere' ? 1 : 0, cubeBlend: shape === 'cube' ? 1 : 0, scatter: scattered ? 1 : 0, x: -.22, y: -.45 })
  const motionEnabled = useRef(enabled)
  const refresh = useRef<() => void>(() => {})
  const restart = useRef<() => void>(() => {})
  useEffect(() => {
    motionEnabled.current = enabled
    const animation = animate(values.current, { blend: shape === 'sphere' ? 1 : 0, cubeBlend: shape === 'cube' ? 1 : 0, scatter: scattered ? 1 : 0, duration: enabled ? 1400 : 0, ease: 'inOut(3)', onUpdate: () => { if (!enabled) refresh.current() } })
    restart.current()
    return () => { animation.cancel() }
  }, [shape, scattered, enabled])
  useEffect(() => {
    const animation = animate(values.current, { x: -.22, y: -.45, duration: motionEnabled.current ? 900 : 0, ease: 'out(4)', onUpdate: () => { if (!motionEnabled.current) refresh.current() } })
    return () => { animation.cancel() }
  }, [resetRevision])
  useEffect(() => {
    const container = host.current!
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }) }
    catch { onStatus('unavailable'); return }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor(0x080a0b, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25
    const canvas = renderer.domElement
    canvas.tabIndex = 0; canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', 'Interactive voxel sculpture. Drag horizontally or use arrow keys to rotate. Use the form and action controls to change its shape or scatter it.')
    container.appendChild(canvas)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 40); camera.position.set(0, .15, 9.7)
    scene.add(new THREE.AmbientLight(0xbed8e1, 2))
    const cyan = new THREE.DirectionalLight(0x8affff, 5); cyan.position.set(-3, 4, 5); scene.add(cyan)
    const purple = new THREE.DirectionalLight(0xdba5ff, 4); purple.position.set(4, 0, 2); scene.add(purple)
    const rim = new THREE.DirectionalLight(0xffffff, 3); rim.position.set(0, 5, -3); scene.add(rim)
    const tubular = window.innerWidth < 700 ? 64 : 100, radial = 14
    const knot = new THREE.TorusKnotGeometry(1.5, .52, tubular, radial)
    const points = knot.getAttribute('position'), normals = knot.getAttribute('normal')
    const count = tubular * radial
    const box = new RoundedBoxGeometry(.225, .205, .09, 2, .015)
    const material = new THREE.MeshStandardMaterial({ color: 0x88949c, metalness: .55, roughness: .25 })
    const sculpture = new THREE.InstancedMesh(box, material, count)
    sculpture.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    sculpture.frustumCulled = false
    const group = new THREE.Group(); group.add(sculpture); scene.add(group)
    const coreMaterial = new THREE.MeshStandardMaterial({ color: 0x18212a, metalness: .6, roughness: .3 })
    const core = new THREE.Mesh(knot, coreMaterial)
    const sphereGeometry = new THREE.SphereGeometry(1.96, 32, 24)
    const sphereCore = new THREE.Mesh(sphereGeometry, coreMaterial)
    const cubeGeometry = new THREE.BoxGeometry(3.26, 3.26, 3.26)
    const cubeCore = new THREE.Mesh(cubeGeometry, coreMaterial)
    group.add(core, sphereCore, cubeCore)
    const origins: THREE.Vector3[] = [], targets: THREE.Vector3[] = [], directions: THREE.Vector3[] = [], bursts: THREE.Vector3[] = []
    const cubeTargets: THREE.Vector3[] = [], cubeNormals: THREE.Vector3[] = []
    const faceAxes = [
      new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
    ]
    const cubeRows = Math.floor(Math.sqrt(count / 6)), tilesPerFace = cubeRows * cubeRows
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / radial), col = i % radial, vertex = row * (radial + 1) + col
      const point = new THREE.Vector3().fromBufferAttribute(points, vertex)
      origins.push(point); directions.push(new THREE.Vector3().fromBufferAttribute(normals, vertex))
      const y = 1 - 2 * (i + .5) / count, radius = Math.sqrt(1 - y * y), angle = i * 2.399963
      targets.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius).multiplyScalar(2))
      // Six regular grids form a real tiled cube; remaining tiles sit inside its shell.
      const face = Math.floor(i / tilesPerFace) % 6, faceTile = i % tilesPerFace
      const u = ((faceTile % cubeRows + .5) / cubeRows - .5) * 3.3
      const v = ((Math.floor(faceTile / cubeRows) + .5) / cubeRows - .5) * 3.3
      const axis = faceAxes[face]
      const cubePoint = axis.clone().multiplyScalar(1.65)
      if (face < 2) { cubePoint.y = u; cubePoint.z = v }
      else if (face < 4) { cubePoint.x = u; cubePoint.z = v }
      else { cubePoint.x = u; cubePoint.y = v }
      if (i >= tilesPerFace * 6) cubePoint.multiplyScalar(.7)
      cubeTargets.push(cubePoint); cubeNormals.push(axis)
      bursts.push(new THREE.Vector3(Math.sin(i * 17.13), Math.cos(i * 13.73), Math.sin(i * 7.91)).multiplyScalar(.7))
      sculpture.setColorAt(i, new THREE.Color('#897a9f').lerp(new THREE.Color('#a1c9ce'), (point.y + 2.2) / 4.4))
    }
    const dummy = new THREE.Object3D(), normal = new THREE.Vector3(), forward = new THREE.Vector3(0, 0, 1)
    const ringGeometry = new THREE.RingGeometry(2.7, 2.71, 96)
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x70858c, transparent: true, opacity: .32, side: THREE.DoubleSide })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial); ring.rotation.x = -Math.PI / 2; ring.position.y = -2.4; scene.add(ring)
    let visible = true, contextAvailable = true, dragging = false, lastX = 0, lastY = 0, elapsed = 0, previous = 0, cameraDistance = 9.7
    let lastBlend = Number.NaN, lastCubeBlend = Number.NaN, lastScatter = Number.NaN
    const render = (time: number) => {
      if (!contextAvailable) return
      if (motionEnabled.current) elapsed += previous ? Math.min((time - previous) / 1000, .04) : 0
      previous = time
      const value = values.current
      camera.position.z = cameraDistance + value.scatter * 3
      core.visible = value.blend < .01 && value.cubeBlend < .01 && value.scatter < .01
      sphereCore.visible = value.blend > .99 && value.scatter < .01
      cubeCore.visible = value.cubeBlend > .99 && value.scatter < .01
      group.rotation.set(value.x, value.y + Math.sin(elapsed * .2) * .16, 0)
      group.position.y = motionEnabled.current ? Math.sin(elapsed * .55) * .07 : 0
      // Tile transforms only change while morphing. Rotation and floating happen on the parent group.
      if (value.blend !== lastBlend || value.cubeBlend !== lastCubeBlend || value.scatter !== lastScatter) {
        const knotWeight = Math.max(0, 1 - value.blend - value.cubeBlend)
        for (let i = 0; i < count; i++) {
          dummy.position.copy(origins[i]).multiplyScalar(knotWeight).addScaledVector(targets[i], value.blend).addScaledVector(cubeTargets[i], value.cubeBlend)
            .multiplyScalar(1 + value.scatter * .55).addScaledVector(bursts[i], value.scatter)
          normal.copy(targets[i]).normalize().multiplyScalar(value.blend).addScaledVector(directions[i], knotWeight).addScaledVector(cubeNormals[i], value.cubeBlend).normalize()
          dummy.quaternion.setFromUnitVectors(forward, normal)
          dummy.rotateZ(value.scatter * bursts[i].x * 3)
          dummy.scale.setScalar((tubular === 64 ? 1.13 : 1) * (1 - value.scatter * .12))
          dummy.updateMatrix(); sculpture.setMatrixAt(i, dummy.matrix)
        }
        sculpture.instanceMatrix.needsUpdate = true
        lastBlend = value.blend; lastCubeBlend = value.cubeBlend; lastScatter = value.scatter
      }
      renderer.render(scene, camera)
    }
    refresh.current = () => render(performance.now())
    const loop = () => {
      previous = 0
      renderer.setAnimationLoop(contextAvailable && visible && !document.hidden && motionEnabled.current ? render : null)
      if (visible && !document.hidden) refresh.current()
    }
    restart.current = loop
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height; cameraDistance = width < 440 ? 11.5 : 9.7; camera.updateProjectionMatrix(); renderer.setSize(width, height); refresh.current()
    }); resize.observe(container)
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; loop() }); observer.observe(container)
    const down = (event: PointerEvent) => { if (event.button !== 0) return; dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-dragging') }
    const move = (event: PointerEvent) => {
      if (!dragging) return
      values.current.y += (event.clientX - lastX) * .007
      if (event.pointerType === 'mouse') values.current.x += (event.clientY - lastY) * .005
      lastX = event.clientX; lastY = event.clientY; refresh.current()
    }
    const up = () => { dragging = false; canvas.classList.remove('is-dragging') }
    const key = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
      event.preventDefault()
      if (event.key === 'ArrowLeft') values.current.y -= .15
      if (event.key === 'ArrowRight') values.current.y += .15
      if (event.key === 'ArrowUp') values.current.x -= .15
      if (event.key === 'ArrowDown') values.current.x += .15
      refresh.current()
    }
    const lost = (event: Event) => { event.preventDefault(); contextAvailable = false; renderer.setAnimationLoop(null); onStatus('unavailable') }
    const restored = () => { contextAvailable = true; lastBlend = Number.NaN; onStatus('ready'); loop() }
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('keydown', key)
    canvas.addEventListener('webglcontextlost', lost); canvas.addEventListener('webglcontextrestored', restored)
    document.addEventListener('visibilitychange', loop)
    onStatus('ready'); loop()
    return () => {
      renderer.setAnimationLoop(null); resize.disconnect(); observer.disconnect()
      canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('keydown', key)
      canvas.removeEventListener('webglcontextlost', lost); canvas.removeEventListener('webglcontextrestored', restored); document.removeEventListener('visibilitychange', loop)
      sculpture.dispose(); knot.dispose(); box.dispose(); material.dispose(); coreMaterial.dispose(); sphereGeometry.dispose(); cubeGeometry.dispose(); ringGeometry.dispose(); ringMaterial.dispose(); renderer.dispose(); canvas.remove()
      refresh.current = () => {}; restart.current = () => {}
    }
  }, [onStatus])
  return <div className="sculpture-canvas" ref={host} />
}
