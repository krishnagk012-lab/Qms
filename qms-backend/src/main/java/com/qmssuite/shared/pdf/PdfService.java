package com.qmssuite.shared.pdf;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Slf4j
@Service
public class PdfService {

    private static final DeviceRgb NAVY   = new DeviceRgb(13,  27,  62);
    private static final DeviceRgb TEAL   = new DeviceRgb( 8, 145, 178);
    private static final DeviceRgb LIGHT  = new DeviceRgb(240, 244, 250);
    private static final DeviceRgb BORDER = new DeviceRgb(226, 232, 240);
    private static final DeviceRgb MUTED  = new DeviceRgb(100, 116, 139);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    /** Generic document — takes a title + ordered key-value sections */
    public byte[] generateDocument(String docType, String docRef, String orgName,
                                   Map<String, Map<String, String>> sections,
                                   String footer) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf  = new PdfDocument(writer);
            Document doc     = new Document(pdf, PageSize.A4);
            doc.setMargins(40, 50, 50, 50);

            PdfFont bold   = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normal = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont mono   = PdfFontFactory.createFont(StandardFonts.COURIER);

            // ── Header bar ────────────────────────────────────────────────
            Table header = new Table(UnitValue.createPercentArray(new float[]{70, 30}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBackgroundColor(NAVY)
                .setBorder(Border.NO_BORDER);

            Cell left = new Cell().setBorder(Border.NO_BORDER)
                .setPadding(14)
                .add(new Paragraph(orgName != null ? orgName : "Laboratory")
                    .setFont(bold).setFontSize(13).setFontColor(ColorConstants.WHITE))
                .add(new Paragraph(docType)
                    .setFont(normal).setFontSize(9)
                    .setFontColor(new DeviceRgb(148, 163, 184)));

            Cell right = new Cell().setBorder(Border.NO_BORDER)
                .setPadding(14).setTextAlignment(TextAlignment.RIGHT)
                .add(new Paragraph("QMS Suite")
                    .setFont(bold).setFontSize(10)
                    .setFontColor(new DeviceRgb(0, 188, 212)))
                .add(new Paragraph("ISO 17025 : 2017")
                    .setFont(normal).setFontSize(8)
                    .setFontColor(new DeviceRgb(148, 163, 184)));

            header.addCell(left);
            header.addCell(right);
            doc.add(header);

            // ── Document title + ref ──────────────────────────────────────
            doc.add(new Paragraph("\n"));
            Table titleRow = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(Border.NO_BORDER);

            titleRow.addCell(new Cell().setBorder(Border.NO_BORDER)
                .add(new Paragraph(docType)
                    .setFont(bold).setFontSize(18).setFontColor(NAVY)));
            titleRow.addCell(new Cell().setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT)
                .add(new Paragraph(docRef)
                    .setFont(mono).setFontSize(11).setFontColor(TEAL))
                .add(new Paragraph("Printed: " + LocalDate.now().format(FMT))
                    .setFont(normal).setFontSize(9).setFontColor(MUTED)));
            doc.add(titleRow);

            // Teal divider
            doc.add(new Paragraph()
                .setBorderBottom(new SolidBorder(TEAL, 2))
                .setMarginBottom(16));

            // ── Sections ─────────────────────────────────────────────────
            for (Map.Entry<String, Map<String, String>> section : sections.entrySet()) {
                // Section heading
                doc.add(new Paragraph(section.getKey().toUpperCase())
                    .setFont(bold).setFontSize(8).setFontColor(MUTED)
                    .setCharacterSpacing(0.8f)
                    .setMarginBottom(6).setMarginTop(12));

                // Key-value table
                Table tbl = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBorder(new SolidBorder(BORDER, 0.5f))
                    .setBackgroundColor(LIGHT)
                    .setBorderRadius(new com.itextpdf.layout.properties.BorderRadius(6));

                boolean first = true;
                for (Map.Entry<String, String> kv : section.getValue().entrySet()) {
                    if (kv.getValue() == null || kv.getValue().isBlank()) continue;

                    Cell kCell = new Cell().setPadding(8)
                        .setBorderBottom(new SolidBorder(BORDER, 0.5f))
                        .setBorderRight(new SolidBorder(BORDER, 0.5f))
                        .setBorderLeft(Border.NO_BORDER)
                        .setBorderTop(first ? Border.NO_BORDER : new SolidBorder(BORDER, 0.5f))
                        .add(new Paragraph(kv.getKey())
                            .setFont(bold).setFontSize(9).setFontColor(MUTED));

                    Cell vCell = new Cell().setPadding(8)
                        .setBorderBottom(new SolidBorder(BORDER, 0.5f))
                        .setBorderRight(Border.NO_BORDER)
                        .setBorderLeft(Border.NO_BORDER)
                        .setBorderTop(first ? Border.NO_BORDER : new SolidBorder(BORDER, 0.5f))
                        .add(new Paragraph(kv.getValue())
                            .setFont(normal).setFontSize(10).setFontColor(NAVY));

                    tbl.addCell(kCell);
                    tbl.addCell(vCell);
                    first = false;
                }
                doc.add(tbl);
            }

            // ── Footer ───────────────────────────────────────────────────
            if (footer != null && !footer.isBlank()) {
                doc.add(new Paragraph("\n"));
                doc.add(new Paragraph(footer)
                    .setFont(normal).setFontSize(8).setFontColor(MUTED)
                    .setBorderTop(new SolidBorder(BORDER, 0.5f))
                    .setPaddingTop(10)
                    .setTextAlignment(TextAlignment.CENTER));
            }

            // ── Signature block (for certificates) ───────────────────────
            if (docType.contains("Certificate") || docType.contains("certificate")) {
                doc.add(new Paragraph("\n\n"));
                Table sig = new Table(UnitValue.createPercentArray(new float[]{1,1,1}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBorder(Border.NO_BORDER);

                for (String label : new String[]{"Prepared by", "Checked by", "Authorised by"}) {
                    sig.addCell(new Cell().setBorder(Border.NO_BORDER)
                        .setPaddingTop(32)
                        .setBorderTop(new SolidBorder(NAVY, 1))
                        .setMarginRight(16)
                        .add(new Paragraph(label)
                            .setFont(bold).setFontSize(9).setFontColor(MUTED)));
                }
                doc.add(sig);
            }

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("PDF generation failed", e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }
}
