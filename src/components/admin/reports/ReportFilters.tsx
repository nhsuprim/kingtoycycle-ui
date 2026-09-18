"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ReportFiltersProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (v: string) => void;
    onEndDateChange: (v: string) => void;
    onClear: () => void;
}

const ReportFilters = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onClear,
}: ReportFiltersProps) => {
    const hasFilter = Boolean(startDate || endDate);

    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1 space-y-1.5">
                <Label htmlFor="startDate" className="text-xs">
                    Start Date
                </Label>
                <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                />
            </div>
            <div className="flex-1 space-y-1.5">
                <Label htmlFor="endDate" className="text-xs">
                    End Date
                </Label>
                <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                />
            </div>
            {hasFilter && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="gap-1"
                >
                    <X className="h-3.5 w-3.5" />
                    Clear
                </Button>
            )}
        </div>
    );
};

export default ReportFilters;
