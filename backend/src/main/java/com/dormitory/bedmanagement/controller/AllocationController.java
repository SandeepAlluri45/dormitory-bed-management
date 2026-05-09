package com.dormitory.bedmanagement.controller;

import com.dormitory.bedmanagement.dto.AllocationDTO;
import com.dormitory.bedmanagement.dto.AllocationRequest;
import com.dormitory.bedmanagement.service.AllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AllocationController {
    
    private final AllocationService allocationService;
    
    @GetMapping
    public ResponseEntity<List<AllocationDTO>> getAllAllocations() {
        return ResponseEntity.ok(allocationService.getAllAllocations());
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<AllocationDTO>> getActiveAllocations() {
        return ResponseEntity.ok(allocationService.getActiveAllocations());
    }
    
    @GetMapping("/completed")
    public ResponseEntity<List<AllocationDTO>> getCompletedAllocations() {
        return ResponseEntity.ok(allocationService.getCompletedAllocations());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AllocationDTO> getAllocationById(@PathVariable Long id) {
        return ResponseEntity.ok(allocationService.getAllocationById(id));
    }
    
    @GetMapping("/bed/{bedId}")
    public ResponseEntity<AllocationDTO> getActiveAllocationByBedId(@PathVariable Long bedId) {
        AllocationDTO allocation = allocationService.getActiveAllocationByBedId(bedId);
        if (allocation != null) {
            return ResponseEntity.ok(allocation);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<AllocationDTO>> getAllocationsByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(allocationService.getAllocationsByCustomerId(customerId));
    }
    
    @PostMapping("/allocate")
    public ResponseEntity<AllocationDTO> allocateBed(@RequestBody AllocationRequest request) {
        return ResponseEntity.ok(allocationService.allocateBed(request));
    }
    
    @PostMapping("/{id}/checkout")
    public ResponseEntity<AllocationDTO> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(allocationService.checkOut(id));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAllocation(@PathVariable Long id) {
        allocationService.deleteAllocation(id);
        return ResponseEntity.ok().build();
    }
}
