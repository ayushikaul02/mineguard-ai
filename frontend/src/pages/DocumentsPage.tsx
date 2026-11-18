import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileCheck,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Edit2
} from 'lucide-react';
import { DocumentItem, Mine } from '../types';
import {
  getDocumentsApi,
  uploadDocumentApi,
  convertDocumentApi,
  getMinesApi
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [mines, setMines] = useState<Mine[]>([]);
  const [loading, setLoading] = useState(true);

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mineId, setMineId] = useState<number>(1);
  const [uploading, setUploading] = useState(false);
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const data = await getDocumentsApi();
      setDocuments(data);
      if (data.length > 0 && !activeDoc) {
        setActiveDoc(data[0]);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    getMinesApi().then(setMines).catch(console.error);
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a statutory document file to upload');
      return;
    }
    setUploading(true);
    setStatusMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mine_id', mineId.toString());

      const newDoc = await uploadDocumentApi(formData);
      setSelectedFile(null);
      setActiveDoc(newDoc);
      setStatusMessage(`Document ${newDoc.document_id} uploaded & parsed via ${newDoc.ocr_status}!`);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleConvert = async (targetType: 'Compliance' | 'Violation') => {
    if (!activeDoc) return;
    try {
      const res = await convertDocumentApi(activeDoc.id, targetType);
      setStatusMessage(res.message);
      fetchDocuments();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to convert document');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Statutory Document Digitization (OCR & Parser)
          </h3>
          <p className="text-xs text-slate-500">
            Automated text extraction from DGMS inspection sheets, environmental certificates, and statutory records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Engine: Tesseract OCR + Heuristic Parser
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)} className="font-bold hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Upload and Document Viewer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Form & Document List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upload Card */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Upload Statutory Document
            </h4>

            <form onSubmit={handleFileUpload} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mine Leasehold</label>
                <select
                  value={mineId}
                  onChange={(e) => setMineId(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
                >
                  {mines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  File (PDF, PNG, JPG, TXT)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.csv"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 file:cursor-pointer cursor-pointer border border-slate-200 rounded-md p-1"
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Extracting OCR Text...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Upload & Extract Statutory Entities
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Uploaded Documents List */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Digitized Archive ({documents.length})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">SQLite Repository</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                    activeDoc?.id === doc.id ? 'bg-amber-50/50 border-l-3 border-amber-500 font-medium' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-800">{doc.document_id}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                      {doc.ocr_status}
                    </span>
                  </div>
                  <p className="text-slate-700 font-semibold truncate">{doc.filename}</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>{doc.mine_name || `Mine #${doc.mine_id}`}</span>
                    <span>{new Date(doc.upload_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: OCR Text & Extracted Structured Entities (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
          {activeDoc ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-amber-600">{activeDoc.document_id}</span>
                  <h3 className="text-base font-bold text-slate-900">{activeDoc.filename}</h3>
                  <p className="text-xs text-slate-500">
                    Uploaded by <b>{activeDoc.uploaded_by}</b> on {new Date(activeDoc.upload_date).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                    Format: {activeDoc.file_type}
                  </span>
                </div>
              </div>

              {/* Extracted Structured Entities */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Identified Statutory Fields
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Document Type:</span>
                    <span className="font-bold text-slate-800">
                      {activeDoc.extracted_fields?.document_type || 'Statutory Inspection Record'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Detected Mine:</span>
                    <span className="font-bold text-slate-800">
                      {activeDoc.extracted_fields?.detected_mine || activeDoc.mine_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Statutory Domain:</span>
                    <span className="font-bold text-slate-800">
                      {activeDoc.extracted_fields?.domain || 'Safety'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Compliance Status:</span>
                    <span
                      className={`font-black ${
                        activeDoc.extracted_fields?.compliance_status === 'Non-Compliant'
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {activeDoc.extracted_fields?.compliance_status || 'Compliant'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Certifying Authority / Inspector:</span>
                    <span className="font-semibold text-slate-700">
                      {activeDoc.extracted_fields?.certifying_inspector || 'DGMS Inspector'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Inspection Date:</span>
                    <span className="font-mono text-slate-700">
                      {activeDoc.extracted_fields?.inspection_date || '2026-11-15'}
                    </span>
                  </div>
                </div>

                {/* Key Observations */}
                {activeDoc.extracted_fields?.key_observations && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">Key Observations:</span>
                    <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5">
                      {activeDoc.extracted_fields.key_observations.map((obs: string, idx: number) => (
                        <li key={idx}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Raw OCR Text Box */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Extracted Raw Text:
                </span>
                <textarea
                  readOnly
                  rows={6}
                  value={activeDoc.ocr_text || 'No text extracted.'}
                  className="w-full font-mono text-[11px] p-2.5 bg-slate-900 text-slate-100 rounded-md border border-slate-800 leading-relaxed"
                />
              </div>

              {/* Conversion Actions */}
              <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                <span className="font-bold text-xs text-amber-900 block mb-1">
                  Convert Document to Live Governance Record:
                </span>
                <p className="text-[11px] text-amber-800 mb-2">
                  Automatically populates a permanent Compliance or Violation record in the database using the extracted fields.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConvert('Compliance')}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded cursor-pointer"
                  >
                    Convert to Compliance Record
                  </button>
                  <button
                    onClick={() => handleConvert('Violation')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded cursor-pointer"
                  >
                    Convert to Active Violation
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400 text-xs">
              Select or upload a statutory document to inspect extracted OCR text.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
