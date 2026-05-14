import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  itemName?: string;
  confirmLabel?: string;
}

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  confirmLabel = 'Xóa',
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className="p-0 overflow-hidden border-0 shadow-2xl"
        style={{
          background: '#fff',
          borderRadius: '16px',
          maxWidth: '560px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(220,38,38,0.08)',
        }}
      >
        {/* Red top accent bar */}
        <div
          style={{
            height: '4px',
            background: 'linear-gradient(90deg, #dc2626, #ef4444)',
            borderRadius: '16px 16px 0 0',
          }}
        />

        {/* Header */}
        <AlertDialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-start gap-4">
            <div
              className="flex-shrink-0 flex items-center justify-center rounded-full"
              style={{
                width: 44,
                height: 44,
                background: 'rgba(220,38,38,0.08)',
                border: '1.5px solid rgba(220,38,38,0.18)',
              }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: '#dc2626' }} />
            </div>

            <div className="flex-1 min-w-0">
              <AlertDialogTitle
                className="text-base font-bold leading-snug"
                style={{ color: '#111827' }}
              >
                {title}
              </AlertDialogTitle>

              <AlertDialogDescription
                className="mt-1.5 text-sm leading-relaxed"
                style={{ color: '#6b7280' }}
              >
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {/* Item name box — wrap text, không truncate */}
        {itemName && (
          <div className="mx-6 mt-4">
            <div
              style={{
                background: 'hsl(220,15%,96%)',
                border: '1px solid hsl(220,15%,87%)',
                borderRadius: '0.5rem',
                padding: '0.625rem 0.875rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
              }}
            >
              <Trash2 style={{ width: 14, height: 14, flexShrink: 0, color: '#9ca3af', marginTop: 2 }} />
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  wordBreak: 'break-word',
                  lineHeight: 1.5,
                }}
              >
                {itemName}
              </span>
            </div>
          </div>
        )}

        {/* Warning note */}
        <div className="mx-6 mt-3">
          <p className="text-xs flex items-center gap-1.5" style={{ color: '#ef4444' }}>
            <span>⚠️</span>
            Hành động này không thể hoàn tác.
          </p>
        </div>

        {/* Divider */}
        <div className="mt-5" style={{ height: '1px', background: 'hsl(220,15%,90%)' }} />

        {/* Footer */}
        <AlertDialogFooter
          className="px-6 py-4 flex justify-end gap-3"
          style={{ background: 'hsl(220,15%,97%)' }}
        >
          <AlertDialogCancel
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all border"
            style={{
              background: '#ffffff',
              borderColor: 'hsl(220,15%,82%)',
              color: '#374151',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'hsl(220,15%,92%)';
              (e.currentTarget as HTMLButtonElement).style.color = '#111827';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
              (e.currentTarget as HTMLButtonElement).style.color = '#374151';
            }}
          >
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              boxShadow: '0 2px 8px rgba(220,38,38,0.35)',
              border: 'none',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #b91c1c, #991b1b)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(220,38,38,0.45)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(220,38,38,0.35)';
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}