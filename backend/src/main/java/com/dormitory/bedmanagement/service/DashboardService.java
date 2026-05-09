package com.dormitory.bedmanagement.service;

import com.dormitory.bedmanagement.dto.DashboardDTO;
import com.dormitory.bedmanagement.entity.BedStatus;
import com.dormitory.bedmanagement.repository.AllocationRepository;
import com.dormitory.bedmanagement.repository.BedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final BedRepository bedRepository;
    private final AllocationRepository allocationRepository;
    
    public DashboardDTO getDashboardStats() {
        Long totalBeds = bedRepository.count();
        Long idleBeds = bedRepository.countByStatus(BedStatus.IDLE);
        Long allocatedBeds = bedRepository.countByStatus(BedStatus.ALLOCATED);
        Long maintenanceBeds = bedRepository.countByStatus(BedStatus.MAINTENANCE);
        Long activeAllocations = allocationRepository.countActiveAllocations();
        
        // Today's revenue
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        Double todayRevenueValue = allocationRepository.getTotalRevenueBetweenDates(todayStart, todayEnd);
        BigDecimal todayRevenue = todayRevenueValue != null ? 
                BigDecimal.valueOf(todayRevenueValue).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        // This month's revenue
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime monthEnd = LocalDate.now().atTime(LocalTime.MAX);
        Double monthRevenueValue = allocationRepository.getTotalRevenueBetweenDates(monthStart, monthEnd);
        BigDecimal monthRevenue = monthRevenueValue != null ? 
                BigDecimal.valueOf(monthRevenueValue).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        // Occupancy rate
        Double occupancyRate = totalBeds > 0 ? 
                (allocatedBeds.doubleValue() / totalBeds.doubleValue()) * 100 : 0.0;
        
        return DashboardDTO.builder()
                .totalBeds(totalBeds)
                .idleBeds(idleBeds)
                .allocatedBeds(allocatedBeds)
                .maintenanceBeds(maintenanceBeds)
                .activeAllocations(activeAllocations)
                .todayRevenue(todayRevenue)
                .monthRevenue(monthRevenue)
                .occupancyRate(Math.round(occupancyRate * 100.0) / 100.0)
                .build();
    }
}
