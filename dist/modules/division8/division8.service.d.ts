export declare class Division8Service {
    listAgencies(status?: string): Promise<{
        agencyId: any;
        name: any;
        agencyType: any;
        department: any;
        naicsCodes: any;
        status: any;
        notes: any;
        contacts: any;
        interactions: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    getAgency(agencyId: string): Promise<{
        agencyId: any;
        name: any;
        agencyType: any;
        department: any;
        naicsCodes: any;
        status: any;
        notes: any;
        contacts: any;
        interactions: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    createAgency(data: {
        name: string;
        agencyType?: string;
        department?: string;
        naicsCodes?: string[];
        notes?: string;
    }): Promise<{
        agencyId: any;
        name: any;
        agencyType: any;
        department: any;
        naicsCodes: any;
        status: any;
        notes: any;
        contacts: any;
        interactions: any;
        createdAt: any;
        updatedAt: any;
    }>;
    updateAgency(agencyId: string, data: Partial<{
        name: string;
        agencyType: string;
        department: string;
        naicsCodes: string[];
        status: string;
        notes: string;
    }>): Promise<{
        agencyId: any;
        name: any;
        agencyType: any;
        department: any;
        naicsCodes: any;
        status: any;
        notes: any;
        contacts: any;
        interactions: any;
        createdAt: any;
        updatedAt: any;
    }>;
    addContact(agencyId: string, data: {
        name: string;
        title?: string;
        email?: string;
        phone?: string;
        role?: string;
        notes?: string;
    }): Promise<{
        contactId: any;
        agencyId: any;
        name: any;
        title: any;
        email: any;
        phone: any;
        role: any;
        notes: any;
        createdAt: any;
    }>;
    deleteContact(contactId: string): Promise<void>;
    addInteraction(agencyId: string, data: {
        type: string;
        summary: string;
        contractRef?: string;
        bidRef?: string;
    }): Promise<{
        interactionId: any;
        agencyId: any;
        type: any;
        contractRef: any;
        bidRef: any;
        summary: any;
        createdAt: any;
    }>;
    agencySummary(): Promise<{
        totalAgencies: number;
        federal: number;
        tribal: number;
        contacts: number;
        interactions: number;
    }>;
    contactRoles(): string[];
    interactionTypes(): string[];
}
export declare const division8Service: Division8Service;
//# sourceMappingURL=division8.service.d.ts.map