package com.documentconverter.service;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.itextpdf.kernel.pdf.EncryptionConstants;
import com.itextpdf.layout.element.Text;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.WriterProperties;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class DocumentConverterService {

    public byte[] convertDocxToPdf(MultipartFile docxFile, String password) throws IOException {
        try (XWPFDocument document = new XWPFDocument(docxFile.getInputStream());
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            WriterProperties writerProperties = password != null && !password.isEmpty() 
                ? createEncryptionProperties(password)
                : new WriterProperties();
            
            PdfWriter writer = new PdfWriter(baos, writerProperties);
            PdfDocument pdfDocument = new PdfDocument(writer);

            try (Document pdfDoc = new Document(pdfDocument)) {
                document.getParagraphs().forEach(para -> {
                    Paragraph paragraph = new Paragraph(para.getText());
                    pdfDoc.add(paragraph);
                });
            }

            return baos.toByteArray();
        }
    }

    private WriterProperties createEncryptionProperties(String password) {
        return new WriterProperties()
            .setStandardEncryption(
                password.getBytes(),
                null,
                EncryptionConstants.ALLOW_PRINTING,
                EncryptionConstants.ENCRYPTION_AES_256
            );
    }
}