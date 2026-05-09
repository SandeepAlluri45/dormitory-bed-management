package com.dormitory.bedmanagement.repository;

import com.dormitory.bedmanagement.entity.Allocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {
    
    @Query("SELECT a FROM Allocation a WHERE a.bed.id = :bedId AND a.checkOutTime IS NULL")
    Optional<Allocation> findActiveAllocationByBedId(@Param("bedId") Long bedId);
    
    @Query("SELECT a FROM Allocation a WHERE a.customer.id = :customerId AND a.checkOutTime IS NULL")
    List<Allocation> findActiveAllocationsByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT a FROM Allocation a WHERE a.checkOutTime IS NULL")
    List<Allocation> findAllActiveAllocations();
    
    @Query("SELECT a FROM Allocation a WHERE a.checkOutTime IS NOT NULL ORDER BY a.checkOutTime DESC")
    List<Allocation> findAllCompletedAllocations();
    
    @Query("SELECT a FROM Allocation a WHERE a.checkInTime >= :startDate AND a.checkInTime <= :endDate")
    List<Allocation> findAllocationsBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(a.totalCost) FROM Allocation a WHERE a.checkOutTime IS NOT NULL " +
           "AND a.checkOutTime >= :startDate AND a.checkOutTime <= :endDate")
    Double getTotalRevenueBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(a) FROM Allocation a WHERE a.checkOutTime IS NULL")
    Long countActiveAllocations();
    
    List<Allocation> findByCustomerId(Long customerId);
    
    List<Allocation> findByBedId(Long bedId);
}
