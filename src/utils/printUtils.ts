import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Detects if the current document is running inside an iframe (e.g., AI Studio preview sandbox)
 */
export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

export interface ExportPdfOptions {
  filename?: string;
  orientation?: 'p' | 'portrait' | 'l' | 'landscape';
  format?: string | [number, number];
  scale?: number;
}

// Helper to safely convert any modern CSS color (oklch, color-mix, oklab, etc.) into standard sRGB/rgba
const sanitizeColor = (colorStr: string, canvasCtx: CanvasRenderingContext2D | null): string => {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'inherit' || colorStr === 'initial' || colorStr === 'currentColor') {
    return colorStr;
  }
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(colorStr)) return colorStr;
  if (/^rgb\(/i.test(colorStr)) return colorStr;

  if (canvasCtx) {
    try {
      canvasCtx.fillStyle = '#000000';
      canvasCtx.fillStyle = colorStr;
      return canvasCtx.fillStyle;
    } catch {
      // Fallback
    }
  }
  return colorStr;
};

/**
 * Exports an HTML element as a clean, high-resolution PDF document (A4 format).
 * Powered by html2canvas-pro with native OKLCH / modern CSS support and jsPDF.
 * Works reliably in sandboxed iframes, mobile devices, and desktop browsers.
 */
export const exportElementToPdf = async (
  elementIdOrElement: string | HTMLElement,
  options: ExportPdfOptions = {}
): Promise<boolean> => {
  const element = typeof elementIdOrElement === 'string' 
    ? document.getElementById(elementIdOrElement)
    : elementIdOrElement;

  if (!element) {
    console.error(`exportElementToPdf: Element not found: ${elementIdOrElement}`);
    return false;
  }

  const {
    filename = 'document-scolaire.pdf',
    orientation = 'portrait',
    scale = 2
  } = options;

  try {
    const h2c = typeof html2canvas === 'function' ? html2canvas : (html2canvas as any).default || html2canvas;

    // Generate canvas with high pixel ratio for razor-sharp text
    const canvas = await h2c(element, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth || 1200,
      windowHeight: element.scrollHeight || 1600,
      onclone: (clonedDoc: Document) => {
        // 1. Hide print-hidden and action buttons in cloned tree
        const printHiddenElements = clonedDoc.querySelectorAll(
          '.print\\:hidden, [data-print-hide], [data-html2canvas-ignore="true"], .no-print'
        );
        printHiddenElements.forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });

        // 2. Reveal official Senegalese print headers marked for print only
        const printOnlyElements = clonedDoc.querySelectorAll(
          '.hidden.print\\:block, [data-print-only="true"]'
        );
        printOnlyElements.forEach((el) => {
          (el as HTMLElement).style.display = 'block';
        });

        // 3. Ensure SVG elements retain exact rendered width/height (essential for Recharts charts)
        const origSvgs = (element as HTMLElement).querySelectorAll('svg');
        const clonedSvgs = clonedDoc.querySelectorAll('svg');
        origSvgs.forEach((origSvg, idx) => {
          const clonedSvg = clonedSvgs[idx];
          if (clonedSvg) {
            const bbox = origSvg.getBoundingClientRect();
            if (bbox.width > 0 && bbox.height > 0) {
              clonedSvg.setAttribute('width', `${Math.round(bbox.width)}`);
              clonedSvg.setAttribute('height', `${Math.round(bbox.height)}`);
            }
          }
        });

        // 4. Color normalization safeguard: Convert any problematic CSS color functions
        // (oklch, color-mix, lab) into browser-computed rgba strings via a 2D canvas context
        try {
          const tempCanvas = clonedDoc.createElement('canvas');
          const ctx = tempCanvas.getContext('2d');
          const styledNodes = clonedDoc.querySelectorAll('*');
          styledNodes.forEach((node) => {
            const el = node as HTMLElement;
            if (!el.style) return;
            const cs = window.getComputedStyle(el);
            if (!cs) return;

            // Normalize color properties if containing non-standard color functions
            if (cs.color && (cs.color.includes('oklch') || cs.color.includes('color-mix') || cs.color.includes('lab'))) {
              el.style.color = sanitizeColor(cs.color, ctx);
            }
            if (cs.backgroundColor && (cs.backgroundColor.includes('oklch') || cs.backgroundColor.includes('color-mix') || cs.backgroundColor.includes('lab'))) {
              el.style.backgroundColor = sanitizeColor(cs.backgroundColor, ctx);
            }
            if (cs.borderColor && (cs.borderColor.includes('oklch') || cs.borderColor.includes('color-mix') || cs.borderColor.includes('lab'))) {
              el.style.borderColor = sanitizeColor(cs.borderColor, ctx);
            }
          });
        } catch (colorSanitizeErr) {
          console.warn('Non-fatal color sanitize warning:', colorSanitizeErr);
        }

        // 5. Ensure cloned target element has clean display, white background, and no transform
        const clonedEl = typeof elementIdOrElement === 'string'
          ? clonedDoc.getElementById(elementIdOrElement)
          : null;
        if (clonedEl) {
          clonedEl.style.transform = 'none';
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.margin = '0';
          clonedEl.style.padding = '20px';
          clonedEl.style.backgroundColor = '#ffffff';
        }
      }
    });

    const isLandscape = orientation === 'landscape' || orientation === 'l';
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = isLandscape ? 297 : 210;
    const pageHeight = isLandscape ? 210 : 297;
    const margin = 8; // 8mm margin
    const contentWidth = pageWidth - (margin * 2);
    
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // Handle single or multi-page PDF output
    let heightLeft = imgHeight;
    let position = margin;
    const pageContentHeight = pageHeight - (margin * 2);

    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageContentHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageContentHeight;
    }

    // Trigger instant download
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to export element to PDF:', error);
    return false;
  }
};

/**
 * Triggers standard browser print with fallback guidance if running inside
 * an iframe where browser security policy blocks window.print().
 */
export const triggerPrint = (fallbackNoticeCallback?: (reason: string) => void): boolean => {
  if (isInIframe()) {
    // Some browsers strictly block window.print() inside sandboxed iframes
    try {
      window.print();
      return true;
    } catch (e) {
      console.warn('window.print() restricted in sandbox:', e);
      if (fallbackNoticeCallback) {
        fallbackNoticeCallback('iframe_restricted');
      }
      return false;
    }
  }

  try {
    window.print();
    return true;
  } catch (e) {
    console.error('window.print() error:', e);
    if (fallbackNoticeCallback) {
      fallbackNoticeCallback('error');
    }
    return false;
  }
};
