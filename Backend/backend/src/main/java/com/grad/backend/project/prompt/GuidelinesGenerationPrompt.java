package com.grad.backend.project.prompt;

/**
 * Prompts for AI-generated PM guidelines and project summary (SRS/SDD workspace).
 */
public final class GuidelinesGenerationPrompt {

    private GuidelinesGenerationPrompt() {}

    public static final String SYSTEM_INSTRUCTION = """
            You are a senior software architect and technical project manager.
            You help project managers create Software Requirements Specifications (SRS) and
            Software Design Documents (SDD) that comply with contract obligations and OCL constraints.

            Rules:
            - Output ONLY valid JSON. No markdown code fences, no commentary outside JSON.
            - projectSummary: 2–4 paragraphs in Markdown describing scope, objectives, stakeholders,
              key deliverables, timeline considerations, and success criteria for this software project.
            - guidelines: Detailed Markdown for the PM covering SRS/SDD authoring, including:
              * Document structure recommendations (sections to include)
              * How to align requirements with OCL/contract constraints
              * Technical stack and integration notes when inferable
              * Compliance, security, and testing expectations
              * Review checkpoints and approval workflow hints
            - Be specific to the project data provided; do not use generic filler.
            - If OCL rules are missing, still produce guidelines based on proposal and contract context.
            - Use professional tone suitable for enterprise software delivery.
            """;

    public static String buildUserPrompt(
            String projectTitle,
            String projectDescription,
            String mainFeatures,
            String projectType,
            Integer durationDays,
            Object budgetUsd,
            String clientName,
            String contractName,
            String oclRules,
            String existingGuidelines) {

        return """
                Generate a project summary and PM guidelines for technical documentation (SRS/SDD).

                Project title: %s
                Project type: %s
                Client: %s
                Contract: %s
                Duration (days): %s
                Budget (USD): %s

                Project description:
                %s

                Main features:
                %s

                OCL constraints (contract policy rules):
                %s

                Existing guidelines (if any — improve and expand, do not repeat verbatim):
                %s

                Return JSON with exactly this shape:
                {
                  "projectSummary": "markdown string",
                  "guidelines": "markdown string"
                }
                """.formatted(
                nullTo(projectTitle, "Software Project"),
                nullTo(projectType, "Not specified"),
                nullTo(clientName, "Not specified"),
                nullTo(contractName, "Main contract"),
                durationDays != null ? durationDays.toString() : "Not specified",
                budgetUsd != null ? budgetUsd.toString() : "Not specified",
                nullTo(projectDescription, "No description provided."),
                nullTo(mainFeatures, "Not specified."),
                nullTo(oclRules, "No OCL rules provided yet."),
                nullTo(existingGuidelines, "None.")
        );
    }

    private static String nullTo(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
