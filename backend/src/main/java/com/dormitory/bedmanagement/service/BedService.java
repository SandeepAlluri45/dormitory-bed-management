package com.dormitory.bedmanagement.service;

import com.dormitory.bedmanagement.dto.BedDTO;
import com.dormitory.bedmanagement.entity.Allocation;
import com.dormitory.bedmanagement.entity.Bed;
import com.dormitory.bedmanagement.entity.BedStatus;
import com.dormitory.bedmanagement.repository.AllocationRepository;
import com.dormitory.bedmanagement.repository.BedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BedService {
    
    private final BedRepository bedRepository;
    private final AllocationRepository allocationRepository;
    
    public List<BedDTO> getAllBeds() {
        return bedRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public BedDTO getBedById(Long id) {
        return bedRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
    }
    
    public BedDTO getBedByNumber(String bedNumber) {
        return bedRepository.findByBedNumber(bedNumber)
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Bed not found with number: " + bedNumber));
    }
    
    public List<BedDTO> getBedsByStatus(BedStatus status) {
        return bedRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<BedDTO> getAvailableBeds() {
        return bedRepository.findAvailableBeds().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<BedDTO> getBedsByFloor(Integer floor) {
        return bedRepository.findByFloorNumber(floor).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public BedDTO createBed(BedDTO bedDTO) {
        BigDecimal defaultHourlyRate = new BigDecimal("100.00");
        BigDecimal defaultDailyRate = new BigDecimal("900.00");
        
        // Set rates based on bed type
        if (bedDTO.getBedType() != null) {
            switch (bedDTO.getBedType()) {
                case "PREMIUM":
                    defaultHourlyRate = new BigDecimal("150.00");
                    defaultDailyRate = new BigDecimal("12000.00");
                    break;
                case "DELUXE":
                    defaultHourlyRate = new BigDecimal("200.00");
                    defaultDailyRate = new BigDecimal("15000.00");
                    break;
                default: // STANDARD
                    defaultHourlyRate = new BigDecimal("100.00");
                    defaultDailyRate = new BigDecimal("900.00");
            }
        }
        
        Bed bed = Bed.builder()
                .bedNumber(bedDTO.getBedNumber())
                .roomNumber(bedDTO.getRoomNumber())
                .floorNumber(bedDTO.getFloorNumber())
                .bedType(bedDTO.getBedType())
                .status(BedStatus.IDLE)
                .hourlyRate(bedDTO.getHourlyRate() != null ? bedDTO.getHourlyRate() : defaultHourlyRate)
                .dailyRate(bedDTO.getDailyRate() != null ? bedDTO.getDailyRate() : defaultDailyRate)
                .build();
        
        return convertToDTO(bedRepository.save(bed));
    }
    
    @Transactional
    public BedDTO updateBed(Long id, BedDTO bedDTO) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
        
        bed.setBedNumber(bedDTO.getBedNumber());
        bed.setRoomNumber(bedDTO.getRoomNumber());
        bed.setFloorNumber(bedDTO.getFloorNumber());
        bed.setBedType(bedDTO.getBedType());
        bed.setHourlyRate(bedDTO.getHourlyRate());
        bed.setDailyRate(bedDTO.getDailyRate());
        
        return convertToDTO(bedRepository.save(bed));
    }
    
    @Transactional
    public void updateBedStatus(Long id, BedStatus status) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bed not found with id: " + id));
        bed.setStatus(status);
        bedRepository.save(bed);
    }
    
    @Transactional
    public void deleteBed(Long id) {
        bedRepository.deleteById(id);
    }
    
    public Long countByStatus(BedStatus status) {
        return bedRepository.countByStatus(status);
    }
    
    private BedDTO convertToDTO(Bed bed) {
        BedDTO dto = BedDTO.builder()
                .id(bed.getId())
                .bedNumber(bed.getBedNumber())
                .roomNumber(bed.getRoomNumber())
                .floorNumber(bed.getFloorNumber())
                .bedType(bed.getBedType())
                .status(bed.getStatus().name())
                .hourlyRate(bed.getHourlyRate())
                .dailyRate(bed.getDailyRate())
                .build();
        
        // If bed is allocated, get customer info
        if (bed.getStatus() == BedStatus.ALLOCATED) {
            Optional<Allocation> allocation = allocationRepository.findActiveAllocationByBedId(bed.getId());
            allocation.ifPresent(a -> {
                dto.setCustomerName(a.getCustomer().getFullName());
                dto.setAllocationId(a.getId());
            });
        }
        
        return dto;
    }
}
