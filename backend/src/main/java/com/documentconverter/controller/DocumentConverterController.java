package com.documentconverter.controller;

import com.documentconverter.service.DocumentConverterService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DocumentConverterController {

    private final DocumentConverterService converterService;

    public DocumentConverterController(DocumentConverterService converterService) {
        this.converterService = converterService;
    }

    @PostMapping(value = "/convert", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> convertDocument(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "password", required = false) String password
    ) {
        try {
            byte[] pdfBytes = converterService.convertDocxToPdf(file, password);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("filename", file.getOriginalFilename().replace(".docx", ".pdf"));
            
            headers.add("X-File-Metadata", createFileMetadataJson(file));

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String createFileMetadataJson(MultipartFile file) {
        return String.format(
            "{\"fileName\":\"%s\",\"fileSize\":%d,\"uploadDate\":\"%s\"}",
            file.getOriginalFilename(),
            file.getSize(),
            LocalDateTime.now().toString()
        );
    }
}