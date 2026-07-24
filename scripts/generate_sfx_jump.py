import os
import math
import struct
import wave

def generate_jump_sfx(output_path="client/public/assets/audio/sfx/char/char_jump.wav"):
    sample_rate = 44100
    duration = 0.150  # 150 ms
    total_samples = int(sample_rate * duration)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    audio_data = bytearray()
    
    f_start = 220.0
    f_end = 660.0
    phase = 0.0
    
    for i in range(total_samples):
        t = i / total_samples
        t_sec = i / sample_rate
        
        # Linear frequency sweep
        freq = f_start + (f_end - f_start) * t
        
        # Exponential volume decay
        vol = math.exp(-3.5 * t_sec / duration)
        # NES 4-bit volume quantization (16 levels)
        vol_step = math.floor(vol * 15.0) / 15.0
        
        phase = (phase + freq / sample_rate) % 1.0
        # 50% duty cycle square wave
        square = 1.0 if phase < 0.5 else -1.0
        
        sample_val = square * vol_step * 0.75
        int_val = int(sample_val * 32767.0)
        int_val = max(-32768, min(32767, int_val))
        
        audio_data.extend(struct.pack("<h", int_val))
        
    with wave.open(output_path, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data)
        
    print(f"Saved: {output_path} ({total_samples} samples, {len(audio_data)} bytes)")

if __name__ == "__main__":
    generate_jump_sfx()
