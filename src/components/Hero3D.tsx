'use client'

import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Text3D, 
  Center, 
  PerspectiveCamera, 
  Float, 
  Environment,
  PresentationControls,
  ContactShadows
} from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'
import gsap from 'gsap'

/**
 * SeekEngine High-Performance 3D Hero
 * Production-Grade Refactor: WebGL Optimizations & GPU discipline.
 */

// --- SHADERS ---

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
      
      float level = (vWorldPosition.y + 1.0) * 0.5;
      float wave = sin(vWorldPosition.x * 2.0 + uTime) * 0.05 * uFill;
      float fluidMask = step(level, uFill + wave);
      
      vec3 containerColor = vec3(0.12, 0.14, 0.18) * (0.8 + fresnel * 0.4);
      vec3 fluidColor = mix(uColorFluid, uColorSurface * 0.2, fresnel);
      fluidColor += sin(vViewPosition.z * 15.0 + uTime) * 0.01;
      
      vec3 color = mix(containerColor, fluidColor, fluidMask);
      float surface = smoothstep(uFill + wave - 0.08, uFill + wave, level) * fluidMask;
      color += surface * uColorSurface * 0.5;
      
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
      
      float vib = noise(position * 20.0 + uTime * 40.0) * 0.008 * uHeat;
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
      
      vec3 ironColor = vec3(0.06, 0.07, 0.09) * (0.8 + fresnel * 0.4);
      
      vec3 dullGlow = vec3(0.8, 0.1, 0.0);
      vec3 brightMolten = vec3(1.0, 0.5, 0.0);
      vec3 whiteHot = vec3(1.0, 0.95, 0.8);
      
      float h = max(0.0, uHeat);
      vec3 moltenColor = mix(dullGlow, brightMolten, pow(h, 1.5));
      moltenColor = mix(moltenColor, whiteHot, pow(h, 4.0) * (1.0 - fresnel));
      
      float convection = 0.9 + 0.1 * sin(uTime * 4.0 + vPosition.y * 10.0);
      
      vec3 finalColor = mix(ironColor, moltenColor * convection, uHeat);
      finalColor += h * fresnel * moltenColor * 0.5;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
}

// --- SUB-COMPONENTS ---

function SparkParticles({ count = 40, active = false }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const tempObject = useMemo(() => new THREE.Object3D(), [])
  
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

  // Correct visibility management via effect
  useEffect(() => {
    if (meshRef.current) meshRef.current.visible = active
  }, [active])

  useFrame((state, delta) => {
    if (!meshRef.current || !active) return
    
    particles.forEach((p, i) => {
      p.t += delta * p.speed
      const time = p.t % 2
      const scale = (1 - (time / 2)) * 0.5
      
      tempObject.position.set(
        p.offset[0] * 2, 
        (time - 1) + p.offset[1], 
        p.offset[2]
      )
      tempObject.scale.setScalar(scale)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[3, 0, 0]}>
      <boxGeometry args={[0.04, 0.04, 0.04]} />
      <meshBasicMaterial color="#ffcc00" transparent opacity={0.8} />
    </instancedMesh>
  )
}

function IndustrialAtmosphere({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const atmosphereMaterial = useMemo(() => {
    const color = isDark ? new THREE.Color("#020406") : new THREE.Color("#f1f1f1")
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uColor: { value: color },
        uOpacity: { value: 0.15 },
        uTime: { value: 0 }
      },
      vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uTime;
      varying vec2 vUv;
      
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        float n = noise(vUv * 100.0 + uTime * 0.01);
        vec3 finalColor = uColor + (n * 0.02);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `
    })
  }, [isDark])

  useFrame((state) => {
    atmosphereMaterial.uniforms.uTime.value = state.clock.elapsedTime
  })
  
  return (
    <mesh ref={meshRef} position={[0, 0, -15]}>
      <planeGeometry args={[100, 100]} />
      <primitive object={atmosphereMaterial} attach="material" />
    </mesh>
  )
}

function IndustrialScene({ isHighPower, isDark, isMobile }: { isHighPower: boolean, isDark: boolean, isMobile: boolean }) {
  // --- GPU DISCIPLINE: USE REFS FOR PERFORMANCE VALUES ---
  const fillRef = useRef(0)
  const heatRef = useRef(0)
  
  // Use public local fonts for production reliability
  const fontUrl = "/fonts/helvetiker_bold.typeface.json"

  // Memoize uniforms to prevent GC churn and breakage of GPU caching
  const dieselUniforms = useMemo(() => ({
    ...DieselShader.uniforms,
    uFill: { value: 0 },
    uTime: { value: 0 },
    uColorFluid: { value: new THREE.Color('#050301') },
    uColorSurface: { value: new THREE.Color('#ff9900') }
  }), [])

  const moltenUniforms = useMemo(() => ({
    ...MoltenShader.uniforms,
    uHeat: { value: 0 },
    uTime: { value: 0 }
  }), [])

  // Responsive values
  const textScale = isMobile ? 0.70 : 1.05
  const seekPos: [number, number, number] = isMobile ? [0, 1.8, 0] : [-2.8, 0, 0]
  const enginePos: [number, number, number] = isMobile ? [0, -0.8, 0] : [2.8, 0, 0]
  const cameraZ = isMobile ? 22 : 12

  useEffect(() => {
    const tl = gsap.timeline()
    tl.to({}, { duration: 0.5 })
      .to(fillRef, { 
        current: 1,
        duration: 4, 
        ease: "power2.inOut"
      })
      .to(heatRef, { 
        current: 0.65,
        duration: 3, 
        ease: "sine.inOut"
      }, "-=2.5")
    
    return () => { tl.kill() }
  }, [])

  useEffect(() => {
    const target = isHighPower ? 1.0 : 0.65
    const tween = gsap.to(heatRef, { 
        current: target,
        duration: 1.5, 
        ease: "power2.out"
    })
    return () => { tween.kill() }
  }, [isHighPower])

  useFrame((state) => {
    // Inject values directly into uniforms without React re-renders
    const time = state.clock.elapsedTime
    dieselUniforms.uTime.value = time
    dieselUniforms.uFill.value = fillRef.current
    
    moltenUniforms.uTime.value = time
    moltenUniforms.uHeat.value = heatRef.current
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, cameraZ]} fov={30} />
      <ambientLight intensity={isDark ? 0.6 : 0.8} />
      <pointLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
      <spotLight position={[-10, 20, 10]} angle={0.2} penumbra={1} intensity={isDark ? 4 : 2} color="#ffcc99" />
      
      <IndustrialAtmosphere isDark={isDark} />
      
      {/* Performance Optimization: Disable controls on mobile to save GPU cycles */}
      {isMobile ? (
        <group scale={textScale} position={[0, 0.4, 0]}>
           <TextObjects 
            fontUrl={fontUrl} 
            seekPos={seekPos} 
            enginePos={enginePos} 
            dieselUniforms={dieselUniforms} 
            moltenUniforms={moltenUniforms} 
            heatRef={heatRef}
            isHighPower={isHighPower}
          />
        </group>
      ) : (
        <PresentationControls
            global
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 1200 }}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 15, Math.PI / 15]}
            azimuth={[-Math.PI / 8, Math.PI / 8]}
        >
            <group scale={textScale} position={[0, 0.9, 0]}>
                <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
                    <TextObjects 
                        fontUrl={fontUrl} 
                        seekPos={seekPos} 
                        enginePos={enginePos} 
                        dieselUniforms={dieselUniforms} 
                        moltenUniforms={moltenUniforms} 
                        heatRef={heatRef}
                        isHighPower={isHighPower}
                    />
                </Float>
            </group>
        </PresentationControls>
      )}

      <ContactShadows position={[0, -2.5, 0]} opacity={isDark ? 0.25 : 0.15} scale={40} blur={4} far={4.5} />
      
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={isDark ? 0.8 : 0.4} />
        <Noise opacity={isDark ? 0.05 : 0.02} />
        <Vignette eskil={false} offset={0.1} darkness={isDark ? 0.8 : 0.4} />
        <ChromaticAberration 
            {...({
                offset: new THREE.Vector2(0.001, 0.001),
                opacity: isMobile ? 0 : 1
            } as any)} 
        />
      </EffectComposer>
      
      <Environment preset="night" />
    </>
  )
}

function TextObjects({ 
    fontUrl, 
    seekPos, 
    enginePos, 
    dieselUniforms, 
    moltenUniforms, 
    heatRef,
    isHighPower 
}: any) {
    return (
        <>
            <Center position={seekPos}>
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
                        uniforms={dieselUniforms}
                        side={THREE.DoubleSide}
                    />
                </Text3D>
            </Center>

            <Center position={enginePos}>
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
                        uniforms={moltenUniforms}
                        side={THREE.DoubleSide}
                    />
                </Text3D>
            </Center>
            
            <SparkParticles active={isHighPower} />
        </>
    )
}

export default function Hero3D({ isHighPower = false, isDark = true, isMobile = false }: { isHighPower?: boolean, isDark?: boolean, isMobile?: boolean }) {
  // Clamp DPR on mobile to prevent thermal throttling
  const dpr: [number, number] = isMobile ? [1, 1] : [1, 1.5]

  return (
    <div className="absolute inset-0 z-0 pointer-events-none w-full h-full">
      <Canvas 
        dpr={dpr} 
        gl={{ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <IndustrialScene isHighPower={isHighPower} isDark={isDark} isMobile={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  )
}
