import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { lessonsAPI, coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ConfirmDialog } from '../Common';
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const { user, isRole } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      lessonsAPI.getOne(courseId, lessonId),
      coursesAPI.getOne(courseId),
    ]).then(([lr, cr]) => {
      setLesson(lr.data.data);
      setCourse(cr.data.data);
    }).catch(() => toast.error('Failed to load lesson'))
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  const handleDelete = async () => {
    try {
      await lessonsAPI.delete(courseId, lessonId);
      toast.success('Lesson deleted');
      navigate(`/courses/${courseId}`);
    } catch (_) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!lesson) return <div className="text-center py-24 text-gray-500">Lesson not found</div>;

  const canManage = user?.id === course?.teacher?.id || isRole('ADMIN');
  const lessons = course?.lessons || [];
  const currentIndex = lessons.findIndex(l => l.id === parseInt(lessonId));
  const prev = lessons[currentIndex - 1];
  const next = lessons[currentIndex + 1];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to={`/courses/${courseId}`} className="hover:text-primary-600 transition-colors">{course?.title}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{lesson.title}</span>
      </div>

      {/* Lesson card */}
      <div className="card p-8">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          {canManage && (
            <div className="flex items-center gap-2">
              <Link to={`/courses/${courseId}/lessons/${lessonId}/edit`} className="btn-secondary text-xs py-1.5">
                <Edit className="h-3.5 w-3.5" /> Edit
              </Link>
              <button onClick={() => setDeleteOpen(true)} className="btn-danger text-xs py-1.5">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Video */}
        {lesson.videoUrl && (
          <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-video">
            <iframe
              src={lesson.videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {lesson.content}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prev ? (
          <Link to={`/courses/${courseId}/lessons/${prev.id}`} className="btn-secondary">
            <ChevronLeft className="h-4 w-4" /> {prev.title}
          </Link>
        ) : <div />}
        {next ? (
          <Link to={`/courses/${courseId}/lessons/${next.id}`} className="btn-primary">
            {next.title} <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link to={`/courses/${courseId}`} className="btn-primary">
            Finish Course ✓
          </Link>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson?"
        danger
      />
    </div>
  );
}
