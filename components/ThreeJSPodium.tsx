'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Box, Cylinder, Text, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface ThreeJSPodiumProps {
  isActive: boolean
  timeRemaining?: number
  totalTime?: number
}

export default function ThreeJSPodium({ isActive, timeRemaining = 30, totalTime = 30 }: ThreeJSPodiumProps) {
  const podiumRef = useRef<THREE.Group>(null)
  const timerRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (podiumRef.current && isActive) {
      // Gentle pulsing animation when active
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      podiumRef.current.scale.setScalar(scale)
    } else if (podiumRef.current) {
      podiumRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
    }

    if (timerRef.current && isActive) {
      // Timer color changes based on time remaining
      const progress = timeRemaining / totalTime
      const material = timerRef.current.material as THREE.MeshStandardMaterial
      if (progress > 0.5) {
        material.color.setHex(0x10b981) // Green
      } else if (progress > 0.2) {
        material.color.setHex(0xf59e0b) // Yellow
      } else {
        material.color.setHex(0xef4444) // Red
      }
    }
  })

  return (
    <group ref={podiumRef} position={[0, -1.5, 2]}>
      {/* Main Podium */}
      <Cylinder
        args={[1.5, 1.8, 0.3]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#1e40af" 
          metalness={0.6}
          roughness={0.4}
        />
      </Cylinder>
      
      {/* Podium Top */}
      <Cylinder
        args={[1.8, 1.8, 0.1]}
        position={[0, 0.2, 0]}
      >
        <meshStandardMaterial 
          color="#3b82f6" 
          metalness={0.7}
          roughness={0.3}
        />
      </Cylinder>
      
      {/* Microphone */}
      <Cylinder
        args={[0.05, 0.05, 0.4]}
        position={[0, 0.4, 0]}
      >
        <meshStandardMaterial 
          color="#374151" 
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>
      
      {/* Microphone Head */}
      <Sphere
        args={[0.08]}
        position={[0, 0.6, 0]}
      >
        <meshStandardMaterial 
          color="#6b7280" 
          metalness={0.9}
          roughness={0.1}
        />
      </Sphere>
      
      {/* Timer Display */}
      {isActive && (
        <Box
          ref={timerRef}
          args={[1.2, 0.3, 0.1]}
          position={[0, 0.35, 0.9]}
        >
          <meshStandardMaterial 
            color="#10b981" 
            metalness={0.5}
            roughness={0.5}
          />
        </Box>
      )}
      
      {/* Timer Text */}
      {isActive && (
        <Text
          position={[0, 0.35, 0.95]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/helvetiker_regular.typeface.json"
        >
          {timeRemaining}s
        </Text>
      )}
      
      {/* Shark Tank Logo on Podium */}
      <Text
        position={[0, -0.1, 0.9]}
        fontSize={0.2}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
        font="/fonts/helvetiker_regular.typeface.json"
      >
        🦈
      </Text>
      
      {/* Presentation Instructions */}
      {!isActive && (
        <Text
          position={[0, 0.5, 0.9]}
          fontSize={0.12}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
          font="/fonts/helvetiker_regular.typeface.json"
        >
          Step up to present your idea
        </Text>
      )}
    </group>
  )
}
