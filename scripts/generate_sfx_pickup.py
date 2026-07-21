import os
import math
import struct
import wave

def generate_pickup_sfx(output_path="client/public/assets/audio/sfx/object/pickup_treasure.wav"):
    sample_rate = 44100
    duration = 0.120  # 120 ms
    total_samples = int(sample_rate * duration)
    
    freq1 = 987.77   # B5
    freq2 = 1318.51  # E6
    switch_sample = int(sample_rate * 0.050)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    audio_data = bytearray()
    
    phase1 = 0.0
    phase2 = 0.0
    
    for i in range(total_samples):
        t = i / sample_rate
        
        if i < switch_sample:
            freq = freq1
            note_t = t / 0.050
            env = math.exp(-3.0 * note_t)
        else:
            freq = freq2
            note_t = (t - 0.050) / 0.070
            env = math.exp(-4.5 * note_t)
            
        vol_step = math.floor(env * 15.0) / 15.0
        vol_step = max(0.0, min(1.0, vol_step))
        
        phase1 = (phase1 + freq / sample_rate) % 1.0
        pulse1 = 1.0 if phase1 < 0.25 else -1.0
        
        freq_oct = freq * 2.0
        phase2 = (phase2 + freq_oct / sample_rate) % 1.0
        pulse2 = 1.0 if phase2 < 0.50 else -1.0
        
        sample_val = (0.80 * pulse1 + 0.20 * pulse2) * vol_step * 0.75
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
    generate_pickup_sfx()
