package com.qmssuite.samples.service;
import com.qmssuite.samples.dto.SampleDTO;import com.qmssuite.samples.entity.SampleEntity;
import com.qmssuite.samples.repository.SampleRepository;
import lombok.RequiredArgsConstructor;import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;import java.util.List;import java.util.Map;
@Service @RequiredArgsConstructor
public class SampleService {
    private final SampleRepository repo;
    public List<SampleDTO> search(String q,String status){return repo.search(q,status).stream().map(this::toDTO).toList();}
    @Transactional
    public SampleDTO save(SampleDTO dto){
        SampleEntity e=repo.findBySampleId(dto.getSampleId()).orElse(new SampleEntity());
        e.setSampleId(dto.getSampleId());e.setReceivedDate(dto.getReceivedDate());
        e.setReceivedBy(dto.getReceivedBy());e.setClient(dto.getClient());
        e.setSampleDescription(dto.getSampleDescription());e.setMatrix(dto.getMatrix());
        e.setQuantity(dto.getQuantity());e.setConditionOnArrival(dto.getConditionOnArrival());
        e.setConditionNotes(dto.getConditionNotes());e.setStorageLocation(dto.getStorageLocation());
        e.setStorageTemp(dto.getStorageTemp());e.setTestsRequested(dto.getTestsRequested());
        e.setMethodReferences(dto.getMethodReferences());e.setPriority(dto.getPriority());
        e.setStatus(dto.getStatus()!=null?dto.getStatus():"RECEIVED");
        e.setDisposalDate(dto.getDisposalDate());e.setDisposalMethod(dto.getDisposalMethod());
        e.setDisposalBy(dto.getDisposalBy());e.setLinkedReport(dto.getLinkedReport());
        e.setNotes(dto.getNotes());repo.save(e);return toDTO(e);
    }
    public Map<String,Long> stats(){return Map.of("total",repo.count(),"received",repo.countByStatus("RECEIVED"),"inTesting",repo.countByStatus("IN_TESTING"),"completed",repo.countByStatus("COMPLETED"));}
    private SampleDTO toDTO(SampleEntity e){return SampleDTO.builder().id(e.getId()).sampleId(e.getSampleId()).receivedDate(e.getReceivedDate()).receivedBy(e.getReceivedBy()).client(e.getClient()).sampleDescription(e.getSampleDescription()).matrix(e.getMatrix()).quantity(e.getQuantity()).conditionOnArrival(e.getConditionOnArrival()).conditionNotes(e.getConditionNotes()).storageLocation(e.getStorageLocation()).storageTemp(e.getStorageTemp()).testsRequested(e.getTestsRequested()).methodReferences(e.getMethodReferences()).priority(e.getPriority()).status(e.getStatus()).disposalDate(e.getDisposalDate()).disposalMethod(e.getDisposalMethod()).disposalBy(e.getDisposalBy()).linkedReport(e.getLinkedReport()).notes(e.getNotes()).createdAt(e.getCreatedAt()).build();}
}