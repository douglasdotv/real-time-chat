package br.com.dv.chat.controller;

import br.com.dv.chat.model.ChatMessage;
import br.com.dv.chat.model.ChatUser;
import br.com.dv.chat.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @MessageMapping("/messages")
    @SendTo("/topic/messages")
    public ChatMessage sendMessage(@Valid ChatMessage message) {
        return message;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatMessage> saveMessage(@Valid @RequestBody ChatMessage message) {
        ChatMessage addedMessage = chatService.addMessage(message);
        return ResponseEntity.ok(addedMessage);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getMessages() {
        List<ChatMessage> messages = chatService.getMessages();
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/user")
    public ResponseEntity<ChatUser> saveUser(@Valid @RequestBody ChatUser user) {
        ChatUser addedUser = chatService.addUser(user);
        return ResponseEntity.ok(addedUser);
    }

    @GetMapping("/connected-users")
    public ResponseEntity<List<ChatUser>> getConnectedUsers() {
        List<ChatUser> connectedUsers = chatService.getConnectedUsers();
        return ResponseEntity.ok(connectedUsers);
    }

}
