package com.onlinerental.web.dto;

import java.util.List;

public record ProductAiTaggingRequest(
        List<String> imageUrls,
        String searchHint
) {
}

