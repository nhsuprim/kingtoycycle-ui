import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionCardProps {
    title: string;
    onExport?: () => void;
    children: React.ReactNode;
}

const SectionCard = ({ title, onExport, children }: SectionCardProps) => {
    return (
        <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-neutral-900">
                    {title}
                </h2>
                {onExport && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onExport}
                        className="gap-1.5"
                    >
                        <Download className="h-3.5 w-3.5" />
                        CSV
                    </Button>
                )}
            </div>
            <div className="mt-3">{children}</div>
        </div>
    );
};

export default SectionCard;
