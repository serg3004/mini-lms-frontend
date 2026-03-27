import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { Spinner } from '../Common';
import toast from 'react-hot-toast';

export default function CourseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', thumbnail: '', isPublished: false, isPublic: false,
  });

  useEffect(() => {
    if (isEdit) {
      coursesAPI.getOne(id)
        .then(r => {
          const c = r.data.data;
          setForm({ title: c.title, description: c.description, thumbnail: c.thumbnail || '', isPublished: c.isPublished, isPublic: c.isPublic });
        })
        .catch(() => toast.error('Failed to load course'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await coursesAPI.update(id, form);
        toast.success('Course updated!');
        navigate(`/courses/${id}`);
      } else {
        const res = await coursesAPI.create(form);
        toast.success('Course created!');
        navigate(`/courses/${res.data.data.id}`);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Course' : 'Create Course'}</h1>
      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
            <input name="title" required className="input" placeholder="e.g. Introduction to Python" value={form.title} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea name="description" required rows={4} className="input resize-none" placeholder="What will students learn?" value={form.description} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
            <input name="thumbnail" type="url" className="input" placeholder="https://..." value={form.thumbnail} onChange={handleChange} />
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isPublished ? 'bg-primary-600' : 'bg-gray-200'}`}
                onClick={() => setForm(p => ({ ...p, isPublished: !p.isPublished }))}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Published</span>
                <p className="text-xs text-gray-500">Students can see and enroll</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className={`relative w-10 h-5 rounded-full transition-colors ${form.isPublic ? 'bg-green-500' : 'bg-gray-200'}`}
                onClick={() => setForm(p => ({ ...p, isPublic: !p.isPublic }))}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Public Preview</span>
                <p className="text-xs text-gray-500">Visible to guests without login</p>
              </div>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
