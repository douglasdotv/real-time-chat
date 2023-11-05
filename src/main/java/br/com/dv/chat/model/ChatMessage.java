package br.com.dv.chat.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ChatMessage(
        @NotBlank
        String message,
        @NotBlank
        String sender,
        @NotNull
        LocalDateTime date
) {
}
