import React from "react";
import { Button } from "@/shared/ui/Button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface ProjectPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    showPageNumbers?: boolean;
    maxVisiblePages?: number;
}

const ProjectPagination: React.FC<ProjectPaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    showPageNumbers = true,
    maxVisiblePages = 5
}) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const getVisiblePages = () => {
        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const half = Math.floor(maxVisiblePages / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisiblePages - 1);

        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        const pages = [];
        
        // 첫 페이지
        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push('ellipsis-start');
            }
        }

        // 중간 페이지들
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // 마지막 페이지
        if (end < totalPages) {
            if (end < totalPages - 1) {
                pages.push('ellipsis-end');
            }
            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) {
        return null;
    }

    const visiblePages = getVisiblePages();

    return (
        <div className="mt-8 flex items-center justify-center space-x-1">
            {/* 이전 버튼 */}
            <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
            >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">이전</span>
            </Button>

            {/* 페이지 번호들 */}
            {showPageNumbers && (
                <div className="flex items-center space-x-1">
                    {visiblePages.map((page, index) => {
                        if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                            return (
                                <div
                                    key={`ellipsis-${index}`}
                                    className="flex items-center justify-center w-8 h-8"
                                >
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground/70" />
                                </div>
                            );
                        }

                        const pageNumber = page as number;
                        const isCurrentPage = pageNumber === currentPage;

                        return (
                            <Button
                                key={pageNumber}
                                variant={isCurrentPage ? "solid" : "outline"}
                                size="sm"
                                onClick={() => handlePageClick(pageNumber)}
                                className="h-8 w-8 p-0"
                                aria-current={isCurrentPage ? "page" : undefined}
                                aria-pressed={isCurrentPage}
                            >
                                {pageNumber}
                            </Button>
                        );
                    })}
                </div>
            )}

            {/* 다음 버튼 */}
            <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
            >
                <span className="hidden sm:inline">다음</span>
                <ChevronRight className="w-4 h-4" />
            </Button>

            {/* 페이지 정보 */}
            <div className="ml-4 hidden text-sm text-muted-foreground sm:block">
                {currentPage} / {totalPages} 페이지
            </div>
        </div>
    );
};

export default ProjectPagination;
