export type DocumentStatus = 'uploading' | 'processing' | 'indexed' | 'failed';
export interface KnowledgeDocument {
    id: string;
    organization_id: string;
    uploaded_by: string;
    name: string;
    file_type: string;
    file_size?: number;
    storage_path?: string;
    status: DocumentStatus;
    chunk_count: number;
    pinecone_namespace?: string;
    error_message?: string;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}
export interface UploadDocumentDto {
    name: string;
    file_type: string;
    file_size?: number;
}
export interface VectorSearchResult {
    id: string;
    score: number;
    text: string;
    metadata: {
        document_id: string;
        document_name: string;
        chunk_index: number;
        organization_id: string;
    };
}
export declare const SUPPORTED_FILE_TYPES: readonly ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/html", "text/csv", "application/json"];
export declare const MAX_FILE_SIZE_MB = 50;
