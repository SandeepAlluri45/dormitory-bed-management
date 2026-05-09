package com.dormitory.bedmanagement.controller;

import com.dormitory.bedmanagement.dto.BedDTO;
import com.dormitory.bedmanagement.entity.BedStatus;
import com.dormitory.bedmanagement.service.BedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beds")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class BedController {
    
    private final BedService bedService;
    
    @GetMapping
    public ResponseEntity<List<BedDTO>> getAllBeds() {
        return ResponseEntity.ok(bedService.getAllBeds());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BedDTO> getBedById(@PathVariable Long id) {
        return ResponseEntity.ok(bedService.getBedById(id));
    }
    
    @GetMapping("/number/{bedNumber}")
    public ResponseEntity<BedDTO> getBedByNumber(@PathVariable String bedNumber) {
        return ResponseEntity.ok(bedService.getBedByNumber(bedNumber));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BedDTO>> getBedsByStatus(@PathVariable String status) {
        BedStatus bedStatus = BedStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(bedService.getBedsByStatus(bedStatus));
    }
    
    @GetMapping("/available")
    public ResponseEntity<List<BedDTO>> getAvailableBeds() {
        return ResponseEntity.ok(bedService.getAvailableBeds());
    }
    
    @GetMapping("/floor/{floor}")
    public ResponseEntity<List<BedDTO>> getBedsByFloor(@PathVariable Integer floor) {
        return ResponseEntity.ok(bedService.getBedsByFloor(floor));
    }
    
    @PostMapping
    public ResponseEntity<BedDTO> createBed(@RequestBody BedDTO bedDTO) {
        return ResponseEntity.ok(bedService.createBed(bedDTO));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<BedDTO> updateBed(@PathVariable Long id, @RequestBody BedDTO bedDTO) {
        return ResponseEntity.ok(bedService.updateBed(id, bedDTO));
    }
    
    @PutMapping("/{id}/status/{status}")
    public ResponseEntity<Void> updateBedStatus(@PathVariable Long id, @PathVariable String status) {
        BedStatus bedStatus = BedStatus.valueOf(status.toUpperCase());
        bedService.updateBedStatus(id, bedStatus);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBed(@PathVariable Long id) {
        bedService.deleteBed(id);
        return ResponseEntity.ok().build();
    }
}
