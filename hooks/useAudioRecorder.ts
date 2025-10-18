import { useState, useRef, useCallback } from 'react'

interface UseAudioRecorderReturn {
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  audioBlob: Blob | null
  error: string | null
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      audioChunksRef.current = []
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1, // Mono
          sampleRate: 16000, // 16kHz
          echoCancellation: true,
          noiseSuppression: true,
        } 
      })

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording'
      setError(errorMessage)
      console.error('Error starting recording:', err)
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          // Create blob from recorded chunks
          const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          
          // Convert to WAV format (PCM 16bit, mono, 16kHz)
          const wavBlob = await convertToWav(webmBlob)
          
          setAudioBlob(wavBlob)
          setIsRecording(false)
          
          // Stop all tracks
          mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop())
          
          resolve(wavBlob)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to process audio'
          setError(errorMessage)
          console.error('Error processing audio:', err)
          setIsRecording(false)
          resolve(null)
        }
      }

      mediaRecorderRef.current.stop()
    })
  }, [])

  const convertToWav = async (webmBlob: Blob): Promise<Blob> => {
    // Create an audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 16000
    })
    audioContextRef.current = audioContext

    // Decode the audio data
    const arrayBuffer = await webmBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // Convert to mono if stereo
    const channelData = audioBuffer.numberOfChannels > 1
      ? mergeChannels(audioBuffer)
      : audioBuffer.getChannelData(0)

    // Resample to 16kHz if needed
    const resampledData = audioBuffer.sampleRate !== 16000
      ? resample(channelData, audioBuffer.sampleRate, 16000)
      : channelData

    // Convert to 16-bit PCM WAV
    const wavBlob = encodeWAV(resampledData, 16000)
    
    return wavBlob
  }

  const mergeChannels = (audioBuffer: AudioBuffer): Float32Array => {
    const numberOfChannels = audioBuffer.numberOfChannels
    const length = audioBuffer.length
    const result = new Float32Array(length)

    for (let i = 0; i < length; i++) {
      let sum = 0
      for (let channel = 0; channel < numberOfChannels; channel++) {
        sum += audioBuffer.getChannelData(channel)[i]
      }
      result[i] = sum / numberOfChannels
    }

    return result
  }

  const resample = (
    audioData: Float32Array,
    fromSampleRate: number,
    toSampleRate: number
  ): Float32Array => {
    if (fromSampleRate === toSampleRate) {
      return audioData
    }

    const ratio = fromSampleRate / toSampleRate
    const newLength = Math.round(audioData.length / ratio)
    const result = new Float32Array(newLength)

    for (let i = 0; i < newLength; i++) {
      const index = i * ratio
      const indexFloor = Math.floor(index)
      const indexCeil = Math.min(indexFloor + 1, audioData.length - 1)
      const fraction = index - indexFloor
      
      result[i] = audioData[indexFloor] * (1 - fraction) + audioData[indexCeil] * fraction
    }

    return result
  }

  const encodeWAV = (samples: Float32Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    // WAV header
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + samples.length * 2, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true) // PCM format
    view.setUint16(20, 1, true) // PCM
    view.setUint16(22, 1, true) // Mono
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true) // Byte rate
    view.setUint16(32, 2, true) // Block align
    view.setUint16(34, 16, true) // 16-bit
    writeString(view, 36, 'data')
    view.setUint32(40, samples.length * 2, true)

    // Convert float samples to 16-bit PCM
    let offset = 44
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }

    return new Blob([buffer], { type: 'audio/wav' })
  }

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    error
  }
}

