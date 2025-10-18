'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useJudgeCreation, CreateJudgeRequest, GeneratedJudgeProfile } from '@/hooks/useJudgeCreation'
import { Judge } from '@/types/judge'
import { X, Plus, Sparkles, User, Briefcase, Target, Heart } from 'lucide-react'

interface CreateJudgeFormProps {
  onJudgeCreated: (judge: Judge) => void
  onClose: () => void
}

export default function CreateJudgeForm({ onJudgeCreated, onClose }: CreateJudgeFormProps) {
  const [formData, setFormData] = useState<CreateJudgeRequest>({
    name: '',
    specialties: [],
    investmentStyle: '',
    causes: []
  })
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newCause, setNewCause] = useState('')
  const [generatedProfile, setGeneratedProfile] = useState<GeneratedJudgeProfile | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const { generateJudgePersonality, isGenerating, error, clearError } = useJudgeCreation()

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }))
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }))
  }

  const addCause = () => {
    if (newCause.trim() && !formData.causes?.includes(newCause.trim())) {
      setFormData(prev => ({
        ...prev,
        causes: [...(prev.causes || []), newCause.trim()]
      }))
      setNewCause('')
    }
  }

  const removeCause = (cause: string) => {
    setFormData(prev => ({
      ...prev,
      causes: prev.causes?.filter(c => c !== cause) || []
    }))
  }

  const handleGeneratePersonality = async () => {
    if (!formData.name || formData.specialties.length === 0 || !formData.investmentStyle) {
      return
    }

    clearError()
    const profile = await generateJudgePersonality(formData)
    if (profile) {
      setGeneratedProfile(profile)
      setShowPreview(true)
    }
  }

  const handleCreateJudge = () => {
    if (!generatedProfile) return

    const newJudge: Judge = {
      id: formData.name.toLowerCase().replace(/\s+/g, '_'),
      name: formData.name,
      personality: generatedProfile.personality,
      expertise: formData.specialties,
      avatarUrl: '',
      voiceId: `${formData.name.toLowerCase().replace(/\s+/g, '_')}_voice`,
      isHeyGenAvatar: true,
      heygenAvatarId: process.env.NEXT_PUBLIC_HEYGEN_AVATAR_ID || 'Ann_Therapist_public',
      microExpressions: generatedProfile.microExpressions,
      scoringCriteria: generatedProfile.scoringCriteria
    }

    onJudgeCreated(newJudge)
    onClose()
  }

  const isFormValid = formData.name.trim() && formData.specialties.length > 0 && formData.investmentStyle.trim()

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-black/90 backdrop-blur-xl rounded-2xl border border-cyan-400/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300">
                  Create New Judge
                </h2>
                <p className="text-cyan-300">Design your perfect Shark Tank judge</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!showPreview ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Judge Name */}
                <div>
                  <label className="block text-lg font-semibold text-cyan-300 mb-3">
                    Judge Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter judge's name"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>

                {/* Specialties */}
                <div>
                  <label className="block text-lg font-semibold text-cyan-300 mb-3">
                    <Briefcase className="w-5 h-5 inline mr-2" />
                    Specialties
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      placeholder="Add a specialty"
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                    />
                    <button
                      onClick={addSpecialty}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.specialties.map((specialty, index) => (
                      <motion.span
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-3 py-1 bg-cyan-400/20 text-cyan-300 rounded-full border border-cyan-400/30 flex items-center gap-2"
                      >
                        {specialty}
                        <button
                          onClick={() => removeSpecialty(specialty)}
                          className="text-cyan-400 hover:text-cyan-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Investment Style */}
                <div>
                  <label className="block text-lg font-semibold text-cyan-300 mb-3">
                    <Target className="w-5 h-5 inline mr-2" />
                    Investment Style
                  </label>
                  <input
                    type="text"
                    value={formData.investmentStyle}
                    onChange={(e) => setFormData(prev => ({ ...prev, investmentStyle: e.target.value }))}
                    placeholder="e.g., risk-taker, conservative, visionary strategist"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-cyan-400/30 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>


                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-900/30 border border-red-400/50 rounded-lg text-red-300"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Generate Button */}
                <div className="flex justify-center">
                  <motion.button
                    onClick={handleGeneratePersonality}
                    disabled={!isFormValid || isGenerating}
                    className={`px-8 py-4 text-lg font-bold rounded-xl transition-all duration-300 flex items-center gap-3 ${
                      isFormValid && !isGenerating
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105 shadow-2xl shadow-yellow-400/50'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                    whileHover={isFormValid && !isGenerating ? { scale: 1.05 } : {}}
                    whileTap={isFormValid && !isGenerating ? { scale: 0.95 } : {}}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Generating Personality...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Personality
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Preview Header */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2">Generated Judge Profile</h3>
                  <p className="text-cyan-300">Review the AI-generated personality for {formData.name}</p>
                </div>

                {/* Personality Preview */}
                <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">Personality</h4>
                    <p className="text-gray-300">{generatedProfile?.personality}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedProfile?.personalityTraits.map((trait, index) => (
                        <span key={index} className="px-3 py-1 bg-cyan-400/20 text-cyan-300 rounded-full border border-cyan-400/30">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">Catchphrases</h4>
                    <div className="space-y-1">
                      {generatedProfile?.catchphrases.map((phrase, index) => (
                        <p key={index} className="text-gray-300 italic">"{phrase}"</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">Scoring Focus</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(generatedProfile?.scoringCriteria || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-300 capitalize">{key}:</span>
                          <span className="text-yellow-400 font-semibold">{(value * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleCreateJudge}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-lg hover:from-yellow-300 hover:to-yellow-400 transition-all transform hover:scale-105"
                  >
                    Create Judge
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
