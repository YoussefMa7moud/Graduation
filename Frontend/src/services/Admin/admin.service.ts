import api from '../api';

export interface AdminDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
}

export interface CreateAdminRequest {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
}

const adminService = {
    getAllAdmins: async (): Promise<AdminDto[]> => {
        const response = await api.get('/api/admin/admins');
        return response.data;
    },

    createAdmin: async (data: CreateAdminRequest): Promise<AdminDto> => {
        const response = await api.post('/api/admin/admins', data);
        return response.data;
    },

    deleteAdmin: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/admins/${id}`);
    },

    getAllCompanies: async (): Promise<any[]> => {
        const response = await api.get('/api/admin/companies');
        return response.data;
    },

    getAllEmployees: async (): Promise<any[]> => {
        const response = await api.get('/api/admin/employees');
        return response.data;
    },

    getAllClientPersons: async (): Promise<any[]> => {
        const response = await api.get('/api/admin/clients/persons');
        return response.data;
    },

    getAllClientCompanies: async (): Promise<any[]> => {
        const response = await api.get('/api/admin/clients/companies');
        return response.data;
    },

    getAllProjects: async (): Promise<any[]> => {
        const response = await api.get('/api/admin/projects');
        return response.data;
    }
};

export default adminService;
