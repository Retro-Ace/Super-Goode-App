import AppKit

struct Palette {
  static let deepPurple = NSColor(calibratedRed: 0.20, green: 0.05, blue: 0.33, alpha: 1.0)
  static let purple = NSColor(calibratedRed: 0.55, green: 0.18, blue: 0.72, alpha: 1.0)
  static let magenta = NSColor(calibratedRed: 0.78, green: 0.43, blue: 0.90, alpha: 1.0)
  static let white = NSColor(calibratedWhite: 1.0, alpha: 1.0)
}

let fileManager = FileManager.default
let cwd = URL(fileURLWithPath: fileManager.currentDirectoryPath)
let imagesDir = cwd.appendingPathComponent("assets/images", isDirectory: true)
let outputDir = imagesDir.appendingPathComponent("app-icon", isDirectory: true)
let brandingDir = imagesDir.appendingPathComponent("branding", isDirectory: true)

try fileManager.createDirectory(at: outputDir, withIntermediateDirectories: true)

let sourceURL = outputDir.appendingPathComponent("source-app-store-icon.png")
let headshotURL = brandingDir.appendingPathComponent("super-goode-headshot.jpg")
let mapLogoURL = brandingDir.appendingPathComponent("super-goode-map-logo.png")

guard let sourceImage = NSImage(contentsOf: sourceURL) else {
  fputs("Missing app-icon/source-app-store-icon.png\n", stderr)
  exit(1)
}

guard let headshotImage = NSImage(contentsOf: headshotURL) else {
  fputs("Missing branding/super-goode-headshot.jpg\n", stderr)
  exit(1)
}

guard let mapLogoImage = NSImage(contentsOf: mapLogoURL) else {
  fputs("Missing branding/super-goode-map-logo.png\n", stderr)
  exit(1)
}

func savePNG(_ image: NSImage, to url: URL) throws {
  guard
    let tiff = image.tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiff),
    let png = bitmap.representation(using: .png, properties: [:])
  else {
    throw NSError(domain: "IconGen", code: 1)
  }

  try png.write(to: url)
}

func makeImage(size: CGFloat, transparent: Bool = false, _ draw: () -> Void) -> NSImage {
  let image = NSImage(size: NSSize(width: size, height: size))
  image.lockFocus()

  if transparent {
    NSColor.clear.setFill()
    NSBezierPath(rect: CGRect(x: 0, y: 0, width: size, height: size)).fill()
  }

  draw()
  image.unlockFocus()
  return image
}

func roundedRectPath(_ rect: CGRect, radius: CGFloat) -> NSBezierPath {
  NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
}

func aspectFitRect(for image: NSImage, in rect: CGRect) -> CGRect {
  let imageSize = image.size

  guard imageSize.width > 0, imageSize.height > 0 else {
    return rect
  }

  let scale = min(rect.width / imageSize.width, rect.height / imageSize.height)
  let width = imageSize.width * scale
  let height = imageSize.height * scale

  return CGRect(
    x: rect.midX - width / 2,
    y: rect.midY - height / 2,
    width: width,
    height: height
  )
}

func drawSource(_ source: NSImage, in rect: CGRect, clipRadius: CGFloat? = nil) {
  NSGraphicsContext.saveGraphicsState()

  if let clipRadius {
    roundedRectPath(rect, radius: clipRadius).addClip()
  }

  source.draw(
    in: rect,
    from: CGRect(origin: .zero, size: source.size),
    operation: .sourceOver,
    fraction: 1,
    respectFlipped: false,
    hints: [.interpolation: NSImageInterpolation.high]
  )

  NSGraphicsContext.restoreGraphicsState()
}

func drawAdaptiveBackground(size: CGFloat) -> NSImage {
  let canvas = CGRect(x: 0, y: 0, width: size, height: size)

  return makeImage(size: size) {
    let gradient = NSGradient(colors: [Palette.deepPurple, Palette.purple, Palette.magenta])!
    gradient.draw(in: NSBezierPath(rect: canvas), angle: -38)

    let glowRect = CGRect(x: size * 0.16, y: size * 0.12, width: size * 0.68, height: size * 0.68)
    let glow = NSGradient(colors: [
      Palette.white.withAlphaComponent(0.18),
      Palette.white.withAlphaComponent(0.02),
    ])!

    glow.draw(in: NSBezierPath(ovalIn: glowRect), relativeCenterPosition: NSPoint(x: 0.15, y: 0.22))
  }
}

func drawMonochrome(size: CGFloat) -> NSImage {
  let canvas = CGRect(x: 0, y: 0, width: size, height: size)

  return makeImage(size: size, transparent: true) {
    let paragraph = NSMutableParagraphStyle()
    paragraph.alignment = .center
    paragraph.lineSpacing = -size * 0.035

    let attributes: [NSAttributedString.Key: Any] = [
      .font: NSFont.systemFont(ofSize: size * 0.19, weight: .black),
      .foregroundColor: Palette.white,
      .paragraphStyle: paragraph,
      .kern: -2.4,
    ]

    let text = NSString(string: "SUPER\nGOODE")
    let bounds = text.boundingRect(
      with: NSSize(width: size * 0.82, height: .greatestFiniteMagnitude),
      options: [.usesLineFragmentOrigin, .usesFontLeading],
      attributes: attributes
    )

    let drawRect = CGRect(
      x: canvas.midX - bounds.width / 2,
      y: canvas.midY - bounds.height / 2 - size * 0.015,
      width: bounds.width,
      height: bounds.height
    )

    text.draw(in: drawRect, withAttributes: attributes)
  }
}

func drawPrimary(size: CGFloat) -> NSImage {
  makeImage(size: size) {
    drawSource(sourceImage, in: CGRect(x: 0, y: 0, width: size, height: size))
  }
}

func drawAdaptiveForeground(size: CGFloat) -> NSImage {
  makeImage(size: size, transparent: true) {
    drawSource(
      sourceImage,
      in: CGRect(x: 0, y: 0, width: size, height: size),
      clipRadius: size * 0.23
    )
  }
}

func drawSplash(size: CGFloat) -> NSImage {
  let canvas = CGRect(x: 0, y: 0, width: size, height: size)
  let avatarSize = size * 0.33
  let avatarRect = CGRect(x: 0, y: 0, width: avatarSize, height: avatarSize)
  let logoBounds = CGRect(x: size * 0.16, y: 0, width: size * 0.68, height: size * 0.2)
  let fittedLogoRect = aspectFitRect(for: mapLogoImage, in: logoBounds)
  let lockupGap = size * 0.03
  let totalHeight = avatarRect.height + lockupGap + fittedLogoRect.height
  let baseY = canvas.midY - totalHeight / 2
  let centeredAvatarRect = CGRect(
    x: canvas.midX - avatarRect.width / 2,
    y: baseY + fittedLogoRect.height + lockupGap,
    width: avatarRect.width,
    height: avatarRect.height
  )
  let centeredLogoRect = CGRect(
    x: canvas.midX - fittedLogoRect.width / 2,
    y: baseY,
    width: fittedLogoRect.width,
    height: fittedLogoRect.height
  )

  return makeImage(size: size, transparent: true) {
    drawSource(headshotImage, in: centeredAvatarRect, clipRadius: centeredAvatarRect.width / 2)

    let framePath = NSBezierPath(ovalIn: centeredAvatarRect.insetBy(dx: 2, dy: 2))
    NSColor(calibratedWhite: 1.0, alpha: 0.35).setStroke()
    framePath.lineWidth = size * 0.006
    framePath.stroke()

    drawSource(mapLogoImage, in: centeredLogoRect)
  }
}

let primary1024 = drawPrimary(size: 1024)
let adaptiveForeground = drawAdaptiveForeground(size: 1024)
let adaptiveBackground = drawAdaptiveBackground(size: 1024)
let monochrome = drawMonochrome(size: 1024)
let splash2048 = drawSplash(size: 2048)

try savePNG(primary1024, to: outputDir.appendingPathComponent("super-goode-app-icon-primary-1024.png"))
try savePNG(adaptiveForeground, to: outputDir.appendingPathComponent("super-goode-app-icon-android-foreground-1024.png"))
try savePNG(adaptiveBackground, to: outputDir.appendingPathComponent("super-goode-app-icon-android-background-1024.png"))
try savePNG(monochrome, to: outputDir.appendingPathComponent("super-goode-app-icon-android-monochrome-1024.png"))

try savePNG(primary1024, to: imagesDir.appendingPathComponent("icon.png"))
try savePNG(splash2048, to: imagesDir.appendingPathComponent("splash-icon.png"))
try savePNG(primary1024, to: imagesDir.appendingPathComponent("favicon.png"))
try savePNG(adaptiveForeground, to: imagesDir.appendingPathComponent("android-icon-foreground.png"))
try savePNG(adaptiveBackground, to: imagesDir.appendingPathComponent("android-icon-background.png"))
try savePNG(monochrome, to: imagesDir.appendingPathComponent("android-icon-monochrome.png"))

print("Generated Super Goode icon assets from \(sourceURL.lastPathComponent)")
