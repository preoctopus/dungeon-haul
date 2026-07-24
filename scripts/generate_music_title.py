import os
import math
import wave
import struct

def generate_title_music(output_path="client/public/assets/audio/music/music_title.wav"):
    sample_rate = 44100
    bpm = 128
    beats = 32
    beat_dur = 60.0 / bpm
    total_dur = beats * beat_dur  # 15.0 s
    total_samples = int(sample_rate * total_dur)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    audio_data = bytearray()
    
    # Simple, crisp 8-bit NES loop melody notes (frequency Hz)
    melody = [
        # Bar 1 (Am)
        440, 440, 523, 523, 493, 493, 440, 440,
        # Bar 2 (F)
        349, 349, 440, 440, 523, 523, 440, 440,
        # Bar 3 (C)
        523, 523, 659, 659, 587, 587, 523, 523,
        # Bar 4 (G)
        392, 392, 493, 493, 587, 587, 493, 493
    ] * 2  # Repeat for 8 bars total
    
    note_dur = total_dur / len(melody)
    samples_per_note = int(sample_rate * note_dur)
    
    for note_idx, freq in enumerate(melody):
        phase_sq = 0.0
        phase_tri = 0.0
        bass_freq = freq / 2.0
        
        for i in range(samples_per_note):
            t_note = i / samples_per_note
            phase_sq = (phase_sq + freq / sample_rate) % 1.0
            phase_tri = (phase_tri + bass_freq / sample_rate) % 1.0
            
            # Pulse lead
            sq = 1.0 if phase_sq < 0.25 else -1.0
            # Triangle bass
            tri = 2.0 * abs(2.0 * (phase_tri - math.floor(phase_tri + 0.5))) - 1.0
            
            env = math.exp(-t_note * 2.5)
            mix = (sq * 0.5 + tri * 0.5) * env * 0.7
            
            int_val = int(mix * 32767.0)
            int_val = max(-32768, min(32767, int_val))
            
            audio_data.extend(struct.pack("<h", int_val))
            
    with wave.open(output_path, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data)
        
    print(f"Saved: {output_path} ({total_dur:.1f}s, {len(audio_data)} bytes)")

if __name__ == "__main__":
    generate_title_music()
