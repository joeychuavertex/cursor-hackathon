'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Box, Sphere, Cylinder } from '@react-three/drei'
import { Judge, MicroExpression } from '@/types/judge'
import * as THREE from 'three'

interface ThreeJSJudgeProps {
  judge: Judge
  position: [number, number, number]
  onClick?: () => void
  isReacting?: boolean
  currentExpression?: string
}

export default function ThreeJSJudge({ 
  judge, 
  position, 
  onClick, 
  isReacting = false,
  currentExpression = 'neutral'
}: ThreeJSJudgeProps) {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Animation based on micro expressions
  useFrame((state) => {
    if (!groupRef.current || !headRef.current || !bodyRef.current) return

    const time = state.clock.elapsedTime
    
    // Base floating animation
    groupRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.05
    
    // Expression-based animations
    switch (currentExpression) {
      case 'smile':
        headRef.current.rotation.x = Math.sin(time * 2) * 0.1
        headRef.current.scale.setScalar(1 + Math.sin(time * 3) * 0.05)
        break
      case 'frown':
        headRef.current.rotation.x = -Math.sin(time * 2) * 0.1
        headRef.current.scale.setScalar(1 - Math.sin(time * 3) * 0.05)
        break
      case 'nod':
        headRef.current.rotation.x = Math.sin(time * 4) * 0.2
        break
      case 'raise_eyebrow':
        headRef.current.rotation.x = Math.sin(time * 2) * 0.15
        headRef.current.scale.y = 1 + Math.sin(time * 3) * 0.1
        break
      case 'intense_stare':
        headRef.current.rotation.z = Math.sin(time * 0.5) * 0.05
        headRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.02)
        break
      case 'smirk':
        headRef.current.rotation.z = Math.sin(time * 3) * 0.1
        headRef.current.scale.x = 1 + Math.sin(time * 2) * 0.05
        break
      case 'head_tilt':
        headRef.current.rotation.z = Math.sin(time * 1.5) * 0.3
        break
      case 'lean_forward':
        bodyRef.current.rotation.x = Math.sin(time * 2) * 0.1
        groupRef.current.position.z = position[2] + Math.sin(time * 2) * 0.1
        break
      case 'stern_look':
        headRef.current.rotation.x = -Math.sin(time * 1.5) * 0.1
        headRef.current.scale.setScalar(1 - Math.sin(time * 2) * 0.03)
        break
      case 'slight_smile':
        headRef.current.rotation.x = Math.sin(time * 1.5) * 0.05
        headRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.02)
        break
      case 'shake_head':
        headRef.current.rotation.y = Math.sin(time * 6) * 0.3
        break
      case 'calculating_look':
        headRef.current.rotation.z = Math.sin(time * 0.8) * 0.1
        headRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.03)
        break
      case 'excited_eyes':
        headRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.08)
        headRef.current.rotation.x = Math.sin(time * 3) * 0.1
        break
      case 'thoughtful_touch':
        headRef.current.rotation.x = Math.sin(time * 1.2) * 0.15
        headRef.current.rotation.z = Math.sin(time * 0.8) * 0.1
        break
      case 'warm_smile':
        headRef.current.rotation.x = Math.sin(time * 1.8) * 0.08
        headRef.current.scale.setScalar(1 + Math.sin(time * 2.5) * 0.04)
        break
      case 'concerned_look':
        headRef.current.rotation.x = -Math.sin(time * 1.3) * 0.12
        headRef.current.scale.setScalar(1 - Math.sin(time * 2) * 0.03)
        break
      case 'intrigued_look':
        headRef.current.rotation.z = Math.sin(time * 1.1) * 0.2
        headRef.current.scale.setScalar(1 + Math.sin(time * 1.8) * 0.05)
        break
      case 'protective_stance':
        bodyRef.current.rotation.y = Math.sin(time * 0.7) * 0.1
        groupRef.current.position.x = position[0] + Math.sin(time * 0.7) * 0.05
        break
      case 'encouraging_nod':
        headRef.current.rotation.x = Math.sin(time * 3) * 0.25
        headRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.03)
        break
      case 'analytical_focus':
        headRef.current.rotation.z = Math.sin(time * 0.5) * 0.08
        headRef.current.scale.setScalar(1 + Math.sin(time * 1.2) * 0.02)
        break
      default:
        // Neutral - gentle breathing
        headRef.current.scale.setScalar(1 + Math.sin(time * 1.5) * 0.02)
    }
    
    // Hover animation
    if (hovered) {
      groupRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1)
    } else {
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
    }
  })

  const getJudgeColor = (judgeId: string) => {
    const colors = {
      barbara: '#f59e0b', // Gold
      mark: '#3b82f6',    // Blue
      kevin: '#ef4444',   // Red
      lori: '#8b5cf6',    // Purple
      robert: '#10b981'   // Green
    }
    return colors[judgeId as keyof typeof colors] || '#6b7280'
  }

  const getJudgeRimColor = (judgeId: string) => {
    const colors = {
      barbara: '#fbbf24', // Bright Gold
      mark: '#00bfff',    // Cyan Blue
      kevin: '#ff6b6b',   // Bright Red
      lori: '#a855f7',    // Bright Purple
      robert: '#34d399'   // Bright Green
    }
    return colors[judgeId as keyof typeof colors] || '#00bfff'
  }

  const getSkinTone = () => {
    const tones = ['#fbbf24', '#f59e0b', '#d97706', '#92400e']
    return tones[Math.floor(Math.random() * tones.length)]
  }

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Judge Body - Suit */}
      <Box
        ref={bodyRef}
        args={[0.8, 1.4, 0.4]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color={getJudgeColor(judge.id)} 
          metalness={0.4}
          roughness={0.6}
        />
      </Box>
      
      {/* Judge Head */}
      <Sphere
        ref={headRef}
        position={[0, 1.1, 0]}
        args={[0.25]}
      >
        <meshStandardMaterial 
          color={getSkinTone()} 
          metalness={0.1}
          roughness={0.8}
        />
      </Sphere>
      
      {/* Hair */}
      <Box
        args={[0.35, 0.15, 0.35]}
        position={[0, 1.25, 0]}
      >
        <meshStandardMaterial 
          color="#374151" 
          metalness={0.2}
          roughness={0.9}
        />
      </Box>
      
      {/* Eyes */}
      <Sphere
        args={[0.03]}
        position={[-0.08, 1.12, 0.2]}
      >
        <meshStandardMaterial color="#000000" />
      </Sphere>
      <Sphere
        args={[0.03]}
        position={[0.08, 1.12, 0.2]}
      >
        <meshStandardMaterial color="#000000" />
      </Sphere>
      
      {/* Arms */}
      <Cylinder
        args={[0.08, 0.08, 0.8]}
        position={[-0.5, 0.2, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial 
          color={getSkinTone()} 
          metalness={0.1}
          roughness={0.8}
        />
      </Cylinder>
      <Cylinder
        args={[0.08, 0.08, 0.8]}
        position={[0.5, 0.2, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial 
          color={getSkinTone()} 
          metalness={0.1}
          roughness={0.8}
        />
      </Cylinder>
      
      {/* Legs */}
      <Cylinder
        args={[0.1, 0.1, 0.8]}
        position={[-0.2, -0.8, 0]}
      >
        <meshStandardMaterial 
          color="#1f2937" 
          metalness={0.3}
          roughness={0.7}
        />
      </Cylinder>
      <Cylinder
        args={[0.1, 0.1, 0.8]}
        position={[0.2, -0.8, 0]}
      >
        <meshStandardMaterial 
          color="#1f2937" 
          metalness={0.3}
          roughness={0.7}
        />
      </Cylinder>
      
      {/* Ambient Rim Lighting */}
      <Box args={[1.2, 1.8, 0.6]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color={getJudgeRimColor(judge.id)} 
          transparent 
          opacity={0.1}
          emissive={getJudgeRimColor(judge.id)}
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Glowing Nameplate */}
      <Box args={[1.5, 0.3, 0.1]} position={[0, -1.3, 0.6]}>
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
      
      {/* Nameplate Glow Edge */}
      <Box args={[1.6, 0.4, 0.05]} position={[0, -1.3, 0.65]}>
        <meshStandardMaterial 
          color={getJudgeRimColor(judge.id)} 
          emissive={getJudgeRimColor(judge.id)}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </Box>
      
      {/* Judge Name - Glowing Typography */}
      <Text
        position={[0, -1.3, 0.7]}
        fontSize={0.12}
        color={getJudgeRimColor(judge.id)}
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        font="/fonts/helvetiker_regular.typeface.json"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {judge.name.toUpperCase()}
      </Text>
      
      {/* Expertise Tags - Glowing */}
      {judge.expertise.slice(0, 2).map((skill, index) => (
        <Text
          key={index}
          position={[0, -1.7 - index * 0.12, 0.7]}
          fontSize={0.08}
          color="#00bfff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/helvetiker_regular.typeface.json"
          outlineWidth={0.005}
          outlineColor="#000000"
        >
          {skill.toUpperCase()}
        </Text>
      ))}
      
      {/* Expression Indicator - Glowing */}
      {isReacting && (
        <Text
          position={[0, 1.6, 0]}
          fontSize={0.1}
          color={getJudgeRimColor(judge.id)}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {judge.microExpressions.find(exp => 
            exp.name.toLowerCase().includes(currentExpression)
          )?.name || 'REACTING...'}
        </Text>
      )}
    </group>
  )
}
