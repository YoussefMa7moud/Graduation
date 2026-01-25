
const mockProposals = [
    { id: 1, projectTitle: "Project Alpha Revamp", clientName: "Vertex Corp", budgetUsd: 5000, durationDays: 30 },
    { id: 2, projectTitle: "Beta Integration API", clientName: "Skyline LLC", budgetUsd: 12000, durationDays: 60 }
];

const mockActiveProjects = [
    { id: 101, projectTitle: "Tech Infra Alpha", projectType: "Web App", status: "Active" },
    { id: 102, projectTitle: "Cairo Plaza Lease", projectType: "Legal System", status: "Active" }
];

export const PMService = {
    getPendingProposals: async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockProposals;
    },

    getActiveProjects: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockActiveProjects;
    },

    updateStatus: async (id: number, status: string) => {
        console.log(`Proposal ${id} updated to ${status}`);
        return { success: true };
    }
};