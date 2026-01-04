'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Premium 3D Hero - Noisy Gradient Shaders
 * Features: Interactive liquid spheres with Perlin noise distortion
 * Aesthetic: Apple-inspired monochrome glass with subtle color shifts
 */

const vertexShader = `
  varying vec2 vUv;
  varying float vDistortion;
  varying vec3 vNormal;
  uniform float uTime;

  // Simplex Noise 3D
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vNormal = normal;
    float noise = snoise(position * 0.5 + uTime * 0.2);
    vDistortion = noise;
    vec3 pos = position + normal * noise * 0.25;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  varying vec2 vUv;
  varying float vDistortion;
  varying vec3 vNormal;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  void main() {
    float intensity = (vDistortion + 1.2) / 2.4; 
    vec3 color = mix(uColorA, uColorB, intensity);
    
    // Subtler, more premium rim lighting
    float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
    color += pow(rim, 4.0) * 0.3;

    gl_FragColor = vec4(color, uOpacity);
  }
`

function LiquidSphere({ position, size, colorA, colorB, speed, isHighPower }: { 
    position: [number, number, number], 
    size: number, 
    colorA: string, 
    colorB: string, 
    speed: number,
    isHighPower?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)

  useFrame((state) => {
    const powerMultiplier = isHighPower ? 2.5 : 1.0
    const t = state.clock.getElapsedTime() * speed * powerMultiplier
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uOpacity.value,
        isHighPower ? 0.75 : 0.6,
        0.05
      )
    }
    
    // Smooth Mouse parallax effect
    if (meshRef.current) {
      const x = (state.mouse.x * state.viewport.width) / 12
      const y = (state.mouse.y * state.viewport.height) / 12
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0] + x, 0.03)
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1] + y, 0.03)
    }
  })

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color(colorA) },
    uColorB: { value: new THREE.Color(colorB) },
    uOpacity: { value: 0.6 }
  }), [colorA, colorB])

  return (
    <Float 
      speed={isHighPower ? 4 : 1.5} 
      rotationIntensity={isHighPower ? 2 : 1} 
      floatIntensity={isHighPower ? 3 : 1.5}
    >
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 48, 48]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </Float>
  )
}

export default function Hero3D({ isHighPower = false }: { isHighPower?: boolean }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        
        <LiquidSphere 
          position={[-3, 2, -2]} 
          size={2.0} 
          colorA="#1e293b" // slate-800
          colorB="#020617" // slate-950
          speed={0.25}
          isHighPower={isHighPower}
        />
        
        <LiquidSphere 
          position={[4, -2, -1]} 
          size={2.4} 
          colorA="#475569" // slate-600
          colorB="#0f172a" // slate-900
          speed={0.35}
          isHighPower={isHighPower}
        />

        <LiquidSphere 
          position={[0, 0, -5]} 
          size={4.0} 
          colorA="#f8fafc" // slate-50
          colorB="#94a3b8" // slate-400
          speed={0.15}
          isHighPower={isHighPower}
        />
      </Canvas>
      
      {/* Premium Apple Liquid Glass Overlay */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/5 backdrop-blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/10 dark:from-black/20 dark:via-transparent dark:to-black/10 pointer-events-none" />
    </div>
  )
}
