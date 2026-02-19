// Generate simple placeholder icons for PWA
const fs = require('fs')
const { PNG } = require('pngjs')

function createSolidColorPNG(size, r, g, b) {
  const png = new PNG({ width: size, height: size })
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2
      png.data[idx] = r
      png.data[idx + 1] = g
      png.data[idx + 2] = b
      png.data[idx + 3] = 255 // alpha
    }
  }
  return PNG.sync.write(png)
}

// Slate-900-ish color: rgb(15, 23, 42)
const color = { r: 15, g: 23, b: 42 }

const sizes = [192, 512]
sizes.forEach(size => {
  const buf = createSolidColorPNG(size, color.r, color.g, color.b)
  const path = `public/icon-${size}x${size}.png`
  fs.writeFileSync(path, buf)
  console.log(`Created ${path}`)
})
