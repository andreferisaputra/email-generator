/**
 * EMAIL RENDERER
 *
 * Responsibility: Assemble complete HTML email document
 * - Receives: EmailDocument
 * - Returns: Complete HTML email string
 * - Does NOT: Generate block HTML (delegates to renderBlock), know about specific block types
 */

import type { EmailDocument } from "../types.js";
import { renderBlock } from "./renderBlock.js";

/**
 * Render complete HTML email from EmailDocument
 *
 * Generates a fully-formed HTML email with:
 * - DOCTYPE and basic HTML structure
 * - Email-safe inline styles in head
 * - Header section (logo/company info)
 * - Body blocks (rendered by block renderer)
 * - Help section (contact information)
 * - Compliance section (legal notice)
 * - Footer section (company info, social links)
 *
 * @param email - The EmailDocument to render
 * @returns Complete HTML email string
 */
export function renderEmail(email: EmailDocument): string {
  // Render all body blocks
  const bodyBlocksHtml = email.body.blocks
    .map((block) => renderBlock(block))
    .join("\n");

  // Build help section HTML
  let helpSectionHtml = "";
  if (email.helpSection) {
    const contactItemsHtml = (email.helpSection.contactItems || [])
      .map((item) => {
        // Map icon URL based on contact type
        let iconUrl = "";
        if (item.type === "email") {
          iconUrl = "https://nobi.id/icons/icon-mail.png";
        } else if (item.type === "phone" || item.type === "whatsapp") {
          iconUrl = "https://nobi.id/icons/icon-phone.png";
        }

        return `
                                        <table cellpadding="0" cellspacing="0" role="presentation"
                                            style="margin-bottom: 8px;">
                                            <tr>
                                                <td style="padding-right: 8px;" valign="middle">
                                                    <img src="${iconUrl}" height="20"
                                                        width="20" style="display: block;" alt="${item.label}" />
                                                </td>
                                                <td valign="middle">
                                                    <a href="${item.href}"
                                                        style="color: #008867; font-size: 14px; text-decoration: none;">
                                                        ${item.value}
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>`;
      })
      .join("\n");

    helpSectionHtml = `
                    <tr>
                        <td style="padding: 40px; background-color: #f6f6f6;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <!-- Kolom Teks -->
                                    <td class="stack-column" valign="top" style="padding-right: 20px; width: 60%;">
                                        <h3
                                            style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 16px;">
                                            ${
                                              email.helpSection.title ||
                                              "Butuh Bantuan untuk Mulai?"
                                            }
                                        </h3>
                                        <p
                                            style="line-height: 1.5; margin-top: 12px; color: #444; margin-bottom: 16px;">
                                            ${
                                              email.helpSection.description ||
                                              ""
                                            }
                                        </p>
                                        ${contactItemsHtml}
                                    </td>

                                    <!-- Kolom Gambar -->
                                    <td class="stack-column" style="width: 40%; text-align: right;" valign="middle">
                                        <img src="${
                                          email.helpSection.imageUrl || ""
                                        }" alt="${
      email.helpSection.title || "Help"
    }"
                                            width="150" style="border-radius: 5px; height: 150px; width: auto;" />
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>`;
  }

  // Build footer social links HTML (table-based icons)
  let socialLinksHtml = "";
  if (email.footer.socialLinks && email.footer.socialLinks.length > 0) {
    const socialIconsHtml = email.footer.socialLinks
      .map((link, index) => {
        // Map icon URL based on platform
        let iconUrl = "";
        if (link.platform === "instagram") {
          iconUrl =
            "https://cdn.tools.unlayer.com/social/icons/circle-black/instagram.png";
        } else if (link.platform === "twitter") {
          iconUrl =
            "https://cdn.tools.unlayer.com/social/icons/circle-black/twitter.png";
        } else if (link.platform === "linkedin") {
          iconUrl =
            "https://cdn.tools.unlayer.com/social/icons/circle-black/linkedin.png";
        } else if (link.platform === "facebook") {
          iconUrl =
            "https://cdn.tools.unlayer.com/social/icons/circle-black/facebook.png";
        } else if (link.platform === "email") {
          iconUrl =
            "https://cdn.tools.unlayer.com/social/icons/circle-black/email.png";
        } else if (link.platform === "whatsapp") {
          iconUrl =
            "https://cdn.tools.unlayer.com/social/icons/circle-black/whatsapp.png";
        }

        // Last item has margin-right: 0px, others have 5px
        const isLast = index === email.footer.socialLinks!.length - 1;
        const marginRight = isLast ? "0px" : "5px";

        return `
                                                    <table role="presentation" border="0" cellspacing="0"
                                                        cellpadding="0" width="32" height="32"
                                                        style="width:32px!important;height:32px!important;display:inline-block;border-collapse:collapse;table-layout:fixed;border-spacing:0;vertical-align:top;margin-right:${marginRight}">
                                                        <tbody>
                                                            <tr style="vertical-align:top">
                                                                <td valign="middle"
                                                                    style="word-break:break-word;border-collapse:collapse!important;vertical-align:top">
                                                                    <a href="${link.url}" title="${link.platform}"
                                                                        target="_blank">
                                                                        <img src="${iconUrl}" 
                                                                            alt="${link.platform}" title="${link.platform}" width="32"
                                                                            style="outline:none;text-decoration:none;clear:both;display:block!important;border:none;height:auto;float:none;max-width:32px!important"
                                                                            class="CToWUd" data-bit="iit">
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>`;
      })
      .join("\n");
    socialLinksHtml = socialIconsHtml;
  }

  // Build compliance section HTML
  const complianceText = email.complianceSection.text || "";
  const sandboxNumber = email.complianceSection.sandboxNumber
    ? `<strong>${email.complianceSection.sandboxNumber}</strong>`
    : "";

  // HTML email structure with email-safe styling
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${email.templateType}</title>
  <style type="text/css">
    /* Reset styles for better email client compatibility */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
    }
    table {
      border-collapse: collapse;
    }
    img {
      display: block;
      outline: none;
      border: none;
      text-decoration: none;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc;">
  <!-- Outer container -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8fafc">
    <!-- HEADER SECTION -->
    <tr>
        <td align="center">
            <span style="display:inline-block; margin:20px 0;">
                ${
                email.header.logoUrl
                    ? `<img src="${
                        email.header.logoUrl
                    }" alt="Logo" style="height: ${
                        email.header.logoHeight || 32
                    }px; max-width: 100%;" />`
                    : '<h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #1a1a1a;">Email</h1>'
                }
            </span>
        </td>
    </tr>

    <tr>
      <td align="center">
        <!-- Main email container (max 600px width) -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="max-width: 100%;">
          <!-- BODY BLOCKS SECTION -->
          <tr>
            <td style="padding: 20px;">
              ${bodyBlocksHtml}
            </td>
          </tr>

          <!-- HELP SECTION (if provided) -->
          ${helpSectionHtml}

          <!-- COMPLIANCE SECTION -->
          <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #e4f4f0;">
            <tr>
              <td align="center" style="padding: 0;">
                <table width="100%" cellpadding="12" cellspacing="0"
                  style="max-width: 600px; background-color: #e4f4f0; border-radius: 0;">
                  <tr>
                    <td align="center"
                        style="font-family: Arial, sans-serif; color: #006950; font-size: 15px; line-height: 1.5;">
                        <strong>PT Dana Kripto Indonesia</strong><br />
                        sebagai peserta sandbox OJK dengan nomor surat
                        <strong>${sandboxNumber}</strong>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- FOOTER SECTION -->
          <tr>
            <td style="
              padding: 30px 40px 20px 40px;
              background-color: #006950;
              color: white;
              font-size: 14px;
            " class="responsive-padding-x">
              ${
                email.footer.logoUrl
                  ? `<img src="${email.footer.logoUrl}" height="20"
                  style="margin-bottom: 8px" />`
                  : ""
              }
              <p style="margin: 4px 0; font-weight: 700;">${
                email.footer.companyName || "PT. Company Indonesia"
              }</p>
              ${
                email.footer.address
                  ? `<p style="margin: 4px 0">${email.footer.address}</p>`
                  : ""
              }
              <table style="font-family:'Open Sans',sans-serif" role="presentation" cellpadding="0"
                cellspacing="0" width="100%" border="0">
                <tbody>
                  <tr>
                    <td style="word-break:break-word;padding-top:10px;font-family:'Open Sans',sans-serif"
                      align="left">

                      <div align="left" style="direction:ltr">
                        <div style="display:table;max-width:${
                          email.footer.socialLinks &&
                          email.footer.socialLinks.length > 0
                            ? email.footer.socialLinks.length * 37 + "px"
                            : "0"
                        }">
                          ${socialLinksHtml}
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return html.trim();
}
