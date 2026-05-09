package com.dormitory.bedmanagement.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDTO {
    private Long totalBeds;
    private Long idleBeds;
    private Long allocatedBeds;
    private Long maintenanceBeds;
    private Long activeAllocations;
    private BigDecimal todayRevenue;
    private BigDecimal monthRevenue;
    private Double occupancyRate;
}
