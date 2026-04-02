// @ts-ignore
import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF document');
  }
}

export async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse Word document');
  }
}
