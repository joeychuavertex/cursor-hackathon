'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Box, Sphere, Plane, Cylinder } from '@react-three/drei'
import { Judge } from '@/types/judge'
import ThreeJSJudge from './ThreeJSJudge'
import ThreeJSPodium from './ThreeJSPodium'
import * as THREE from 'three'

interface ThreeJSRoomProps {
  judges: Judge[]
  onJudgeClick?: (judge: Judge) => void
  currentPhase: 'preparation' | 'presentation' | 'questions' | 'scoring' | 'results'
}


// Cinematic Room Environment
function RoomEnvironment() {
  return (
    <>
      {/* Polished Dark Floor with Water-like Shimmer */}
      <Plane
        args={[40, 40]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
      >
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.9}
          roughness={0.1}
          envMapIntensity={1.2}
        />
      </Plane>
      
      {/* Raised Stage Platform */}
      <Box args={[12, 0.3, 8]} position={[0, -1.85, 0]}>
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
      
      {/* Stage Edge Lighting */}
      <Box args={[12.2, 0.1, 0.2]} position={[0, -1.7, 4.1]}>
        <meshStandardMaterial 
          color="#00bfff" 
          emissive="#00bfff"
          emissiveIntensity={0.3}
        />
      </Box>
      <Box args={[12.2, 0.1, 0.2]} position={[0, -1.7, -4.1]}>
        <meshStandardMaterial 
          color="#00bfff" 
          emissive="#00bfff"
          emissiveIntensity={0.3}
        />
      </Box>
      <Box args={[0.2, 0.1, 8.2]} position={[6.1, -1.7, 0]}>
        <meshStandardMaterial 
          color="#00bfff" 
          emissive="#00bfff"
          emissiveIntensity={0.3}
        />
      </Box>
      <Box args={[0.2, 0.1, 8.2]} position={[-6.1, -1.7, 0]}>
        <meshStandardMaterial 
          color="#00bfff" 
          emissive="#00bfff"
          emissiveIntensity={0.3}
        />
      </Box>
      
      {/* Dramatic Backdrop */}
      <Box args={[40, 15, 0.5]} position={[0, 5.5, -20]}>
        <meshStandardMaterial 
          color="#0f0f0f" 
          metalness={0.3}
          roughness={0.8}
        />
      </Box>
      
      {/* Vertical Light Strips - Curved Arc */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 11) * Math.PI - Math.PI / 2
        const radius = 18
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius - 2
        return (
          <Box 
            key={i} 
            args={[0.1, 12, 0.1]} 
            position={[x, 3, z]}
          >
            <meshStandardMaterial 
              color="#00bfff" 
              emissive="#00bfff"
              emissiveIntensity={0.4}
            />
          </Box>
        )
      })}
      
      {/* Side Walls */}
      <Box args={[0.5, 15, 40]} position={[-20, 5.5, 0]}>
        <meshStandardMaterial color="#0a0a0a" metalness={0.2} roughness={0.9} />
      </Box>
      <Box args={[0.5, 15, 40]} position={[20, 5.5, 0]}>
        <meshStandardMaterial color="#0a0a0a" metalness={0.2} roughness={0.9} />
      </Box>
      
      {/* Ceiling */}
      <Plane
        args={[40, 40]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 13, 0]}
      >
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.1}
          roughness={0.9}
        />
      </Plane>
      
      {/* Atmospheric Particles */}
      {Array.from({ length: 50 }, (_, i) => (
        <Sphere
          key={i}
          args={[0.01]}
          position={[
            (Math.random() - 0.5) * 30,
            Math.random() * 8 + 2,
            (Math.random() - 0.5) * 30
          ]}
        >
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.1}
          />
        </Sphere>
      ))}
      
      {/* Floating Money Animation */}
      {Array.from({ length: 12 }, (_, i) => (
        <Text
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 4 + 1,
            (Math.random() - 0.5) * 20
          ]}
          fontSize={0.3}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
        >
          💰
        </Text>
      ))}
    </>
  )
}

// Halo-lit Pitching Circle
function PitchingCircle({ isActive }: { isActive: boolean }) {
  const circleRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (circleRef.current) {
      // Gentle floating animation
      circleRef.current.position.y = -1.85 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02
    }
    
    if (glowRef.current) {
      // Pulsing glow effect
      const intensity = isActive ? 0.6 : 0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      const material = glowRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = intensity
    }
  })

  return (
    <group ref={circleRef} position={[0, -1.85, 0]}>
      {/* Main Circle */}
      <Cylinder args={[2.5, 2.5, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>
      
      {/* Glowing Edge */}
      <Cylinder args={[2.6, 2.6, 0.05]} position={[0, 0.06, 0]}>
        <meshStandardMaterial 
          color="#00bfff" 
          emissive="#00bfff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </Cylinder>
      
      {/* Outer Glow Ring */}
      <Cylinder ref={glowRef} args={[3, 3, 0.02]} position={[0, 0.08, 0]}>
        <meshStandardMaterial 
          color="#00bfff" 
          emissive="#00bfff"
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
        />
      </Cylinder>
      
      {/* Center Logo */}
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.4}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
      >
        🦈
      </Text>
    </group>
  )
}

// Cinematic Camera Controller
function CameraController({ phase }: { phase: string }) {
  const { camera } = useThree()
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Cinematic camera movement based on phase
    switch (phase) {
      case 'preparation':
        // Wide, dramatic establishing shot
        camera.position.x = Math.sin(time * 0.05) * 2
        camera.position.y = 4 + Math.sin(time * 0.03) * 0.3
        camera.position.z = 10 + Math.cos(time * 0.05) * 1
        camera.lookAt(
          Math.sin(time * 0.02) * 0.5, 
          Math.sin(time * 0.01) * 0.2, 
          0
        )
        break
      case 'presentation':
        // Closer, focused on the stage
        camera.position.x = Math.sin(time * 0.08) * 1
        camera.position.y = 3 + Math.sin(time * 0.04) * 0.2
        camera.position.z = 7 + Math.cos(time * 0.08) * 0.5
        camera.lookAt(0, 0, 0)
        break
      case 'questions':
        // Dynamic, moving between judges
        camera.position.x = Math.sin(time * 0.1) * 3
        camera.position.y = 2.5 + Math.sin(time * 0.05) * 0.3
        camera.position.z = 6 + Math.cos(time * 0.1) * 1
        camera.lookAt(
          Math.sin(time * 0.06) * 1, 
          Math.sin(time * 0.03) * 0.5, 
          0
        )
        break
      default:
        // Default cinematic movement
        camera.position.x = Math.sin(time * 0.06) * 2
        camera.position.y = 3.5 + Math.sin(time * 0.04) * 0.2
        camera.position.z = 8 + Math.cos(time * 0.06) * 1
        camera.lookAt(0, 0, 0)
    }
  })
  
  return null
}

// Main 3D Room Component
export default function ThreeJSRoom({ judges, onJudgeClick, currentPhase }: ThreeJSRoomProps) {
  const [reactingJudge, setReactingJudge] = useState<string | null>(null)

  // Trigger judge reactions
  useEffect(() => {
    if (currentPhase === 'presentation') {
      const interval = setInterval(() => {
        const randomJudge = judges[Math.floor(Math.random() * judges.length)]
        setReactingJudge(randomJudge.id)
        setTimeout(() => setReactingJudge(null), 2000)
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [currentPhase, judges])

  // Position judges in a semi-circle behind curved desk
  const getJudgePosition = (index: number, total: number): [number, number, number] => {
    const angle = (index / (total - 1)) * Math.PI - Math.PI / 2
    const radius = 6
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius - 3
    return [x, 0, z]
  }

  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 60 }}
        shadows
        className="bg-gradient-to-b from-blue-900 to-blue-800"
      >
        {/* Cinematic Lighting System */}
        <ambientLight intensity={0.2} color="#0a0a2e" />
        
        {/* Main Stage Spotlight */}
        <spotLight
          position={[0, 12, 0]}
          angle={0.3}
          penumbra={0.5}
          intensity={2}
          castShadow
          color="#ffffff"
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* Rim Lighting for Judges */}
        <pointLight position={[0, 3, 6]} intensity={0.8} color="#00bfff" />
        <pointLight position={[0, 3, -6]} intensity={0.8} color="#00bfff" />
        <pointLight position={[6, 3, 0]} intensity={0.8} color="#00bfff" />
        <pointLight position={[-6, 3, 0]} intensity={0.8} color="#00bfff" />
        
        {/* Warm Accent Lights */}
        <pointLight position={[-8, 5, 8]} intensity={0.4} color="#fbbf24" />
        <pointLight position={[8, 5, 8]} intensity={0.4} color="#fbbf24" />
        
        {/* Atmospheric Haze Lights */}
        <pointLight position={[0, 8, -10]} intensity={0.3} color="#00bfff" />
        <pointLight position={[-15, 6, -5]} intensity={0.2} color="#00bfff" />
        <pointLight position={[15, 6, -5]} intensity={0.2} color="#00bfff" />
        
        {/* Environment */}
        <Environment preset="sunset" />
        
        {/* Room Environment */}
        <RoomEnvironment />
        
        {/* Pitching Circle Stage */}
        <PitchingCircle isActive={currentPhase === 'presentation'} />
        
        {/* Judges in Semi-circular Formation */}
        {judges.map((judge, index) => (
          <ThreeJSJudge
            key={judge.id}
            judge={judge}
            position={getJudgePosition(index, judges.length)}
            onClick={() => onJudgeClick?.(judge)}
            isReacting={reactingJudge === judge.id}
            currentExpression={reactingJudge === judge.id ? 'intrigued_look' : 'neutral'}
          />
        ))}
        
        {/* Presentation Podium */}
        <ThreeJSPodium 
          isActive={currentPhase === 'presentation'}
          timeRemaining={30}
          totalTime={30}
        />
        
        {/* Camera Controls */}
        <CameraController phase={currentPhase} />
        
        {/* Orbit Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={15}
        />
      </Canvas>
    </div>
  )
}
