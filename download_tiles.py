import os
import requests
import time

base_url = "https://raw.githubusercontent.com/FluffyStuff/riichi-mahjong-tiles/master/Export/Regular"
dest_dir = "public/tiles"

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

# Mapping: (RemoteName, LocalName)
files_to_download = []

# Manzu
for i in range(1, 10):
    files_to_download.append((f"Man{i}.png", f"{i}m.png"))

# Pinzu
for i in range(1, 10):
    files_to_download.append((f"Pin{i}.png", f"{i}p.png"))

# Souzu
for i in range(1, 10):
    files_to_download.append((f"Sou{i}.png", f"{i}s.png"))

# Honors
honors = {
    "Ton": "z1", "Nan": "z2", "Sha": "z3", "Pei": "z4",
    "Haku": "z5", "Hatu": "z6", "Chun": "z7" 
    # Note: Checking 'Hatu' vs 'Hatsu' vs 'Green'. 
    # Common is Haku/Hatsu/Chun but sometimes Hatu. 
    # Let's try Haku, Hatsu, Chun first.
}

# Add Winds
files_to_download.append(("Ton.png", "z1.png"))
files_to_download.append(("Nan.png", "z2.png"))
files_to_download.append(("Sha.png", "z3.png"))
files_to_download.append(("Pei.png", "z4.png"))

# Add Dragons - trying likely names, valid ones will overwrite or we catch errors
# I'll try standard Hepburn: Haku, Hatsu, Chun
files_to_download.append(("Haku.png", "z5.png"))
files_to_download.append(("Hatsu.png", "z6.png"))
files_to_download.append(("Chun.png", "z7.png"))

# Also try 'Hatu' just in case for z6
files_to_download.append(("Hatu.png", "z6_alt.png")) 

# Also try 'Aka' (Red 5s) if they exist
files_to_download.append(("Man5-Dora.png", "5m_red.png"))
files_to_download.append(("Pin5-Dora.png", "5p_red.png"))
files_to_download.append(("Sou5-Dora.png", "5s_red.png"))


print(f"Starting download of {len(files_to_download)} files...")

for remote, local in files_to_download:
    url = f"{base_url}/{remote}"
    local_path = os.path.join(dest_dir, local)
    
    # Skip if exists? No, overwrite to be sure
    try:
        print(f"Downloading {remote} -> {local}...", end="")
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            with open(local_path, 'wb') as f:
                f.write(r.content)
            print("OK")
        else:
            print(f"FAILED ({r.status_code})")
    except Exception as e:
        print(f"ERROR: {e}")
    
    time.sleep(0.2) # be nice

print("Download complete.")
