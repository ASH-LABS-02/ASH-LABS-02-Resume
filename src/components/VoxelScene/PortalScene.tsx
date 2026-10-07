import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { animate, createScope, onScroll } from 'animejs'

const vertexShader = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`
const fragmentShader = `varying vec2 vUv; uniform float uTime;
void main(){vec2 p=(vUv-.5)*2.;float radius=length(p);float angle=atan(p.y,p.x);
float wave=sin(radius*22.-uTime*1.5+sin(angle*4.+uTime*.3)*2.);
float glow=pow(.5+.5*wave,3.);float edge=smoothstep(.9,.2,max(abs(p.x),abs(p.y)));
vec3 color=mix(vec3(.18,.025,.35),vec3(.67,.25,1.),glow);color+=vec3(.16,.045,.3)*edge;
gl_FragColor=vec4(color,.9);}`

export default function PortalScene() {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = host.current!
    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }) } catch { return }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setClearColor(0, 0)
    container.appendChild(renderer.domElement)
    const section = container.closest('.marquee-section') as HTMLElement
    section.dataset.webgl = 'ready'
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, .1, 50)
    camera.position.z = 10
    scene.add(new THREE.AmbientLight(0xb4a3de, 2.2))
    const light = new THREE.DirectionalLight(0xbbaaff, 4); light.position.set(-2, 5, 8); scene.add(light)
    const box = new THREE.BoxGeometry(.29, .29, .35)
    const stone = new THREE.MeshStandardMaterial({ color: 0x20142f, metalness: .45, roughness: .45 })
    const coordinates: [number, number][] = []
    for (let x = -4; x <= 4; x++) for (let y = -6; y <= 6; y++) if (Math.abs(x) >= 3 || Math.abs(y) >= 5) coordinates.push([x, y])
    const frame = new THREE.InstancedMesh(box, stone, coordinates.length)
    const dummy = new THREE.Object3D()
    coordinates.forEach(([x, y], i) => {
      dummy.position.set(x * .29, y * .29, Math.sin(i * 5) * .025); dummy.updateMatrix(); frame.setMatrixAt(i, dummy.matrix)
      frame.setColorAt(i, new THREE.Color().setHSL(.73, .2 + (i % 4) * .12, .2 + (i % 3) * .06))
    })
    const surface = new THREE.PlaneGeometry(1.46, 2.65)
    const shader = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: { uTime: { value: 0 } }, side: THREE.DoubleSide })
    const group = new THREE.Group(); group.add(frame, new THREE.Mesh(surface, shader))
    const second = group.clone(); scene.add(group, second)
    const scope = createScope().add(() => {
      animate(group.rotation, { y: [-.4, .4], ease: 'linear', autoplay: onScroll({ target: section, enter: 'bottom top', leave: 'top bottom', sync: .4 }) })
      animate(second.rotation, { y: [.4, -.4], ease: 'linear', autoplay: onScroll({ target: section, enter: 'bottom top', leave: 'top bottom', sync: .4 }) })
    })
    const resize = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height)
      const visibleWidth = 2 * Math.tan(THREE.MathUtils.degToRad(17.5)) * camera.position.z * camera.aspect
      const slot = width <= 600 ? 58 : width <= 1000 ? 105 : 150
      const portalHeight = width <= 600 ? 78 : 138
      const scale = (visibleWidth / width) * portalHeight / 3.77
      group.scale.setScalar(scale); second.scale.setScalar(scale)
      group.position.x = -visibleWidth / 2 + (visibleWidth / width) * slot / 2
      second.position.x = -group.position.x
    })
    resize.observe(container)
    let visible = true, elapsed = 0, last = 0
    const render = (time: number) => {
      elapsed += last ? Math.min((time - last) / 1000, .05) : 0; last = time
      shader.uniforms.uTime.value = elapsed
      group.position.y = Math.sin(elapsed * .6) * .1; second.position.y = -group.position.y
      renderer.render(scene, camera)
    }
    const loop = () => { last = 0; renderer.setAnimationLoop(visible && !document.hidden ? render : null) }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; loop() }); observer.observe(container)
    const lost = (event: Event) => { event.preventDefault(); renderer.setAnimationLoop(null); delete section.dataset.webgl }
    const restored = () => { section.dataset.webgl = 'ready'; loop() }
    renderer.domElement.addEventListener('webglcontextlost', lost); renderer.domElement.addEventListener('webglcontextrestored', restored)
    document.addEventListener('visibilitychange', loop); loop()
    return () => {
      renderer.setAnimationLoop(null); observer.disconnect(); resize.disconnect(); scope.revert()
      document.removeEventListener('visibilitychange', loop)
      renderer.domElement.removeEventListener('webglcontextlost', lost); renderer.domElement.removeEventListener('webglcontextrestored', restored)
      frame.dispose(); (second.children[0] as THREE.InstancedMesh).dispose(); box.dispose(); stone.dispose(); surface.dispose(); shader.dispose(); renderer.dispose(); renderer.domElement.remove(); delete section.dataset.webgl
    }
  }, [])
  return <div className="portal-scene" ref={host} aria-hidden="true" />
}
