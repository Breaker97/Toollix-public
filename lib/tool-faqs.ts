import { FAQItem } from "@/components/faq-section";

export const TOOL_FAQS: Record<string, FAQItem[]> = {
  "/tools/merge-pdf": [
    {
      question: "How do I merge multiple PDFs into one on Toollix?",
      answer: "Simply upload your PDF files, drag and drop them into your preferred order, and click 'Merge'. You can then download the combined file instantly.",
      isHowTo: true,
      steps: [
        "Upload all the PDF documents you want to combine.",
        "Arrange the files in the specific order you need.",
        "Click 'Merge' and download your new single PDF file."
      ]
    },
    {
      question: "Is there a limit to how many PDFs I can merge?",
      answer: "No, Toollix allows you to merge dozens of files at once. However, for the best performance on mobile devices, we recommend merging fewer than 50 files at a time."
    },
    {
      question: "Will my merged document lose its formatting or links?",
      answer: "No. Our industrial-grade PDF engine preserves all hyperlinks, table of contents, and high-resolution formatting during the merge process."
    },
    {
      question: "Is it safe to upload sensitive documents for merging?",
      answer: "Yes. Toollix uses secure SSL encryption. Your documents are processed privately and are never stored on our servers permanently."
    },
    {
      question: "Can I use the PDF merger on my phone?",
      answer: "Absolutely. Toollix is fully optimized for mobile browsers, allowing you to merge documents on-the-go without installing any apps."
    }
  ],
  "/tools/remove-background": [
    {
      question: "Does the Background Remover reduce the quality of my image?",
      answer: "No. Toollix is designed to maintain the original resolution of your image while accurately removing the background for a clean, professional finish.",
      isHowTo: true,
      steps: [
        "Upload your image (JPG, PNG, or WebP).",
        "Wait a few seconds for our AI to isolate the subject.",
        "Download your high-resolution image with a transparent background."
      ]
    },
    {
      question: "Can I create a professional passport photo from a regular selfie?",
      answer: "Absolutely. Once you've removed the background, you can use our <a href='/tools/passport-photo' class='text-primary hover:underline'>Passport Photo Creator</a> to align it to official standards."
    },
    {
      question: "Is my image data kept private?",
      answer: "Yes. We use client-side acceleration and secure processing. Your original images and the processed results are deleted as soon as you close your session."
    },
    {
      question: "What image formats are supported?",
      answer: "We support all common image formats, including JPG, PNG, WebP, and even high-resolution smartphone photos."
    },
    {
      question: "Does this work for complex backgrounds like hair or trees?",
      answer: "Our advanced AI model is specifically trained to handle complex edges like hair, fur, and intricate objects for a near-perfect cutout every time."
    }
  ],
  "/tools/json-formatter": [
    {
      question: "Does Toollix store my JSON data during formatting?",
      answer: "Never. All developer tools on Toollix, including the JSON Formatter, run client-side. Your data stays in your browser and never touches our database.",
      isHowTo: true,
      steps: [
        "Paste your raw or minified JSON into the editor.",
        "The tool instantly beautifies and validates your syntax.",
        "Copy the clean code or convert it to TypeScript interfaces."
      ]
    },
    {
      question: "Can I convert complex JSON into TypeScript interfaces?",
      answer: "Yes. Simply paste your JSON object, and then use our <a href='/tools/json-to-typescript' class='text-primary hover:underline'>JSON to TypeScript</a> tool to instantly generate clean, ready-to-use interfaces."
    },
    {
      question: "How does the JSON validator handle syntax errors?",
      answer: "The validator highlights specific line numbers and provides clear error messages, helping you find missing commas or unclosed brackets instantly."
    },
    {
      question: "Is there a size limit for the JSON data?",
      answer: "Toollix can handle large JSON files up to 10MB directly in your browser without any performance lag."
    },
    {
      question: "Can I use this tool offline?",
      answer: "Once the page is loaded, the JSON Formatter works entirely offline as all processing happens locally on your machine."
    }
  ],
  "/tools/pdf-to-booklet": [
    {
      question: "How do I create a print-ready booklet from a PDF?",
      answer: "Our tool automates the 'Imposition' process. It rearranges your pages so that when printed double-sided and folded, they appear in the correct numerical order.",
      isHowTo: true,
      steps: [
        "Upload your multi-page PDF document.",
        "Choose your sheet format (A4 or Letter).",
        "Click 'Re-arrange' and download the booklet-ready PDF."
      ]
    },
    {
      question: "What is 'Saddle Stitch' printing?",
      answer: "Saddle stitch is the most common booklet binding method where sheets are folded and stapled through the center crease. Our tool arranges pages specifically for this method."
    },
    {
      question: "Does this tool work for legal documents or zines?",
      answer: "Yes! It is perfect for zines, programs, scripts, and legal booklets. Once you have your PDF, you can also use <a href='/tools/sign-pdf' class='text-primary hover:underline'>Sign PDF</a> if you need to add signatures."
    },
    {
      question: "Is my PDF data secure during the booklet creation?",
      answer: "Completely. The imposition engine runs entirely in your browser using SSL-encrypted workers. Your document content is never uploaded to our servers."
    },
    {
      question: "Can I print the output on a standard home printer?",
      answer: "Yes. Simply print the downloaded file using your printer's 'Double-Sided' (flip on short edge) setting for a perfect booklet result."
    }
  ],
  "/tools/utm-builder": [
    {
      question: "What is a UTM link and why do I need one?",
      answer: "UTM (Urchin Tracking Module) codes are snippets added to the end of a URL to track the effectiveness of marketing campaigns. They allow you to see exactly where your traffic is coming from in tools like Google Analytics.",
      isHowTo: true,
      steps: [
        "Paste your destination URL into the 'Target URL' field.",
        "Fill in your campaign parameters (Source, Medium, Name).",
        "Copy the generated link and use it in your marketing materials."
      ]
    },
    {
      question: "Which UTM parameters are mandatory?",
      answer: "Technically, only the 'Campaign Source' is required for basic tracking, but it is highly recommended to also use 'Medium' and 'Campaign Name' for meaningful data analysis."
    },
    {
      question: "Does Toollix store the links I generate?",
      answer: "Never. Our UTM Link Architect runs entirely in your browser. Your marketing data and URLs stay private and never touch our servers."
    },
    {
      question: "Can I use UTM links for social media bios?",
      answer: "Yes! UTM links are perfect for Instagram, TikTok, and LinkedIn bios. Once you've generated your link, you can also use our <a href='/tools/whatsapp-no-save' class='text-primary hover:underline'>WhatsApp Link Maker</a> if you need to combine tracking with direct messaging."
    },
    {
      question: "Will my UTM link work with any analytics tool?",
      answer: "Yes. Toollix follows the industry-standard UTM protocol, making our links compatible with Google Analytics 4 (GA4), Mixpanel, Adobe Analytics, and all other major platforms."
    }
  ]
};

export function getFaqsForTool(href: string, toolName: string): FAQItem[] {
  if (TOOL_FAQS[href]) {
    return TOOL_FAQS[href];
  }

  // Generate generic "Magic 5" FAQs for tools without specific ones
  return [
    {
      question: `What is the ${toolName} on Toollix?`,
      answer: `Toollix's ${toolName} is a professional-grade utility designed to provide fast, high-quality results directly in your browser. It's part of our industrial-strength tool suite.`
    },
    {
      question: `How do I use the ${toolName}?`,
      answer: `The process is direct and efficient: upload your file or input your data, configure your settings, and get your result instantly.`,
      isHowTo: true,
      steps: [
        "Input your data or upload your source file.",
        "Adjust the professional settings to your requirements.",
        "Download or copy your high-quality output."
      ]
    },
    {
      question: "Is my data secure while using this tool?",
      answer: "Yes. We use industry-standard SSL encryption and process all data privately. Most of our tools run entirely client-side, meaning your data never leaves your device."
    },
    {
      question: "Are there any file size or usage limits?",
      answer: "Toollix provides high limits for free users. Once you're done, you can explore our other <a href='/' class='text-primary hover:underline'>50+ professional tools</a> to complete your workflow."
    },
    {
      question: "Does this tool work on mobile devices?",
      answer: `Absolutely. Like all Toollix utilities, the ${toolName} is fully responsive and optimized for both iOS and Android browsers, as well as desktop environments.`
    }
  ];
}
