import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { X, Table, Upload, Plus, Trash2, Save } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';

interface DataGridEditorProps {
  initialData: string[][] | null;
  onSave: (data: string[][]) => void;
  onClose: () => void;
}

export const DataGridEditor: React.FC<DataGridEditorProps> = ({ initialData, onSave, onClose }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<string[][]>(initialData || [['', '', ''], ['', '', ''], ['', '', '']]);
  const [activeCell, setActiveCell] = useState<{ r: number, c: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const ext = file.name.split('.').pop()?.toLowerCase();

    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (ext === 'csv') {
        const results = Papa.parse(bstr as string, { header: false });
        setData(results.data as string[][]);
      } else {
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
        setData(json);
      }
    };

    if (ext === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const updateCell = (r: number, c: number, value: string) => {
    const newData = [...data];
    if (!newData[r]) newData[r] = [];
    newData[r][c] = value;
    setData(newData);
  };

  const addRow = () => {
    const cols = data[0]?.length || 2;
    setData([...data, Array(cols).fill('')]);
  };

  const addCol = () => {
    setData(data.map(row => [...row, '']));
  };

  const removeRow = (idx: number) => {
    if (data.length <= 1) return;
    setData(data.filter((_, i) => i !== idx));
  };

  const removeCol = (idx: number) => {
    if (data[0].length <= 1) return;
    setData(data.map(row => row.filter((_, i) => i !== idx)));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', 
      zIndex: 1000001, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)', padding: '20px'
    }}>
      <div style={{
        background: '#111', border: '1px solid #333', borderRadius: '12px',
        width: '100%', maxWidth: '1000px', height: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '16px 24px', borderBottom: '1px solid #222', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Table size={18} color="var(--accent)" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#eee', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t('edit_data')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <label className="dv-btn" style={{ height: '32px', fontSize: '10px', gap: '6px', cursor: 'pointer' }}>
              <Upload size={14}/> {t('import_data')}
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '8px 24px', borderBottom: '1px solid #222', display: 'flex', gap: '12px', background: '#0a0a0a' }}>
          <button onClick={addRow} className="dv-btn" style={{ height: '28px', fontSize: '9px', background: '#1a1a1a' }}>
            <Plus size={12}/> {t('add_row')}
          </button>
          <button onClick={addCol} className="dv-btn" style={{ height: '28px', fontSize: '9px', background: '#1a1a1a' }}>
            <Plus size={12}/> {t('add_column')}
          </button>
        </div>

        {/* Grid Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0', background: '#050505' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 'max-content' }}>
            <thead>
              <tr>
                <th style={{ width: '40px', background: '#111', border: '1px solid #222' }}></th>
                {data[0]?.map((_, c) => (
                  <th key={c} style={{ 
                    padding: '8px', background: '#111', border: '1px solid #222',
                    fontSize: '10px', color: '#666', fontWeight: 800, textAlign: 'center', position: 'relative'
                  }}>
                    {String.fromCharCode(65 + c)}
                    <button 
                      onClick={() => removeCol(c)}
                      style={{ position: 'absolute', top: 2, right: 2, background: 'transparent', border: 'none', color: '#444', cursor: 'pointer' }}
                    >
                      <Trash2 size={8}/>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, r) => (
                <tr key={r}>
                  <td style={{ 
                    width: '40px', background: '#111', border: '1px solid #222', 
                    fontSize: '9px', color: '#444', textAlign: 'center', fontWeight: 800, position: 'relative'
                  }}>
                    {r + 1}
                    <button 
                      onClick={() => removeRow(r)}
                      style={{ position: 'absolute', left: 2, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#444', cursor: 'pointer' }}
                    >
                      <Trash2 size={8}/>
                    </button>
                  </td>
                  {row.map((cell, c) => (
                    <td 
                      key={c} 
                      style={{ 
                        border: '1px solid #222', 
                        padding: '0',
                        background: activeCell?.r === r && activeCell?.c === c ? '#1a1a1a' : 'transparent'
                      }}
                    >
                      <input 
                        className="grid-input"
                        value={cell || ''}
                        onChange={(e) => updateCell(r, c, e.target.value)}
                        onFocus={() => setActiveCell({ r, c })}
                        onBlur={() => setActiveCell(null)}
                        placeholder={t('cell_placeholder')}
                        style={{
                          width: '100%', border: 'none', background: 'transparent', 
                          color: '#ccc', padding: '10px', fontSize: '12px', outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '16px 24px', borderTop: '1px solid #222', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111'
        }}>
          <div style={{ fontSize: '10px', color: '#555', fontFamily: 'var(--font-mono)' }}>
            {data.length} filas x {data[0]?.length || 0} columnas
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={onClose} 
              style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}
            >
              {t('cancel')}
            </button>
            <button 
              onClick={() => onSave(data)}
              className="dv-btn cta"
              style={{ padding: '8px 30px', fontSize: '11px' }}
            >
              <Save size={14}/> {t('save')}
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .grid-input:focus {
          background: rgba(228, 76, 48, 0.05) !important;
          box-shadow: inset 0 0 0 1px var(--accent);
        }
      `}</style>
    </div>
  );
};
