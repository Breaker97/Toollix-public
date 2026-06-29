import { 
    ServicePrincipalCredentials, 
    PDFServices, 
    MimeType, 
    ExportPDFJob, 
    ExportPDFResult,
    SDKError,
    ServiceUsageError,
    ClientConfig,
    ExportPDFParams,
    ExportPDFTargetFormat,
    CloudAsset
} from "@adobe/pdfservices-node-sdk";
import { Readable } from "stream";

/**
 * Exports a PDF to DOCX using Adobe Acrobat Services API.
 * This provides industry-leading export that preserves layout, images, and formatting.
 */
export async function exportPdfToWordWithAdobe(
    buffer: Buffer | null, 
    credentials: { clientId: string; clientSecret: string; organizationId?: string },
    preUploadedAssetId?: string
): Promise<Buffer> {
    try {
        // 1. Setup credentials
        const sdkCredentials = new ServicePrincipalCredentials({
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret
        });

        // 2. Setup Client Config with 3-minute timeout for large files
        const clientConfig = new ClientConfig({
            timeout: 180000 
        });

        // 3. Create PDF Services instance
        const pdfServices = new PDFServices({ 
            credentials: sdkCredentials,
            clientConfig 
        });

        let inputAsset;

        if (preUploadedAssetId) {
            inputAsset = new CloudAsset(preUploadedAssetId);
        } else if (buffer) {
            // 4. Upload the source buffer (standard path)
            const readStream = Readable.from(buffer);
            inputAsset = await pdfServices.upload({
                readStream,
                mimeType: MimeType.PDF
            });
        } else {
            throw new Error("Either buffer or preUploadedAssetId must be provided.");
        }

        // 5. Setup Export parameters (DOCX)
        const params = new ExportPDFParams({
            targetFormat: ExportPDFTargetFormat.DOCX
        });

        // 6. Create and submit the job
        const job = new ExportPDFJob({ 
            inputAsset,
            params
        });

        const pollingUrl = await pdfServices.submit({ job });
        
        // 7. Poll for completion and get result
        const pdfServicesResponse = await pdfServices.getJobResult({
            pollingURL: pollingUrl,
            resultType: ExportPDFResult
        });

        const result = pdfServicesResponse.result as ExportPDFResult;
        const asset = result.asset;

        // 9. Download result stream and convert to Buffer
        const streamAsset = await pdfServices.getContent({ asset });
        const stream = streamAsset.readStream;
        const chunks: any[] = [];
        
        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        return Buffer.concat(chunks);

    } catch (err) {
        if (err instanceof ServiceUsageError) {
            console.error("Adobe API Quota Exceeded:", err.message);
            throw new Error("Adobe API quota exceeded or unauthorized.");
        }
        if (err instanceof SDKError) {
            console.error("Adobe SDK Error:", err.message);
            throw new Error(`Adobe processing failed: ${err.message}`);
        }
        console.error("Unknown Adobe Integration Error:", err);
        throw err;
    }
}
