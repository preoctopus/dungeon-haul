import os
import math
import struct
import wave
import random

def generate_spikes_sfx(output_path="client/public/assets/audio/sfx/trap/trap_spikes.wav"):
    sample_rate = 44100
    duration = 0.180  # 180 ms
    total_samples = int(sample_rate * duration)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    audio_data = bytearray()
    
    random.seed(1337)
    phase = 0.0
    
    f_start = 800.0
    f_end = 200.0
    
    for i in range(total_samples):
        t = i / total_samples
        t_sec = i / sample_rate
        
        freq = f_start + (f_end - f_start) * (t ** 0.5)
        phase = (phase + freq / sample_rate) % 1.0
        
        square = 1.0 if phase < 0.3 else -1.0
        noise = random.uniform(-1.0, 1.0)
        
        # Attack click envelope
        click_env = math.exp(-t_sec * 60.0)
        body_env = math.exp(-t_sec * 12.0)
        
        sample_val = (0.5 * square * body_env) + (0.5 * noise * click_env)
        vol_step = math.floor(sample_val * 15.0) / 15.0
        
        int_val = int(vol_step * 0.75 * 32767.0)
        int_val = max(-32768, min(32767, int_val))
        
        audio_data.extend(struct.pack("<h", int_val))
        
    with wave.open(output_path, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data)
        
    print(f"Saved: {output_path} ({total_samples} samples, {len(audio_data)} bytes)")

if __name__ == "__main__":
    generate_spikes_sfx()
