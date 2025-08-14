#!/usr/bin/env python3
"""
Vocal Separation Service for Wai'tu Music Platform
Provides vocal removal capabilities using Spleeter for DJ playback tracks
"""

import os
import sys
import json
import logging
from pathlib import Path
import tempfile
import shutil

try:
    from spleeter.separator import Separator
    from spleeter.audio.adapter import AudioAdapter
    import librosa
    import soundfile as sf
    import numpy as np
except ImportError as e:
    print(f"Error: Required packages not installed: {e}")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class VocalSeparationService:
    def __init__(self):
        """Initialize the vocal separation service with Spleeter models"""
        try:
            # Initialize Spleeter with 2stems model (vocals/accompaniment)
            self.separator = Separator('spleeter:2stems-16kHz')
            self.audio_adapter = AudioAdapter.default()
            logger.info("Spleeter initialized successfully with 2stems model")
        except Exception as e:
            logger.error(f"Failed to initialize Spleeter: {e}")
            raise
    
    def analyze_audio(self, audio_file_path):
        """
        Analyze audio file to detect if vocals are present
        Returns confidence score and recommendations
        """
        try:
            # Load audio file
            waveform, sample_rate = librosa.load(audio_file_path, sr=None, mono=False)
            
            # Convert to mono for analysis if stereo
            if len(waveform.shape) > 1:
                waveform_mono = librosa.to_mono(waveform)
            else:
                waveform_mono = waveform
            
            # Detect vocal presence using spectral features
            spectral_centroids = librosa.feature.spectral_centroid(y=waveform_mono, sr=sample_rate)[0]
            mfccs = librosa.feature.mfcc(y=waveform_mono, sr=sample_rate, n_mfcc=13)
            
            # Calculate vocal likelihood based on spectral characteristics
            high_freq_energy = np.mean(spectral_centroids > 2000)  # Vocal frequency range
            vocal_formant_energy = np.mean(mfccs[1:4])  # Formant-related MFCCs
            
            # Combine metrics for vocal confidence score
            vocal_confidence = (high_freq_energy * 0.6) + (abs(vocal_formant_energy) * 0.4)
            vocal_confidence = min(max(vocal_confidence, 0.0), 1.0)  # Clamp to 0-1
            
            # Determine recommendation
            if vocal_confidence > 0.7:
                recommendation = "high_confidence_vocals"
                message = "High confidence vocals detected - recommend vocal separation"
            elif vocal_confidence > 0.4:
                recommendation = "moderate_vocals"
                message = "Moderate vocal content detected - separation may be beneficial"
            else:
                recommendation = "instrumental"
                message = "Appears to be instrumental - separation may not be necessary"
            
            return {
                "vocal_confidence": float(vocal_confidence),
                "recommendation": recommendation,
                "message": message,
                "duration": float(librosa.get_duration(y=waveform_mono, sr=sample_rate)),
                "sample_rate": int(sample_rate),
                "channels": int(waveform.shape[0] if len(waveform.shape) > 1 else 1)
            }
            
        except Exception as e:
            logger.error(f"Audio analysis failed: {e}")
            return {
                "error": f"Analysis failed: {str(e)}",
                "vocal_confidence": 0.0,
                "recommendation": "error"
            }
    
    def separate_vocals(self, input_file_path, output_dir, filename_prefix="track"):
        """
        Separate vocals from audio track using Spleeter
        Returns paths to separated tracks
        """
        try:
            # Create output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)
            
            # Load audio using Spleeter's audio adapter
            waveform, sample_rate = self.audio_adapter.load(input_file_path)
            
            # Perform separation
            logger.info(f"Starting vocal separation for: {input_file_path}")
            prediction = self.separator.separate(waveform)
            
            # Save separated tracks
            output_files = {}
            
            # Save instrumental (accompaniment) track - this is what DJs need
            instrumental_path = os.path.join(output_dir, f"{filename_prefix}_instrumental.wav")
            sf.write(instrumental_path, prediction['accompaniment'], sample_rate)
            output_files['instrumental'] = instrumental_path
            
            # Save vocals track (for reference/quality check)
            vocals_path = os.path.join(output_dir, f"{filename_prefix}_vocals.wav")
            sf.write(vocals_path, prediction['vocals'], sample_rate)
            output_files['vocals'] = vocals_path
            
            # Save original for comparison
            original_path = os.path.join(output_dir, f"{filename_prefix}_original.wav")
            shutil.copy2(input_file_path, original_path)
            output_files['original'] = original_path
            
            logger.info(f"Vocal separation completed successfully")
            return {
                "success": True,
                "output_files": output_files,
                "message": "Vocal separation completed successfully"
            }
            
        except Exception as e:
            logger.error(f"Vocal separation failed: {e}")
            return {
                "success": False,
                "error": f"Separation failed: {str(e)}"
            }
    
    def process_setlist_track(self, input_file_path, song_title, output_base_dir):
        """
        Process a single setlist track for DJ use
        Combines analysis and separation in one workflow
        """
        try:
            # Create song-specific output directory
            safe_title = "".join(c for c in song_title if c.isalnum() or c in (' ', '-', '_')).rstrip()
            song_output_dir = os.path.join(output_base_dir, safe_title)
            
            # Step 1: Analyze audio
            logger.info(f"Analyzing track: {song_title}")
            analysis_result = self.analyze_audio(input_file_path)
            
            if "error" in analysis_result:
                return analysis_result
            
            # Step 2: Decide if separation is needed
            should_separate = analysis_result["recommendation"] in ["high_confidence_vocals", "moderate_vocals"]
            
            result = {
                "song_title": song_title,
                "analysis": analysis_result,
                "separation_performed": should_separate
            }
            
            if should_separate:
                # Step 3: Perform separation
                logger.info(f"Performing vocal separation for: {song_title}")
                separation_result = self.separate_vocals(
                    input_file_path, 
                    song_output_dir, 
                    safe_title.replace(' ', '_')
                )
                result.update(separation_result)
            else:
                # Just copy original file for DJ use
                os.makedirs(song_output_dir, exist_ok=True)
                dj_track_path = os.path.join(song_output_dir, f"{safe_title.replace(' ', '_')}_dj_ready.wav")
                shutil.copy2(input_file_path, dj_track_path)
                result["output_files"] = {"dj_ready": dj_track_path}
                result["message"] = "No vocal separation needed - original track copied for DJ use"
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to process setlist track: {e}")
            return {
                "song_title": song_title,
                "error": f"Processing failed: {str(e)}"
            }

def main():
    """Command-line interface for vocal separation service"""
    if len(sys.argv) < 2:
        print("Usage: python vocal_separation_service.py <command> [args...]")
        print("Commands:")
        print("  analyze <audio_file> - Analyze audio for vocal content")
        print("  separate <audio_file> <output_dir> [prefix] - Separate vocals from audio")
        print("  process <audio_file> <song_title> <output_dir> - Process setlist track")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    try:
        service = VocalSeparationService()
        
        if command == "analyze":
            if len(sys.argv) < 3:
                print("Usage: analyze <audio_file>")
                sys.exit(1)
            
            result = service.analyze_audio(sys.argv[2])
            print(json.dumps(result, indent=2))
        
        elif command == "separate":
            if len(sys.argv) < 4:
                print("Usage: separate <audio_file> <output_dir> [prefix]")
                sys.exit(1)
            
            prefix = sys.argv[4] if len(sys.argv) > 4 else "track"
            result = service.separate_vocals(sys.argv[2], sys.argv[3], prefix)
            print(json.dumps(result, indent=2))
        
        elif command == "process":
            if len(sys.argv) < 5:
                print("Usage: process <audio_file> <song_title> <output_dir>")
                sys.exit(1)
            
            result = service.process_setlist_track(sys.argv[2], sys.argv[3], sys.argv[4])
            print(json.dumps(result, indent=2))
        
        else:
            print(f"Unknown command: {command}")
            sys.exit(1)
    
    except Exception as e:
        logger.error(f"Service error: {e}")
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()