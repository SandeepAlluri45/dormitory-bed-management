package com.dormitory.bedmanagement.service;

import com.dormitory.bedmanagement.dto.AllocationDTO;
import com.dormitory.bedmanagement.dto.AllocationRequest;
import com.dormitory.bedmanagement.entity.Allocation;
import com.dormitory.bedmanagement.entity.Bed;
import com.dormitory.bedmanagement.entity.BedStatus;
import com.dormitory.bedmanagement.entity.Customer;
import com.dormitory.bedmanagement.repository.AllocationRepository;
import com.dormitory.bedmanagement.repository.BedRepository;
import com.dormitory.bedmanagement.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllocationService {
    
    private final AllocationRepository allocationRepository;
    private final BedRepository bedRepository;
    private final CustomerRepository customerRepository;
    
    public List<AllocationDTO> getAllAllocations() {
        return allocationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<AllocationDTO> getActiveAllocations() {
        return allocationRepository.findAllActiveAllocations().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<AllocationDTO> getCompletedAllocations() {
        return allocationRepository.findAllCompletedAllocations().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public AllocationDTO getAllocationById(Long id) {
        return allocationRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Allocation not found with id: " + id));
    }
    
    public AllocationDTO getActiveAllocationByBedId(Long bedId) {
        return allocationRepository.findActiveAllocationByBedId(bedId)
                .map(this::convertToDTO)
                .orElse(null);
    }
    
    public List<AllocationDTO> getAllocationsByCustomerId(Long customerId) {
        return allocationRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public AllocationDTO allocateBed(AllocationRequest request) {
        Bed bed = bedRepository.findById(request.getBedId())
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + request.getBedId()));
        
        if (bed.getStatus() != BedStatus.IDLE) {
            throw new RuntimeException("Bed is not available for allocation");
        }
        
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + request.getCustomerId()));
        
        Allocation allocation = Allocation.builder()
                .bed(bed)
                .customer(customer)
                .checkInTime(LocalDateTime.now())
                .expectedCheckout(request.getExpectedCheckout())
                .hourlyRate(bed.getHourlyRate())
                .dailyRate(bed.getDailyRate())
                .paymentStatus("PENDING")
                .notes(request.getNotes())
                .build();
        
        // Update bed status
        bed.setStatus(BedStatus.ALLOCATED);
        bedRepository.save(bed);
        
        return convertToDTO(allocationRepository.save(allocation));
    }
    
    @Transactional
    public AllocationDTO checkOut(Long allocationId) {
        Allocation allocation = allocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Allocation not found with id: " + allocationId));
        
        if (allocation.getCheckOutTime() != null) {
            throw new RuntimeException("Allocation has already been checked out");
        }
        
        LocalDateTime checkOutTime = LocalDateTime.now();
        allocation.setCheckOutTime(checkOutTime);
        
        // Calculate total hours and cost
        BigDecimal[] costResult = calculateCost(allocation.getCheckInTime(), checkOutTime, 
                allocation.getHourlyRate(), allocation.getDailyRate());
        
        allocation.setTotalHours(costResult[0]);
        allocation.setTotalCost(costResult[1]);
        allocation.setPaymentStatus("COMPLETED");
        
        // Update bed status back to IDLE
        Bed bed = allocation.getBed();
        bed.setStatus(BedStatus.IDLE);
        bedRepository.save(bed);
        
        return convertToDTO(allocationRepository.save(allocation));
    }
    
    @Transactional
    public void deleteAllocation(Long id) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Allocation not found with id: " + id));
        
        // If allocation is active, free the bed
        if (allocation.getCheckOutTime() == null) {
            Bed bed = allocation.getBed();
            bed.setStatus(BedStatus.IDLE);
            bedRepository.save(bed);
        }
        
        allocationRepository.deleteById(id);
    }
    
    public Long countActiveAllocations() {
        return allocationRepository.countActiveAllocations();
    }
    
    public Double getTotalRevenueForPeriod(LocalDateTime start, LocalDateTime end) {
        Double revenue = allocationRepository.getTotalRevenueBetweenDates(start, end);
        return revenue != null ? revenue : 0.0;
    }
    
    private BigDecimal[] calculateCost(LocalDateTime checkIn, LocalDateTime checkOut, 
                                        BigDecimal hourlyRate, BigDecimal dailyRate) {
        Duration duration = Duration.between(checkIn, checkOut);
        long totalMinutes = duration.toMinutes();
        BigDecimal totalHours = new BigDecimal(totalMinutes).divide(new BigDecimal("60"), 2, RoundingMode.HALF_UP);
        
        // If stay is more than 20 hours, use daily rate
        long days = totalMinutes / (24 * 60);
        long remainingMinutes = totalMinutes % (24 * 60);
        BigDecimal remainingHours = new BigDecimal(remainingMinutes).divide(new BigDecimal("60"), 2, RoundingMode.HALF_UP);
        
        BigDecimal totalCost;
        if (days >= 1) {
            // Calculate daily rate for full days + hourly for remainder
            totalCost = dailyRate.multiply(new BigDecimal(days));
            // If remaining hours > 20, charge another day
            if (remainingHours.compareTo(new BigDecimal("20")) > 0) {
                totalCost = totalCost.add(dailyRate);
            } else {
                totalCost = totalCost.add(hourlyRate.multiply(remainingHours));
            }
        } else {
            // Less than a day, use hourly rate
            // But if hours > 20, cap at daily rate
            BigDecimal hourlyTotal = hourlyRate.multiply(totalHours);
            if (hourlyTotal.compareTo(dailyRate) > 0) {
                totalCost = dailyRate;
            } else {
                totalCost = hourlyTotal;
            }
        }
        
        return new BigDecimal[] { totalHours.setScale(2, RoundingMode.HALF_UP), 
                                   totalCost.setScale(2, RoundingMode.HALF_UP) };
    }
    
    private BigDecimal calculateCurrentCost(Allocation allocation) {
        if (allocation.getCheckOutTime() != null) {
            return allocation.getTotalCost();
        }
        
        BigDecimal[] result = calculateCost(allocation.getCheckInTime(), LocalDateTime.now(),
                allocation.getHourlyRate(), allocation.getDailyRate());
        return result[1];
    }
    
    private AllocationDTO convertToDTO(Allocation allocation) {
        return AllocationDTO.builder()
                .id(allocation.getId())
                .bedId(allocation.getBed().getId())
                .bedNumber(allocation.getBed().getBedNumber())
                .roomNumber(allocation.getBed().getRoomNumber())
                .customerId(allocation.getCustomer().getId())
                .customerName(allocation.getCustomer().getFullName())
                .checkInTime(allocation.getCheckInTime())
                .checkOutTime(allocation.getCheckOutTime())
                .expectedCheckout(allocation.getExpectedCheckout())
                .hourlyRate(allocation.getHourlyRate())
                .dailyRate(allocation.getDailyRate())
                .totalHours(allocation.getTotalHours())
                .totalCost(allocation.getTotalCost())
                .currentCost(calculateCurrentCost(allocation))
                .paymentStatus(allocation.getPaymentStatus())
                .notes(allocation.getNotes())
                .active(allocation.isActive())
                .build();
    }
}
