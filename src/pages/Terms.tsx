import { LegalLayout, LegalBlock } from "@/components/legal/LegalLayout";
import { BRAND } from "@/data/site";

export default function Terms() {
  return (
    <LegalLayout title="TERMS" updated="Last updated: January 2026">
      <LegalBlock
        heading="Agreement"
        body={`These terms govern your use of the ${BRAND.name} website. By browsing the site you agree to use it lawfully and respectfully. If you do not agree with these terms, please do not use the site.`}
      />
      <LegalBlock
        heading="Intellectual Property"
        body={`All content on this site, including writing, design, photography and project material, is created by ${BRAND.name} and is protected by copyright. The projects shown are original works produced by ${BRAND.name}. You may not reproduce, distribute or reuse this material without written permission.`}
      />
      <LegalBlock
        heading="Project Work"
        body={`Any engagement between ${BRAND.name} and a client is governed by a separate written agreement covering scope, ownership, timelines and fees. Nothing on this website constitutes a binding offer or a guarantee of specific results.`}
      />
      <LegalBlock
        heading="Use of the Site"
        body="You agree not to attempt to disrupt the site, access it through automated means without permission, or misuse any forms or contact channels. Content may be updated or removed at any time without notice."
      />
      <LegalBlock
        heading="Limitation of Liability"
        body={`The site is provided on an as-is basis. ${BRAND.name} is not liable for any loss arising from your use of the site or reliance on its content. Some jurisdictions do not allow certain limitations, so parts of this section may not apply to you.`}
      />
      <LegalBlock
        heading="Contact"
        body="Questions about these terms can be directed through the contact page. Happy to explain how the work is done and what to expect from an engagement."
      />
    </LegalLayout>
  );
}
