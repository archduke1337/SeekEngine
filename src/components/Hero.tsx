'use client'

import { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'

/**
 * SeekEngine Hero — A Computational Organism
 * 
 * Philosophy:
 * - Dense, layered, volumetric, calm
 * - Thousands of coordinated elements forming a slowly evolving structure
 * - Motion is slow, intentional, almost subconscious
 * - No calls to action, no explanations
 * - The feeling that something important has been initiated
 * 
 * Not: a fancy background, a Three.js playground, spinning logos, floating icons
 * Yes: fields, volumes, layers, density, restraint
 */

interface HeroProps {
  isHighPower?: boolean
  isDark?: boolean
  isMobile?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CORE_PARTICLE_COUNT = 8000
const FILAMENT_COUNT = 120
const LAYER_COUNT = 5
const BREATHING_CYCLE = 20 // seconds for full breath
const PHASE_SPEED = 0.00008 // extremely slow phase shift

// Color palette: near-black base, graphite/deep blue, one restrained accent
const PALETTE = {
  void: new THREE.Color('#050508'),
  graphite: new THREE.Color('#1a1a1f'),
  deepBlue: new THREE.Color('#0a0a12'),
  charcoal: new THREE.Color('#12121a'),
  accent: new THREE.Color('#3a4a5a'), // ice/cool cyan muted
  accentBright: new THREE.Color('#5a6a7a'),
}

// ============================================================================
// DENSE VOLUMETRIC CORE — The Computational Mass
// ============================================================================

function VolumetricCore({ isMobile = false }: { isMobile?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)
  const count = isMobile ? 3000 : CORE_PARTICLE_COUNT
  
  // Generate particle positions in layered volumetric structure
  const { positions, basePositions, layers, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const basePositions = new Float32Array(count * 3)
    const layers = new Float32Array(count)
    const phases = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      // Assign to a layer (creates depth structure)
      const layer = Math.floor(Math.random() * LAYER_COUNT)
      layers[i] = layer
      
      // Layer-specific radius creates volumetric depth
      const layerRadius = 1.5 + layer * 0.6
      const layerThickness = 0.3
      
      // Distribute in toroidal volumes (not spherical — more intentional)
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI * 0.7 // compressed vertically
      const r = layerRadius + (Math.random() - 0.5) * layerThickness
      
      // Add structured noise to break perfect geometry
      const noiseScale = 0.15
      const nx = (Math.random() - 0.5) * noiseScale
      const ny = (Math.random() - 0.5) * noiseScale * 0.5 // less vertical noise
      const nz = (Math.random() - 0.5) * noiseScale
      
      const x = r * Math.cos(theta) * Math.cos(phi) + nx
      const y = r * Math.sin(phi) * 0.4 + ny // flattened
      const z = r * Math.sin(theta) * Math.cos(phi) + nz
      
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      
      // Store base positions for breathing
      basePositions[i * 3] = x
      basePositions[i * 3 + 1] = y
      basePositions[i * 3 + 2] = z
      
      // Random phase offset for convection
      phases[i] = Math.random() * Math.PI * 2
    }
    
    return { positions, basePositions, layers, phases }
  }, [count])
  
  // Slow, purposeful animation
  useFrame((state) => {
    if (!pointsRef.current) return
    
    const time = state.clock.elapsedTime
    const geo = pointsRef.current.geometry
    const posAttr = geo.attributes.position as THREE.BufferAttribute
    const pos = posAttr.array as Float32Array
    
    // Breathing: expansion/contraction over long interval
    const breathPhase = (Math.sin(time * (Math.PI * 2 / BREATHING_CYCLE)) + 1) * 0.5
    const breathScale = 0.97 + breathPhase * 0.06 // 0.97 to 1.03
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const layer = layers[i]
      const phase = phases[i]
      
      // Convection: slow internal circulation
      const convectionSpeed = PHASE_SPEED * (1 + layer * 0.2)
      const convectionAngle = time * convectionSpeed + phase
      
      // Get base position
      const bx = basePositions[i3]
      const by = basePositions[i3 + 1]
      const bz = basePositions[i3 + 2]
      
      // Apply breathing
      let x = bx * breathScale
      let y = by * breathScale
      let z = bz * breathScale
      
      // Apply convection (rotation around Y axis, layer-dependent)
      const cosA = Math.cos(convectionAngle)
      const sinA = Math.sin(convectionAngle)
      const rx = x * cosA - z * sinA
      const rz = x * sinA + z * cosA
      
      // Phase shifting: layers pass through each other
      const phaseShift = Math.sin(time * 0.05 + layer * 0.5) * 0.08 * layer
      
      pos[i3] = rx
      pos[i3 + 1] = y + phaseShift
      pos[i3 + 2] = rz
    }
    
    posAttr.needsUpdate = true
    
    // Very subtle overall rotation (almost imperceptible)
    pointsRef.current.rotation.y = time * 0.003
  })
  
  // Custom shader material for depth-aware particles
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: PALETTE.accentBright },
        uColorDark: { value: PALETTE.graphite },
      },
      vertexShader: `
        varying float vDepth;
        varying float vDistance;
        
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDepth = -mvPosition.z;
          vDistance = length(position);
          
          // Size attenuation based on depth
          gl_PointSize = (3.0 / -mvPosition.z) * (1.0 + vDistance * 0.1);
          gl_PointSize = clamp(gl_PointSize, 0.5, 4.0);
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uColorDark;
        varying float vDepth;
        varying float vDistance;
        
        void main() {
          // Circular point
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          if (dist > 0.5) discard;
          
          // Soft edge
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          
          // Color based on depth (further = darker)
          float depthMix = smoothstep(2.0, 8.0, vDepth);
          vec3 color = mix(uColor, uColorDark, depthMix);
          
          // Distance-based dimming (center brighter)
          float distanceFade = 1.0 - smoothstep(1.0, 4.0, vDistance) * 0.6;
          
          alpha *= distanceFade * 0.7;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])
  
  return (
    <points ref={pointsRef} material={material}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
    </points>
  )
}

// ============================================================================
// FILAMENTS — Thin lines forming and dissolving
// ============================================================================

function Filaments({ isMobile = false }: { isMobile?: boolean }) {
  const linesRef = useRef<THREE.LineSegments>(null)
  const count = isMobile ? 40 : FILAMENT_COUNT
  
  const { positions, opacities, baseOpacities } = useMemo(() => {
    const positions = new Float32Array(count * 6) // 2 points per line
    const opacities = new Float32Array(count)
    const baseOpacities = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      // Start point in core volume
      const theta1 = Math.random() * Math.PI * 2
      const r1 = 1 + Math.random() * 2
      const y1 = (Math.random() - 0.5) * 1.5
      
      // End point extends outward
      const theta2 = theta1 + (Math.random() - 0.5) * 0.3
      const r2 = r1 + 0.5 + Math.random() * 1.5
      const y2 = y1 + (Math.random() - 0.5) * 0.5
      
      positions[i * 6] = r1 * Math.cos(theta1)
      positions[i * 6 + 1] = y1
      positions[i * 6 + 2] = r1 * Math.sin(theta1)
      
      positions[i * 6 + 3] = r2 * Math.cos(theta2)
      positions[i * 6 + 4] = y2
      positions[i * 6 + 5] = r2 * Math.sin(theta2)
      
      // Random phase for appearance/disappearance
      baseOpacities[i] = Math.random() * Math.PI * 2
      opacities[i] = 0
    }
    
    return { positions, opacities, baseOpacities }
  }, [count])
  
  useFrame((state) => {
    if (!linesRef.current) return
    
    const time = state.clock.elapsedTime
    const material = linesRef.current.material as THREE.LineBasicMaterial
    
    // Slow rotation
    linesRef.current.rotation.y = time * 0.002
    
    // Pulsing opacity (filaments form and dissolve)
    const pulse = (Math.sin(time * 0.1) + 1) * 0.5
    material.opacity = 0.03 + pulse * 0.04
  })
  
  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count * 2}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={PALETTE.accent}
        transparent
        opacity={0.05}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}

// ============================================================================
// DEPTH LIGHT RAYS — Cutting through the volume
// ============================================================================

function DepthRays() {
  const groupRef = useRef<THREE.Group>(null)
  const rayCount = 5
  
  useFrame((state) => {
    if (!groupRef.current) return
    // Imperceptible rotation
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.02) * 0.05
  })
  
  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      {Array.from({ length: rayCount }).map((_, i) => {
        const angle = (i / rayCount) * Math.PI + Math.PI / 2
        const offset = (i - rayCount / 2) * 0.8
        return (
          <mesh
            key={i}
            position={[offset * 0.5, 0, -2]}
            rotation={[0, 0, angle * 0.1]}
          >
            <planeGeometry args={[0.003, 12]} />
            <meshBasicMaterial
              color={PALETTE.accent}
              transparent
              opacity={0.015}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

// ============================================================================
// CAMERA — Locked perspective, slow drift, heavy feel
// ============================================================================

function HeavyCamera() {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(0, 0, 0))
  const currentPos = useRef(new THREE.Vector3(0, 0, 6))
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Extremely slow drift — almost subconscious
    const driftX = Math.sin(time * 0.015) * 0.15
    const driftY = Math.cos(time * 0.012) * 0.08
    const driftZ = 6 + Math.sin(time * 0.008) * 0.1
    
    // Very slow interpolation for heavy feel
    currentPos.current.x += (driftX - currentPos.current.x) * 0.002
    currentPos.current.y += (driftY - currentPos.current.y) * 0.002
    currentPos.current.z += (driftZ - currentPos.current.z) * 0.002
    
    camera.position.copy(currentPos.current)
    camera.lookAt(target.current)
  })
  
  return null
}

// ============================================================================
// SCENE COMPOSITION
// ============================================================================

function Scene({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <>
      {/* Minimal ambient — most light comes from particles */}
      <ambientLight intensity={0.02} color={PALETTE.deepBlue} />
      
      {/* Single subtle directional for depth */}
      <directionalLight 
        position={[5, 3, 5]} 
        intensity={0.05} 
        color={PALETTE.accent}
      />
      
      {/* Camera controller */}
      <HeavyCamera />
      
      {/* Core volumetric mass */}
      <VolumetricCore isMobile={isMobile} />
      
      {/* Filaments */}
      <Filaments isMobile={isMobile} />
      
      {/* Depth rays */}
      <DepthRays />
      
      {/* Post-processing: subtle bloom, heavy vignette */}
      <EffectComposer>
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette
          eskil={false}
          offset={0.2}
          darkness={0.85}
        />
      </EffectComposer>
    </>
  )
}

// ============================================================================
// MICRO-NOISE OVERLAY — Layered on macro motion
// ============================================================================

function MicroNoise() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        mixBlendMode: 'overlay',
      }}
    />
  )
}

// ============================================================================
// MAIN HERO COMPONENT
// ============================================================================

export default function Hero({ isHighPower = false, isDark = true, isMobile = false }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Scroll-based depth reveal
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  // Smooth spring for scroll effects
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    restDelta: 0.001
  })
  
  // Depth separation on scroll
  const depthZ = useTransform(smoothProgress, [0, 0.5], [0, -2])
  const layerOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0.3])
  
  if (!mounted) {
    return (
      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: '#050508' }}
      />
    )
  }
  
  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#050508' }}
    >
      {/* 3D Canvas */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
        style={{ opacity: layerOpacity }}
      >
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50, near: 0.1, far: 50 }}
          dpr={isMobile ? 1 : [1, 1.5]}
          gl={{ 
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          style={{ background: '#050508' }}
        >
          <Suspense fallback={null}>
            <Scene isMobile={isMobile} />
          </Suspense>
        </Canvas>
      </motion.div>
      
      {/* Depth gradient overlay — describes depth, not decoration */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, transparent 0%, rgba(5,5,8,0.3) 50%, rgba(5,5,8,0.9) 100%)
          `,
        }}
      />
      
      {/* Micro-noise layer */}
      <MicroNoise />
      
      {/* Edge vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 200px 100px rgba(5,5,8,0.8)',
        }}
      />
    </div>
  )
}
