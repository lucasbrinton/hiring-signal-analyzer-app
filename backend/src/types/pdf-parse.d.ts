declare module "pdf-parse" {
  interface PDFInfo {
    PDFFormatVersion?: string;
    IsAcroFormPresent?: boolean;
    IsXFAPresent?: boolean;
    Title?: string;
    Author?: string;
    Subject?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
  }

  interface PDFMetadata {
    _metadata?: Record<string, unknown>;
  }

  interface PDFData {
    /** Number of pages in the PDF */
    numpages: number;
    /** Number of rendered pages */
    numrender: number;
    /** PDF info object */
    info: PDFInfo;
    /** PDF metadata */
    metadata: PDFMetadata | null;
    /** PDF version */
    version: string;
    /** Extracted text content */
    text: string;
  }

  interface PDFOptions {
    /** Maximum number of pages to parse (default: 0 = all) */
    max?: number;
    /** Page number to start parsing from (default: 1) */
    pagerender?: (pageData: unknown) => string;
    /** Custom version */
    version?: string;
  }

  function pdf(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;

  export = pdf;
}
