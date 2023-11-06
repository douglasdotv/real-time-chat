package br.com.dv.chat.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record ChatUser(
        @NotBlank
        @Size(min = 2, max = 50)
        String username,
        @NotNull
        LocalDateTime joined
) {
}
