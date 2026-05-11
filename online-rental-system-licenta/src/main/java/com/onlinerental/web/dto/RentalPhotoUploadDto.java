package com.onlinerental.web.dto;

public record RentalPhotoUploadDto(
        boolean success,
        String message,
        String imageUrl
) {
}
