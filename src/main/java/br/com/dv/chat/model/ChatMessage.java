package br.com.dv.chat.model;

import jakarta.validation.constraints.NotBlank;

public record ChatMessage(@NotBlank String message) {
}
