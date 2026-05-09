package com.dormitory.bedmanagement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationRequest {
    private Long bedId;
    private Long customerId;
    private LocalDateTime expectedCheckout;
    private String notes;
}
