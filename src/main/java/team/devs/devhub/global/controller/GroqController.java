package team.devs.devhub.global.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/llama")
public class GroqController {

    @Value("${spring.groq.api.key}")
    private String groqApiKey ;

    @PostMapping("/code-review")
    public ResponseEntity<?> codeReview(@RequestBody Map<String, Object> requestBody) {
        String prompt = (String) requestBody.get("prompt");

        // Groq API 요청을 구성합니다.
        String groqApiUrl = "https://api.groq.com/openai/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("Authorization", "Bearer " + groqApiKey);

        Map<String, Object> groqRequestBody = new HashMap<>();
        groqRequestBody.put("model", "mixtral-8x7b-32768"); // 사용하려는 모델 이름
        groqRequestBody.put("messages", Arrays.asList(
                new HashMap<String, Object>() {{
                    put("role", "user");
                    put("content", prompt);
                }}
        ));
        groqRequestBody.put("max_tokens", 500);
        groqRequestBody.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(groqRequestBody, headers);

        try {
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.exchange(
                    groqApiUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            String responseText = "";
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                if (message != null) {
                    responseText = (String) message.get("content");
                }
            }

            // 응답 데이터를 클라이언트에게 전달합니다.
            return ResponseEntity.ok(Collections.singletonMap("response", responseText));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Groq API 호출 중 오류 발생: " + e.getMessage());
        }
    }
}
