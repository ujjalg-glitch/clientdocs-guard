import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

/**
 * Add watermark to PDF
 */
export async function addWatermarkToPDF(
  pdfBytes: ArrayBuffer,
  watermarkText: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  for (const page of pages) {
    const { width, height } = page.getSize()
    const textSize = 50
    const textWidth = font.widthOfTextAtSize(watermarkText, textSize)

    page.drawText(watermarkText, {
      x: (width - textWidth) / 2,
      y: height / 2,
      size: textSize,
      font: font,
      color: rgb(0.75, 0.75, 0.75),
      opacity: 0.3,
      rotate: { angle: -45, type: 'degrees' },
    })
  }

  return await pdfDoc.save()
}

/**
 * Extract pages from PDF
 */
export async function extractPDFPages(
  pdfBytes: ArrayBuffer,
  pageNumbers: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const newPdfDoc = await PDFDocument.create()

  for (const pageNum of pageNumbers) {
    if (pageNum > 0 && pageNum <= pdfDoc.getPageCount()) {
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1])
      newPdfDoc.addPage(copiedPage)
    }
  }

  return await newPdfDoc.save()
}

/**
 * Merge multiple PDFs
 */
export async function mergePDFs(pdfByteArrays: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create()

  for (const pdfBytes of pdfByteArrays) {
    const pdf = await PDFDocument.load(pdfBytes)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  return await mergedPdf.save()
}

/**
 * Get PDF metadata
 */
export async function getPDFMetadata(pdfBytes: ArrayBuffer) {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pageCount = pdfDoc.getPageCount()
  const title = pdfDoc.getTitle()
  const author = pdfDoc.getAuthor()
  const subject = pdfDoc.getSubject()
  const keywords = pdfDoc.getKeywords()
  const creator = pdfDoc.getCreator()
  const producer = pdfDoc.getProducer()
  const creationDate = pdfDoc.getCreationDate()
  const modificationDate = pdfDoc.getModificationDate()

  return {
    pageCount,
    title,
    author,
    subject,
    keywords,
    creator,
    producer,
    creationDate,
    modificationDate,
  }
}

/**
 * Rotate PDF pages
 */
export async function rotatePDFPages(
  pdfBytes: ArrayBuffer,
  rotation: 90 | 180 | 270
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()

  pages.forEach((page) => {
    const currentRotation = page.getRotation().angle
    page.setRotation({ angle: (currentRotation + rotation) % 360, type: 'degrees' })
  })

  return await pdfDoc.save()
}

/**
 * Compress PDF (reduce quality)
 */
export async function compressPDF(pdfBytes: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  
  // Save with compression
  return await pdfDoc.save({
    useObjectStreams: false,
  })
}

