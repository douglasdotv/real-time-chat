package br.com.dv.chat.service;

import br.com.dv.chat.exception.UsernameAlreadyInUseException;
import br.com.dv.chat.model.ChatMessage;
import br.com.dv.chat.model.ChatUser;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ChatServiceImpl implements ChatService {

    private static final String USERNAME_ALREADY_IN_USE = "Username already in use.";
    private final List<ChatMessage> messages = new CopyOnWriteArrayList<>();
    private final List<ChatUser> registeredUsers = new CopyOnWriteArrayList<>();
    private final Map<String, ChatUser> connectedUsers = new ConcurrentHashMap<>();

    @Override
    public ChatMessage addMessage(ChatMessage message) {
        messages.add(message);
        return message;
    }

    @Override
    public ChatUser addUser(ChatUser user) {
        if (registeredUsers.contains(user)) {
            throw new UsernameAlreadyInUseException(USERNAME_ALREADY_IN_USE);
        }
        registeredUsers.add(user);
        return user;
    }

    @Override
    public List<ChatMessage> getMessages() {
        List<ChatMessage> messages = new ArrayList<>(this.messages);
        messages.sort(Comparator.comparing(ChatMessage::date));
        return messages;
    }

    @Override
    public void addToConnectedUsers(ChatUser user, String sessionId) {
        connectedUsers.put(sessionId, user);
    }

    @Override
    public void removeFromConnectedUsers(String sessionId) {
        connectedUsers.remove(sessionId);
    }

    @Override
    public List<ChatUser> getConnectedUsers() {
        List<ChatUser> connectedUsers = new ArrayList<>(this.connectedUsers.values());
        connectedUsers.sort(Comparator.comparing(ChatUser::joined));
        return connectedUsers;
    }

}
