export interface LegalSection {
  id: string;
  title: string;
  content: string;
}

export interface LegalPage {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const LEGAL_CONTENT: Record<string, LegalPage> = {
  "privacy-policy": {
    title: "Privacy Policy",
    lastUpdated: "June 3, 2026",
    sections: [
      {
        id: "introduction",
        title: "1. Introduction & Scope",
        content: "At Toollix.io, accessible from https://www.toollix.io, user privacy is one of our core values. This Privacy Policy outlines the types of information we collect, how we use it, and the strict safety measures we take to protect your personal data when you interact with our suite of free online tools. By using our website, you hereby consent to our Privacy Policy and agree to its terms."
      },
      {
        id: "file-processing",
        title: "2. Ephemeral File Processing (Zero-Storage Policy)",
        content: "We take file privacy extremely seriously. When you use any tool on Toollix (such as signing PDFs, merging documents, compressing images, or formatting developer code), your files are processed in a highly secure, ephemeral environment. Files are loaded into short-lived system memory (RAM) only. We do not store, copy, analyze, or write your files to non-volatile storage (disk). Once your processing task is complete and you download the output (or close the browser session), the files are permanently and automatically purged from our ephemeral memory. We never view the contents of your files, and no human has access to them."
      },
      {
        id: "data-collection",
        title: "3. Information We Collect",
        content: "We collect minimal information to ensure security, prevent service abuse, and deliver a personalized experience: (a) Account Information: If you register for an account (e.g., Toollix Pro), we collect your name, email address, and billing credentials through our secure payment gateway providers. (b) Usage Statistics: We log details about user activity on our platform (like timestamps, selected tools, page views, and API calls) to optimize platform routing. (c) Technical Logs: We collect standard server logging details, including Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), referring/exit pages, and number of clicks. These logs do not contain any file contents and are used solely for threat detection, rate limiting, and spam prevention."
      },
      {
        id: "cookies-adsense",
        title: "4. Cookies, Google Analytics, and AdSense",
        content: "Toollix.io uses cookies to store visitor preferences, record user-specific information on which pages are accessed, and customize our web content. Third-party vendors, including Google, use cookies (such as the DART cookie) to serve ads based on a user's prior visits to our website and other sites on the internet. Users may opt out of personalized advertising by visiting the Google Ad Settings or through third-party consent banners. We also employ Google Analytics and PostHog to analyze traffic demographics and optimize user flows; these tools collect anonymous data, which is governed by their respective privacy policies."
      },
      {
        id: "data-protection-rights",
        title: "5. GDPR and CCPA Data Protection Rights",
        content: "We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following: (a) The right to access – You have the right to request copies of your personal data. (b) The right to rectification – You have the right to request that we correct any information you believe is inaccurate. (c) The right to erasure – You have the right to request that we erase your personal data under certain conditions. (d) The right to restrict processing – You have the right to request that we restrict the processing of your personal data. (e) The right to object to processing – You have the right to object to our processing of your personal data. If you make a request, we have one month to respond to you. Please contact our support team to exercise these rights."
      },
      {
        id: "security",
        title: "6. Data Security Measures",
        content: "We implement robust technical and organizational security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. All data transmitted to and from Toollix.io is encrypted in transit using industry-standard Secure Socket Layer (SSL/TLS) technology. While we strive to protect your data, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security."
      },
      {
        id: "children-privacy",
        title: "7. Children's Information",
        content: "Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. Toollix.io does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records."
      }
    ]
  },
  "terms-of-service": {
    title: "Terms of Service",
    lastUpdated: "June 3, 2026",
    sections: [
      {
        id: "acceptance",
        title: "1. Acceptance of Terms",
        content: "By accessing and using the website Toollix.io, you agree to comply with and be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law."
      },
      {
        id: "usage-license",
        title: "2. Use License & Restrictions",
        content: "Permission is granted to temporarily use the tools and services on Toollix.io for personal, non-commercial, or commercial file processing. Under this license, you may not: (a) Modify or copy the source code or proprietary materials of the tools. (b) Use the materials for any commercial redistribution, resale, or reverse-engineering. (c) Attempt to decompile, exploit, or bypass rate limiting mechanisms, including utilizing scrapers or automated bots to submit files to our servers. (d) Remove any copyright or other proprietary notations from the materials. This license shall automatically terminate if you violate any of these restrictions and may be terminated by Toollix.io at any time."
      },
      {
        id: "file-ownership",
        title: "3. Content & File Ownership",
        content: "Toollix.io does not claim any ownership rights over the files, text, images, or documents you upload or process through our services. You retain full copyright and ownership of all your uploaded content. You are solely responsible for the content of the files you process. You warrant that you have the necessary rights, licenses, and permissions to process these files, and that your use of our tools does not infringe upon any third-party intellectual property or privacy rights."
      },
      {
        id: "acceptable-use",
        title: "4. Acceptable Use Policy",
        content: "You agree not to use Toollix.io to upload or process any content that: (a) Is unlawful, defamatory, abusive, threatening, harmful, or invasive of another's privacy. (b) Contains malware, viruses, or any other code designed to interrupt, destroy, or limit the functionality of computer systems. (c) Infringes upon copyrights, patents, trademarks, trade secrets, or other proprietary rights. (d) Promotes hate speech, harassment, or illegal activities. Toollix.io reserves the right to block access or deny service to any user violating this policy."
      },
      {
        id: "disclaimers",
        title: "5. Disclaimer of Warranties",
        content: "The services and tools on Toollix.io are provided on an 'as is' and 'as available' basis. Toollix.io makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. Further, Toollix.io does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials."
      },
      {
        id: "limitations",
        title: "6. Limitations of Liability",
        content: "In no event shall Toollix.io or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the tools or services on Toollix.io, even if Toollix.io or an authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you."
      },
      {
        id: "governing-law",
        title: "7. Governing Law",
        content: "These terms and conditions are governed by and construed in accordance with the laws, without regard to its conflict of law provisions. You irrevocably submit to the exclusive jurisdiction of the courts in that State or location for any dispute arising under these Terms."
      }
    ]
  },
  "cookie-policy": {
    title: "Cookie Policy",
    lastUpdated: "June 3, 2026",
    sections: [
      {
        id: "what-are-cookies",
        title: "1. What Are Cookies?",
        content: "Cookies are small text files placed on your computer or mobile device by websites that you visit. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site. Cookies cannot extract any private information from your hard drive, transmit viruses, or run malicious code. You can find more information about cookies at www.allaboutcookies.org."
      },
      {
        id: "how-we-use",
        title: "2. How We Use Cookies",
        content: "Toollix.io uses cookies for several functional and analytical reasons: (a) Essential Cookies: These are strictly necessary to provide you with services available through our site, such as keeping you logged into your Pro account or remembering your user settings. (b) Analytical/Performance Cookies: These allow us to recognize and count the number of visitors and see how visitors move around our website. This helps us improve the user experience (e.g., ensuring users find what they are looking for easily). (c) Advertising Cookies: These are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring ads are properly displayed, and in some cases selecting advertisements that are based on your interests."
      },
      {
        id: "third-party-cookies",
        title: "3. Third-Party Cookies on Our Site",
        content: "In addition to our first-party cookies, you may also receive cookies from third parties: (a) Google AdSense: Google uses cookies to serve ads on Toollix.io. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and other sites on the Internet. (b) Google Analytics: We use Google Analytics cookies to compile anonymous, aggregated statistics about our site visitors. This data includes the region of visitors, browser types, and pages visited, allowing us to gauge site performance. (c) PostHog: We use PostHog cookies to monitor interface performance, analyze feature popularity, and perform user flow audits to streamline the layout."
      },
      {
        id: "managing-cookies",
        title: "4. Managing and Disabling Cookies",
        content: "You have the right to decide whether to accept or reject cookies. Most web browsers automatically accept cookies by default, but you can usually modify your browser setting to decline cookies if you prefer. However, please note that if you choose to decline cookies, some portions of our website (including account login and user preference persistence) may not function correctly. You can also clear cookies manually from your browser cache at any time."
      }
    ]
  }
};
