package com.education.udemy.controller;

import com.education.udemy.entity.Course;
import com.education.udemy.repository.CourseRepository;
import com.education.udemy.util.annotation.ApiMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ai")
@Slf4j
@RequiredArgsConstructor
public class AIChatController {

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    private final CourseRepository courseRepository;

    private static final String GEMINI_MODEL = "gemini-2.5-flash-lite";
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent";

    private static final int MAX_PER_CATEGORY = 5;

    @PostMapping("/chat")
    @ApiMessage("CALL API SUCCESS")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, Object> frontendBody) {
        try {
            List<Course> courses = courseRepository.findAll();
            String courseContext = buildCourseContext(courses);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> contents = (List<Map<String, Object>>) frontendBody.get("contents");

            if (contents != null && !contents.isEmpty()) {
                Map<String, Object> systemTurn = contents.get(0);
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> parts = (List<Map<String, Object>>) systemTurn.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    String originalPrompt = (String) parts.get(0).get("text");
                    parts.get(0).put("text", originalPrompt + "\n\n" + courseContext);
                }
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> generationConfig = (Map<String, Object>) frontendBody.get("generationConfig");

            Map<String, Object> geminiRequest = new HashMap<>();
            geminiRequest.put("contents", contents);
            if (generationConfig != null) geminiRequest.put("generationConfig", generationConfig);

            String url = GEMINI_URL + "?key=" + geminiApiKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(geminiRequest, headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> geminiResponse = restTemplate.postForEntity(url, request, Map.class);

            if (!geminiResponse.getStatusCode().is2xxSuccessful() || geminiResponse.getBody() == null) {
                throw new RuntimeException("Gemini API error");
            }

            return ResponseEntity.ok(Map.of("text", extractText(geminiResponse.getBody())));

        } catch (Exception e) {
            log.error("Gemini API error: ", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Trợ lý AI tạm thời không khả dụng. Vui lòng thử lại sau."));
        }
    }

    private String buildCourseContext(List<Course> courses) {
        if (courses.isEmpty()) return "";

        StringBuilder sb = new StringBuilder();
        sb.append("=== DANH SÁCH KHÓA HỌC HIỆN CÓ TRÊN NỀN TẢNG ===\n");
        sb.append("(Chỉ gợi ý tối đa 3 khóa phù hợp nhất. Ưu tiên khóa có [OUTSTANDING] khi cùng danh mục)\n\n");

        Map<String, List<Course>> byCategory = courses.stream()
                .collect(Collectors.groupingBy(c ->
                        c.getCategory() != null ? c.getCategory().getName() : "Khác"));

        byCategory.forEach((category, list) -> {
            List<Course> sorted = list.stream()
                    .sorted(Comparator.comparing(
                            c -> Boolean.TRUE.equals(c.getOutstanding()) ? 0 : 1
                    ))
                    .limit(MAX_PER_CATEGORY)
                    .collect(Collectors.toList());

            sb.append("📚 ").append(category).append(":\n");
            sorted.forEach(course -> {
                String price = course.getDiscountPrice() != null
                        ? course.getDiscountPrice() + "đ (giảm từ " + course.getPrice() + "đ)"
                        : course.getPrice() + "đ";

                sb.append("  - [ID:").append(course.getId()).append("]");
                if (Boolean.TRUE.equals(course.getOutstanding())) {
                    sb.append(" [OUTSTANDING]");
                }
                sb.append(" [THUMBNAIL:").append(course.getThumbnail()).append("]")
                        .append(" [PRICE:").append(course.getPrice()).append("]");
                if (course.getDiscountPrice() != null) {
                    sb.append(" [DISCOUNT_PRICE:").append(course.getDiscountPrice()).append("]");
                }
                sb.append(" ").append(course.getTitle())
                        .append(" | Cấp độ: ").append(course.getLevel())
                        .append(" | Giá: ").append(price)
                        .append(" | ").append(course.getSmallDescription())
                        .append("\n");
            });
            sb.append("\n");
        });

        sb.append("=== KẾT THÚC DANH SÁCH ===\n");
        sb.append("\nLưu ý: Khi tạo COURSE_CARDS JSON, dùng đúng ID, THUMBNAIL, PRICE, DISCOUNT_PRICE từ danh sách. Chỉ chọn tối đa 3 khóa nổi bật nhất.\n");
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<?, ?> body) {
        try {
            var candidates = (List<?>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "Không có phản hồi từ AI.";
            var candidate = (Map<?, ?>) candidates.get(0);
            var content = (Map<?, ?>) candidate.get("content");
            var parts = (List<?>) content.get("parts");
            if (parts == null || parts.isEmpty()) return "Không có phản hồi từ AI.";
            var part = (Map<?, ?>) parts.get(0);
            String text = (String) part.get("text");
            return text != null ? text : "Xin lỗi, tôi không thể xử lý lúc này.";
        } catch (Exception e) {
            log.warn("Không parse được response từ Gemini: {}", e.getMessage());
            return "Xin lỗi, tôi không thể xử lý phản hồi lúc này.";
        }
    }
}