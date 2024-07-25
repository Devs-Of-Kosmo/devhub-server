package team.devs.devhub.domain.message.controller;

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
public class MessageController {

    public final MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<MessageSaveResponse> messageSend(@RequestBody MessageDtoRequest messageDtoRequest,
                                                           @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return ResponseEntity.ok(messageService.saveMessage(messageDtoRequest, customUserDetails));
    }

    @GetMapping("/received")
    public List<MessageDtoResponse> getReceivedMessages(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return messageService.getReceivedMessages(customUserDetails);
    }

    @GetMapping("/sent")
    public List<MessageDtoResponse> getSentMessages(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        return messageService.getSentMessages(customUserDetails);
    }

    @GetMapping("/delete")
    public List<MessageDtoResponse> deleteMessage(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                  @RequestParam("id") Long messageId,
                                                  @RequestParam("box") String box) {

        return messageService.deleteMessage(customUserDetails, messageId, box);
    }

    @GetMapping("/received/read")
    public MessageDtoResponse readMessageCheck(@AuthenticationPrincipal CustomUserDetails customUserDetails,
                                                @RequestParam("id") Long messageId)
            {
        return messageService.readCheckMessage(customUserDetails, messageId);
    }

    @GetMapping("/sent/read")
    public MessageDtoResponse getMessage(@RequestParam("id") Long messageId){

        return messageService.getMessage(messageId);
    }

}
