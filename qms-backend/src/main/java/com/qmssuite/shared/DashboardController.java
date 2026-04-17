package com.qmssuite.shared;
import com.qmssuite.documents.service.DocumentService;
import com.qmssuite.equipment.service.EquipmentService;
import com.qmssuite.personnel.service.PersonnelService;
import com.qmssuite.testing.service.TestingService;
import com.qmssuite.quality.service.QualityService;
import com.qmssuite.reports.service.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;import java.util.Map;
@RestController @RequestMapping("/api/dashboard") @RequiredArgsConstructor
@Tag(name="Dashboard",description="Aggregated KPI statistics across all modules")
public class DashboardController {
    private final DocumentService docSvc;  private final EquipmentService eqSvc;
    private final PersonnelService pplSvc; private final TestingService testSvc;
    private final QualityService qualSvc;  private final ReportService repSvc;
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<?>> stats(){
        Map<String,Object> r=new HashMap<>();
        r.put("documents", docSvc.stats());  r.put("equipment", eqSvc.stats());
        r.put("personnel", pplSvc.stats());  r.put("testing",   testSvc.stats());
        r.put("quality",   qualSvc.stats()); r.put("reports",   repSvc.stats());
        return ResponseEntity.ok(ApiResponse.ok(r));
    }
}