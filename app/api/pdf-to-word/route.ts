import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { rateLimit } from '@/lib/rate-limit';
import { exportPdfToWordWithAdobe } from '@/lib/pdf/adobe-export';
import dbConnect from '@/lib/mongoose';
import Settings from '@/models/Settings';

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "PDF to Word");
    if (!rateLimitCheck.success) {
      return NextResponse.json({ error: rateLimitCheck.message }, { status: 429 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (err) {
      return NextResponse.json({ error: 'Failed to read upload data. Please try again.' }, { status: 400 });
    }

    const file = formData.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'File not provided' }, { status: 400 });
    }
    
    // Convert Blob to Buffer
    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await dbConnect();
    const settings = await Settings.findOne({});

    let docBuffer: Buffer;

    // Check if Adobe credentials exist for high-fidelity export
    if (settings?.adobeClientId && settings?.adobeClientSecret) {
      console.log("Using Adobe PDF Services for high-fidelity PDF to Word export...");
      docBuffer = await exportPdfToWordWithAdobe(buffer, {
        clientId: settings.adobeClientId,
        clientSecret: settings.adobeClientSecret,
        organizationId: settings.adobeOrganizationId
      });
    } else {
      console.log("Adobe credentials not found. Falling back to basic text extraction.");
      // Extract text from PDF
      const pdfData = await pdf(buffer);
      const rawText = pdfData.text;

      // Create a simple DOCX document with extracted text
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: rawText
              .split('\n')
              .filter((line) => line.trim().length > 0)
              .map(
                (line) =>
                  new Paragraph({
                    children: [new TextRun({ text: line })],
                  })
              ),
          },
        ],
      });

      docBuffer = await Packer.toBuffer(doc);
    }

    // Return the generated DOCX file
    return new NextResponse(docBuffer as any, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${(file as File).name.replace(/\.pdf$/i, '.docx')}"`,
      },
    });
  } catch (err: any) {
    console.error('PDF to Word conversion error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
