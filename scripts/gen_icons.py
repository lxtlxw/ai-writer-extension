"""Generate simple PNG icons for Chrome extension using pure Python."""
import struct, zlib, os

def create_png(width, height, draw_func):
    """Create a PNG file with given dimensions and drawing function."""
    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'

    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)  # 8-bit RGB
    ihdr = make_chunk(b'IHDR', ihdr_data)

    # Image data
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter byte
        for x in range(width):
            r, g, b = draw_func(x, y, width, height)
            raw_data.extend([r, g, b])

    compressed = zlib.compress(bytes(raw_data))
    idat = make_chunk(b'IDAT', compressed)

    # IEND chunk
    iend = make_chunk(b'IEND', b'')

    return sig + ihdr + idat + iend

def make_chunk(chunk_type, data):
    chunk = chunk_type + data
    return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)

def draw_icon(x, y, w, h):
    """Draw a purple gradient 'AI' badge."""
    # Background gradient (purple)
    progress = (x + y) / (w + h)
    r = int(108 + (162 - 108) * progress)
    g = int(92 + (155 - 92) * progress)
    b = int(231 + (254 - 231) * progress)

    # Rounded corner clipping
    cx, cy = w/2, h/2
    rx, ry = w/2 - w*0.05, h/2 - h*0.05
    corner_r = min(w, h) * 0.2

    # Simple rounded rect check
    dx = abs(x - cx)
    dy = abs(y - cy)
    if dx > rx - corner_r and dy > ry - corner_r:
        corner_dist = ((dx - (rx - corner_r)) ** 2 + (dy - (ry - corner_r)) ** 2) ** 0.5
        if corner_dist > corner_r:
            # Outside the rounded rect - transparent (but PNG doesn't support alpha without RGBA)
            # Let's just use white background
            return (255, 255, 255)

    # Draw "AI" text - very simple pixel art approach
    # Define "AI" as a simple pixel grid
    # Let's do this simpler: just gradient background with the letters as negative space
    # Actually, for simplicity, let's just do a nice gradient badge

    # Simple "A" detection (center area, top portion)
    text_center_x = w * 0.35
    text_center_y = h * 0.5
    char_w = w * 0.12
    char_h = h * 0.5

    # Draw letter "A" as simple pixel art
    # Left side of A
    if abs(x - text_center_x) < char_w * 0.5 and abs(y - text_center_y) < char_h * 0.5:
        # Triangle shape for A
        rel_x = (x - text_center_x) / char_w
        rel_y = (y - text_center_y) / char_h
        # Upper triangle
        if abs(rel_x) < (0.5 - abs(rel_y) * 0.3) and abs(rel_y) < 0.6:
            # Cross bar of A
            if abs(rel_y) < 0.1:
                return (255, 255, 255)  # White
            if rel_y < -0.1:
                return (255, 255, 255)  # White
            if rel_y > 0.1:
                return (255, 255, 255)  # White

    # Draw letter "I"
    text2_x = w * 0.65
    if abs(x - text2_x) < char_w * 0.2 and abs(y - h * 0.5) < char_h * 0.4:
        return (255, 255, 255)  # White

    return (r, g, b)

def draw_icon_simple(x, y, w, h):
    """Simpler icon - purple rounded square with AI text."""
    padding = max(2, w // 8)
    inner = w - padding * 2
    corner_r = inner * 0.25

    # Check if we're inside the rounded rect
    cx, cy = w/2, h/2
    dx = abs(x - cx) - (inner/2 - corner_r)
    dy = abs(y - cy) - (inner/2 - corner_r)

    if dx > 0 and dy > 0:
        if dx*dx + dy*dy > corner_r*corner_r:
            return (245, 245, 250)  # Light gray outside

    # Purple gradient inside
    t = (x + y) / (w + h)
    r = int(100 + 30 * t)
    g = int(80 + 40 * t)
    b = int(220 - 20 * t)

    # "AI" text as simple white pixels
    # Normalize coordinates
    nx = (x - w/2) / w
    ny = (y - h/2) / h

    # A letter (left side, triangular shape)
    ax, ay = -0.18, 0
    if abs(ny) < 0.35:
        a_width = 0.12 - abs(ny) * 0.08
        if abs(nx - ax) < a_width:
            # Cross bar of A (around y=0.05 normalized)
            if abs(ny - 0.05) < 0.04:
                return (255, 255, 255)
            if ny < 0:
                return (255, 255, 255)
            if ny > 0.1:
                return (255, 255, 255)

    # I letter (right side, simple vertical bar)
    ix, iy = 0.18, 0
    if abs(nx - ix) < 0.05 and abs(ny) < 0.3:
        return (255, 255, 255)

    return (r, g, b)

def draw_icon_v3(x, y, w, h):
    """Clean icon: purple background with white 'AI' text using simple geometry."""
    # Background: soft purple gradient
    t = (x + y) / (w + h)
    r = int(100 + 40 * t)
    g = int(85 + 45 * t)
    b = int(225 - 10 * t)

    # Rounded square check
    margin = w * 0.08
    inner_r = w/2 - margin
    corner_r = inner_r * 0.3
    cx, cy = w/2, h/2
    dx = abs(x - cx)
    dy = abs(y - cy)

    if dx > inner_r - corner_r and dy > inner_r - corner_r:
        corner_dist = ((dx - (inner_r - corner_r))**2 + (dy - (inner_r - corner_r))**2)**0.5
        if corner_dist > corner_r:
            return (248, 247, 253)

    # Draw "A" as two diagonal lines + cross bar
    nx = (x - w/2) / w  # -0.5 to 0.5
    ny = (y - h/2) / h  # -0.5 to 0.5

    # Scale for letter rendering
    letter_size = 0.28
    stroke = 0.045

    # Letter "A" centered at x=-0.15
    ax = -0.15
    # Left leg: from (-0.22, 0.35) to (-0.08, -0.35)
    left_leg_dx = nx - (ax - 0.07 + ny * 0.2)
    if abs(left_leg_dx) < stroke and abs(ny) < 0.33:
        return (255, 255, 255)
    # Right leg: from (-0.08, -0.35) to (-0.22, 0.35)
    right_leg_dx = nx - (ax + 0.07 - ny * 0.2)
    if abs(right_leg_dx) < stroke and abs(ny) < 0.33:
        return (255, 255, 255)
    # Cross bar at ny ≈ 0.08
    if abs(ny - 0.08) < stroke*0.6 and abs(nx - ax) < 0.1:
        return (255, 255, 255)

    # Letter "I" centered at x=0.15
    ix = 0.15
    if abs(nx - ix) < stroke and abs(ny) < 0.3:
        return (255, 255, 255)

    return (r, g, b)

# Generate icons
sizes = [16, 48, 128]
out_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'icons')
os.makedirs(out_dir, exist_ok=True)

for size in sizes:
    png_data = create_png(size, size, draw_icon_v3)
    filepath = os.path.join(out_dir, f'icon{size}.png')
    with open(filepath, 'wb') as f:
        f.write(png_data)
    print(f'OK Generated {filepath} ({size}x{size})')

# Also verify the files
for size in sizes:
    filepath = os.path.join(out_dir, f'icon{size}.png')
    file_size = os.path.getsize(filepath)
    print(f'  {filepath} - {file_size} bytes')

print('\nOK All icons generated successfully!')
