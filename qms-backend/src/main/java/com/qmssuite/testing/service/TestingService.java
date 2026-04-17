package com.qmssuite.testing.service;
import com.qmssuite.testing.dto.*;import com.qmssuite.testing.entity.*;
import com.qmssuite.testing.repository.*;
import com.qmssuite.shared.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;import java.math.MathContext;import java.util.*;
@Service @RequiredArgsConstructor
public class TestingService {
    private final TestRecordRepository testRepo; private final PTResultRepository ptRepo; private final AuditService audit;

    public Page<TestRecordDTO> searchTests(String q,String result,String stage,int page,int size){
        return testRepo.search(q,result,stage,PageRequest.of(page,size)).map(this::toTestDTO);
    }
    @Transactional
    public TestRecordDTO saveTest(TestRecordDTO dto,String user){
        TestRecordEntity e=testRepo.findByTestId(dto.getTestId()).orElse(new TestRecordEntity());
        e.setTestId(dto.getTestId());e.setTestName(dto.getTestName());e.setSampleId(dto.getSampleId());
        e.setClient(dto.getClient());e.setStartDate(dto.getStartDate());e.setEndDate(dto.getEndDate());
        e.setAnalyst(dto.getAnalyst());e.setResult(dto.getResult());e.setStage(dto.getStage());
        e.setMethod(dto.getMethod());e.setParameters(dto.getParameters());e.setNotes(dto.getNotes());
        testRepo.save(e); audit.log(user,"SAVE","test_records",e.getTestId(),null); return toTestDTO(e);
    }
    @Transactional
    public PTResultDTO savePT(PTResultDTO dto,String user){
        PTResultEntity e=new PTResultEntity();
        e.setResultId(dto.getResultId()==null?"PT-"+System.currentTimeMillis():dto.getResultId());
        e.setSchemeId(dto.getSchemeId());e.setRoundNo(dto.getRoundNo());
        e.setAssignedValue(dto.getAssignedValue());e.setLabResult(dto.getLabResult());
        e.setUncertainty(dto.getUncertainty());e.setStdDev(dto.getStdDev());
        // Calculate z-score
        if(dto.getLabResult()!=null&&dto.getAssignedValue()!=null&&dto.getStdDev()!=null&&dto.getStdDev().compareTo(BigDecimal.ZERO)!=0){
            BigDecimal z=dto.getLabResult().subtract(dto.getAssignedValue()).divide(dto.getStdDev(),new MathContext(6));
            e.setZScore(z.setScale(4,java.math.RoundingMode.HALF_UP));
        }
        e.setStatus(dto.getStatus());e.setSubmissionDate(dto.getSubmissionDate());e.setAnalyst(dto.getAnalyst());e.setNotes(dto.getNotes());
        ptRepo.save(e); audit.log(user,"SAVE","pt_results",e.getResultId(),null); return toPTDTO(e);
    }
    public List<PTResultDTO> getPTResults(UUID schemeId){
        return (schemeId!=null?ptRepo.findBySchemeIdOrderByCreatedAtDesc(schemeId):ptRepo.findAll())
            .stream().map(this::toPTDTO).toList();
    }
    public Map<String,Long> stats(){return Map.of("total",testRepo.count(),"active",testRepo.countByStage("ACTIVE"),"completed",testRepo.countByStage("COMPLETED"),"ptPending",ptRepo.countByStatus("PENDING"));}
    private TestRecordDTO toTestDTO(TestRecordEntity e){return TestRecordDTO.builder().id(e.getId()).testId(e.getTestId()).testName(e.getTestName()).sampleId(e.getSampleId()).client(e.getClient()).startDate(e.getStartDate()).endDate(e.getEndDate()).analyst(e.getAnalyst()).result(e.getResult()).stage(e.getStage()).method(e.getMethod()).parameters(e.getParameters()).notes(e.getNotes()).createdAt(e.getCreatedAt()).updatedAt(e.getUpdatedAt()).build();}
    private PTResultDTO toPTDTO(PTResultEntity e){
        String zStatus="PENDING";
        if(e.getZScore()!=null){double z=e.getZScore().abs().doubleValue();zStatus=z<=2?"SATISFACTORY":z<=3?"QUESTIONABLE":"UNSATISFACTORY";}
        return PTResultDTO.builder().id(e.getId()).resultId(e.getResultId()).schemeId(e.getSchemeId()).roundNo(e.getRoundNo()).assignedValue(e.getAssignedValue()).labResult(e.getLabResult()).uncertainty(e.getUncertainty()).stdDev(e.getStdDev()).zScore(e.getZScore()).status(e.getStatus()).submissionDate(e.getSubmissionDate()).analyst(e.getAnalyst()).notes(e.getNotes()).zStatus(zStatus).build();
    }
}