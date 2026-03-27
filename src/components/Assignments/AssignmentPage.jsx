import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentsAPI, submissionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner, Badge } from '../Common';
import { FileText, Calendar, Star, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AssignmentPage() {
  const { courseId, id } = useParams();
  const { user, isRole } = useAuth();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gradingId, setGradingId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const aRes = await assignmentsAPI.getOne(courseId, id);
        setAssignment(aRes.data.data);

        if (isRole('STUDENT')) {
          const sRes = await submissionsAPI.getMine(id);
          if (sRes.data.data) { setSubmission(sRes.data.data); setContent(sRes.data.data.content); }
        } else {
          setAllSubmissions(aRes.data.data.submissions || []);
        }
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submissionsAPI.submit(id, { content });
      setSubmission(res.data.data);
      toast.success('Submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrade = async (submissionId) => {
    try {
      await submissionsAPI.grade(submissionId, { score: parseInt(gradeForm.score), feedback: gradeForm.feedback });
      setAllSubmissions(prev => prev.map(s => s.id === submissionId
        ? { ...s, score: parseInt(gradeForm.score), feedback: gradeForm.feedback, status: 'GRADED' }
        : s
      ));
      setGradingId(null);
      toast.success('Graded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Grading failed');
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!assignment) return <div className="text-center py-24 text-gray-500">Assignment not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Assignment header */}
      <div className="card p-8">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Star className="h-4 w-4" />{assignment.maxScore} points</span>
              {assignment.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />Due {format(new Date(assignment.dueDate), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
      </div>

      {/* Student submission */}
      {isRole('STUDENT') && (
        <div className="card p-8">
          <h2 className="font-semibold text-gray-900 mb-4">Your Submission</h2>

          {submission?.status === 'GRADED' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
                <CheckCircle className="h-5 w-5" />
                Grade: {submission.score}/{assignment.maxScore}
              </div>
              {submission.feedback && <p className="text-sm text-green-700">{submission.feedback}</p>}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <textarea
              rows={8}
              className="input resize-y mb-4"
              placeholder="Write your answer here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              disabled={submission?.status === 'GRADED'}
            />
            {submission?.status !== 'GRADED' && (
              <button type="submit" disabled={submitting || !content.trim()} className="btn-primary">
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : submission ? 'Resubmit' : 'Submit'}
              </button>
            )}
          </form>
        </div>
      )}

      {/* Teacher / curator: all submissions */}
      {isRole('TEACHER', 'ADMIN', 'CURATOR') && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Submissions ({allSubmissions.length})</h2>
          </div>
          {allSubmissions.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">No submissions yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {allSubmissions.map(s => (
                <div key={s.id} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center text-xs font-bold text-primary-700">
                        {s.student?.name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.student?.name}</p>
                        <p className="text-xs text-gray-500">{format(new Date(s.createdAt), 'MMM d, yyyy HH:mm')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge label={s.status} type={s.status} />
                      {s.score != null && <span className="text-sm font-semibold text-gray-700">{s.score}/{assignment.maxScore}</span>}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3 whitespace-pre-wrap line-clamp-4">{s.content}</p>

                  {gradingId === s.id ? (
                    <div className="flex gap-2 mt-3">
                      <input type="number" min={0} max={assignment.maxScore} placeholder="Score"
                        className="input w-24" value={gradeForm.score}
                        onChange={e => setGradeForm(p => ({ ...p, score: e.target.value }))} />
                      <input placeholder="Feedback (optional)" className="input flex-1"
                        value={gradeForm.feedback}
                        onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))} />
                      <button onClick={() => handleGrade(s.id)} className="btn-primary">Save</button>
                      <button onClick={() => setGradingId(null)} className="btn-secondary">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setGradingId(s.id); setGradeForm({ score: s.score ?? '', feedback: s.feedback ?? '' }); }}
                      className="btn-secondary text-xs py-1.5"
                    >
                      {s.status === 'GRADED' ? 'Re-grade' : 'Grade'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
