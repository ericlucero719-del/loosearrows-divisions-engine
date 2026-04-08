export declare class Division6Service {
    docTypes(): string[];
    listDocs(docType?: string, status?: string): Promise<{
        docId: any;
        docRef: any;
        docType: any;
        title: any;
        issuer: any;
        identifier: any;
        status: any;
        issuedDate: any;
        expiryDate: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    getDoc(docId: string): Promise<{
        docId: any;
        docRef: any;
        docType: any;
        title: any;
        issuer: any;
        identifier: any;
        status: any;
        issuedDate: any;
        expiryDate: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    createDoc(data: {
        docType: string;
        title: string;
        issuer?: string;
        identifier?: string;
        issuedDate?: string;
        expiryDate?: string;
        notes?: string;
    }): Promise<{
        docId: any;
        docRef: any;
        docType: any;
        title: any;
        issuer: any;
        identifier: any;
        status: any;
        issuedDate: any;
        expiryDate: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    updateDoc(docId: string, data: Partial<{
        title: string;
        issuer: string;
        identifier: string;
        status: string;
        issuedDate: string;
        expiryDate: string;
        notes: string;
    }>): Promise<{
        docId: any;
        docRef: any;
        docType: any;
        title: any;
        issuer: any;
        identifier: any;
        status: any;
        issuedDate: any;
        expiryDate: any;
        notes: any;
        createdAt: any;
        updatedAt: any;
    }>;
    deleteDoc(docId: string): Promise<void>;
    complianceStatus(): Promise<{
        complianceScore: string;
        totalDocs: number;
        active: number;
        missingTypes: string[];
        expiringIn30Days: {
            docId: any;
            docRef: any;
            docType: any;
            title: any;
            issuer: any;
            identifier: any;
            status: any;
            issuedDate: any;
            expiryDate: any;
            notes: any;
            createdAt: any;
            updatedAt: any;
        }[];
        expired: {
            docId: any;
            docRef: any;
            docType: any;
            title: any;
            issuer: any;
            identifier: any;
            status: any;
            issuedDate: any;
            expiryDate: any;
            notes: any;
            createdAt: any;
            updatedAt: any;
        }[];
    }>;
    generateCapabilityStatement(data: {
        companyName: string;
        cageCode?: string;
        dunsUei?: string;
        naicsCodes?: string[];
        setAsides?: string[];
        coreCompetencies?: string[];
        pastPerformance?: Array<{
            agency: string;
            value: string;
            description: string;
        }>;
        contactName?: string;
        contactEmail?: string;
        contactPhone?: string;
    }): Promise<{
        generated: string;
        document: {
            title: string;
            companyName: string;
            cageCode: string;
            uei: string;
            naicsCodes: string[];
            setAsides: string[];
            coreCompetencies: string[];
            pastPerformance: {
                agency: string;
                value: string;
                description: string;
            }[];
            contact: {
                name: string;
                email: string;
                phone: string;
            };
            footer: string;
        };
    }>;
}
export declare const division6Service: Division6Service;
//# sourceMappingURL=division6.service.d.ts.map