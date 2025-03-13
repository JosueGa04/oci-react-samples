package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    // Find alerts by status (e.g., PENDING, SENT)
    List<Alert> findByStatus(String status);

    // Find alerts by User ID
    List<Alert> findByUserId(String userId);

    // Find alerts scheduled before a certain time and still in PENDING status
    @Query("SELECT a FROM Alert a WHERE a.scheduledTime < :scheduledTime AND a.status = 'PENDING'")
    List<Alert> findOverdueAlerts(@Param("scheduledTime") OffsetDateTime scheduledTime);

    // Find alerts by taskId
    List<Alert> findByTaskId(Long taskId);

    // Update the status of an alert (for example, from PENDING to SENT)
    @Modifying
    @Query("UPDATE Alert a SET a.status = :status WHERE a.id = :alertId")
    int updateAlertStatus(@Param("alertId") Long alertId, @Param("status") String status);

    // Find alerts that are scheduled to be sent within a specific time frame (e.g., between now and a future time)
    @Query("SELECT a FROM Alert a WHERE a.scheduledTime BETWEEN :startDate AND :endDate")
    List<Alert> findAlertsBetweenDates(@Param("startDate") OffsetDateTime startDate, @Param("endDate") OffsetDateTime endDate);

    // Find alerts by priority
    List<Alert> findByPriority(String priority);

    // Find alerts by taskId and status (useful for checking specific tasks)
    List<Alert> findByTaskIdAndStatus(Long taskId, String status);

}
