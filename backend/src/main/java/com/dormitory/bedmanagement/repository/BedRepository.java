package com.dormitory.bedmanagement.repository;

import com.dormitory.bedmanagement.entity.Bed;
import com.dormitory.bedmanagement.entity.BedStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    
    Optional<Bed> findByBedNumber(String bedNumber);
    
    List<Bed> findByStatus(BedStatus status);
    
    List<Bed> findByRoomNumber(String roomNumber);
    
    List<Bed> findByFloorNumber(Integer floorNumber);
    
    List<Bed> findByBedType(String bedType);
    
    @Query("SELECT COUNT(b) FROM Bed b WHERE b.status = :status")
    Long countByStatus(@Param("status") BedStatus status);
    
    @Query("SELECT b.status, COUNT(b) FROM Bed b GROUP BY b.status")
    List<Object[]> countBedsByStatus();
    
    @Query("SELECT b FROM Bed b WHERE b.status = 'IDLE' ORDER BY b.floorNumber, b.roomNumber")
    List<Bed> findAvailableBeds();
}
