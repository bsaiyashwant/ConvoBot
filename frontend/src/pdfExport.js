import { jsPDF } from "jspdf";

/**
 * Generates a clean PDF of the chat conversation with ConvoBot branding.
 * @param {Array} messages - Array of { user, bot } message objects
 * @param {string} chatTitle - Title/name of the chat session
 */
export function downloadChatAsPDF(messages, chatTitle = "ConvoBot Chat") {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // ──────────────────────────────────────────
  // HEADER — ConvoBot branding
  // ──────────────────────────────────────────
  const drawHeader = () => {
    // Header background bar
    doc.setFillColor(15, 23, 42); // --bg-main
    doc.rect(0, 0, pageWidth, 28, "F");

    // Accent line
    doc.setFillColor(66, 133, 244); // --neon-blue
    doc.rect(0, 28, pageWidth, 1.2, "F");

    // ConvoBot title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("ConvoBot", margin, 17);

    // Subtitle / chat title
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // --text-sub
    doc.text(chatTitle, pageWidth - margin, 12, { align: "right" });

    // Date
    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(dateStr, pageWidth - margin, 18, { align: "right" });
  };

  // ──────────────────────────────────────────
  // FOOTER
  // ──────────────────────────────────────────
  const drawFooter = (pageNum, totalPages) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `ConvoBot — AI Study Assistant  |  Page ${pageNum}`,
      pageWidth / 2,
      pageHeight - 4,
      { align: "center" }
    );
  };

  // ──────────────────────────────────────────
  // TEXT WRAPPING UTILITY
  // ──────────────────────────────────────────
  const stripMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/#{1,6}\s/g, "")           // headings
      .replace(/\*\*(.+?)\*\*/g, "$1")    // bold
      .replace(/\*(.+?)\*/g, "$1")        // italic
      .replace(/__(.+?)__/g, "$1")        // underline
      .replace(/~~(.+?)~~/g, "$1")        // strikethrough
      .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, "")) // code
      .replace(/!\[.*?\]\(.*?\)/g, "[Image]")   // images
      .replace(/\[(.+?)\]\(.*?\)/g, "$1")       // links
      .replace(/^\s*[-*+]\s/gm, "• ")           // unordered lists
      .replace(/^\s*\d+\.\s/gm, (m) => m)       // ordered lists (keep)
      .replace(/^>\s?/gm, "")                    // blockquotes
      .replace(/---+/g, "")                      // horizontal rules
      .replace(/\n{3,}/g, "\n\n");               // excess newlines
  };

  const writeWrappedText = (text, x, startY, maxWidth, fontSize, lineHeight) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    let currentY = startY;

    for (let i = 0; i < lines.length; i++) {
      if (currentY > pageHeight - 18) {
        // Need a new page
        doc.addPage();
        drawHeader();
        currentY = 36;
      }
      doc.text(lines[i], x, currentY);
      currentY += lineHeight;
    }
    return currentY;
  };

  // ──────────────────────────────────────────
  // BUILD THE PDF
  // ──────────────────────────────────────────
  drawHeader();
  y = 36; // Start below header

  if (messages.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text("No messages in this conversation.", margin, y);
  } else {
    messages.forEach((msg, index) => {
      // Check if we need a new page before starting
      if (y > pageHeight - 30) {
        doc.addPage();
        drawHeader();
        y = 36;
      }

      // ── USER MESSAGE ──
      // Blue accent dot + "You" label
      doc.setFillColor(66, 133, 244);
      doc.circle(margin + 2, y - 1.5, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(66, 133, 244);
      doc.text("You", margin + 7, y);
      y += 5;

      // User text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      const userText = stripMarkdown(msg.user || "");
      y = writeWrappedText(userText, margin + 4, y, contentWidth - 4, 10, 5);
      y += 4;

      // ── BOT MESSAGE ──
      if (msg.bot && msg.bot !== "...") {
        // Check for new page
        if (y > pageHeight - 30) {
          doc.addPage();
          drawHeader();
          y = 36;
        }

        // Purple accent dot + "ConvoBot" label
        doc.setFillColor(168, 85, 247); // purple
        doc.circle(margin + 2, y - 1.5, 2, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(168, 85, 247);
        doc.text("ConvoBot", margin + 7, y);
        y += 5;

        // Bot text
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        const botText = stripMarkdown(msg.bot);
        y = writeWrappedText(botText, margin + 4, y, contentWidth - 4, 10, 5);
        y += 4;
      }

      // Divider between conversations
      if (index < messages.length - 1) {
        if (y > pageHeight - 18) {
          doc.addPage();
          drawHeader();
          y = 36;
        }
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
        y += 6;
      }
    });
  }

  // Draw footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(i, totalPages);
  }

  // ── DOWNLOAD ──
  const safeName = chatTitle.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");
  doc.save(`ConvoBot_${safeName || "Chat"}.pdf`);
}
