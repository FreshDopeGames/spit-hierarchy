

## Plan: Update Privacy Policy & Terms of Use for UGC and PII Protections

### Changes to Privacy Policy (`src/pages/PrivacyPolicy.tsx`)

**Add new section "User-Generated Content & Personal Information"** (after section 3, before Data Security):
- Advise users strongly against sharing PII (real name, age, sex, location, phone number, SSN, state ID, etc.) in journal entries or any UGC
- State that the platform reserves the right to remove UGC containing PII without prior notice
- Note that publicly visible UGC may be indexed by search engines

**Add new section "Assumption of Risk"** (after the UGC section):
- Users acknowledge they voluntarily share information at their own risk
- Fresh Dope Biz LLC is not liable for any harm (online or offline) resulting from users sharing PII through UGC

Renumber subsequent sections accordingly. Update "Last updated" to March 2025.

### Changes to Terms of Use (`src/pages/TermsOfUse.tsx`)

**Add new section "User-Generated Content"** (after section 5 Content Guidelines):
- Define UGC scope (journal entries, comments, votes, profile content)
- Explicitly warn against sharing PII with a detailed list of examples
- State platform's right to remove PII-containing content without notice
- Users grant the platform a license to display, moderate, and remove their UGC

**Add new section "Assumption of Risk & Liability Waiver"** (after UGC section):
- Broad liability waiver: Fresh Dope Biz LLC not responsible for any harm (online or offline) including identity theft, harassment, stalking, financial loss, or any other consequence from sharing PII
- Users assume full responsibility for information they voluntarily disclose
- Platform provided "as-is" and not designed to be abused

**Add new section "Prohibited Uses"** (after liability section):
- Platform not intended for sharing sensitive personal data
- Not designed for use as a communication tool for illegal activity
- Any abuse of the service is grounds for termination

Renumber subsequent sections accordingly. Update "Last updated" to March 2025.

### Sections affected (renumbering)
- **Privacy Policy**: Insert 2 new sections → sections 4-10 become 6-12
- **Terms of Use**: Insert 3 new sections → sections 6-11 become 9-14

