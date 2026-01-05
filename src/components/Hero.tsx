'use client'

import React, { useRef, Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
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

export default function Hero3D({
  isHighPower = false,
  isDark = true,
  isMobile = false
}: {
  isHighPower?: boolean
  isDark?: boolean
  isMobile?: boolean
}) {
  const [heat, setHeat] = useState(0)

  useEffect(() => {
    gsap.to({}, {
      duration: 1.5,
      onUpdate: () => {
        setHeat(prev => THREE.MathUtils.lerp(prev, isHighPower ? 1 : 0.4, 0.08))
      }
    })
  }, [isHighPower])

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, isMobile ? 18 : 12]} fov={30} />

          <ambientLight intensity={isDark ? 0.6 : 0.8} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <spotLight position={[-10, 20, 10]} intensity={isDark ? 4 : 2} />

          <PresentationControls
            global
            polar={[-Math.PI / 12, Math.PI / 12]}
            azimuth={[-Math.PI / 6, Math.PI / 6]}
          >
            <group position={[0, isMobile ? 0.3 : 0.9, 0]}>
              <Float speed={1.2} floatIntensity={0.4}>
                <Center>
                  <Text3D
                    font="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json"
                    size={1.4}
                    height={0.5}
                    bevelEnabled
                    bevelThickness={0.06}
                    bevelSize={0.04}
                  >
                    SeekEngine
                    <meshStandardMaterial
                      color={isDark ? '#ffffff' : '#111111'}
                      emissive={new THREE.Color('#ff4500')}
                      emissiveIntensity={heat}
                    />
                  </Text3D>
                </Center>
              </Float>
            </group>
          </PresentationControls>

          <ContactShadows position={[0, -2.5, 0]} opacity={0.25} scale={40} blur={4} />

          <EffectComposer multisampling={0}>
            <Bloom intensity={isDark ? 0.8 : 0.4} />
            <Noise opacity={0.03} />
            <Vignette eskil={false} offset={0.1} darkness={0.6} />
            <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
          </EffectComposer>

          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  )
}
