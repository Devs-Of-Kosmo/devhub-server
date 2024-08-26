package team.devs.devhub.domain.message.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.message.dto.MessageDtoRequest;
import team.devs.devhub.domain.message.dto.MessageDtoResponse;
import team.devs.devhub.domain.message.dto.MessageSaveResponse;
import team.devs.devhub.domain.message.service.MessageService;
import team.devs.devhub.global.security.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@Tag(name = "쪽지 관련 API", description = "쪽지 관련 API 입니다")
public class MessageController {

    public final MessageService messageService;

    @PostMapping("/send")
    @Operation(summary = "쪽지 발송(생성) API", description = "header에 accessToken과 body에 content, receiverEmail을 담아 요청하고 저장된 쪽지의 식별자 id를 받는다")
    public ResponseEntity<MessageSaveResponse> messageSend(@RequestBody MessageDtoRequest messageDtoRequest,
                                                           @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return ResponseEntity.ok(messageService.saveMessage(messageDtoRequest, customUserDetails));
    }

    @GetMapping("/received")
    @Operation(summary = "받은 쪽지 목록 조회 API", description = "header에 accessToken을 담아 요청하고 받은 쪽지 목록을 리스트 형식으로 받는다")
    public List<MessageDtoResponse> getReceivedMessages(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return messageService.getReceivedMessages(customUserDetails);
    }

    @GetMapping("/sent")
    @Operation(summary = "보낸 쪽지 목록 조회 API", description = "header에 accessToken을 담아 요청하고 보낸 쪽지 목록을 리스트 형식으로 받는다")
    public List<MessageDtoResponse> getSentMessages(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return messageService.getSentMessages(customUserDetails);
    }

    @GetMapping("/delete")
    @Operation(summary = "쪽지 삭제 API", description = "header에 accessToken과 파라미터로 messageId, box를 담아 요청하고 삭제 된 쪽지를 제외한 리스트 형식을 받는다")
    public List<MessageDtoResponse> deleteMessage(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                  @RequestParam("id") Long messageId,
                                                  @RequestParam("box") String box) {

        return messageService.deleteMessage(customUserDetails, messageId, box);
    }

    @GetMapping("/received/read")
    @Operation(summary = "받은 쪽지 조회 API", description = "header에 accessToken과 파라미터 messageId 담아 요청하고 해당되는 쪽지의 데이터를 받는다")
    public MessageDtoResponse readMessageCheck(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                @RequestParam("id") Long messageId)
            {
        return messageService.readCheckMessage(customUserDetails, messageId);
    }

    @GetMapping("/sent/read")
    @Operation(summary = "보낸 쪽지 조회 API", description = "파라미터에 messageId을 담아 요청히고 해당되는 쪽지의 데이터를 받는다")
    public MessageDtoResponse getMessage(@RequestParam("id") Long messageId){

        return messageService.getMessage(messageId);
    }

}
