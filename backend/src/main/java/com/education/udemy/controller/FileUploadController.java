//package com.education.udemy.controller;
//
//import lombok.AccessLevel;
//import lombok.experimental.FieldDefaults;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//import com.education.udemy.util.annotation.ApiMessage;
//
//import java.io.IOException;
//import java.nio.file.*;
//import java.util.Map;
//import java.util.UUID;
//
//@RestController
//@RequestMapping("/upload")
//@FieldDefaults(level = AccessLevel.PRIVATE)
//public class FileUploadController {
//
//    @Value("${upload.file.image-uri}")
//    String imageUri;
//
//    @Value("${upload.file.video-uri}")
//    String videoUri;
//
//    @PostMapping("/image")
//    @ApiMessage("Upload image success")
//    public ResponseEntity<Map<String, String>> uploadImage(
//            @RequestParam("file") MultipartFile file) throws IOException {
//
//        String contentType = file.getContentType();
//        if (contentType == null || !contentType.startsWith("image/")) {
//            throw new RuntimeException("File phải là ảnh (jpg, png, ...)");
//        }
//
//        String dirPath = imageUri.replace("file:///", "").replace("file://", "");
//        Path uploadPath = Paths.get(dirPath);
//        if (!Files.exists(uploadPath)) {
//            Files.createDirectories(uploadPath);
//        }
//
//        String ext = getExt(file.getOriginalFilename(), ".jpg");
//        String fileName = UUID.randomUUID() + ext;
//        Files.copy(file.getInputStream(), uploadPath.resolve(fileName),
//                StandardCopyOption.REPLACE_EXISTING);
//
//        return ResponseEntity.ok(Map.of("url", "/images/" + fileName));
//    }
//
//    @PostMapping("/video")
//    @ApiMessage("Upload video success")
//    public ResponseEntity<Map<String, String>> uploadVideo(
//            @RequestParam("file") MultipartFile file) throws IOException {
//
//        String contentType = file.getContentType();
//        if (contentType == null || !contentType.startsWith("video/")) {
//            throw new RuntimeException("File phải là video (mp4, ...)");
//        }
//
//        String dirPath = videoUri.replace("file:///", "").replace("file://", "");
//        Path uploadPath = Paths.get(dirPath);
//        if (!Files.exists(uploadPath)) {
//            Files.createDirectories(uploadPath);
//        }
//
//        String ext = getExt(file.getOriginalFilename(), ".mp4");
//        String fileName = UUID.randomUUID() + ext;
//        Files.copy(file.getInputStream(), uploadPath.resolve(fileName),
//                StandardCopyOption.REPLACE_EXISTING);
//
//        return ResponseEntity.ok(Map.of("url", "/videos/" + fileName));
//    }
//
//    private String getExt(String filename, String defaultExt) {
//        return (filename != null && filename.contains("."))
//                ? filename.substring(filename.lastIndexOf("."))
//                : defaultExt;
//    }
//}

package com.education.udemy.controller;

import com.education.udemy.util.annotation.ApiMessage;
import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.StringJoiner;
import java.util.TreeMap;

@RestController
@RequestMapping("/upload")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileUploadController {

    @Value("${cloudinary.cloud-name}")
    String cloudName;

    @Value("${cloudinary.api-key}")
    String apiKey;

    @Value("${cloudinary.api-secret}")
    String apiSecret;

    @GetMapping("/signature")
    @ApiMessage("Get upload signature success")
    public ResponseEntity<Map<String, Object>> getSignature(
            @RequestParam String folder,
            @RequestParam(defaultValue = "image") String resourceType
    ) throws Exception {

        long timestamp = System.currentTimeMillis() / 1000L;

        TreeMap<String, String> params = new TreeMap<>();
        params.put("folder", folder);
        params.put("timestamp", String.valueOf(timestamp));

        StringJoiner joiner = new StringJoiner("&");
        params.forEach((k, v) -> joiner.add(k + "=" + v));
        String toSign = joiner.toString() + apiSecret;

        String signature = sha1Hex(toSign);

        return ResponseEntity.ok(Map.of(
                "signature",    signature,
                "timestamp",    timestamp,
                "apiKey",       apiKey,
                "cloudName",    cloudName,
                "folder",       folder,
                "resourceType", resourceType
        ));
    }

    private String sha1Hex(String data) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-1");
        byte[] raw = md.digest(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : raw) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}