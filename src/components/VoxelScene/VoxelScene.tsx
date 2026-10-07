import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { animate, createScope } from 'animejs'

// One instanced mesh for dust, one for the self-assembling satellites.
export default function VoxelScene({ energized }: { energized: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const energy = useRef(energized)
  useEffect(() => { energy.current = energized }, [energized])
  useEffect(() => {
    const container = host.current!
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }) }
    catch { container.dataset.fallback = 'true'; return }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement); renderer.domElement.setAttribute('aria-hidden', 'true')
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40)
    camera.position.z = 11
    scene.add(new THREE.AmbientLight(0xffffff, 1.5))
    const light = new THREE.DirectionalLight(0xbafff8, 3)
    light.position.set(2, 5, 6); scene.add(light)
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshStandardMaterial({ roughness: .32, metalness: .35 })
    const compact = window.innerWidth < 700
    const count = compact ? 28 : 64
    const cubes = new THREE.InstancedMesh(geometry, material, count)
    cubes.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    const dummy = new THREE.Object3D()
    const positions = Array.from({ length: count }, (_, i) => {
      const angle = i * 2.39996, radius = 2.5 + (i % 7) * .23
      cubes.setColorAt(i, new THREE.Color(i % 3 === 0 ? '#a48ad4' : '#67e8ed'))
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: Math.sin(i * 4.13) * 2, size: i % 9 === 0 ? .22 : .035 + (i % 5) * .014, phase: i * .8 }
    })
    scene.add(cubes)

    const satelliteMaterial = new THREE.MeshStandardMaterial({ roughness: .28, metalness: .58, emissive: 0x174a55, emissiveIntensity: .5 })
    const satelliteAnchors = [
      { x: -.76, y: .55, phase: 0, color: '#6ff7ed', size: 1 },
      { x: compact ? .5 : .75, y: -.02, phase: 4.6, color: '#b599ff', size: .86 },
      { x: -.7, y: -.31, phase: 9.2, color: '#829eff', size: .68 },
    ].slice(0, compact ? 2 : 3)
    const cells = Array.from({ length: 27 }, (_, i) => {
      const x = i % 3 - 1, y = Math.floor(i / 3) % 3 - 1, z = Math.floor(i / 9) - 1
      const direction = new THREE.Vector3(x, y, z).normalize()
      return { x, y, z, direction, phase: i * 2.39996 }
    }).filter(cell => cell.x || cell.y || cell.z)
    const satellites = new THREE.InstancedMesh(geometry, satelliteMaterial, cells.length * satelliteAnchors.length)
    satellites.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    // The cells move outside their assembled bounds during a burst.
    satellites.frustumCulled = false
    const satelliteAnchor = new THREE.Object3D(), tile = new THREE.Object3D(), tileMatrix = new THREE.Matrix4()
    satelliteAnchors.forEach((anchor, cluster) => {
      const color = new THREE.Color(anchor.color)
      cells.forEach((_, index) => satellites.setColorAt(cluster * cells.length + index, color))
    })
    scene.add(satellites)
    const smooth = (value: number) => { const t = THREE.MathUtils.clamp(value, 0, 1); return t * t * (3 - 2 * t) }
    const burstAt = (phase: number) => phase < 4 ? 0 : phase < 5.5 ? smooth((phase - 4) / 1.5) : phase < 7 ? 1 : phase < 9.6 ? 1 - smooth((phase - 7) / 2.6) : 0
    const drift = { rotation: -.08 }
    let driftAnimation: ReturnType<typeof animate> | undefined
    const scope = createScope().add(() => { driftAnimation = animate(drift, { rotation: .08, duration: 9000, alternate: true, loop: true, ease: 'inOutSine' }) })
    const pointer = { x: 0, y: 0 }
    let visible = true, contextLost = false, elapsed = 0, previous = 0, spin = 0, intensity = energy.current ? 1 : 0
    const render = (time: number) => {
      const delta = previous ? Math.min((time - previous) / 1000, .05) : 0
      elapsed += delta; previous = time
      intensity += ((energy.current ? 1 : 0) - intensity) * (1 - Math.exp(-delta * 3))
      spin += delta * .1 * intensity
      camera.position.x += (pointer.x * .45 - camera.position.x) * .045
      camera.position.y += (pointer.y * .25 - camera.position.y) * .045; camera.lookAt(0, 0, 0)
      cubes.rotation.z = drift.rotation
      positions.forEach((p, i) => {
        dummy.position.set(p.x, p.y + Math.sin(elapsed * .45 + p.phase) * .16, p.z)
        dummy.rotation.set(elapsed * .11 + p.phase, elapsed * .17 + p.phase, p.phase)
        dummy.scale.setScalar(p.size * (energy.current ? 1 : .65)); dummy.updateMatrix(); cubes.setMatrixAt(i, dummy.matrix)
      })
      cubes.instanceMatrix.needsUpdate = true
      const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * camera.position.z
      const halfWidth = halfHeight * camera.aspect
      satelliteAnchors.forEach((anchor, cluster) => {
        const phase = (elapsed + anchor.phase) % 14
        const spread = burstAt(phase) * intensity
        const orbit = elapsed * .18 + anchor.phase
        satelliteAnchor.position.set(anchor.x * halfWidth + Math.cos(orbit) * .1 * intensity, anchor.y * halfHeight + Math.sin(orbit) * .16 * intensity, -.3 + Math.sin(orbit) * .25 * intensity)
        satelliteAnchor.rotation.set(.48 + Math.sin(elapsed * .15 + cluster) * .13 * intensity, .65 + spin, .15 + Math.sin(orbit) * .14 * intensity)
        satelliteAnchor.scale.setScalar(anchor.size * (compact ? .82 : 1))
        satelliteAnchor.updateMatrix()
        cells.forEach((cell, index) => {
          const distance = spread * (.33 + (index % 4) * .055)
          tile.position.set(cell.x * .215 + cell.direction.x * distance, cell.y * .215 + cell.direction.y * distance, cell.z * .215 + cell.direction.z * distance)
          tile.rotation.set(spread * Math.sin(cell.phase) * 1.6, spread * Math.cos(cell.phase) * 1.6, spread * Math.sin(cell.phase + 1))
          tile.scale.setScalar(.185 * (1 - spread * .12)); tile.updateMatrix()
          tileMatrix.multiplyMatrices(satelliteAnchor.matrix, tile.matrix)
          satellites.setMatrixAt(cluster * cells.length + index, tileMatrix)
        })
      })
      satellites.instanceMatrix.needsUpdate = true
      satelliteMaterial.emissiveIntensity = .15 + intensity * .35
      renderer.render(scene, camera)
    }
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height)
    })
    resize.observe(container)
    const loop = () => {
      previous = 0
      const active = visible && !document.hidden && !contextLost
      renderer.setAnimationLoop(active ? render : null)
      if (active) driftAnimation?.resume(); else driftAnimation?.pause()
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; loop() })
    observer.observe(container)
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pointer.x = e.clientX / window.innerWidth * 2 - 1; pointer.y = -(e.clientY / window.innerHeight * 2 - 1)
    }
    const lost = (event: Event) => { event.preventDefault(); contextLost = true; loop(); container.dataset.fallback = 'true' }
    const restored = () => { contextLost = false; delete container.dataset.fallback; loop() }
    renderer.domElement.addEventListener('webglcontextlost', lost); renderer.domElement.addEventListener('webglcontextrestored', restored)
    window.addEventListener('pointermove', move, { passive: true }); document.addEventListener('visibilitychange', loop); loop()
    return () => {
      renderer.setAnimationLoop(null); scope.revert(); resize.disconnect(); observer.disconnect()
      window.removeEventListener('pointermove', move); document.removeEventListener('visibilitychange', loop)
      renderer.domElement.removeEventListener('webglcontextlost', lost); renderer.domElement.removeEventListener('webglcontextrestored', restored)
      cubes.dispose(); satellites.dispose(); geometry.dispose(); material.dispose(); satelliteMaterial.dispose(); renderer.dispose(); renderer.domElement.remove()
    }
  }, [])
  return <div className="voxel-scene" ref={host} aria-hidden="true" />
}
