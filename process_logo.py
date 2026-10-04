from PIL import Image, ImageDraw

def make_transparent_circle(input_path, output_path):
    # Open the image
    img = Image.open(input_path).convert("RGBA")
    
    # Get dimensions
    width, height = img.size
    
    # Create a circular mask
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    # Draw a circle. We might need a small offset if there's an internal border, 
    # but a full inscribed ellipse is the safest bet for a square image.
    draw.ellipse((0, 0, width, height), fill=255)
    
    # Create a new image with transparent background
    transparent = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    transparent.paste(img, (0, 0), mask)
    
    # Save the output
    transparent.save(output_path, 'PNG')

if __name__ == "__main__":
    make_transparent_circle('public/logo.jpg', 'public/logo.png')
    make_transparent_circle('public/logo.jpg', 'src/app/icon.png')
    print("Successfully processed images!")
