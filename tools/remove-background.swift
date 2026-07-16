import CoreImage
import Foundation
import ImageIO
import Vision

guard CommandLine.arguments.count == 3 else {
    fputs("Usage: swift tools/remove-background.swift input.png output.png\n", stderr)
    exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])

guard
    let source = CGImageSourceCreateWithURL(inputURL as CFURL, nil),
    let image = CGImageSourceCreateImageAtIndex(source, 0, nil)
else {
    fputs("Could not read input image.\n", stderr)
    exit(1)
}

do {
    // ponytail: Native Vision avoids another segmentation dependency.
    let handler = VNImageRequestHandler(cgImage: image)
    let request = VNGenerateForegroundInstanceMaskRequest()
    try handler.perform([request])

    guard let result = request.results?.first else {
        throw NSError(domain: "RemoveBackground", code: 1, userInfo: [NSLocalizedDescriptionKey: "No foreground found."])
    }

    let maskBuffer = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)
    let foreground = CIImage(cgImage: image)
    let mask = CIImage(cvPixelBuffer: maskBuffer)
    let transparent = CIImage(color: .clear).cropped(to: foreground.extent)
    let cutout = foreground.applyingFilter("CIBlendWithMask", parameters: [
        kCIInputBackgroundImageKey: transparent,
        kCIInputMaskImageKey: mask,
    ])

    let context = CIContext()
    let colorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
    try context.writePNGRepresentation(of: cutout, to: outputURL, format: .RGBA8, colorSpace: colorSpace)
} catch {
    fputs("Background removal failed: \(error.localizedDescription)\n", stderr)
    exit(1)
}
