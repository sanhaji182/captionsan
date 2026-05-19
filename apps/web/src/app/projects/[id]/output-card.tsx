'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface PlatformOutput {
  id: string;
  generationId: string;
  platform: string;
  tone: string;
  targetLength: number | null;
  characterCount: number;
  contentOriginalAi: string;
  contentCurrent: string;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface OutputCardProps {
  output: PlatformOutput;
  platformLabel: string;
  onUpdated: () => void;
}

export function OutputCard({ output, platformLabel, onUpdated }: OutputCardProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(output.contentCurrent);
  const [revisionInstruction, setRevisionInstruction] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output.contentCurrent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    await apiFetch(`/api/outputs/${output.id}/edit`, {
      method: 'PUT',
      body: JSON.stringify({ content: editContent }),
    });
    setEditing(false);
    setLoading(false);
    onUpdated();
  };

  const handleRevise = async () => {
    if (!revisionInstruction.trim()) return;
    setLoading(true);
    await apiFetch(`/api/outputs/${output.id}/revise`, {
      method: 'POST',
      body: JSON.stringify({ instruction: revisionInstruction }),
    });
    setRevisionInstruction('');
    setShowRevisionForm(false);
    setLoading(false);
    onUpdated();
  };

  const handleApprove = async () => {
    setLoading(true);
    await apiFetch(`/api/outputs/${output.id}/approve`, {
      method: 'POST',
    });
    setLoading(false);
    onUpdated();
  };

  const isApproved = output.approvalStatus === 'approved';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{platformLabel}</h3>
          <span className="text-xs text-gray-400">{output.characterCount} karakter</span>
          {isApproved && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
              Disetujui
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {showOriginal ? 'Sembunyikan Asli' : 'Lihat Asli'}
          </button>
          <button
            onClick={handleCopy}
            className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {copied ? '✓ Disalin' : 'Salin'}
          </button>
        </div>
      </div>

      {/* Show original AI output for comparison */}
      {showOriginal && output.contentOriginalAi !== output.contentCurrent && (
        <div className="mb-3 rounded bg-gray-50 p-3 border border-gray-100">
          <p className="text-xs font-medium text-gray-400 mb-1">Output AI Asli</p>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {output.contentOriginalAi}
          </p>
        </div>
      )}

      {/* Current content */}
      {editing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-y"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              disabled={loading}
              className="rounded bg-gray-900 px-3 py-1 text-xs text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setEditContent(output.contentCurrent);
              }}
              className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm mb-3">{output.contentCurrent}</p>
      )}

      {/* Revision form */}
      {showRevisionForm && !editing && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <textarea
            value={revisionInstruction}
            onChange={(e) => setRevisionInstruction(e.target.value)}
            rows={2}
            placeholder="Tulis instruksi revisi... (contoh: buat lebih singkat, tambah emoji, ubah tone jadi lebih formal)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 resize-y"
          />
          <div className="flex gap-2">
            <button
              onClick={handleRevise}
              disabled={loading || !revisionInstruction.trim()}
              className="rounded bg-gray-900 px-3 py-1 text-xs text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Merevisi...' : 'Revisi dengan AI'}
            </button>
            <button
              onClick={() => setShowRevisionForm(false)}
              className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!editing && !showRevisionForm && !isApproved && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => setEditing(true)}
            className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 transition-colors"
          >
            Edit Manual
          </button>
          <button
            onClick={() => setShowRevisionForm(true)}
            className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 transition-colors"
          >
            Revisi AI
          </button>
          <button
            onClick={handleApprove}
            disabled={loading}
            className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Setujui
          </button>
        </div>
      )}
    </div>
  );
}
