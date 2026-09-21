"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import StatusBadge from "@/components/admin/order/StatusBadge";

interface Option {
    label: string;
    value: string;
    colorClasses: string;
}

interface InlineStatusSelectProps {
    value: string;
    options: Option[];
    onValueChange: (value: string) => void;
}

const InlineStatusSelect = ({
    value,
    options,
    onValueChange,
}: InlineStatusSelectProps) => {
    const activeOption = options.find((o) => o.value === value);

    return (
        <Select
            items={options.map((o) => ({ label: o.label, value: o.value }))}
            value={value}
            onValueChange={(v) => v && onValueChange(v)}
        >
            <SelectTrigger className="h-auto border-none bg-transparent p-0 shadow-none hover:opacity-80 [&>svg]:hidden">
                {activeOption && (
                    <StatusBadge
                        label={activeOption.label}
                        colorClasses={activeOption.colorClasses}
                    />
                )}
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default InlineStatusSelect;
