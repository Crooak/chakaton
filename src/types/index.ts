export type FindingStatus =
  | 'CANDIDATE'
  | 'CONFIRMED_VIOLATION'
  | 'NEGATIVE_VERIFIED'
  | 'MISSING_EVIDENCE'
  | 'NOT_APPLICABLE'
  | 'NOT_COMPARABLE'
  | 'CLARIFICATION_REQUIRED'
  | 'SUSPICION';

export type ProcessStatus =
  | 'PENDING'
  | 'PARSING'
  | 'READY'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FINALIZED';

export type DocStage = 'PD' | 'RD' | 'ID';

export type ApprovalStatus =
  | 'DRAFT'
  | 'APPROVED'
  | 'FOR_CONSTRUCTION'
  | 'SUPERSEDED'
  | 'CANCELLED';

export type ReviewPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type ReasonCode =
  | 'WRONG_REVISION'
  | 'APPROVED_CHANGE'
  | 'OCR_ERROR'
  | 'BINDING_ERROR'
  | 'NOT_APPLICABLE'
  | 'OTHER';

export type ColorIndicator = 'green' | 'yellow' | 'red';
export type CompletenessStatus = 'full' | 'partial' | 'missing';

export interface EvidenceFragment {
  fileId: string;
  sha256: string;
  stage: DocStage;
  documentCode: string;
  revision: string;
  approvalStatus: ApprovalStatus;
  sheetPage: number;
  bbox: [number, number, number, number];
  extractedValue: string;
  role: 'expected' | 'actual';
}

export interface Finding {
  id: string;
  code: string;
  section: string;
  parameterName: string;
  expected: string;
  actual: string;
  delta: string;
  sources: DocStage[];
  priority: ReviewPriority;
  status: FindingStatus;
  evidence?: EvidenceFragment[];
  aiRationale?: string | null;
  normReference?: string | null;
  approvedChange?: string | null;
  triggerDescription?: string | null;
  detectionMethod?: string;
  confidenceScore?: number;
}

export interface DocumentFile {
  id: string;
  name: string;
  format: 'PDF' | 'DOCX' | 'XML';
  size: string;
  sizeMb: number;
  stage: DocStage;
  section: string;
  documentCode: string;
  revision: string;
  approvalStatus: ApprovalStatus;
  sheets: number;
  sha256: string;
}

export interface InspectionObject {
  id: string;
  name: string;
  address: string;
  developer: string;
  contractor: string;
  permitNumber: string;
  processStatus: ProcessStatus;
  pdComplete: CompletenessStatus;
  rdComplete: CompletenessStatus;
  idComplete: CompletenessStatus;
  candidatesCount: number;
  confirmedCount: number;
  updatedAt: string;
  colorIndicator: ColorIndicator;
  pdFileCount: number;
  rdFileCount: number;
  idFileCount: number;
  rdTotalExpected?: number;
  pdTotalExpected?: number;
}

export interface Protocol {
  id: string;
  number: string;
  objectId: string;
  createdAt: string;
  processStatus: ProcessStatus;
  matrixVersion: string;
  modelVersion: string;
  datasetVersion: string;
  inputHash: string;
  totalParameters: number;
  candidatesCount: number;
  confirmedCount: number;
  negativeVerifiedCount: number;
  missingEvidenceCount: number;
  notApplicableCount: number;
  notComparableCount: number;
  suspicionCount: number;
  clarificationCount: number;
  findings: Finding[];
}

export interface DecisionPayload {
  findingId: string;
  verdict: 'CONFIRMED_VIOLATION' | 'NEGATIVE_VERIFIED' | 'CLARIFICATION_REQUIRED';
  reasonCode?: ReasonCode;
  comment?: string;
}

export const STATUS_LABELS: Record<FindingStatus, string> = {
  CANDIDATE: 'Кандидат',
  CONFIRMED_VIOLATION: 'Нарушение подтверждено',
  NEGATIVE_VERIFIED: 'Проверено, расхождений нет',
  MISSING_EVIDENCE: 'Нет доказательства',
  NOT_APPLICABLE: 'Неприменимо',
  NOT_COMPARABLE: 'Нельзя сопоставить',
  CLARIFICATION_REQUIRED: 'Требует уточнения',
  SUSPICION: 'Гипотеза',
};

export const PROCESS_STATUS_LABELS: Record<ProcessStatus, string> = {
  PENDING: 'Ожидает загрузки',
  PARSING: 'Обработка',
  READY: 'Готов к проверке',
  VERIFYING: 'На верификации',
  COMPLETED: 'Проверка завершена',
  FINALIZED: 'Финализирован',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  DRAFT: 'Черновик',
  APPROVED: 'Утверждён',
  FOR_CONSTRUCTION: 'В производство',
  SUPERSEDED: 'Устаревший',
  CANCELLED: 'Аннулирован',
};

export const REASON_CODE_LABELS: Record<ReasonCode, string> = {
  WRONG_REVISION: 'Актуальная редакция выбрана неверно',
  APPROVED_CHANGE: 'Есть согласованное изменение',
  OCR_ERROR: 'Ошибка OCR',
  BINDING_ERROR: 'Ошибка привязки',
  NOT_APPLICABLE: 'Параметр неприменим',
  OTHER: 'Иное (укажите)',
};

export const DOC_STAGE_LABELS: Record<DocStage, string> = {
  PD: 'ПД',
  RD: 'РД',
  ID: 'ИД',
};
