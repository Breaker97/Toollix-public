import { 
    ServicePrincipalCredentials, 
    PDFServices, 
    CreatePDFJob, 
    CreatePDFResult,
    SDKError,
    ServiceUsageError,
    ClientConfig,
    CloudAsset
} from "@adobe/pdfservices-node-sdk";
import { Readable } from "stream";

/**
 * Creates a PDF from a Word document using Adobe Acrobat Services API.
 * This preserves exact layout, fonts, and images.
 */
export async function createPdfFromWordWithAdobe(
    buffer: Buffer | null, 
    credentials: { clientId: string; clientSecret: string; organizationId?: string },
    preUploadedAssetId?: string,
    mimeType: string = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
): Promise<Buffer> {
    try {
        const sdkCredentials = new ServicePrincipalCredentials({
            clientId: credentials.clientId,
            clientSecret: credentials.clientSecret
        });

        const clientConfig = new ClientConfig({
            timeout: 180000 
        });

        const pdfServices = new PDFServices({ 
            credentials: sdkCredentials,
            clientConfig 
        });

        let inputAsset;

        if (preUploadedAssetId) {
            inputAsset = new CloudAsset(preUploadedAssetId);
        } else if (buffer) {
            const readStream = Readable.from(buffer);
            inputAsset = await pdfServices.upload({
                readStream,
                mimeType
            });
        } else {
            throw new Error("Either buffer or preUploadedAssetId must be provided.");
        }

        const job = new CreatePDFJob({ 
            inputAsset
        });

        const pollingUrl = await pdfServices.submit({ job });
        
        const pdfServicesResponse = await pdfServices.getJobResult({
            pollingURL: pollingUrl,
            resultType: CreatePDFResult
        });

        const result = pdfServicesResponse.result as CreatePDFResult;
        const asset = result.asset;

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
