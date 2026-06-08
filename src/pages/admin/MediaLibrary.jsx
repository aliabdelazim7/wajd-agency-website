import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { audioManager } from '../../utils/audioManager';

const MediaLibrary = () => {
  const [selectedBucket, setSelectedBucket] = useState('portfolio-images');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  const buckets = [
    { id: 'portfolio-images', name: 'صور أعمال المعرض (Portfolio)' },
    { id: 'avatar-images', name: 'صور الشركاء والعملاء (Avatars)' }
  ];

  const handleHover = () => {
    audioManager.playHover();
  };

  const handleClick = () => {
    audioManager.playClick();
  };

  const fetchFiles = async () => {
    setLoading(true);
    setFeedback({ type: '', msg: '' });
    try {
      const data = await api.storage.listImages(selectedBucket);
      setFiles(data);
    } catch (err) {
      console.error('Error listing storage files:', err);
      // Suppress full error and show friendly warning because buckets might not exist yet
      setFiles([]);
      setFeedback({ 
        type: 'warning', 
        msg: `تحذير: لم نتمكن من الاتصال بالخادم أو أن مجلد الباكت "${selectedBucket}" غير موجود في Supabase Storage حتى الآن. يرجى إنشاؤه وجعله عاماً (Public Access).` 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedBucket]);

  const handleUploadSubmit = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    handleClick();
    setUploading(true);
    setFeedback({ type: '', msg: '' });

    try {
      const folderName = selectedBucket === 'portfolio-images' ? 'projects' : 'avatars';
      const publicUrl = await api.storage.uploadImage(selectedBucket, file, folderName);
      if (publicUrl) {
        setFeedback({ type: 'success', msg: 'تم رفع الملف بنجاح وإضافته للمكتبة!' });
        fetchFiles(); // refresh
      }
    } catch (err) {
      console.error('Upload error:', err);
      setFeedback({ type: 'error', msg: err.message || 'فشل رفع الملف. تأكد من حجم الملف (أقل من 2MB) وصيغته.' });
    } finally {
      setUploading(false);
      // Clear input
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileName) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الملف نهائياً؟')) return;

    handleClick();
    setFeedback({ type: '', msg: '' });

    try {
      await api.storage.deleteImage(selectedBucket, fileName);
      setFeedback({ type: 'success', msg: 'تم حذف الملف بنجاح!' });
      fetchFiles();
    } catch (err) {
      console.error('Delete error:', err);
      setFeedback({ type: 'error', msg: 'فشل حذف الملف من السيرفر.' });
    }
  };

  const handleCopyLink = (url, index) => {
    handleClick();
    navigator.clipboard.writeText(url);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Bucket Selector Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
        background: 'rgba(255,255,255,0.02)',
        padding: '18px 24px',
        borderRadius: '20px',
        border: '1px solid var(--border-glass)'
      }}>
        
        {/* Toggle buckets */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {buckets.map(b => (
            <button
              key={b.id}
              onClick={() => { handleClick(); setSelectedBucket(b.id); }}
              className={`action-btn ${selectedBucket === b.id ? 'filled' : 'outline'}`}
              onMouseEnter={handleHover}
              style={{
                padding: '8px 18px',
                fontSize: '13px',
                borderColor: selectedBucket === b.id ? 'var(--gold)' : 'rgba(255,255,255,0.1)'
              }}
            >
              <FolderOpen size={16} style={{ marginLeft: '6px' }} />
              <span>{b.name}</span>
            </button>
          ))}
        </div>

        {/* Upload Button */}
        <div>
          <label 
            htmlFor="media-file-upload" 
            className={`action-btn filled ${uploading ? 'disabled' : ''}`}
            onMouseEnter={handleHover}
            style={{ padding: '8px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: uploading ? 'not-allowed' : 'pointer' }}
          >
            {uploading ? (
              <Loader2 size={16} className="spinner-icon" />
            ) : (
              <Upload size={16} />
            )}
            <span>{uploading ? 'جاري الرفع...' : 'رفع صورة جديدة'}</span>
            <input 
              id="media-file-upload"
              type="file" 
              accept="image/*"
              onChange={handleUploadSubmit}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        </div>

      </div>

      {feedback.msg && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 
                      feedback.type === 'warning' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: feedback.type === 'success' ? '1px solid rgba(34, 197, 94, 0.3)' : 
                  feedback.type === 'warning' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          color: feedback.type === 'success' ? '#22c55e' : 
                 feedback.type === 'warning' ? '#f59e0b' : '#ef4444',
          textAlign: 'right'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px', color: 'var(--gold)' }}>
          <Loader2 className="spinner-icon" size={32} />
          <span style={{ marginRight: '10px' }}>جاري جلب الملفات...</span>
        </div>
      ) : (
        <div className="contact-container" style={{ padding: '30px', borderRadius: '24px' }}>
          
          {files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <ImageIcon size={48} style={{ opacity: 0.3 }} />
              <span>لا توجد صور مرفوعة في هذا المجلد بعد. ابدأ برفع أول صورة!</span>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              {files.map((file, idx) => (
                <div 
                  key={file.id || idx} 
                  className="faq-item" 
                  style={{ 
                    padding: '12px', 
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  
                  {/* Image container */}
                  <div style={{
                    width: '100%',
                    height: '140px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: '#0a0a0d',
                    border: '1px solid var(--border-glass)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={file.url} 
                      alt={file.name} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Metadata */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-light)', 
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      direction: 'ltr'
                    }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-en)' }}>
                      {formatSize(file.metadata?.size)}
                    </span>
                  </div>

                  {/* Actions bar */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    borderTop: '1px solid var(--border-glass)', 
                    paddingTop: '10px',
                    marginTop: 'auto'
                  }}>
                    
                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopyLink(file.url, idx)}
                      onMouseEnter={handleHover}
                      className="action-btn outline"
                      title="نسخ رابط الصورة"
                      style={{ 
                        flex: 1, 
                        padding: '6px', 
                        justifyContent: 'center', 
                        fontSize: '11px', 
                        gap: '4px',
                        borderColor: copiedIndex === idx ? '#22c55e' : 'var(--border-glass)',
                        color: copiedIndex === idx ? '#22c55e' : 'var(--text-muted)'
                      }}
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={12} />
                          <span>تم!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>رابط</span>
                        </>
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteFile(file.name)}
                      onMouseEnter={handleHover}
                      className="action-btn outline"
                      title="حذف الملف"
                      style={{ 
                        padding: '6px 12px', 
                        justifyContent: 'center', 
                        borderColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default MediaLibrary;
