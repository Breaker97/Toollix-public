import { 
    ServicePrincipalCredentials, 
    PDFServices, 
    MimeType, 
    CompressPDFJob, 
    CompressPDFResult,
    SDKError,
    ServiceUsageError,
    ClientConfig,
    CompressPDFParams,
    CompressionLevel,
    CloudAsset
} from "@adobe/pdfservices-node-sdk";
import { Readable } from "stream";

/**
 * Creates an upload asset on Adobe's servers and returns the pre-signed 
 * upload URI and a unique Asset ID.
 */
export async function createAdobeUploadAsset(
    credentials: { clientId: string; clientSecret: string; organizationId?: string }
): Promise<{ uploadUri: string; assetId: string }> {
    try {
        // 1. Get Access Token manually via REST 
        // We use the standard Adobe IMS endpoint with the user's confirmed scopes
        const tokenParams = new URLSearchParams();
        tokenParams.append("client_id", credentials.clientId);
        tokenParams.append("client_secret", credentials.clientSecret);
        tokenParams.append("grant_type", "client_credentials");
        tokenParams.append("scope", "openid,AdobeID,DCAPI");

        const tokenRes = await fetch("https://ims-na1.adobelogin.com/ims/token/v2", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: tokenParams.toString()
        });

        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            throw new Error(`Adobe Token Auth Failed: ${err}`);
        }

        const { access_token } = await tokenRes.json();

        // 2. Request Upload Asset
        const assetRes = await fetch("https://pdf-services.adobe.io/assets", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "X-API-KEY": credentials.clientId,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ mediaType: MimeType.PDF })
        });

        if (!assetRes.ok) {
            const err = await assetRes.text();
            throw new Error(`Adobe Asset Creation Failed: ${err}`);
        }

        const data = await assetRes.json();
        return {
            uploadUri: data.uploadUri,
            assetId: data.assetID
        };

    } catch (error) {
        console.error("Adobe Asset Prep Error:", error);
        throw error;
    }
}

/**
 * Compresses a PDF using Adobe Acrobat Services API.
 * This provides industry-leading compression with maximum quality.
 */
export async function compressPdfWithAdobe(
    buffer: Buffer | null, 
    credentials: { clientId: string; clientSecret: string; organizationId?: string },
    level: "LOW" | "MEDIUM" | "HIGH" = "HIGH",
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
            // Fix: We use the formal CloudAsset class to ensure the SDK's internal 
            // serialization logic finds the asset ID correctly. This resolves
            // the 'INVALID_REQUEST_FORMAT' error.
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

        // 5. Map and set compression parameters
        let adobeLevel = CompressionLevel.MEDIUM;
        if (level === "HIGH") adobeLevel = CompressionLevel.HIGH;
        if (level === "LOW") adobeLevel = CompressionLevel.LOW;

        const params = new CompressPDFParams({
            compressionLevel: adobeLevel
        });

        // 6. Create and submit the job
        const job = new CompressPDFJob({ 
            inputAsset,
            params
        });

        const pollingUrl = await pdfServices.submit({ job });
        
        // 7. Poll for completion and get result (v4.x uses getJobResult with pollingURL)
        const pdfServicesResponse = await pdfServices.getJobResult({
            pollingURL: pollingUrl,
            resultType: CompressPDFResult
        });

        // 8. Extract the CloudAsset from the result object
        const result = pdfServicesResponse.result as CompressPDFResult;
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
