'use client'

import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  Text3D, 
  Center, 
  PerspectiveCamera, 
  Float, 
  Environment,
  PresentationControls,
  Instances,
  Instance,
  ContactShadows
} from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'

/**
 * SeekEngine High-Performance 3D Hero
 * Final High-Fidelity Implementation
 */

// --- SHADERS ---

const BackgroundShader = {
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
    float noise(vec2 p) {
      vec2 i = floor(p); vec2 f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), f.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }

    void main() {
      vec2 p = vUv - 0.5;
      float d = length(p);
      
      float n = noise(vUv * 3.0 + uTime * 0.1);
      
      vec3 colorA = vec3(0.01, 0.015, 0.02); // Deep obsidian
      vec3 colorB = vec3(0.06, 0.03, 0.01); // Dark industrial amber
      vec3 colorC = vec3(0.04, 0.01, 0.01); // Deep oil crimson
      
      vec3 color = mix(colorA, colorB, n * 0.5 + 0.5);
      color = mix(color, colorC, sin(uTime * 0.2) * 0.5 + 0.5);
      
      // Add industrial grain
      color += (hash(vUv + uTime) - 0.5) * 0.02;
      
      // Vignette
      color *= smoothstep(1.0, 0.3, d);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
}

const DieselShader = {
  uniforms: {
    uTime: { value: 0 },
    uFill: { value: 0 },
    uColorFluid: { value: new THREE.Color('#050301') },
    uColorSurface: { value: new THREE.Color('#ff9900') },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    uniform float uTime;
    uniform float uFill;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      // Internal fluid sloshing distortion
      float slosh = sin(position.x * 3.0 + uTime * 0.5) * 0.015 * uFill;
      vec3 pos = position + normal * slosh;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec3 vViewPosition;
    uniform float uTime;
    uniform float uFill;
    uniform vec3 uColorFluid;
    uniform vec3 uColorSurface;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(max(0.0, 1.0 - dot(normal, viewDir)), 2.5);
      
      // Dynamic fluid level (Y axis)
      float level = (vWorldPosition.y + 1.0) * 0.5; // Roughly 0 to 1
      float wave = sin(vWorldPosition.x * 2.0 + uTime) * 0.05 * uFill;
      float fluidMask = step(level, uFill + wave);
      
      // Container Material
      vec3 containerColor = vec3(0.12, 0.14, 0.18) * (0.8 + fresnel * 0.4);
      
      // Thick Diesel Fluid (Viscous & Oily)
      vec3 fluidColor = mix(uColorFluid, uColorSurface * 0.2, fresnel);
      fluidColor += sin(vViewPosition.z * 15.0 + uTime) * 0.01; // Viscosity refractive ripples
      
      vec3 color = mix(containerColor, fluidColor, fluidMask);
      
      // Surface Tension Glow
      float surface = smoothstep(uFill + wave - 0.08, uFill + wave, level) * fluidMask;
      color += surface * uColorSurface * 0.5;
      
      // Specular Highlight
      float spec = pow(max(dot(reflect(-viewDir, normal), vec3(0,1,0)), 0.0), 32.0);
      color += spec * 0.1;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
}

const MoltenShader = {
  uniforms: {
    uTime: { value: 0 },
    uHeat: { value: 0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uHeat;

    float hash(float n) { return fract(sin(n) * 43758.5453); }
    float noise(vec3 x) {
      vec3 p = floor(x); vec3 f = fract(x);
      f = f*f*(3.0-2.0*f);
      float n = p.x + p.y*57.0 + 113.0*p.z;
      return mix(mix(mix(hash(n+0.0), hash(n+1.0),f.x), mix(hash(n+57.0), hash(n+58.0),f.x),f.y),
                 mix(mix(hash(n+113.0),hash(n+114.0),f.x), mix(hash(n+170.0),hash(n+171.0),f.x),f.y),f.z);
    }

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      // Heavy mechanical vibration
      float vib = noise(position * 20.0 + uTime * 40.0) * 0.008 * uHeat;
      // Thermal softening distortion
      float softening = noise(vec3(position.xy * 2.0, uTime * 0.2)) * 0.04 * uHeat;
      
      vec3 pos = position + normal * (vib + softening);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float uHeat;
    uniform float uTime;

    void main() {
      vec3 normal = normalize(vNormal);
      float fresnel = pow(max(0.0, 1.0 - dot(normal, vec3(0,0,1))), 3.0);
      
      // Dark forged iron (cool)
      vec3 ironColor = vec3(0.06, 0.07, 0.09) * (0.8 + fresnel * 0.4);
      
      // Heating phases
      vec3 dullGlow = vec3(0.8, 0.1, 0.0); // Deep red
      vec3 brightMolten = vec3(1.0, 0.5, 0.0); // Bright orange
      vec3 whiteHot = vec3(1.0, 0.95, 0.8); // Incandescent
      
      float h = max(0.0, uHeat);
      vec3 moltenColor = mix(dullGlow, brightMolten, pow(h, 1.5));
      moltenColor = mix(moltenColor, whiteHot, pow(h, 4.0) * (1.0 - fresnel));
      
      // Convection pulse
      float convection = 0.9 + 0.1 * sin(uTime * 4.0 + vPosition.y * 10.0);
      
      vec3 finalColor = mix(ironColor, moltenColor * convection, uHeat);
      
      // Thermal bloom leakage
      finalColor += uHeat * fresnel * moltenColor * 0.5;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

// --- SUB-COMPONENTS ---

function SparkParticles({ count = 20, active = false }) {
  const meshRef = useRef<THREE.Group>(null!)
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
        temp.push({ 
            t: Math.random() * 10, 
            speed: 0.5 + Math.random(), 
            offset: [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5] 
        })
    }
    return temp
  }, [count])

  useFrame((state, delta) => {
    if (!meshRef.current || !meshRef.current.children || !particles) return
    meshRef.current.children.forEach((child, i) => {
      const p = particles[i]
      if (!p || !child || !child.position || !child.scale) return
      p.t += delta * p.speed
      child.position.y = (p.t % 2) - 1 + (p.offset?.[1] || 0)
      const scale = active ? (1 - (p.t % 1) * 0.5) : 0
      child.scale.setScalar(Math.max(0.001, scale))
      child.visible = active && scale > 0.01
    })
  })

  return (
    <group ref={meshRef} position={[3, 0, 0]}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.02, 0.02, 0.02]} />
          <meshBasicMaterial color="#ffcc00" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function IndustrialAtmosphere({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const color = isDark ? "#020406" : "#f1f1f1"
  
  return (
    <mesh ref={meshRef} position={[0, 0, -15]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

function IndustrialScene({ isHighPower, isDark }: { isHighPower: boolean, isDark: boolean }) {
  const [fill, setFill] = useState(0)
  const [heat, setHeat] = useState(0)
  const fontUrl = "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json"

  useEffect(() => {
    // Stage 1: Industrial Initialization
    const tl = gsap.timeline()
    tl.to({}, { duration: 0.5 })
      .to({}, { 
        duration: 4, 
        onUpdate: () => setFill(tl.progress()),
        ease: "power2.inOut"
      })
      .to({}, { 
        duration: 3, 
        onUpdate: function() { 
          // Safely get progress from timeline
          setHeat(tl.progress() * 0.65) 
        },
        ease: "sine.inOut"
      }, "-=2.5")
    
    return () => { tl.kill() }
  }, [])

  useEffect(() => {
    const tween = gsap.to({}, { 
        duration: 1.5, 
        onUpdate: () => { 
            const target = isHighPower ? 1.0 : 0.65
            const p = tween.progress()
            setHeat(cur => THREE.MathUtils.lerp(cur, target, p))
        } 
    })
    return () => { tween.kill() }
  }, [isHighPower])

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={30} />
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
      <spotLight position={[-10, 20, 10]} angle={0.2} penumbra={1} intensity={4} color="#ffcc99" />
      
      <IndustrialAtmosphere isDark={isDark} />
      
      <PresentationControls
        global
        config={{ mass: 2, tension: 400 }}
        snap={{ mass: 4, tension: 1200 }}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 15, Math.PI / 15]}
        azimuth={[-Math.PI / 8, Math.PI / 8]}
      >
        <group scale={1.05} position={[0, 0.9, 0]}>
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
            {/* SEEK - Diesel Container */}
            <Center position={[-2.8, 0, 0]}>
              <Text3D
                font={fontUrl}
                size={1.4}
                height={0.5}
                bevelEnabled
                bevelThickness={0.06}
                bevelSize={0.04}
                curveSegments={8}
              >
                Seek
                <shaderMaterial
                  attach="material"
                  vertexShader={DieselShader.vertexShader}
                  fragmentShader={DieselShader.fragmentShader}
                  uniforms={DieselShader.uniforms}
                  side={THREE.DoubleSide}
                />
              </Text3D>
            </Center>

            {/* ENGINE - Molten Forging */}
            <Center position={[2.8, 0, 0]}>
              <Text3D
                font={fontUrl}
                size={1.4}
                height={0.5}
                bevelEnabled
                bevelThickness={0.06}
                bevelSize={0.04}
                curveSegments={8}
              >
                Engine
                <shaderMaterial
                  attach="material"
                  vertexShader={MoltenShader.vertexShader}
                  fragmentShader={MoltenShader.fragmentShader}
                  uniforms={MoltenShader.uniforms}
                  side={THREE.DoubleSide}
                />
              </Text3D>
            </Center>
            
            <SparkParticles active={isHighPower || heat > 0.8} />
          </Float>
        </group>
      </PresentationControls>

      <ContactShadows position={[0, -2.5, 0]} opacity={0.25} scale={40} blur={4} far={4.5} />
      
      {/* @ts-ignore - Prop mismatch in library types */}
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={0.8} />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={0.8} />
        {/* @ts-ignore - Library type mismatch in v2.x */}
        <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
      </EffectComposer>
      
      <Environment preset="night" />
    </>
  )
}

export default function Hero3D({ isHighPower = false, isDark = true }: { isHighPower?: boolean, isDark?: boolean }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
      <Canvas 
        dpr={[1, 1.5]} 
        gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <IndustrialScene isHighPower={isHighPower} isDark={isDark} />
        </Suspense>
      </Canvas>
    </div>
  )
}
