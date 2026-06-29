import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createPdfFromWordWithAdobe } from '@/lib/pdf/adobe-create';
import dbConnect from '@/lib/mongoose';
import Settings from '@/models/Settings';

export async function POST(req: NextRequest) {
  try {
    const rateLimitCheck = await rateLimit(req, "Word to PDF");
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
    
    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await dbConnect();
    const settings = await Settings.findOne({});

    if (!settings?.adobeClientId || !settings?.adobeClientSecret) {
      return NextResponse.json(
        { error: "High-fidelity Word to PDF conversion requires Adobe PDF Services. Please configure your API keys in the Admin Dashboard." },
        { status: 501 }
      );
    }

    // Pass the correct mime type based on file extension
    let mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if ((file as File).name.toLowerCase().endsWith('.doc')) {
      mimeType = "application/msword";
    }

    const pdfBuffer = await createPdfFromWordWithAdobe(buffer, {
      clientId: settings.adobeClientId,
      clientSecret: settings.adobeClientSecret,
      organizationId: settings.adobeOrganizationId
    }, undefined, mimeType);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(file as File).name.replace(/\.docx?$/i, '.pdf')}"`,
      },
    });
  } catch (err: any) {
    console.error('Word to PDF conversion error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
