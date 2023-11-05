package br.com.dv.chat.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatUsername(
        @NotBlank
        @Size(min = 2, max = 50)
        String username
) {
}
