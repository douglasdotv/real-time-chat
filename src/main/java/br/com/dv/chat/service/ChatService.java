package br.com.dv.chat.service;

import br.com.dv.chat.model.ChatMessage;
import br.com.dv.chat.model.ChatUser;

import java.util.List;

public interface ChatService {

    ChatMessage addMessage(ChatMessage message);

    ChatUser addUser(ChatUser user);

    List<ChatMessage> getMessages();

    void addToConnectedUsers(ChatUser user, String sessionId);

    void removeFromConnectedUsers(String sessionId);

    List<ChatUser> getConnectedUsers();

}
