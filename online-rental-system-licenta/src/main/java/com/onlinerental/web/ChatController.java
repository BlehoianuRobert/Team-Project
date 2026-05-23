package com.onlinerental.web;

import com.onlinerental.service.ChatService;
import com.onlinerental.service.ChatService.ChatMessage;
import com.onlinerental.service.ChatService.ChatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    public record ChatRequest(String message, List<ChatMessage> history) {
        public ChatRequest {
            if (history == null) history = List.of();
        }
    }

    @PostMapping
    public ChatResponse send(
            @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        String username = principal != null ? principal.getUsername() : null;
        return chatService.chat(request.message(), request.history(), username);
    }
}
