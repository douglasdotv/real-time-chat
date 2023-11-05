package br.com.dv.chat.service;

import br.com.dv.chat.model.ChatMessage;
import br.com.dv.chat.model.ChatUsername;

import java.util.List;

public interface ChatService {

    ChatMessage addMessage(ChatMessage message);

    ChatUsername addUsername(ChatUsername username);

    List<ChatMessage> getMessages();

}
