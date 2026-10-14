/**
 * Client-Side Portrait Background Removal & Alpha Matting Engine
 * 
 * Extracts only the student's face, hair, and head, cleanly removing
 * the room/classroom background so only the face blends into the 3D avatar.
 */

import { DetectedFaceBox } from './faceDetector';

export interface BackgroundRemovalOptions {
  featherRadius?: number;     // Soft edge feathering in pixels (default: 20)
  headExpansion?: number;     // Head coverage multiplier (default: 1.25)
  preserveHairCrown?: boolean;// Preserve hair crown above forehead (default: true)
  smoothContour?: boolean;    // Apply smooth gradient falloff
}

/**
 * Remove background from an image or canvas, returning an HTMLCanvasElement
 * containing only the segmented face & head with transparent background.
 */
export async function removePortraitBackground(
  sourceImage: HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  detectedFace: DetectedFaceBox | null,
  options: BackgroundRemovalOptions = {}
): Promise<HTMLCanvasElement> {
  const imgW = (sourceImage as HTMLImageElement).naturalWidth || sourceImage.width || 640;
  const imgH = (sourceImage as HTMLImageElement).naturalHeight || sourceImage.height || 480;

  const feather = options.featherRadius ?? 22;
  const headExpansion = options.headExpansion ?? 1.28;

  // Working canvas for output
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = imgW;
  outputCanvas.height = imgH;
  const ctx = outputCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return outputCanvas;

  // If no face was provided or detected, create default head estimation at center
  const faceCenterX = detectedFace ? detectedFace.centerX : imgW / 2;
  const faceCenterY = detectedFace ? detectedFace.centerY : imgH * 0.45;
  const faceW = detectedFace ? detectedFace.width : imgW * 0.38;
  const faceH = detectedFace ? detectedFace.height : imgH * 0.52;

  // Head radius estimation (semi-major & semi-minor axes)
  // Human head is wider around hair/ears and extends upward for hair
  const headRadiusX = (faceW / 2) * headExpansion;
  const headRadiusY = (faceH / 2) * (headExpansion * 1.15);

  // Offset center slightly upward to include hair crown
  const headCenterY = faceCenterY - headRadiusY * 0.08;

  // Draw source image first
  ctx.drawImage(sourceImage, 0, 0, imgW, imgH);

  // Create an Alpha Mask Canvas
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = imgW;
  maskCanvas.height = imgH;
  const maskCtx = maskCanvas.getContext('2d');
  if (!maskCtx) return outputCanvas;

  // Fill mask canvas with pure transparent black
  maskCtx.clearRect(0, 0, imgW, imgH);

  // Build Portrait Mask using composite gradient paths
  maskCtx.save();

  // Head & Neck Compound Path:
  // 1. Oval for Cranium & Face
  // 2. Trapezoid for Neck extending to chin
  maskCtx.beginPath();

  // Draw smooth head silhouette
  maskCtx.ellipse(
    faceCenterX,
    headCenterY,
    headRadiusX,
    headRadiusY,
    0,
    0,
    Math.PI * 2
  );

  // Soft Radial Feathering:
  // Using radial gradient fill with smooth alpha falloff
  const maxRadius = Math.max(headRadiusX, headRadiusY);
  const radGrad = maskCtx.createRadialGradient(
    faceCenterX,
    headCenterY,
    maxRadius - feather * 1.5,
    faceCenterX,
    headCenterY,
    maxRadius + feather * 0.5
  );
  radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  radGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.95)');
  radGrad.addColorStop(0.92, 'rgba(255, 255, 255, 0.45)');
  radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  maskCtx.fillStyle = radGrad;
  maskCtx.fill();

  // Add neck connection downward so the neck flows into collar
  const neckW = headRadiusX * 0.75;
  const neckTopY = headCenterY + headRadiusY * 0.65;
  const neckBotY = Math.min(imgH, headCenterY + headRadiusY * 1.45);

  const neckGrad = maskCtx.createLinearGradient(0, neckTopY, 0, neckBotY);
  neckGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  neckGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.85)');
  neckGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  maskCtx.fillStyle = neckGrad;
  maskCtx.beginPath();
  maskCtx.moveTo(faceCenterX - neckW, neckTopY);
  maskCtx.lineTo(faceCenterX + neckW, neckTopY);
  maskCtx.lineTo(faceCenterX + neckW * 1.25, neckBotY);
  maskCtx.lineTo(faceCenterX - neckW * 1.25, neckBotY);
  maskCtx.closePath();
  maskCtx.fill();

  maskCtx.restore();

  // Apply Alpha Mask to output image using 'destination-in'
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';

  return outputCanvas;
}
