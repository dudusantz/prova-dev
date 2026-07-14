from PIL import Image
from pathlib import Path

path = Path(r"C:\Users\educr\OneDrive\Documentos\prova-dev\frontend-prova\src\assets\logo-x.png")
img = Image.open(path).convert("RGBA")
pixels = img.load()
w, h = img.size

samples = [pixels[0, 0], pixels[w - 1, 0], pixels[0, h - 1], pixels[w - 1, h - 1]]
print("corner_samples", samples)


def is_background(r, g, b, a):
    if a == 0:
        return True
    brightness = (r + g + b) / 3
    # almost white / off-white backgrounds
    if brightness >= 235 and abs(r - g) < 25 and abs(g - b) < 30 and abs(r - b) < 35:
        return True
    # pale blue-gray leftover board
    if brightness >= 220 and b >= r - 5 and b >= g - 5 and (b - min(r, g)) < 45:
        return True
    return False


changed = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if is_background(r, g, b, a):
            pixels[x, y] = (r, g, b, 0)
            changed += 1

img.save(path)
print(f"saved transparent_pixels={changed} size={w}x{h}")
