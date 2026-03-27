import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI } from '../../services/api';
import { Spinner } from '../Common';
import toast from 'react-hot-toast';

export default function LessonFormPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!lessonId;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', videoUrl: '', order: 0, isPublic: false });

  useEffect(() => {
    if (isEdit) {
      lessonsAPI.getOne(courseId, lessonId)
        .then(r => {
          const l = r.data.data;
          setForm({ title: l.title, content: l.content, videoUrl: l.videoUrl || '', order: l.order, isPublic: l.isPublic });
        })
        .catch(() => toast.error('Failed to load lesson'))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await lessonsAPI.update(courseId, lessonId, form);
        toast.success('Lesson updated!');
        navigate(`/courses/${courseId}/lessons/${lessonId}`);
      } else {
        const res = await lessonsAPI.create(courseId, form);
        toast.success('Lesson created!');
        navigate(`/courses/${courseId}/lessons/${res.data.data.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Lesson' : 'New Lesson'}</h1>
      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input name="title" required className="input" placeholder="Lesson title" value={form.title} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea name="content" required rows={10} className="input resize-y font-mono text-sm" placeholder="Lesson content (Markdown supported)" value={form.content} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (optional)</label>
            <input name="videoUrl" type="url" className="input" placeholder="https://youtube.com/embed/..." value={form.videoUrl} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <input name="order" type="number" min={0} className="input w-32" value={form.order} onChange={handleChange} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleChange} className="w-4 h-4 text-primary-600 rounded" />
            <span className="text-sm text-gray-700">Free preview (visible without enrollment)</span>
          </label>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : isEdit ? 'Update' : 'Create Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
