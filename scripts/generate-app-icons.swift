import AppKit

struct Palette {
  static let base = NSColor(calibratedRed: 0.07, green: 0.03, blue: 0.13, alpha: 1.0)
  static let plum = NSColor(calibratedRed: 0.15, green: 0.05, blue: 0.26, alpha: 1.0)
  static let purple = NSColor(calibratedRed: 0.43, green: 0.15, blue: 0.83, alpha: 1.0)
  static let neonPurple = NSColor(calibratedRed: 0.72, green: 0.42, blue: 0.98, alpha: 1.0)
  static let gold = NSColor(calibratedRed: 0.98, green: 0.78, blue: 0.18, alpha: 1.0)
  static let goldDeep = NSColor(calibratedRed: 0.91, green: 0.58, blue: 0.06, alpha: 1.0)
  static let lilac = NSColor(calibratedRed: 0.86, green: 0.80, blue: 0.95, alpha: 1.0)
  static let white = NSColor(calibratedWhite: 1.0, alpha: 1.0)
}

let fileManager = FileManager.default
let cwd = URL(fileURLWithPath: fileManager.currentDirectoryPath)
let imagesDir = cwd.appendingPathComponent("assets/images", isDirectory: true)
let outputDir = imagesDir.appendingPathComponent("app-icon", isDirectory: true)

try fileManager.createDirectory(at: outputDir, withIntermediateDirectories: true)

guard let avatarArt = NSImage(contentsOf: imagesDir.appendingPathComponent("branding/super-goode-long.png")) else {
  fputs("Missing branding/super-goode-long.png\n", stderr)
  exit(1)
}

func circlePath(_ rect: CGRect) -> NSBezierPath {
  NSBezierPath(ovalIn: rect)
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

func withShadow(color: NSColor, blur: CGFloat, x: CGFloat = 0, y: CGFloat = 0, draw: () -> Void) {
  NSGraphicsContext.saveGraphicsState()
  let shadow = NSShadow()
  shadow.shadowColor = color
  shadow.shadowBlurRadius = blur
  shadow.shadowOffset = NSSize(width: x, height: y)
  shadow.set()
  draw()
  NSGraphicsContext.restoreGraphicsState()
}

func drawLinearGradient(_ colors: [NSColor], in rect: CGRect, angle: CGFloat) {
  NSGradient(colors: colors)?.draw(in: NSBezierPath(rect: rect), angle: angle)
}

func drawCircleGradient(_ colors: [NSColor], in rect: CGRect, relativeCenter: NSPoint = NSPoint(x: 0, y: 0)) {
  NSGradient(colors: colors)?.draw(in: circlePath(rect), relativeCenterPosition: relativeCenter)
}

func avatarCropRect(for image: NSImage) -> CGRect {
  CGRect(x: 0, y: 52, width: 420, height: 420)
}

func drawAvatar(in rect: CGRect, source: NSImage) {
  source.draw(
    in: rect,
    from: avatarCropRect(for: source),
    operation: .sourceOver,
    fraction: 1,
    respectFlipped: false,
    hints: [.interpolation: NSImageInterpolation.high]
  )
}

func drawGloss(in rect: CGRect, alpha: CGFloat = 0.18) {
  let glossRect = CGRect(x: rect.minX + rect.width * 0.14, y: rect.midY + rect.height * 0.12, width: rect.width * 0.72, height: rect.height * 0.28)
  NSGraphicsContext.saveGraphicsState()
  circlePath(glossRect).addClip()
  let colors = [
    Palette.white.withAlphaComponent(alpha),
    Palette.white.withAlphaComponent(0.02),
  ]
  drawLinearGradient(colors, in: glossRect, angle: -90)
  NSGraphicsContext.restoreGraphicsState()
}

func drawSparkStar(center: CGPoint, radius: CGFloat, color: NSColor, alpha: CGFloat = 1.0) {
  let longRect = CGRect(x: center.x - radius * 0.16, y: center.y - radius, width: radius * 0.32, height: radius * 2)
  let wideRect = CGRect(x: center.x - radius, y: center.y - radius * 0.16, width: radius * 2, height: radius * 0.32)
  withShadow(color: color.withAlphaComponent(0.45 * alpha), blur: radius * 0.45) {
    color.withAlphaComponent(alpha).setFill()
    NSBezierPath(roundedRect: longRect, xRadius: radius * 0.2, yRadius: radius * 0.2).fill()
    NSBezierPath(roundedRect: wideRect, xRadius: radius * 0.2, yRadius: radius * 0.2).fill()
  }
}

func centeredParagraph() -> NSMutableParagraphStyle {
  let style = NSMutableParagraphStyle()
  style.alignment = .center
  return style
}

func drawSGMonogram(in rect: CGRect, color: NSColor) {
  let attributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: rect.height * 0.34, weight: .black),
    .foregroundColor: color,
    .paragraphStyle: centeredParagraph(),
    .kern: -2.0,
  ]
  let text = NSString(string: "SG")
  let size = text.size(withAttributes: attributes)
  let drawRect = CGRect(
    x: rect.midX - size.width / 2,
    y: rect.midY - size.height / 2 - rect.height * 0.03,
    width: size.width,
    height: size.height
  )
  withShadow(color: Palette.gold.withAlphaComponent(0.38), blur: rect.width * 0.04) {
    text.draw(in: drawRect, withAttributes: attributes)
  }
}

func drawPinMark(in rect: CGRect, color: NSColor) {
  let path = NSBezierPath()
  let top = CGPoint(x: rect.midX, y: rect.maxY - rect.height * 0.1)
  let left = CGPoint(x: rect.minX + rect.width * 0.2, y: rect.midY + rect.height * 0.1)
  let right = CGPoint(x: rect.maxX - rect.width * 0.2, y: rect.midY + rect.height * 0.1)
  let bottom = CGPoint(x: rect.midX, y: rect.minY + rect.height * 0.06)
  path.move(to: top)
  path.curve(to: left, controlPoint1: CGPoint(x: rect.minX + rect.width * 0.35, y: rect.maxY), controlPoint2: CGPoint(x: rect.minX + rect.width * 0.08, y: rect.maxY - rect.height * 0.12))
  path.curve(to: bottom, controlPoint1: CGPoint(x: rect.minX + rect.width * 0.2, y: rect.midY - rect.height * 0.06), controlPoint2: CGPoint(x: rect.midX - rect.width * 0.12, y: rect.minY + rect.height * 0.12))
  path.curve(to: right, controlPoint1: CGPoint(x: rect.midX + rect.width * 0.12, y: rect.minY + rect.height * 0.12), controlPoint2: CGPoint(x: rect.maxX - rect.width * 0.2, y: rect.midY - rect.height * 0.06))
  path.curve(to: top, controlPoint1: CGPoint(x: rect.maxX - rect.width * 0.08, y: rect.maxY - rect.height * 0.12), controlPoint2: CGPoint(x: rect.maxX - rect.width * 0.35, y: rect.maxY))
  path.close()

  withShadow(color: color.withAlphaComponent(0.4), blur: rect.width * 0.05) {
    color.setFill()
    path.fill()
  }

  Palette.base.setFill()
  circlePath(CGRect(x: rect.midX - rect.width * 0.18, y: rect.midY - rect.width * 0.18, width: rect.width * 0.36, height: rect.width * 0.36)).fill()
}

func makeImage(size: CGFloat, transparent: Bool = false, _ draw: () -> Void) -> NSImage {
  let image = NSImage(size: NSSize(width: size, height: size))
  image.lockFocus()
  if !transparent {
    NSColor.clear.setFill()
    NSBezierPath(rect: CGRect(x: 0, y: 0, width: size, height: size)).fill()
  }
  draw()
  image.unlockFocus()
  return image
}

func drawPrimaryIcon(size: CGFloat, transparentBackground: Bool = false) -> NSImage {
  let canvas = CGRect(x: 0, y: 0, width: size, height: size)

  return makeImage(size: size, transparent: transparentBackground) {
    if !transparentBackground {
      drawCircleGradient([Palette.base, Palette.plum], in: canvas.insetBy(dx: size * -0.06, dy: size * -0.06), relativeCenter: NSPoint(x: -0.18, y: 0.28))
      withShadow(color: Palette.neonPurple.withAlphaComponent(0.35), blur: size * 0.08) {
        let glowRect = CGRect(x: size * 0.16, y: size * 0.16, width: size * 0.68, height: size * 0.68)
        drawCircleGradient([Palette.neonPurple.withAlphaComponent(0.28), Palette.neonPurple.withAlphaComponent(0.02)], in: glowRect)
      }
    }

    let outerRect = CGRect(x: size * 0.14, y: size * 0.14, width: size * 0.72, height: size * 0.72)
    let goldHaloRect = outerRect.insetBy(dx: size * 0.014, dy: size * 0.014)
    let ringRect = outerRect.insetBy(dx: size * 0.026, dy: size * 0.026)
    let avatarRect = ringRect.insetBy(dx: size * 0.032, dy: size * 0.032)

    withShadow(color: Palette.base.withAlphaComponent(0.55), blur: size * 0.055, y: size * -0.01) {
      drawCircleGradient([Palette.purple, Palette.plum], in: outerRect, relativeCenter: NSPoint(x: -0.2, y: 0.2))
    }

    Palette.gold.withAlphaComponent(0.52).setStroke()
    let goldStroke = circlePath(goldHaloRect)
    goldStroke.lineWidth = size * 0.012
    goldStroke.stroke()

    Palette.neonPurple.withAlphaComponent(0.95).setStroke()
    let outerStroke = circlePath(outerRect.insetBy(dx: size * 0.01, dy: size * 0.01))
    outerStroke.lineWidth = size * 0.012
    outerStroke.stroke()

    drawCircleGradient([Palette.neonPurple, Palette.purple], in: ringRect, relativeCenter: NSPoint(x: -0.25, y: 0.25))
    Palette.white.withAlphaComponent(0.2).setStroke()
    let ringStroke = circlePath(ringRect.insetBy(dx: size * 0.01, dy: size * 0.01))
    ringStroke.lineWidth = size * 0.004
    ringStroke.stroke()

    NSGraphicsContext.saveGraphicsState()
    circlePath(avatarRect).addClip()
    drawAvatar(in: avatarRect, source: avatarArt)
    NSGraphicsContext.restoreGraphicsState()

    drawGloss(in: outerRect, alpha: 0.14)

    drawSparkStar(center: CGPoint(x: size * 0.26, y: size * 0.77), radius: size * 0.022, color: Palette.white, alpha: 0.95)
    drawSparkStar(center: CGPoint(x: size * 0.73, y: size * 0.28), radius: size * 0.018, color: Palette.gold, alpha: 0.9)
  }
}

func drawMonogramIcon(size: CGFloat) -> NSImage {
  let canvas = CGRect(x: 0, y: 0, width: size, height: size)
  return makeImage(size: size) {
    drawCircleGradient([Palette.base, Palette.plum], in: canvas.insetBy(dx: size * -0.08, dy: size * -0.08), relativeCenter: NSPoint(x: -0.22, y: 0.24))
    let medallion = CGRect(x: size * 0.14, y: size * 0.14, width: size * 0.72, height: size * 0.72)
    withShadow(color: Palette.neonPurple.withAlphaComponent(0.32), blur: size * 0.06) {
      drawCircleGradient([Palette.purple, Palette.plum], in: medallion, relativeCenter: NSPoint(x: -0.18, y: 0.24))
    }
    Palette.neonPurple.withAlphaComponent(0.9).setStroke()
    let stroke = circlePath(medallion.insetBy(dx: size * 0.01, dy: size * 0.01))
    stroke.lineWidth = size * 0.013
    stroke.stroke()

    drawSGMonogram(in: medallion.insetBy(dx: size * 0.12, dy: size * 0.12), color: Palette.gold)
    drawSparkStar(center: CGPoint(x: size * 0.27, y: size * 0.73), radius: size * 0.02, color: Palette.white, alpha: 0.8)
  }
}

func drawPinIcon(size: CGFloat) -> NSImage {
  let canvas = CGRect(x: 0, y: 0, width: size, height: size)
  return makeImage(size: size) {
    drawCircleGradient([Palette.base, Palette.plum], in: canvas.insetBy(dx: size * -0.08, dy: size * -0.08), relativeCenter: NSPoint(x: -0.22, y: 0.24))
    let medallion = CGRect(x: size * 0.14, y: size * 0.14, width: size * 0.72, height: size * 0.72)
    withShadow(color: Palette.neonPurple.withAlphaComponent(0.32), blur: size * 0.06) {
      drawCircleGradient([Palette.purple, Palette.plum], in: medallion, relativeCenter: NSPoint(x: -0.18, y: 0.24))
    }
    Palette.neonPurple.withAlphaComponent(0.9).setStroke()
    let stroke = circlePath(medallion.insetBy(dx: size * 0.01, dy: size * 0.01))
    stroke.lineWidth = size * 0.013
    stroke.stroke()

    drawPinMark(in: medallion.insetBy(dx: size * 0.17, dy: size * 0.15), color: Palette.gold)
    drawSparkStar(center: CGPoint(x: size * 0.72, y: size * 0.76), radius: size * 0.026, color: Palette.white, alpha: 0.85)
  }
}

func drawAndroidBackground(size: CGFloat) -> NSImage {
  let canvas = CGRect(x: 0, y: 0, width: size, height: size)
  return makeImage(size: size) {
    drawCircleGradient([Palette.base, Palette.plum], in: canvas.insetBy(dx: size * -0.12, dy: size * -0.12), relativeCenter: NSPoint(x: -0.18, y: 0.25))
    let inner = CGRect(x: size * 0.12, y: size * 0.12, width: size * 0.76, height: size * 0.76)
    drawCircleGradient([Palette.neonPurple.withAlphaComponent(0.12), Palette.neonPurple.withAlphaComponent(0.01)], in: inner)
  }
}

func drawAndroidMonochrome(size: CGFloat) -> NSImage {
  let canvas = CGRect(x: 0, y: 0, width: size, height: size)
  return makeImage(size: size, transparent: true) {
    let medallion = canvas.insetBy(dx: size * 0.16, dy: size * 0.16)
    Palette.white.setFill()
    circlePath(medallion).fill()

    let head = CGRect(x: size * 0.39, y: size * 0.49, width: size * 0.22, height: size * 0.22)
    Palette.base.setFill()
    circlePath(head).fill()

    let shoulders = NSBezierPath(roundedRect: CGRect(x: size * 0.28, y: size * 0.24, width: size * 0.44, height: size * 0.26), xRadius: size * 0.13, yRadius: size * 0.13)
    shoulders.fill()

    let cutout = NSBezierPath(ovalIn: CGRect(x: size * 0.37, y: size * 0.16, width: size * 0.26, height: size * 0.18))
    NSGraphicsContext.saveGraphicsState()
    cutout.setClip()
    NSColor.clear.setFill()
    NSBezierPath(rect: canvas).fill()
    NSGraphicsContext.restoreGraphicsState()
  }
}

let primary1024 = drawPrimaryIcon(size: 1024)
let primary180 = drawPrimaryIcon(size: 180)
let adaptiveForeground = drawPrimaryIcon(size: 1024, transparentBackground: true)
let adaptiveBackground = drawAndroidBackground(size: 1024)
let monochrome = drawAndroidMonochrome(size: 1024)
let altSG1024 = drawMonogramIcon(size: 1024)
let altPin1024 = drawPinIcon(size: 1024)

try savePNG(primary1024, to: outputDir.appendingPathComponent("super-goode-app-icon-primary-1024.png"))
try savePNG(primary180, to: outputDir.appendingPathComponent("super-goode-app-icon-primary-180.png"))
try savePNG(altSG1024, to: outputDir.appendingPathComponent("super-goode-app-icon-alt-sg-1024.png"))
try savePNG(altPin1024, to: outputDir.appendingPathComponent("super-goode-app-icon-alt-pin-1024.png"))
try savePNG(adaptiveForeground, to: outputDir.appendingPathComponent("super-goode-app-icon-android-foreground-1024.png"))
try savePNG(adaptiveBackground, to: outputDir.appendingPathComponent("super-goode-app-icon-android-background-1024.png"))
try savePNG(monochrome, to: outputDir.appendingPathComponent("super-goode-app-icon-android-monochrome-1024.png"))

try savePNG(primary1024, to: imagesDir.appendingPathComponent("icon.png"))
try savePNG(primary1024, to: imagesDir.appendingPathComponent("splash-icon.png"))
try savePNG(primary1024, to: imagesDir.appendingPathComponent("favicon.png"))
try savePNG(adaptiveForeground, to: imagesDir.appendingPathComponent("android-icon-foreground.png"))
try savePNG(adaptiveBackground, to: imagesDir.appendingPathComponent("android-icon-background.png"))
try savePNG(monochrome, to: imagesDir.appendingPathComponent("android-icon-monochrome.png"))

print("Generated Super Goode app icon package in \(outputDir.path)")
