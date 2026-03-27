import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coursesAPI, submissionsAPI, usersAPI } from '../../services/api';
import { Spinner, Badge } from '../Common';
import { BookOpen, Users, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`h-12 w-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, isRole } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isRole('ADMIN')) {
          const [usersRes, coursesRes] = await Promise.all([
            usersAPI.getAll({ limit: 5 }),
            coursesAPI.getAll({ limit: 5 }),
          ]);
          setData({
            users: usersRes.data,
            courses: coursesRes.data,
          });
        } else if (isRole('TEACHER', 'CURATOR')) {
          const coursesRes = await coursesAPI.getMy({ limit: 5 });
          setData({ courses: coursesRes.data });
        } else {
          const coursesRes = await coursesAPI.getMy({ limit: 6 });
          setData({ courses: coursesRes.data });
        }
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24"><Spinner size="lg" /></div>
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {user.name.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening in your LMS</p>
      </div>

      {/* Stats */}
      {isRole('ADMIN') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={data?.users?.pagination?.total ?? '—'} color="bg-blue-500" />
          <StatCard icon={BookOpen} label="Total Courses" value={data?.courses?.pagination?.total ?? '—'} color="bg-purple-500" />
          <StatCard icon={FileText} label="Published" value={data?.courses?.data?.filter(c => c.isPublished).length ?? '—'} color="bg-green-500" />
          <StatCard icon={TrendingUp} label="Enrollments" value={data?.courses?.data?.reduce((s, c) => s + (c._count?.enrollments || 0), 0) ?? '—'} color="bg-orange-500" />
        </div>
      )}

      {isRole('STUDENT') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={BookOpen} label="Enrolled Courses" value={data?.courses?.pagination?.total ?? 0} color="bg-primary-500" />
          <StatCard icon={CheckCircle} label="Completed Lessons" value={data?.courses?.data?.reduce((s, c) => s + (c.progressCount || 0), 0) ?? 0} color="bg-green-500" />
          <StatCard icon={Clock} label="In Progress" value={data?.courses?.data?.filter(c => (c.progressCount || 0) > 0).length ?? 0} color="bg-yellow-500" />
        </div>
      )}

      {/* Courses section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isRole('STUDENT') ? 'My Enrolled Courses' : 'My Courses'}
          </h2>
          <Link to="/courses" className="text-sm text-primary-600 font-medium hover:underline">
            {isRole('STUDENT') ? 'Browse all courses →' : 'View all →'}
          </Link>
        </div>

        {!data?.courses?.data?.length ? (
          <div className="card p-12 text-center">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {isRole('STUDENT') ? 'You are not enrolled in any courses yet.' : 'You have not created any courses yet.'}
            </p>
            <Link
              to={isRole('STUDENT') ? '/courses' : '/courses/new'}
              className="btn-primary mt-4 inline-flex"
            >
              {isRole('STUDENT') ? 'Browse Courses' : 'Create Course'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.courses.data.map(course => (
              <Link key={course.id} to={`/courses/${course.id}`} className="card p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary-600" />
                  </div>
                  <Badge
                    label={course.isPublished ? 'Published' : 'Draft'}
                    type={course.isPublished ? 'published' : 'draft'}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span>{course._count?.lessons ?? 0} lessons</span>
                  <span>·</span>
                  <span>{course._count?.enrollments ?? 0} students</span>
                  {course.progressCount !== undefined && (
                    <>
                      <span>·</span>
                      <span className="text-green-600 font-medium">{course.progressCount} done</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Admin: recent users */}
      {isRole('ADMIN') && data?.users?.data?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-primary-600 font-medium hover:underline">View all →</Link>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Name','Email','Role','Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.users.data.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3"><Badge label={u.role} type={u.role} /></td>
                    <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
