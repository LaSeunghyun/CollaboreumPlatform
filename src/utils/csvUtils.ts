// CSV 관련 유틸리티 함수들

export interface CsvRow {
    [key: string]: string | number | Date | null;
}

export interface CsvConfig {
    headers: string[];
    filename: string;
    encoding?: string;
    delimiter?: string;
}

// 기본 CSV 설정
const DEFAULT_CSV_CONFIG: Partial<CsvConfig> = {
    encoding: 'utf-8',
    delimiter: ','
};

// CSV 행을 문자열로 변환
export const rowToCsvString = (
    row: CsvRow,
    headers: string[],
    delimiter: string = ','
): string => {
    return headers
        .map(header => {
            const value = row[header];
            if (value === null || value === undefined) {
                return '""';
            }

            let stringValue = String(value);

            // 날짜인 경우 한국어 형식으로 변환
            if (value instanceof Date) {
                stringValue = value.toLocaleDateString('ko-KR');
            }

            // 숫자인 경우 천 단위 구분자 추가
            if (typeof value === 'number') {
                stringValue = value.toLocaleString('ko-KR');
            }

            // 쉼표나 따옴표가 포함된 경우 따옴표로 감싸기
            if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
                stringValue = `"${stringValue.replace(/"/g, '""')}"`;
            }

            return stringValue;
        })
        .join(delimiter);
};

// CSV 데이터 생성
export const generateCsv = (
    data: CsvRow[],
    headers: string[],
    delimiter: string = ','
): string => {
    if (!data || data.length === 0) {
        return headers.join(delimiter);
    }

    const csvRows = [
        headers.join(delimiter),
        ...data.map(row => rowToCsvString(row, headers, delimiter))
    ];

    return csvRows.join('\n');
};

// CSV 파일 다운로드
export const downloadCsv = (
    csvContent: string,
    filename: string,
    encoding: string = 'utf-8'
): void => {
    try {
        // BOM 추가 (한글 깨짐 방지)
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], {
            type: `text/csv;charset=${encoding}`
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 메모리 해제
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('CSV 다운로드 중 오류 발생:', error);
        throw new Error('CSV 파일 다운로드에 실패했습니다.');
    }
};

// 수익 분배 CSV 생성
export const generateRevenueDistributionCsv = (
    distributions: any[],
    projectId: string
): string => {
    const headers = ['후원자', '원금', '수익 배분', '총 반환금', '상태', '분배일'];

    const csvData = distributions.map(d => ({
        '후원자': d.userName || '',
        '원금': d.originalAmount || 0,
        '수익 배분': d.profitShare || 0,
        '총 반환금': d.totalReturn || 0,
        '상태': d.status || '',
        '분배일': d.distributedAt ? new Date(d.distributedAt) : null
    }));

    return generateCsv(csvData, headers);
};

// 비용 기록 CSV 생성
export const generateExpenseRecordsCsv = (
    expenses: any[],
    projectId: string
): string => {
    const headers = ['카테고리', '제목', '설명', '금액', '날짜', '단계', '검증상태'];

    const csvData = expenses.map(expense => ({
        '카테고리': expense.category || '',
        '제목': expense.title || '',
        '설명': expense.description || '',
        '금액': expense.amount || 0,
        '날짜': expense.date ? new Date(expense.date) : null,
        '단계': expense.stage?.title || '',
        '검증상태': expense.verified ? '검증완료' : '미검증'
    }));

    return generateCsv(csvData, headers);
};

// 프로젝트 진행 CSV 생성
export const generateProjectProgressCsv = (
    stages: any[],
    projectId: string
): string => {
    const headers = ['단계', '제목', '설명', '진행률', '상태', '완료일'];

    const csvData = stages.map(stage => ({
        '단계': stage.order || '',
        '제목': stage.title || '',
        '설명': stage.description || '',
        '진행률': stage.progress || 0,
        '상태': stage.status || '',
        '완료일': stage.completedAt ? new Date(stage.completedAt) : null
    }));

    return generateCsv(csvData, headers);
};

// 사용자 활동 CSV 생성
export const generateUserActivityCsv = (
    activities: any[],
    userId: string
): string => {
    const headers = ['활동유형', '제목', '설명', '날짜', '상태', '금액'];

    const csvData = activities.map(activity => ({
        '활동유형': activity.type || '',
        '제목': activity.title || '',
        '설명': activity.description || '',
        '날짜': activity.date ? new Date(activity.date) : null,
        '상태': activity.status || '',
        '금액': activity.amount || 0
    }));

    return generateCsv(csvData, headers);
};

// 이벤트 참가자 CSV 생성
export const generateEventAttendeesCsv = (
    attendees: any[],
    eventId: string
): string => {
    const headers = ['이름', '이메일', '티켓타입', '등록일', '참석상태'];

    const csvData = attendees.map(attendee => ({
        '이름': attendee.userName || '',
        '이메일': attendee.email || '',
        '티켓타입': attendee.ticketType || '',
        '등록일': attendee.registeredAt ? new Date(attendee.registeredAt) : null,
        '참석상태': attendee.status || ''
    }));

    return generateCsv(csvData, headers);
};

// CSV 파일 미리보기 (첫 5행)
export const previewCsv = (
    csvContent: string,
    maxRows: number = 5
): string => {
    const lines = csvContent.split('\n');
    const previewLines = (Array.isArray(lines) ? lines : []).slice(0, maxRows + 1); // 헤더 + 데이터

    return previewLines.join('\n');
};

// CSV 데이터 검증
export const validateCsvData = (
    data: CsvRow[],
    headers: string[]
): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data || data.length === 0) {
        errors.push('데이터가 비어있습니다.');
        return { isValid: false, errors };
    }

    if (!headers || headers.length === 0) {
        errors.push('헤더가 정의되지 않았습니다.');
        return { isValid: false, errors };
    }

    // 각 행의 필수 필드 검증
    data.forEach((row, index) => {
        headers.forEach(header => {
            if (row[header] === undefined) {
                errors.push(`행 ${index + 1}: 필수 필드 '${header}'가 누락되었습니다.`);
            }
        });
    });

    return {
        isValid: errors.length === 0,
        errors
    };
};

// CSV 파일명 생성 (타임스탬프 포함)
export const generateCsvFilename = (
    baseName: string,
    projectId?: string
): string => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const projectSuffix = projectId ? `_${projectId}` : '';

    return `${baseName}${projectSuffix}_${timestamp}.csv`;
};
