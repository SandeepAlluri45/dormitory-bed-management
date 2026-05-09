package com.dormitory.bedmanagement.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BedDTO {
    private Long id;
    private String bedNumber;
    private String roomNumber;
    private Integer floorNumber;
    private String bedType;
    private String status;
    private BigDecimal hourlyRate;
    private BigDecimal dailyRate;
    private String customerName;
    private Long allocationId;
}
