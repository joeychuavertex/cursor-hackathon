'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree, Canvas } from '@react-three/fiber'
import { Text, Box, Sphere, Cylinder, Plane, Environment, OrbitControls } from '@react-three/drei'
import { Judge } from '@/types/judge'
import * as THREE from 'three'

// Error Boundary for Three.js
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

class ThreeJSErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Three.js Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-red-900 flex items-center justify-center text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">3D Rendering Error</h2>
            <p className="mb-4">There was an error loading the 3D scene.</p>
            <p className="text-sm text-red-200">Error: {this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4 px-4 py-2 bg-white text-red-900 rounded"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

interface ThreeJSJudgeGalleryProps {
  judges: Judge[]
  onJudgesSelected: (judges: Judge[]) => void
  onBackToLanding?: () => void
}

// Immersive Gallery Environment (like theyearofgreta.com)
function ImmersiveGalleryEnvironment() {
  const timeRef = useRef(0)
  
  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime
  })

  return (
    <>
      {/* Atmospheric Background */}
      <Box
        args={[100, 100, 100]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#0a0a0a" 
          transparent
          opacity={0.8}
        />
      </Box>
      
      {/* Floating Ambient Particles */}
      {Array.from({ length: 50 }, (_, i) => {
        const angle = (i / 50) * Math.PI * 2
        const radius = 20 + Math.sin(timeRef.current * 0.1 + i) * 5
        const height = Math.sin(timeRef.current * 0.2 + i * 0.3) * 10 + 5
        
        return (
          <Sphere
            key={i}
            args={[0.02 + Math.sin(timeRef.current + i) * 0.01]}
            position={[
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius
            ]}
          >
            <meshStandardMaterial 
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.2 + Math.sin(timeRef.current * 2 + i) * 0.1}
              transparent
              opacity={0.3 + Math.sin(timeRef.current * 1.5 + i) * 0.2}
            />
          </Sphere>
        )
      })}
      
      {/* Depth Fog Effect */}
      <Box
        args={[200, 200, 200]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#1a1a2e"
          transparent
          opacity={0.1}
        />
      </Box>
    </>
  )
}

// Floating Judge Card (like theyearofgreta.com style)
function FloatingJudgeCard({ 
  judge, 
  position, 
  isSelected, 
  isHovered, 
  isFocused,
  distanceFromFocus,
  onSelect, 
  onHover 
}: {
  judge: Judge
  position: [number, number, number]
  isSelected: boolean
  isHovered: boolean
  isFocused: boolean
  distanceFromFocus: number
  onSelect: () => void
  onHover: (hovered: boolean) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const cardRef = useRef<THREE.Mesh>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useFrame((state) => {
    if (!groupRef.current || !cardRef.current) return

    const time = state.clock.elapsedTime
    
    // Floating animation
    groupRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.2
    
    // Focus-based scaling and positioning
    const focusScale = isFocused ? 1.5 : Math.max(0.3, 1 - distanceFromFocus * 0.3)
    const focusOpacity = isFocused ? 1 : Math.max(0.2, 1 - distanceFromFocus * 0.4)
    
    cardRef.current.scale.lerp(new THREE.Vector3(focusScale, focusScale, focusScale), 0.1)
    
    // Hover expansion
    if (isHovered || isExpanded) {
      cardRef.current.scale.lerp(new THREE.Vector3(focusScale * 1.2, focusScale * 1.2, focusScale * 1.2), 0.08)
      setIsExpanded(true)
    } else {
      setIsExpanded(false)
    }
    
    // Selection glow
    if (isSelected) {
      cardRef.current.rotation.y = Math.sin(time * 2) * 0.1
    } else {
      cardRef.current.rotation.y = 0
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

  const getSkinTone = () => {
    const tones = ['#fbbf24', '#f59e0b', '#d97706', '#92400e']
    return tones[Math.floor(Math.random() * tones.length)]
  }

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={onSelect}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    >
      {/* Main Card - Large and prominent when focused */}
      <Box
        ref={cardRef}
        args={[3, 4, 0.2]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color={isSelected ? "#fbbf24" : isFocused ? "#ffffff" : "#1a1a1a"}
          metalness={0.9}
          roughness={0.1}
          emissive={isSelected ? "#fbbf24" : isFocused ? "#fbbf24" : "#000000"}
          emissiveIntensity={isSelected ? 0.4 : isFocused ? 0.2 : 0}
          transparent
          opacity={isFocused ? 0.95 : 0.7}
        />
      </Box>
      
      {/* Card Border with Focus Effect */}
      <Box
        args={[3.1, 4.1, 0.1]}
        position={[0, 0, -0.05]}
      >
        <meshStandardMaterial 
          color={isFocused ? "#fbbf24" : "#374151"}
          metalness={1}
          roughness={0.05}
          transparent
          opacity={isFocused ? 0.8 : 0.4}
        />
      </Box>
      
      {/* Judge Avatar - Larger when focused */}
      <group position={[-1.2, 1.5, 0.15]}>
        {/* Head */}
        <Sphere
          args={[0.5]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial 
            color={getSkinTone()}
            metalness={0.2}
            roughness={0.8}
          />
        </Sphere>
        
        {/* Hair */}
        <Box
          args={[0.8, 0.3, 0.8]}
          position={[0, 0.4, 0]}
        >
          <meshStandardMaterial 
            color="#374151" 
            metalness={0.3}
            roughness={0.8}
          />
        </Box>
        
        {/* Eyes */}
        <Sphere
          args={[0.06]}
          position={[-0.15, 0.1, 0.4]}
        >
          <meshStandardMaterial color="#000000" />
        </Sphere>
        <Sphere
          args={[0.06]}
          position={[0.15, 0.1, 0.4]}
        >
          <meshStandardMaterial color="#000000" />
        </Sphere>
        
        {/* Body */}
        <Box
          args={[1, 1.5, 0.6]}
          position={[0, -0.8, 0]}
        >
          <meshStandardMaterial 
            color={getJudgeColor(judge.id)}
            metalness={0.6}
            roughness={0.4}
          />
        </Box>
      </group>
      
      {/* Judge Name - Simple text */}
      <Text
        position={[0, 2, 0.15]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {judge.name}
      </Text>
      
      {/* Selection Indicator */}
      {isSelected && (
        <Box
          args={[0.4, 0.4, 0.05]}
          position={[1.6, 2, 0.15]}
        >
          <meshStandardMaterial 
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.8}
          />
        </Box>
      )}
      
      {/* Personality Description - Only show when focused */}
      {isFocused && (
        <Text
          position={[1, 1.2, 0.15]}
          fontSize={0.15}
          color="#94a3b8"
          anchorX="left"
          anchorY="middle"
          maxWidth={2.5}
          font="/fonts/helvetiker_regular.typeface.json"
        >
          {judge.personality}
        </Text>
      )}
      
      {/* Expertise Tags - Only show when focused */}
      {isFocused && (
        <group position={[1, 0.5, 0.15]}>
          {judge.expertise.slice(0, 3).map((skill, index) => (
            <Text
              key={index}
              position={[0, -index * 0.2, 0]}
              fontSize={0.1}
              color="#64748b"
              anchorX="left"
              anchorY="middle"
              font="/fonts/helvetiker_regular.typeface.json"
            >
              • {skill}
            </Text>
          ))}
        </group>
      )}
      
      {/* Investment Focus - Only show when focused */}
      {isFocused && (
        <Text
          position={[1, -0.5, 0.15]}
          fontSize={0.12}
          color="#fbbf24"
          anchorX="left"
          anchorY="middle"
          font="/fonts/helvetiker_regular.typeface.json"
        >
          Focus: {judge.scoringCriteria.financials > 0.3 ? 'Financials' : 
                 judge.scoringCriteria.innovation > 0.3 ? 'Innovation' : 
                 judge.scoringCriteria.marketPotential > 0.3 ? 'Market' : 'Team'}
        </Text>
      )}
      
      {/* Micro Expression Indicator */}
      {isHovered && (
        <Text
          position={[0, 3, 0]}
          fontSize={0.15}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          font="/fonts/helvetiker_regular.typeface.json"
        >
          {judge.microExpressions[0]?.name || 'Observing...'}
        </Text>
      )}
    </group>
  )
}

// Cylindrical Gallery Environment (kept for reference)
function GalleryEnvironment() {
  const timeRef = useRef(0)
  const lightRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime
    
    // Rotate the light group for dynamic lighting
    if (lightRef.current) {
      lightRef.current.rotation.y = timeRef.current * 0.1
    }
  })

  return (
    <>
      {/* Cylindrical Floor */}
      <Cylinder
        args={[8, 8, 0.1, 64]}
        position={[0, -0.05, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="#0f172a" 
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </Cylinder>
      
      {/* Cylindrical Wall */}
      <Cylinder
        args={[8, 8, 6, 64]}
        position={[0, 3, 0]}
      >
        <meshStandardMaterial 
          color="#1e293b" 
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </Cylinder>
      
      {/* Reflective Floor */}
      <Cylinder
        args={[8.1, 8.1, 0.01, 64]}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={1}
          roughness={0.1}
          transparent
          opacity={0.3}
        />
      </Cylinder>
      
      {/* Dynamic Light System */}
      <group ref={lightRef}>
        {/* Ocean Blue Light Ring */}
        <Cylinder
          args={[7.8, 7.8, 0.05, 64]}
          position={[0, 0.1, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial 
            color="#0ea5e9"
            emissive="#0ea5e9"
            emissiveIntensity={0.4 + Math.sin(timeRef.current * 0.5) * 0.2}
            transparent
            opacity={0.6}
          />
        </Cylinder>
        
        {/* Deep Gold Light Ring */}
        <Cylinder
          args={[7.3, 7.3, 0.05, 64]}
          position={[0, 0.2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial 
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.3 + Math.sin(timeRef.current * 0.7 + Math.PI) * 0.15}
            transparent
            opacity={0.5}
          />
        </Cylinder>
        
        {/* Purple Accent Ring */}
        <Cylinder
          args={[6.8, 6.8, 0.05, 64]}
          position={[0, 0.3, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial 
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.2 + Math.sin(timeRef.current * 0.3 + Math.PI * 2) * 0.1}
            transparent
            opacity={0.4}
          />
        </Cylinder>
      </group>
      
      {/* Floating Particles with Water-like Motion */}
      {Array.from({ length: 30 }, (_, i) => {
        const angle = (i / 30) * Math.PI * 2
        const radius = 7 + Math.sin(timeRef.current * 0.3 + i) * 0.8
        const height = Math.sin(timeRef.current * 0.4 + i * 0.5) * 1.5 + 2.5
        const waveOffset = Math.sin(timeRef.current * 0.2 + i) * 0.3
        
        return (
          <Sphere
            key={i}
            args={[0.015 + Math.sin(timeRef.current + i) * 0.005]}
            position={[
              Math.cos(angle + waveOffset) * radius,
              height,
              Math.sin(angle + waveOffset) * radius
            ]}
          >
            <meshStandardMaterial 
              color={i % 3 === 0 ? "#0ea5e9" : i % 3 === 1 ? "#fbbf24" : "#8b5cf6"}
              emissive={i % 3 === 0 ? "#0ea5e9" : i % 3 === 1 ? "#fbbf24" : "#8b5cf6"}
              emissiveIntensity={0.3 + Math.sin(timeRef.current * 2 + i) * 0.2}
              transparent
              opacity={0.4 + Math.sin(timeRef.current * 1.5 + i) * 0.3}
            />
          </Sphere>
        )
      })}
      
      {/* Water Ripple Effect on Floor */}
      {Array.from({ length: 5 }, (_, i) => (
        <Cylinder
          key={i}
          args={[1 + i * 0.5, 1 + i * 0.5, 0.01, 32]}
          position={[0, 0.01, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshStandardMaterial 
            color="#0ea5e9"
            emissive="#0ea5e9"
            emissiveIntensity={0.1}
            transparent
            opacity={0.1 + Math.sin(timeRef.current * 0.8 + i) * 0.05}
          />
        </Cylinder>
      ))}
    </>
  )
}

// Individual Judge Panel - Card-like layout similar to list view
function JudgePanel({ 
  judge, 
  position, 
  isSelected, 
  isHovered, 
  onSelect, 
  onHover 
}: {
  judge: Judge
  position: [number, number, number]
  isSelected: boolean
  isHovered: boolean
  onSelect: () => void
  onHover: (hovered: boolean) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const panelRef = useRef<THREE.Mesh>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useFrame((state) => {
    if (!groupRef.current || !panelRef.current) return

    const time = state.clock.elapsedTime
    
    // Gentle floating animation
    groupRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.05
    
    // Hover expansion with smooth transition
    if (isHovered || isExpanded) {
      panelRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.08)
      setIsExpanded(true)
    } else {
      panelRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08)
      setIsExpanded(false)
    }
    
    // Selection glow
    if (isSelected) {
      panelRef.current.position.z = position[2] + Math.sin(time * 3) * 0.02
    } else {
      panelRef.current.position.z = position[2]
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

  const getSkinTone = () => {
    const tones = ['#fbbf24', '#f59e0b', '#d97706', '#92400e']
    return tones[Math.floor(Math.random() * tones.length)]
  }

  return (
    <group 
      ref={groupRef}
      position={position}
      onClick={onSelect}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
    >
      {/* Main Card Panel - Wider for better content display */}
      <Box
        ref={panelRef}
        args={[3.5, 4.5, 0.2]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color={isSelected ? "#fbbf24" : "#1a1a1a"}
          metalness={0.9}
          roughness={0.1}
          emissive={isSelected ? "#fbbf24" : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : 0}
          transparent
          opacity={0.95}
        />
      </Box>
      
      {/* Card Border */}
      <Box
        args={[3.6, 4.6, 0.1]}
        position={[0, 0, -0.05]}
      >
        <meshStandardMaterial 
          color={isSelected ? "#fbbf24" : "#374151"}
          metalness={1}
          roughness={0.05}
          transparent
          opacity={isSelected ? 0.8 : 0.4}
        />
      </Box>
      
      {/* Judge Avatar - Larger and more prominent */}
      <group position={[-1, 1, 0.15]}>
        {/* Head */}
        <Sphere
          args={[0.4]}
          position={[0, 0, 0]}
        >
          <meshStandardMaterial 
            color={getSkinTone()}
            metalness={0.2}
            roughness={0.8}
          />
        </Sphere>
        
        {/* Hair */}
        <Box
          args={[0.6, 0.25, 0.6]}
          position={[0, 0.3, 0]}
        >
          <meshStandardMaterial 
            color="#374151" 
            metalness={0.3}
            roughness={0.8}
          />
        </Box>
        
        {/* Eyes */}
        <Sphere
          args={[0.05]}
          position={[-0.12, 0.05, 0.35]}
        >
          <meshStandardMaterial color="#000000" />
        </Sphere>
        <Sphere
          args={[0.05]}
          position={[0.12, 0.05, 0.35]}
        >
          <meshStandardMaterial color="#000000" />
        </Sphere>
        
        {/* Body */}
        <Box
          args={[0.7, 1, 0.4]}
          position={[0, -0.5, 0]}
        >
          <meshStandardMaterial 
            color={getJudgeColor(judge.id)}
            metalness={0.6}
            roughness={0.4}
          />
        </Box>
      </group>
      
      {/* Judge Name - Larger and more prominent */}
      <Text
        position={[0.8, 1.5, 0.15]}
        fontSize={0.25}
        color="white"
        anchorX="left"
        anchorY="middle"
        font="/fonts/helvetiker_regular.typeface.json"
      >
        {judge.name}
      </Text>
      
      {/* Selection Indicator */}
      {isSelected && (
        <Box
          args={[0.3, 0.3, 0.05]}
          position={[1.4, 1.5, 0.15]}
        >
          <meshStandardMaterial 
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.8}
          />
        </Box>
      )}
      
      {/* Personality Description - Like list view */}
      <Text
        position={[0.8, 1, 0.15]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="left"
        anchorY="middle"
        maxWidth={2.2}
        font="/fonts/helvetiker_regular.typeface.json"
      >
        {judge.personality}
      </Text>
      
      {/* Expertise Tags - Like list view */}
      <group position={[0.8, 0.5, 0.15]}>
        {judge.expertise.slice(0, 3).map((skill, index) => (
          <Text
            key={index}
            position={[0, -index * 0.15, 0]}
            fontSize={0.08}
            color="#64748b"
            anchorX="left"
            anchorY="middle"
            font="/fonts/helvetiker_regular.typeface.json"
          >
            • {skill}
          </Text>
        ))}
      </group>
      
      {/* Investment Focus - Like list view */}
      <Text
        position={[0.8, -0.2, 0.15]}
        fontSize={0.1}
        color="#fbbf24"
        anchorX="left"
        anchorY="middle"
        font="/fonts/helvetiker_regular.typeface.json"
      >
        Focus: {judge.scoringCriteria.financials > 0.3 ? 'Financials' : 
               judge.scoringCriteria.innovation > 0.3 ? 'Innovation' : 
               judge.scoringCriteria.marketPotential > 0.3 ? 'Market' : 'Team'}
      </Text>
      
      {/* Micro Expression Indicator */}
      {isHovered && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.12}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          font="/fonts/helvetiker_regular.typeface.json"
        >
          {judge.microExpressions[0]?.name || 'Observing...'}
        </Text>
      )}
    </group>
  )
}

// Selection Tray
function SelectionTray({ 
  selectedJudges, 
  onConfirmSelection 
}: { 
  selectedJudges: Judge[], 
  onConfirmSelection: () => void 
}) {
  const timeRef = useRef(0)
  
  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime
  })

  return (
    <group position={[0, -2.5, 0]}>
      {/* Tray Base with Glow */}
      <Cylinder
        args={[3.2, 3.2, 0.15, 32]}
        position={[0, 0, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="#1e293b"
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.9}
        />
      </Cylinder>
      
      {/* Glowing Ring */}
      <Cylinder
        args={[3.3, 3.3, 0.02, 32]}
        position={[0, 0.08, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial 
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.3 + Math.sin(timeRef.current * 2) * 0.1}
          transparent
          opacity={0.6}
        />
      </Cylinder>
      
      {/* Selected Judge Indicators */}
      {selectedJudges.map((judge, index) => {
        const angle = (index / selectedJudges.length) * Math.PI * 2
        const radius = 2.5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const floatOffset = Math.sin(timeRef.current * 2 + index) * 0.05
        
        return (
          <group key={judge.id} position={[x, 0.15 + floatOffset, z]}>
            {/* Glowing Ring */}
            <Cylinder
              args={[0.15, 0.15, 0.02, 16]}
              position={[0, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial 
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.8}
              />
            </Cylinder>
            
            {/* Judge Avatar */}
            <Sphere args={[0.08]}>
              <meshStandardMaterial 
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.3}
              />
            </Sphere>
            
            {/* Judge Name */}
            <Text
              position={[0, -0.25, 0]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              anchorY="middle"
              font="/fonts/helvetiker_regular.typeface.json"
            >
              {judge.name.split(' ')[0]}
            </Text>
          </group>
        )
      })}
      
      {/* Selection Count */}
      {selectedJudges.length > 0 && (
        <Text
          position={[0, 0.3, 0]}
          fontSize={0.12}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          font="/fonts/helvetiker_regular.typeface.json"
        >
          {selectedJudges.length} Selected
        </Text>
      )}
      
      {/* Confirm Button */}
      {selectedJudges.length > 0 && (
        <group position={[0, -0.5, 0]}>
          {/* Button Base */}
          <Cylinder
            args={[0.8, 0.8, 0.1, 16]}
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            onClick={onConfirmSelection}
            onPointerOver={(e) => {
              e.stopPropagation()
            }}
            onPointerOut={(e) => {
              e.stopPropagation()
            }}
          >
            <meshStandardMaterial 
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.2}
            />
          </Cylinder>
          
          {/* Button Glow */}
          <Cylinder
            args={[0.9, 0.9, 0.02, 16]}
            position={[0, 0.06, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial 
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.4 + Math.sin(timeRef.current * 3) * 0.2}
              transparent
              opacity={0.6}
            />
          </Cylinder>
          
          {/* Button Text */}
          <Text
            position={[0, 0, 0.05]}
            fontSize={0.08}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            font="/fonts/helvetiker_regular.typeface.json"
          >
            CONFIRM
          </Text>
        </group>
      )}
    </group>
  )
}

// Scroll-based Gallery Component (like theyearofgreta.com)
function JudgeGallery({ 
  judges, 
  onJudgesSelected, 
  onBackToLanding, 
  selectedJudges, 
  onToggleJudge, 
  onConfirmSelection 
}: ThreeJSJudgeGalleryProps & { 
  selectedJudges: Judge[], 
  onToggleJudge: (judge: Judge) => void, 
  onConfirmSelection: () => void 
}) {
  const [hoveredJudge, setHoveredJudge] = useState<string | null>(null)
  const [currentFocusIndex, setCurrentFocusIndex] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  // Debug: Log judges to console
  console.log('JudgeGallery received judges:', judges)

  // Position judges in a scroll-based 3D layout
  const getJudgePosition = (index: number): [number, number, number] => {
    const spacing = 8 // Space between judges
    const zOffset = index * spacing
    const xOffset = Math.sin(index * 0.5) * 2 // Slight curve
    const yOffset = Math.cos(index * 0.3) * 1 // Vertical variation
    return [xOffset, yOffset, -zOffset]
  }

  // Handle scroll with mouse wheel and trackpad
  useEffect(() => {
    let scrollY = 0
    const maxScroll = judges.length * 1000 // Total scroll distance
    
    const handleScroll = (event: WheelEvent) => {
      event.preventDefault()
      scrollY += event.deltaY * 0.5
      scrollY = Math.max(0, Math.min(maxScroll, scrollY))
      
      const progress = scrollY / maxScroll
      setScrollProgress(progress)
      
      // Calculate which judge should be in focus
      const focusIndex = Math.floor(progress * judges.length)
      setCurrentFocusIndex(Math.min(focusIndex, judges.length - 1))
      
      console.log('Scroll progress:', progress, 'Focus index:', focusIndex)
    }

    window.addEventListener('wheel', handleScroll, { passive: false })
    return () => window.removeEventListener('wheel', handleScroll)
  }, [judges.length])

  // Camera and scene animation based on scroll
  useFrame((state) => {
    if (!groupRef.current) return
    
    const time = state.clock.elapsedTime
    
    // Move the entire scene based on scroll progress
    const totalDistance = judges.length * 8
    const currentZ = -scrollProgress * totalDistance
    groupRef.current.position.z = currentZ
    
    // Camera follows the focused judge
    const focusJudge = judges[currentFocusIndex]
    if (focusJudge) {
      const focusPosition = getJudgePosition(currentFocusIndex)
      const targetX = focusPosition[0] * 0.3
      const targetY = focusPosition[1] + 2
      const targetZ = focusPosition[2] + 5
      
      camera.position.x += (targetX - camera.position.x) * 0.05
      camera.position.y += (targetY - camera.position.y) * 0.05
      camera.position.z += (targetZ - camera.position.z) * 0.05
      camera.lookAt(focusPosition[0], focusPosition[1], focusPosition[2])
      
      // Debug: Log camera position
      if (time % 2 < 0.1) { // Log every 2 seconds
        console.log('Camera position:', camera.position.x, camera.position.y, camera.position.z)
        console.log('Focus position:', focusPosition)
      }
    }
  })

  return (
    <group ref={groupRef}>
      {/* Immersive Environment */}
      <ImmersiveGalleryEnvironment />
      
      {/* Floating Judge Cards */}
      {judges && judges.length > 0 ? judges.map((judge, index) => {
        const position = getJudgePosition(index)
        const isSelected = selectedJudges.some(j => j.id === judge.id)
        const isHovered = hoveredJudge === judge.id
        const isFocused = index === currentFocusIndex
        const distanceFromFocus = Math.abs(index - currentFocusIndex)
        
        return (
          <FloatingJudgeCard
            key={judge.id}
            judge={judge}
            position={position}
            isSelected={isSelected}
            isHovered={isHovered}
            isFocused={isFocused}
            distanceFromFocus={distanceFromFocus}
            onSelect={() => onToggleJudge(judge)}
            onHover={(hovered) => setHoveredJudge(hovered ? judge.id : null)}
          />
        )
      }) : (
        <Text position={[0, 0, 0]} fontSize={0.5} color="red">
          No judges found!
        </Text>
      )}
      
      {/* Selection Tray */}
      <SelectionTray 
        selectedJudges={selectedJudges} 
        onConfirmSelection={onConfirmSelection}
      />
    </group>
  )
}

// Main Component
export default function ThreeJSJudgeGallery({ judges, onJudgesSelected, onBackToLanding }: ThreeJSJudgeGalleryProps) {
  const [selectedJudges, setSelectedJudges] = useState<Judge[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showFallback, setShowFallback] = useState(true) // Start with list view as default

  // Debug: Log judges data
  console.log('ThreeJSJudgeGallery received judges:', judges)
  console.log('Judges length:', judges?.length)
  console.log('showFallback state:', showFallback)

  // Safety check: if no judges or invalid data, show fallback
  if (!judges || judges.length === 0) {
    console.warn('No judges data provided, showing fallback list view')
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">No Judges Available</h2>
          <p className="text-gray-300 mb-4">Unable to load judge data.</p>
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Back to Landing
            </button>
          )}
        </div>
      </div>
    )
  }

  const handleConfirmSelection = () => {
    if (selectedJudges.length > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        onJudgesSelected(selectedJudges)
      }, 1000)
    }
  }

  const toggleJudge = (judge: Judge) => {
    setSelectedJudges(prev => {
      if (prev.find(j => j.id === judge.id)) {
        return prev.filter(j => j.id !== judge.id)
      } else if (prev.length < 5) {
        return [...prev, judge]
      }
      return prev
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Back Button */}
      {onBackToLanding && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-lg rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300 border border-yellow-400/30"
          >
            ← Back to Landing
          </button>
        </div>
      )}
      
      {/* Instructions */}
      <div className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-lg rounded-lg p-4 text-white border border-yellow-400/30">
        <h3 className="text-lg font-bold mb-2 text-yellow-400">🦈 Judge Gallery</h3>
        <p className="text-sm text-gray-300 mb-2">
          Scroll to explore judges • Click to select • Hover for details
        </p>
        <p className="text-sm text-gray-300 mb-1">
          Selected: {selectedJudges.length}/5 judges
        </p>
        <p className="text-xs text-yellow-400">
          Scroll through the 3D space to discover each judge
        </p>
        <button
          onClick={() => setShowFallback(!showFallback)}
          className="mt-2 px-3 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded hover:bg-yellow-400/30 border border-yellow-400/50"
        >
          {showFallback ? 'Show 3D Gallery' : 'Show List View'}
        </button>
      </div>
      
      {/* Selection Status */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-black/50 backdrop-blur-lg rounded-lg p-3 text-white text-center border border-yellow-400/30">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-yellow-400">Selection Status</span>
          </div>
          <p className="text-xs text-gray-300">
            {selectedJudges.length >= 1 ? 'Ready to enter!' : 'Choose your judges...'}
          </p>
        </div>
      </div>
      
      {/* Confirm Button */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <button
          onClick={handleConfirmSelection}
          disabled={selectedJudges.length < 1 || isTransitioning}
          className={`px-10 py-4 text-xl font-bold rounded-xl transition-all duration-500 ${
            selectedJudges.length >= 1 && !isTransitioning
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 shadow-2xl border-2 border-yellow-300'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed border border-gray-500'
          }`}
        >
          {isTransitioning ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Entering the Tank...
            </div>
          ) : selectedJudges.length >= 1 ? (
            `Enter the Tank with ${selectedJudges.length} Judge${selectedJudges.length > 1 ? 's' : ''}!`
          ) : (
            'Select a judge to continue'
          )}
        </button>
      </div>
      
      {/* Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 z-30 bg-gradient-to-br from-yellow-900/20 to-blue-900/20 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4 animate-pulse">🦈</div>
            <h2 className="text-3xl font-bold mb-2">Entering the Shark Tank</h2>
            <p className="text-lg text-blue-200">Prepare for your pitch...</p>
          </div>
        </div>
      )}
      
      {/* Fallback List View */}
      {showFallback && (
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-900 via-black to-gray-800 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-yellow-400 mb-4">🦈 Judge Selection</h1>
              <p className="text-xl text-gray-300">Choose your judges for the Shark Tank</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {judges.map((judge) => {
                const isSelected = selectedJudges.find(j => j.id === judge.id)
                return (
                  <div
                    key={judge.id}
                    onClick={() => toggleJudge(judge)}
                    className={`relative cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                      isSelected ? 'ring-4 ring-yellow-400' : 'hover:ring-2 hover:ring-yellow-400/50'
                    }`}
                  >
                    <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-yellow-400/30">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-yellow-400">{judge.name}</h3>
                        {isSelected && (
                          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <span className="text-black text-sm font-bold">✓</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-300 text-sm mb-2">{judge.personality}</p>
                        <div className="flex flex-wrap gap-1">
                          {judge.expertise.map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded-full border border-yellow-400/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>Focus: {judge.scoringCriteria.financials > 0.3 ? 'Financials' : 
                                   judge.scoringCriteria.innovation > 0.3 ? 'Innovation' : 
                                   judge.scoringCriteria.marketPotential > 0.3 ? 'Market' : 'Team'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* 3D Canvas */}
      {!showFallback && (
        <div className="w-full h-screen bg-black">
          <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
            {/* Gallery Lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={0.8}
              color="#fbbf24"
            />
            <pointLight position={[0, 5, 0]} intensity={1.2} color="#fbbf24" />
            <pointLight position={[-5, 3, 5]} intensity={0.6} color="#00bfff" />
            <pointLight position={[5, 3, 5]} intensity={0.6} color="#fbbf24" />
            
            {/* Gallery */}
            <JudgeGallery 
              judges={judges}
              onJudgesSelected={onJudgesSelected}
              onBackToLanding={onBackToLanding}
              selectedJudges={selectedJudges}
              onToggleJudge={toggleJudge}
              onConfirmSelection={handleConfirmSelection}
            />
            
            {/* Gallery Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={Math.PI / 8}
              maxPolarAngle={Math.PI / 2.2}
              minDistance={5}
              maxDistance={20}
              enableDamping={true}
              dampingFactor={0.05}
              rotateSpeed={0.2}
              zoomSpeed={0.8}
            />
          </Canvas>
        </div>
      )}
      
    </div>
  )
}
