import os
import math
import struct
import wave

def generate_ui_start_sfx(output_path="client/public/assets/audio/sfx/ui/ui_start_game.wav"):
    sample_rate = 44100
    duration = 0.250  # 250 ms
    total_samples = int(sample_rate * duration)
    
    # C5, E5, G5, C6
    notes = [523.25, 659.25, 784.00, 1046.50]
    note_dur = duration / len(notes)
    note_samples = int(sample_rate * note_dur)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    audio_data = bytearray()
    
    for note_idx, freq in enumerate(notes):
        phase = 0.0
        for i in range(note_samples):
            t_loc = i / note_samples
            phase = (phase + freq / sample_rate) % 1.0
            
            pulse = 1.0 if phase < 0.25 else -1.0
            env = math.exp(-t_loc * 4.0)
            vol_step = math.floor(env * 15.0) / 15.0
            
            sample_val = pulse * vol_step * 0.75
            int_val = int(sample_val * 32767.0)
            int_val = max(-32768, min(32767, int_val))
            
            audio_data.extend(struct.pack("<h", int_val))
            
    with wave.open(output_path, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data)
        
    print(f"Saved: {output_path} ({len(notes)*note_samples} samples, {len(audio_data)} bytes)")

if __name__ == "__main__":
    generate_ui_start_sfx()
