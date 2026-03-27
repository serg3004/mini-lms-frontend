import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Spinner, Pagination, Badge, Empty } from '../Common';
import { BookOpen, Plus, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const { user, isRole } = useAuth();
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await coursesAPI.getAll({ page, limit: 9, search: search || undefined });
      setCourses(res.data.data);
      setPagination(res.data.pagination);
    } catch (_) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination ? `${pagination.total} course${pagination.total !== 1 ? 's' : ''} available` : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="input pl-9 w-56"
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-secondary">Search</button>
          </form>
          {isRole('TEACHER', 'ADMIN') && (
            <Link to="/courses/new" className="btn-primary">
              <Plus className="h-4 w-4" /> New Course
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : courses.length === 0 ? (
        <Empty
          icon={BookOpen}
          title="No courses found"
          description={search ? 'Try a different search term' : 'No courses are available yet'}
          action={isRole('TEACHER', 'ADMIN') && (
            <Link to="/courses/new" className="btn-primary">Create First Course</Link>
          )}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} user={user} />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

function CourseCard({ course, user }) {
  return (
    <Link to={`/courses/${course.id}`} className="card overflow-hidden hover:shadow-lg transition-all duration-200 group flex flex-col">
      {/* Thumbnail */}
      <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center relative overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <BookOpen className="h-14 w-14 text-white/60" />
        )}
        {course.isPublic && !user && (
          <span className="absolute top-3 right-3 bg-white/90 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            Free Preview
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {course.title}
          </h3>
          <Badge
            label={course.isPublished ? 'Live' : 'Draft'}
            type={course.isPublished ? 'published' : 'draft'}
          />
        </div>
        <p className="text-sm text-gray-500 line-clamp-3 flex-1">{course.description}</p>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course._count?.lessons ?? 0} lessons
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course._count?.enrollments ?? 0} enrolled
          </span>
          {course.teacher && (
            <span className="font-medium text-gray-700 truncate max-w-[100px]">
              {course.teacher.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
