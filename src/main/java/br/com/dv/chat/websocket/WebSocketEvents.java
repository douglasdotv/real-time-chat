package br.com.dv.chat.websocket;

import br.com.dv.chat.model.ChatUser;
import br.com.dv.chat.service.ChatService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class WebSocketEvents {

    private final static String USERNAME_HEADER = "username";
    private final static String JOINED_HEADER = "joined";
    private final static String CONNECTED_USERS_TOPIC = "/topic/connected-users";
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEvents(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        ChatUser user = getChatUser(headerAccessor);
        String sessionId = headerAccessor.getSessionId();
        chatService.addToConnectedUsers(user, sessionId);
        sendToConnectedUsersTopic();
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        chatService.removeFromConnectedUsers(sessionId);
        sendToConnectedUsersTopic();
    }

    private void sendToConnectedUsersTopic() {
        List<ChatUser> updatedConnectedUsers = chatService.getConnectedUsers();
        messagingTemplate.convertAndSend(CONNECTED_USERS_TOPIC, updatedConnectedUsers);
    }

    private ChatUser getChatUser(StompHeaderAccessor headerAccessor) {
        String username = headerAccessor.getFirstNativeHeader(USERNAME_HEADER);
        String joinedString = headerAccessor.getFirstNativeHeader(JOINED_HEADER);

        LocalDateTime joined = null;
        if (joinedString != null) {
            joined = LocalDateTime.parse(joinedString);
        }

        return new ChatUser(username, joined);
    }

}
