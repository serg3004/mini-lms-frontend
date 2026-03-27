import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentsAPI } from '../../services/api';
import { Spinner } from '../Common';
import toast from 'react-hot-toast';

export default function AssignmentFormPage() {
  const { courseId, id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', maxScore: 100 });

  useEffect(() => {
    if (isEdit) {
      assignmentsAPI.getOne(courseId, id)
        .then(r => {
          const a = r.data.data;
          setForm({
            title: a.title,
            description: a.description,
            dueDate: a.dueDate ? a.dueDate.slice(0, 16) : '',
            maxScore: a.maxScore,
          });
        })
        .catch(() => toast.error('Failed to load assignment'))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, maxScore: parseInt(form.maxScore), dueDate: form.dueDate || null };
      if (isEdit) {
        await assignmentsAPI.update(courseId, id, payload);
        toast.success('Assignment updated!');
        navigate(`/courses/${courseId}/assignments/${id}`);
      } else {
        const res = await assignmentsAPI.create(courseId, payload);
        toast.success('Assignment created!');
        navigate(`/courses/${courseId}/assignments/${res.data.data.id}`);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? 'Edit Assignment' : 'New Assignment'}
      </h1>
      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              name="title" required className="input"
              placeholder="e.g. Build a personal portfolio"
              value={form.title} onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              name="description" required rows={6}
              className="input resize-y"
              placeholder="Describe what students need to do..."
              value={form.description} onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                name="dueDate" type="datetime-local"
                className="input"
                value={form.dueDate} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
              <input
                name="maxScore" type="number" min={1} max={1000} required
                className="input"
                value={form.maxScore} onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving...' : isEdit ? 'Update Assignment' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
