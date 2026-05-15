package com.grad.backend.project.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.project.DTO.GenerateTasksFromProposalRequest;
import com.grad.backend.project.DTO.ProjectTaskDTO;
import com.grad.backend.project.DTO.UpdateProjectTaskRequest;
import com.grad.backend.project.DTO.ai.AiGeneratedPhaseDTO;
import com.grad.backend.project.DTO.ai.AiGeneratedTaskDTO;
import com.grad.backend.project.DTO.ai.AiTaskGenerationResponseDTO;
import com.grad.backend.project.entity.CompanyProject;
import com.grad.backend.project.entity.ProjectTask;
import com.grad.backend.project.enums.ProjectPhase;
import com.grad.backend.project.enums.TaskPriority;
import com.grad.backend.project.enums.TaskStatus;
import com.grad.backend.project.repository.CompanyProjectRepository;
import com.grad.backend.project.repository.ProjectTaskRepository;
import com.grad.backend.project.DTO.CompanyProjectDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectTaskService {

    private final ProjectTaskRepository projectTaskRepository;
    private final CompanyProjectRepository companyProjectRepository;
    private final CompanyProjectService companyProjectService;
    private final TaskGenerationAiService taskGenerationAiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional(readOnly = true)
    public List<ProjectTaskDTO> getTasksForProject(Long projectId, Long pmUserId) {
        verifyPmAccess(projectId, pmUserId);
        return projectTaskRepository.findByCompanyProjectIdOrderByPhaseAscSortOrderAscIdAsc(projectId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<ProjectTaskDTO> generateTasksFromProposal(
            Long projectId,
            Long pmUserId,
            GenerateTasksFromProposalRequest request) {

        CompanyProject project = verifyPmAccess(projectId, pmUserId);
        CompanyProjectDTO projectDto = companyProjectService.getProjectById(projectId, pmUserId);

        String proposalText = taskGenerationAiService.sanitizeProposalText(request.getProposalText());
        String projectTitle = projectDto.getProjectTitle() != null ? projectDto.getProjectTitle() : "Software Project";
        String context = buildProjectContext(project, projectDto);

        AiTaskGenerationResponseDTO aiResponse = taskGenerationAiService.generateTasksFromProposal(
                projectTitle, context, proposalText);

        if (request.isReplaceExisting()) {
            projectTaskRepository.deleteByCompanyProjectId(projectId);
        }

        List<ProjectTask> entities = mapAiResponseToEntities(projectId, aiResponse);
        if (entities.isEmpty()) {
            throw new RuntimeException("No tasks could be parsed from the AI response");
        }

        List<ProjectTask> saved = projectTaskRepository.saveAll(entities);
        log.info("Saved {} tasks for project {}", saved.size(), projectId);
        return saved.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ProjectTaskDTO updateTask(Long projectId, Long taskId, Long pmUserId, UpdateProjectTaskRequest request) {
        verifyPmAccess(projectId, pmUserId);
        ProjectTask task = projectTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getCompanyProjectId().equals(projectId)) {
            throw new RuntimeException("Task does not belong to this project");
        }

        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        return toDto(projectTaskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long projectId, Long taskId, Long pmUserId) {
        verifyPmAccess(projectId, pmUserId);
        ProjectTask task = projectTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        if (!task.getCompanyProjectId().equals(projectId)) {
            throw new RuntimeException("Task does not belong to this project");
        }

        projectTaskRepository.delete(task);
    }

    public long countTasks(Long projectId) {
        return projectTaskRepository.countByCompanyProjectId(projectId);
    }

    public long countDoneTasks(Long projectId) {
        return projectTaskRepository.countByCompanyProjectIdAndStatus(projectId, TaskStatus.DONE);
    }

    private CompanyProject verifyPmAccess(Long projectId, Long pmUserId) {
        CompanyProject project = companyProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getProjectManager().getId().equals(pmUserId)) {
            throw new RuntimeException("Unauthorized: you are not assigned to this project");
        }
        return project;
    }

    private String buildProjectContext(CompanyProject project, CompanyProjectDTO dto) {
        StringBuilder sb = new StringBuilder();
        if (dto.getProjectDescription() != null && !dto.getProjectDescription().isBlank()) {
            sb.append("Description: ").append(dto.getProjectDescription()).append("\n");
        }
        if (dto.getMainFeatures() != null && !dto.getMainFeatures().isBlank()) {
            sb.append("Main features: ").append(dto.getMainFeatures()).append("\n");
        }
        if (dto.getProjectType() != null) {
            sb.append("Type: ").append(dto.getProjectType()).append("\n");
        }
        if (dto.getDurationDays() != null) {
            sb.append("Target duration (days): ").append(dto.getDurationDays()).append("\n");
        }
        if (dto.getBudgetUsd() != null) {
            sb.append("Budget (USD): ").append(dto.getBudgetUsd()).append("\n");
        }
        if (project.getGuidelines() != null && !project.getGuidelines().isBlank()) {
            sb.append("Guidelines: ").append(project.getGuidelines()).append("\n");
        }
        if (project.getOclRules() != null && !project.getOclRules().isBlank()) {
            sb.append("Compliance/OCL rules apply to delivery.\n");
        }
        return sb.toString().trim();
    }

    private List<ProjectTask> mapAiResponseToEntities(Long projectId, AiTaskGenerationResponseDTO aiResponse) {
        List<ProjectTask> result = new ArrayList<>();
        int sortOrder = 0;

        for (AiGeneratedPhaseDTO phaseDto : aiResponse.getPhases()) {
            if (phaseDto.getTasks() == null) continue;

            ProjectPhase phase = parsePhase(phaseDto.getPhase());
            String phaseMilestone = phaseDto.getMilestone();

            for (AiGeneratedTaskDTO taskDto : phaseDto.getTasks()) {
                if (taskDto.getTitle() == null || taskDto.getTitle().isBlank()) continue;

                ProjectTask task = ProjectTask.builder()
                        .companyProjectId(projectId)
                        .title(taskDto.getTitle().trim())
                        .description(taskDto.getDescription())
                        .priority(parsePriority(taskDto.getPriority()))
                        .estimatedDuration(taskDto.getEstimatedDuration())
                        .suggestedAssignee(taskDto.getSuggestedAssignee())
                        .status(parseStatus(taskDto.getStatus()))
                        .dependenciesJson(serializeDependencies(taskDto.getDependencies()))
                        .milestone(taskDto.getMilestone() != null ? taskDto.getMilestone() : phaseMilestone)
                        .phase(phase)
                        .sortOrder(sortOrder++)
                        .build();

                result.add(task);
            }
        }
        return result;
    }

    private ProjectPhase parsePhase(String value) {
        if (value == null) return ProjectPhase.PLANNING;
        try {
            return ProjectPhase.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Unknown phase '{}', defaulting to PLANNING", value);
            return ProjectPhase.PLANNING;
        }
    }

    private TaskPriority parsePriority(String value) {
        if (value == null) return TaskPriority.MEDIUM;
        try {
            return TaskPriority.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return TaskPriority.MEDIUM;
        }
    }

    private TaskStatus parseStatus(String value) {
        if (value == null) return TaskStatus.TODO;
        try {
            return TaskStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return TaskStatus.TODO;
        }
    }

    private String serializeDependencies(List<String> deps) {
        try {
            return objectMapper.writeValueAsString(deps != null ? deps : Collections.emptyList());
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<String> deserializeDependencies(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }
    }

    private ProjectTaskDTO toDto(ProjectTask entity) {
        return ProjectTaskDTO.builder()
                .id(entity.getId())
                .companyProjectId(entity.getCompanyProjectId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .priority(entity.getPriority())
                .estimatedDuration(entity.getEstimatedDuration())
                .suggestedAssignee(entity.getSuggestedAssignee())
                .status(entity.getStatus())
                .dependencies(deserializeDependencies(entity.getDependenciesJson()))
                .milestone(entity.getMilestone())
                .phase(entity.getPhase())
                .sortOrder(entity.getSortOrder())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
