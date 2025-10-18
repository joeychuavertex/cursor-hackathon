'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Text, Box, Plane, Sphere, Environment, useTexture } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useAuthContext } from '@/contexts/AuthContext'
import AuthModal from './AuthModal'
import { User, LogOut } from 'lucide-react'

interface LandingPageProps {
  onEnter: () => void
}

// Animated Shark Tank Logo
function SharkTankLogo({ isVisible }: { isVisible: boolean }) {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (meshRef.current && isVisible) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group ref={meshRef} position={[0, 0, 0]}>      
      {/* Decorative Elements */}
      <Box args={[0.1, 0.8, 0.2]} position={[-2, 0.8, 0]} rotation={[0, 0, 0.3]}>
        <meshStandardMaterial color="#1e40af" metalness={0.8} roughness={0.2} />
      </Box>
      <Box args={[0.1, 0.8, 0.2]} position={[2, 0.8, 0]} rotation={[0, 0, -0.3]}>
        <meshStandardMaterial color="#1e40af" metalness={0.8} roughness={0.2} />
      </Box>
    </group>
  )
}

// Floating Money Animation
function FloatingMoney() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        child.rotation.y += 0.01
        child.position.y = Math.sin(state.clock.elapsedTime + index) * 0.5 + 2
      })
    }
  })

  return (
    <group ref={groupRef}>
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
    </group>
  )
}

// Theatrical Entry Door
function TheatricalDoor({ onClick, isHovered }: { onClick: () => void; isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const arrowRef = useRef<THREE.Group>(null)
  const spotlightRef = useRef<THREE.SpotLight>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      if (isHovered) {
        meshRef.current.scale.setScalar(1.12)
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 10) * 0.05
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
        meshRef.current.rotation.y = 0
      }
    }
    
    // More dramatic floating animation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.12
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.02
    }
    
    // Pulsing ring animation - much more intense
    if (ringRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.25
      ringRef.current.scale.setScalar(scale)
    }
    
    // Glow intensity animation - much more dramatic
    if (glowRef.current) {
      const intensity = isHovered ? 0.8 : 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.15
      const material = glowRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = intensity
    }
    
    // Animated arrows pointing to door
    if (arrowRef.current) {
      arrowRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
      arrowRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.2
    }
    
    // Spotlight intensity
    if (spotlightRef.current) {
      const intensity = isHovered ? 3 : 1.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.5
      spotlightRef.current.intensity = intensity
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, -2]}>
      {/* Enhanced Spotlight on Door */}
      <spotLight
        ref={spotlightRef}
        position={[0, 10, 2]}
        angle={0.6}
        penumbra={0.2}
        intensity={2.5}
        color="#fbbf24"
        castShadow
        target-position={[0, 0, -2]}
      />
      
      {/* Additional Side Spotlights */}
      <spotLight
        position={[-8, 6, 0]}
        angle={0.3}
        penumbra={0.4}
        intensity={1.5}
        color="#fbbf24"
        castShadow
        target-position={[0, 0, -2]}
      />
      <spotLight
        position={[8, 6, 0]}
        angle={0.3}
        penumbra={0.4}
        intensity={1.5}
        color="#fbbf24"
        castShadow
        target-position={[0, 0, -2]}
      />
      
      {/* Rim Lighting for Door */}
      <pointLight position={[0, 0, 1]} intensity={1.2} color="#00bfff" />
      <pointLight position={[0, 0, -5]} intensity={0.8} color="#ff6b35" />
      
      {/* Ornate Door Frame - Smaller */}
      <Box args={[6, 8, 0.4]} position={[0, 0, 0.2]}>
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.8} 
          roughness={0.2} 
        />
      </Box>
      
      {/* Main Door - Smaller */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
        }}
      >
        <boxGeometry args={[5.5, 7.5, 0.3]} />
        <meshStandardMaterial 
          color={isHovered ? "#3a3a3a" : "#1a1a1a"} 
          metalness={0.9} 
          roughness={0.1}
          emissive={isHovered ? "#fbbf24" : "#000000"}
          emissiveIntensity={isHovered ? 0.2 : 0}
        />
      </mesh>
      
      {/* Enhanced Ornate Handle - Smaller */}
      <Sphere args={[0.2]} position={[2, 0, 0.4]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          metalness={0.9} 
          roughness={0.1}
          emissive="#fbbf24"
          emissiveIntensity={0.4}
        />
      </Sphere>
      
      {/* "ENTER THE TANK" Text - Printed on Door - Smaller */}
      <Text
        position={[0, 1.5, 0.16]}
        fontSize={0.4}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        fontWeight="bold"
      >
        ENTER THE TANK
      </Text>
      
      {/* Enhanced Dramatic Glow Effect - Smaller */}
      <Box ref={glowRef} args={[7, 9, 0.1]} position={[0, 0, 0.1]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          transparent 
          opacity={0.4}
          emissive="#fbbf24"
          emissiveIntensity={0.2}
        />
      </Box>
      
      {/* Enhanced Pulsing Ring - Smaller */}
      <Box ref={ringRef} args={[8, 10, 0.05]} position={[0, 0, 0.05]}>
        <meshStandardMaterial 
          color="#00bfff" 
          transparent 
          opacity={0.3}
          emissive="#00bfff"
          emissiveIntensity={0.2}
        />
      </Box>
      
      
      {/* Enhanced Corner Accents - Smaller */}
      {[
        [-2.5, 3.5], [2.5, 3.5], [-2.5, -3.5], [2.5, -3.5]
      ].map(([x, y], i) => (
        <Box key={i} args={[0.15, 0.15, 0.15]} position={[x, y, 0.4]}>
          <meshStandardMaterial 
            color="#fbbf24" 
            emissive="#fbbf24"
            emissiveIntensity={0.5}
          />
        </Box>
      ))}
      
      {/* "CLICK HERE TO START" Text - Printed on Door - Smaller */}
      <Text
        position={[0, -1.5, 0.16]}
        fontSize={0.25}
        color="#00bfff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        fontWeight="bold"
      >
        CLICK HERE TO START
      </Text>
    </group>
  )
}

// Theatrical Camera Controller
function TheatricalCameraController() {
  const { camera } = useThree()
  
  useFrame((state) => {
    // Dramatic, slow camera movement
    const time = state.clock.elapsedTime
    
    // Slow circular movement around the stage - adjusted for front door
    camera.position.x = Math.sin(time * 0.08) * 2
    camera.position.y = 3 + Math.sin(time * 0.03) * 0.2
    camera.position.z = 6 + Math.cos(time * 0.08) * 1
    
    // Look at the door with slight variation
    camera.lookAt(
      Math.sin(time * 0.05) * 0.3, 
      Math.sin(time * 0.02) * 0.1, 
      -2 + Math.sin(time * 0.03) * 0.2
    )
  })
  
  return null
}

// Theatrical Tank Environment
function TankEnvironment() {
  return (
    <>
      {/* Polished Dark Floor */}
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
          color="#fbbf24" 
          emissive="#fbbf24"
          emissiveIntensity={0.3}
        />
      </Box>
      <Box args={[12.2, 0.1, 0.2]} position={[0, -1.7, -4.1]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24"
          emissiveIntensity={0.3}
        />
      </Box>
      <Box args={[0.2, 0.1, 8.2]} position={[6.1, -1.7, 0]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24"
          emissiveIntensity={0.3}
        />
      </Box>
      <Box args={[0.2, 0.1, 8.2]} position={[-6.1, -1.7, 0]}>
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24"
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
    </>
  )
}

// Shark Chairs Arrangement
function SharkChairs() {
  const chairs = Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 4) * Math.PI - Math.PI / 2
    const radius = 8
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius - 2
    
    return (
      <group key={i} position={[x, 0, z]} rotation={[0, angle + Math.PI / 2, 0]}>
        {/* Chair Base */}
        <Box args={[1.2, 0.1, 1.2]} position={[0, -1.9, 0]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
        </Box>
        
        {/* Chair Back */}
        <Box args={[1.2, 2, 0.1]} position={[0, -0.9, -0.6]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
        </Box>
        
        {/* Chair Seat */}
        <Box args={[1.2, 0.1, 1]} position={[0, -1.8, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
        </Box>
        
        {/* Side Table */}
        <Box args={[0.6, 0.8, 0.6]} position={[0.8, -1.5, 0]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
        </Box>
        
      </group>
    )
  })
  
  return <>{chairs}</>
}

// Main 3D Scene
function LandingScene({ onEnter }: { onEnter: () => void }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const [showDoor, setShowDoor] = useState(false)
  const [showTank, setShowTank] = useState(false)

  useEffect(() => {
    // Staggered animation sequence
    const timer1 = setTimeout(() => setShowLogo(true), 1000)
    const timer2 = setTimeout(() => setShowTank(true), 1500)
    const timer3 = setTimeout(() => setShowDoor(true), 2500)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  const handleDoorClick = () => {
    onEnter()
  }

  const handleDoorHover = () => {
    setIsHovered(true)
  }

  const handleDoorLeave = () => {
    setIsHovered(false)
  }

  return (
    <>
      {/* Theatrical Environment */}
      <TankEnvironment />
      
      {/* Shark Chairs */}
      <AnimatePresence>
        {showTank && <SharkChairs />}
      </AnimatePresence>
      
      {/* Dramatic Lighting */}
      <ambientLight intensity={0.2} color="#0a0a2e" />
      
      {/* Stage Spotlights */}
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
      
      {/* Rim Lighting */}
      <pointLight position={[0, 3, 6]} intensity={0.8} color="#00bfff" />
      <pointLight position={[0, 3, -6]} intensity={0.8} color="#00bfff" />
      <pointLight position={[6, 3, 0]} intensity={0.8} color="#00bfff" />
      <pointLight position={[-6, 3, 0]} intensity={0.8} color="#00bfff" />
      
      {/* Warm Accent Lights */}
      <pointLight position={[-8, 5, 8]} intensity={0.4} color="#fbbf24" />
      <pointLight position={[8, 5, 8]} intensity={0.4} color="#fbbf24" />
      
      {/* Animated Elements */}
      <AnimatePresence>
        {showLogo && <SharkTankLogo isVisible={showLogo} />}
      </AnimatePresence>
      
      <FloatingMoney />
      
      <AnimatePresence>
        {showDoor && (
          <>
            {/* Invisible hover area - Smaller to match door */}
            <mesh
              onPointerOver={handleDoorHover}
              onPointerOut={handleDoorLeave}
              position={[0, 0, -1]}
            >
              <boxGeometry args={[6, 8, 1]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            
            <TheatricalDoor 
              onClick={handleDoorClick}
              isHovered={isHovered}
            />
          </>
        )}
      </AnimatePresence>
      
      <TheatricalCameraController />
    </>
  )
}

// Main Landing Page Component
export default function LandingPage({ onEnter }: LandingPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, signOut, loading: authLoading } = useAuthContext()

  useEffect(() => {
    // Simulate loading time for dramatic effect
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleEnterTank = () => {
    if (user) {
      onEnter()
    } else {
      setShowAuthModal(true)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    onEnter()
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Atmospheric background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
        
        {/* Floating particles */}
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity }
            }}
            className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-8 relative"
          >
            <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 mb-4"
          >
            🦈 SHARK TANK
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="text-2xl text-cyan-300 font-light tracking-wider mb-6"
          >
            PITCH SIMULATOR
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-lg text-yellow-400 font-mono tracking-widest"
          >
            PREPARING THE TANK
          </motion.p>
          
      
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 3, 6], fov: 50 }}
          shadows
          className="bg-black"
        >
          <LandingScene onEnter={handleEnterTank} />
        </Canvas>
      </div>

      {/* Theatrical Overlay UI */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* User Authentication UI */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-xl border border-yellow-400/30 rounded-lg px-4 py-2">
                <User size={20} className="text-yellow-400" />
                <span className="text-yellow-300 text-sm font-medium">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 bg-red-900/60 backdrop-blur-xl border border-red-500/30 rounded-lg hover:bg-red-800/60 transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} className="text-red-300" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center space-x-2 bg-black/60 backdrop-blur-xl border border-yellow-400/30 rounded-lg px-4 py-2 hover:bg-yellow-400/10 transition-colors"
            >
              <User size={20} className="text-yellow-400" />
              <span className="text-yellow-300 text-sm font-medium">Sign In</span>
            </button>
          )}
        </div>

        {/* Top Title - Cinematic Style */}
        <div className="p-8 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
            className="text-center"
          >
            <motion.h1 
              className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 mb-6 drop-shadow-2xl"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.5)",
                  "0 0 40px rgba(251, 191, 36, 0.8)",
                  "0 0 20px rgba(251, 191, 36, 0.5)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🦈 SHARK TANK
            </motion.h1>
            <motion.p 
              className="text-3xl text-cyan-300 drop-shadow-lg font-light tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              PITCH SIMULATOR
            </motion.p>
          </motion.div>
        </div>

        {/* Lower Third - Dramatic Info */}
        <div className="absolute bottom-16 left-0 right-0 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, x: -50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 2.5, duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto px-8"
          >
            <div className="bg-black/60 backdrop-blur-xl border border-yellow-400/30 rounded-lg p-8 shadow-2xl">
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3 }}
              >
                <h2 className="text-4xl font-bold text-yellow-400 mb-4 tracking-wide">
                  ENTER THE TANK
                </h2>
                <p className="text-xl text-cyan-200 mb-6 leading-relaxed">
                  Step into the most intense pitch environment ever created. 
                  Face the sharks, defend your vision, and prove your worth.
                </p>
              </motion.div>
              
              <motion.div
                className="flex items-center justify-center space-x-8 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.5 }}
              >
                <div className="text-center">
                  <div className="text-2xl text-yellow-400 font-bold">3</div>
                  <div className="text-sm text-cyan-300">SHARKS</div>
                </div>
                <div className="w-px h-8 bg-yellow-400/50"></div>
                <div className="text-center">
                  <div className="text-2xl text-yellow-400 font-bold">30s</div>
                  <div className="text-sm text-cyan-300">PITCH TIME</div>
                </div>
                <div className="w-px h-8 bg-yellow-400/50"></div>
                <div className="text-center">
                  <div className="text-2xl text-yellow-400 font-bold">∞</div>
                  <div className="text-sm text-cyan-300">POSSIBILITIES</div>
                </div>
              </motion.div>
              
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 4, duration: 0.8 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    textShadow: [
                      "0 0 15px rgba(251, 191, 36, 0.8)",
                      "0 0 30px rgba(251, 191, 36, 1)",
                      "0 0 15px rgba(251, 191, 36, 0.8)"
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-3xl text-yellow-300 font-black mb-4 tracking-wider"
                >
                  🚪 CLICK THE DOOR TO BEGIN 🚪
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-lg text-yellow-400"
                >
                  The sharks are waiting...
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Atmospheric Corner Elements */}
        <motion.div
          className="absolute top-8 right-8 text-yellow-400/30"
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="text-sm font-mono tracking-widest">LIVE</div>
          <div className="w-2 h-2 bg-red-500 rounded-full mt-1 animate-pulse"></div>
        </motion.div>


        <motion.div
          className="absolute bottom-8 right-8 text-cyan-300/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <div className="text-xs font-mono">THE TANK AWAITS</div>
        </motion.div>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signin"
      />
    </div>
  )
}
