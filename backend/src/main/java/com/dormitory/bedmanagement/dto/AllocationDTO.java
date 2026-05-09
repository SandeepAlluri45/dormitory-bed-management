package com.dormitory.bedmanagement.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AllocationDTO {
    private Long id;
    private Long bedId;
    private String bedNumber;
    private String roomNumber;
    private Long customerId;
    private String customerName;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private LocalDateTime expectedCheckout;
    private BigDecimal hourlyRate;
    private BigDecimal dailyRate;
    private BigDecimal totalHours;
    private BigDecimal totalCost;
    private BigDecimal currentCost;
    private String paymentStatus;
    private String notes;
    private boolean active;
}
