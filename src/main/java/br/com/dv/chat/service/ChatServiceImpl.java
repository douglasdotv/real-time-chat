package br.com.dv.chat.service;

import br.com.dv.chat.exception.UsernameAlreadyInUseException;
import br.com.dv.chat.model.ChatMessage;
import br.com.dv.chat.model.ChatUsername;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ChatServiceImpl implements ChatService {

    private static final String USERNAME_ALREADY_IN_USE = "Username already in use.";
    private final List<ChatMessage> messages = new CopyOnWriteArrayList<>();
    private final List<ChatUsername> usernames = new CopyOnWriteArrayList<>();

    @Override
    public ChatMessage addMessage(ChatMessage message) {
        messages.add(message);
        return message;
    }

    @Override
    public ChatUsername addUsername(ChatUsername username) {
        if (usernames.contains(username)) {
            throw new UsernameAlreadyInUseException(USERNAME_ALREADY_IN_USE);
        }
        usernames.add(username);
        return username;
    }

    @Override
    public List<ChatMessage> getMessages() {
        List<ChatMessage> sortedMessages = new ArrayList<>(messages);
        sortedMessages.sort(Comparator.comparing(ChatMessage::date));
        return sortedMessages;
    }

}
