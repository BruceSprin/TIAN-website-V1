import { LegalLayout, LegalBlock } from "@/components/legal/LegalLayout";
import { BRAND } from "@/data/site";

export default function Privacy() {
  return (
    <LegalLayout title="PRIVACY POLICY" updated="Last updated: January 2026">
      <LegalBlock
        heading="Overview"
        body={`${BRAND.name} respects your privacy. This policy explains what information is collected when you visit this site or get in touch, how it is used, and the choices you have. Only what is needed to respond to enquiries and improve the work is collected.`}
      />
      <LegalBlock
        heading="Information We Collect"
        body="When you submit a project enquiry the details you provide are collected, such as your name, email, company and a description of your project. Basic, anonymous analytics about how the site is used may also be collected, such as pages visited and general location, to help maintain and improve the experience."
      />
      <LegalBlock
        heading="How We Use Information"
        body="The information you share is used to reply to your enquiry, scope potential work and keep a record of the correspondence. Your personal information is never sold. Aggregated, non-identifying analytics may be used to understand how the site performs."
      />
      <LegalBlock
        heading="Data Retention"
        body="Enquiry information is kept for as long as necessary to evaluate and pursue a potential engagement, and to meet legal and record-keeping obligations. You may ask for your information to be deleted at any time."
      />
      <LegalBlock
        heading="Your Choices"
        body="You can request access to, correction of, or deletion of the personal information you have shared. To make a request, use the details on the contact page and you will get a prompt response."
      />
      <LegalBlock
        heading="Contact"
        body="If you have questions about this policy or how your information is handled, please reach out through the contact page. Happy to clarify anything about how your data is treated."
      />
    </LegalLayout>
  );
}
