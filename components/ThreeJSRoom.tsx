'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Box, Sphere, Plane } from '@react-three/drei'
import { Judge } from '@/types/judge'
import ThreeJSJudge from './ThreeJSJudge'
import ThreeJSPodium from './ThreeJSPodium'
import * as THREE from 'three'

interface ThreeJSRoomProps {
  judges: Judge[]
  onJudgeClick?: (judge: Judge) => void
  currentPhase: 'preparation' | 'presentation' | 'questions' | 'scoring' | 'results'
}


// 3D Room Environment
function RoomEnvironment() {
  return (
    <>
      {/* Floor */}
      <Plane
        args={[20, 20]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
      >
        <meshStandardMaterial 
          color="#1e3a8a" 
          metalness={0.1}
          roughness={0.8}
        />
      </Plane>
      
      {/* Walls */}
      <Box args={[20, 8, 0.2]} position={[0, 2, -10]}>
        <meshStandardMaterial color="#1e40af" />
      </Box>
      
      <Box args={[0.2, 8, 20]} position={[-10, 2, 0]}>
        <meshStandardMaterial color="#1e40af" />
      </Box>
      
      <Box args={[0.2, 8, 20]} position={[10, 2, 0]}>
        <meshStandardMaterial color="#1e40af" />
      </Box>
      
      {/* Ceiling */}
      <Plane
        args={[20, 20]}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 6, 0]}
      >
        <meshStandardMaterial 
          color="#1e3a8a" 
          metalness={0.2}
          roughness={0.6}
        />
      </Plane>
      
      {/* Shark Tank Logo */}
      <Text
        position={[0, 4, -9.8]}
        fontSize={0.8}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
        font="/fonts/helvetiker_regular.typeface.json"
      >
        🦈 SHARK TANK
      </Text>
      
      {/* Decorative Elements */}
      {/* Shark fin decorations */}
      <Box args={[0.1, 0.5, 0.3]} position={[-8, 1, -9.5]} rotation={[0, 0, 0.3]}>
        <meshStandardMaterial color="#1e40af" metalness={0.6} roughness={0.4} />
      </Box>
      <Box args={[0.1, 0.5, 0.3]} position={[8, 1, -9.5]} rotation={[0, 0, -0.3]}>
        <meshStandardMaterial color="#1e40af" metalness={0.6} roughness={0.4} />
      </Box>
      
      {/* Money symbols floating around */}
      {Array.from({ length: 8 }, (_, i) => (
        <Text
          key={i}
          position={[
            (Math.random() - 0.5) * 18,
            Math.random() * 4 + 1,
            (Math.random() - 0.5) * 18
          ]}
          fontSize={0.3}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
        >
          💰
        </Text>
      ))}
      
      {/* Chairs for judges */}
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 4) * Math.PI - Math.PI / 2
        const radius = 4.5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius - 2
        return (
          <Box key={i} args={[0.6, 0.8, 0.6]} position={[x, -0.4, z]} rotation={[0, angle + Math.PI / 2, 0]}>
            <meshStandardMaterial color="#374151" metalness={0.3} roughness={0.7} />
          </Box>
        )
      })}
    </>
  )
}

// Camera Controller
function CameraController({ phase }: { phase: string }) {
  const { camera } = useThree()
  
  useEffect(() => {
    if (phase === 'preparation') {
      // Wide view for preparation
      camera.position.set(0, 3, 8)
      camera.lookAt(0, 0, 0)
    } else if (phase === 'presentation') {
      // Closer view for presentation
      camera.position.set(0, 2, 6)
      camera.lookAt(0, 0, 0)
    } else if (phase === 'questions') {
      // Dynamic view for questions
      camera.position.set(2, 2, 5)
      camera.lookAt(0, 0, 0)
    }
  }, [phase, camera])
  
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

  // Position judges in a semi-circle
  const getJudgePosition = (index: number, total: number): [number, number, number] => {
    const angle = (index / (total - 1)) * Math.PI - Math.PI / 2
    const radius = 4
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius - 2
    return [x, 0, z]
  }

  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 60 }}
        shadows
        className="bg-gradient-to-b from-blue-900 to-blue-800"
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#fbbf24" />
        <pointLight position={[-5, 3, 5]} intensity={0.4} color="#3b82f6" />
        <pointLight position={[5, 3, 5]} intensity={0.4} color="#8b5cf6" />
        <spotLight
          position={[0, 8, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
          color="#ffffff"
        />
        
        {/* Environment */}
        <Environment preset="sunset" />
        
        {/* Room */}
        <RoomEnvironment />
        
        {/* Judges */}
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
