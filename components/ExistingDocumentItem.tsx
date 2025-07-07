
import React from 'react';
import { Calendar, DollarSign, Wrench, Camera, AlertTriangle, CheckCircle, Link, File, Eye, Trash2 } from 'lucide-react';
import { AssignmentReport } from '@/lib/types/claims'
import { Button } from './ui/button';
import { useLanguage } from '@/lib/language-context';

const STORAGES_URL = process.env.NEXT_PUBLIC_APP_WEB_URL + "storage/";
const { t } = useLanguage();
// Document item component for existing documents
const ExistingDocumentItem = ({ document, onRemove }: { document: any, onRemove: (id: string) => void }) => {
    const getDocumentIcon = (type: string) => {
        switch (type) {
            case "driver_license":
                return "📄";
            case "vehicle_registration":
                return "🚗";
            case "accident_scene":
            case "vehicle_damage":
                return "📸";
            case "police_report":
                return "👮";
            case "witness_statement":
                return "📝";
            default:
                return "📎";
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
                <span className="text-2xl">{getDocumentIcon(document.type)}</span>
                <div>
                    <p className="font-medium text-sm">{document.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                        {t(`documents.${document.type}`)} • {document.file_size ? formatFileSize(document.file_size) : 'Unknown size'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {t("documents.uploaded")}: {new Date(document.uploaded_at).toLocaleDateString()}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {document.file_url && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(document.file_url, '_blank')}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                )}
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemove(document.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
export default ExistingDocumentItem;