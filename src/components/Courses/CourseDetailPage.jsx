import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { coursesAPI, lessonsAPI, assignmentsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner, Badge, ConfirmDialog } from '../Common';
import { BookOpen, Clock, Users, Play, FileText, Edit, Trash2, Plus, CheckCircle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user, isRole } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    coursesAPI.getOne(id)
      .then(r => setCourse(r.data.data))
      .catch(() => toast.error('Course not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await coursesAPI.enroll(id);
      setCourse(prev => ({ ...prev, isEnrolled: true }));
      toast.success('Enrolled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleDelete = async () => {
    try {
      await coursesAPI.delete(id);
      toast.success('Course deleted');
      navigate('/courses');
    } catch (_) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!course) return <div className="text-center py-24 text-gray-500">Course not found</div>;

  const isOwner = user?.id === course.teacher?.id || isRole('ADMIN');
  const canManage = isOwner || course.curators?.some(c => c.user.id === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge label={course.isPublished ? 'Published' : 'Draft'} type={course.isPublished ? 'published' : 'draft'} />
                  {course.isPublic && <Badge label="Public" type="published" />}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600 mt-2">{course.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" />{course.lessons?.length ?? 0} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />{course._count?.enrollments ?? 0} students
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />Updated {format(new Date(course.updatedAt || course.createdAt), 'MMM d, yyyy')}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
              {isRole('STUDENT') && !course.isEnrolled && (
                <button onClick={handleEnroll} disabled={enrolling} className="btn-primary">
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}
              {course.isEnrolled && (
                <Link to={`/courses/${id}/lessons/${course.lessons?.[0]?.id}`} className="btn-primary">
                  <Play className="h-4 w-4" /> Continue Learning
                </Link>
              )}
              {isOwner && (
                <>
                  <Link to={`/courses/${id}/edit`} className="btn-secondary">
                    <Edit className="h-4 w-4" /> Edit Course
                  </Link>
                  <button onClick={() => setDeleteOpen(true)} className="btn-danger">
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Lessons */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Lessons ({course.lessons?.length ?? 0})</h2>
              {canManage && (
                <Link to={`/courses/${id}/lessons/new`} className="btn-primary text-xs py-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Lesson
                </Link>
              )}
            </div>
            {!course.lessons?.length ? (
              <div className="text-center py-10 text-gray-500 text-sm">No lessons yet</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {course.lessons.map((lesson, i) => {
                  const accessible = lesson.isPublic || course.isEnrolled || canManage;
                  return (
                    <li key={lesson.id}>
                      {accessible ? (
                        <Link to={`/courses/${id}/lessons/${lesson.id}`}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                          <span className="h-7 w-7 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="flex-1 text-sm font-medium text-gray-800 group-hover:text-primary-600">{lesson.title}</span>
                          {lesson.isPublic && <span className="text-xs text-green-600 font-medium">Free</span>}
                          <Play className="h-4 w-4 text-gray-300 group-hover:text-primary-500" />
                        </Link>
                      ) : (
                        <div className="flex items-center gap-4 px-6 py-4 opacity-60 cursor-not-allowed">
                          <span className="h-7 w-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="flex-1 text-sm text-gray-600">{lesson.title}</span>
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Assignments */}
          {(course.isEnrolled || canManage) && course.assignments?.length > 0 && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Assignments ({course.assignments.length})</h2>
                {canManage && (
                  <Link to={`/courses/${id}/assignments/new`} className="btn-primary text-xs py-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Link>
                )}
              </div>
              <ul className="divide-y divide-gray-100">
                {course.assignments.map(a => (
                  <li key={a.id}>
                    <Link to={`/courses/${id}/assignments/${a.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-primary-600">{a.title}</p>
                        <p className="text-xs text-gray-500">
                          {a.dueDate ? `Due ${format(new Date(a.dueDate), 'MMM d, yyyy')}` : 'No deadline'} · {a.maxScore} pts
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Teacher */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Instructor</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
                {course.teacher?.name?.[0]}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{course.teacher?.name}</p>
                {course.teacher?.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{course.teacher.bio}</p>}
              </div>
            </div>
          </div>

          {/* Curators */}
          {course.curators?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Curators</h3>
              <div className="space-y-2">
                {course.curators.map(c => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-700">
                      {c.user.name?.[0]}
                    </div>
                    <span className="text-sm text-gray-700">{c.user.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* What you'll need */}
          {!course.isEnrolled && isRole('STUDENT') && (
            <div className="card p-5 bg-primary-50 border-primary-100">
              <h3 className="font-semibold text-primary-900 mb-2">Ready to start?</h3>
              <p className="text-sm text-primary-700 mb-4">Enroll to get full access to all lessons and assignments.</p>
              <button onClick={handleEnroll} disabled={enrolling} className="btn-primary w-full justify-center">
                {enrolling ? 'Enrolling...' : 'Enroll for Free'}
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? All lessons and assignments will be permanently removed."
        danger
      />
    </div>
  );
}
