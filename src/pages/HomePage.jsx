import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Award, ArrowRight, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: BookOpen, title: 'Rich Course Content', desc: 'Video lessons, text content, and structured learning paths.' },
  { icon: Users, title: 'Multiple Roles', desc: 'Students, Teachers, Curators, and Admins each have tailored access.' },
  { icon: Award, title: 'Assignments & Grading', desc: 'Submit work, receive detailed feedback and scores.' },
  { icon: CheckCircle, title: 'Progress Tracking', desc: 'Track completed lessons and course progress in real time.' },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <GraduationCap className="h-4 w-4" />
            Open-source Learning Management System
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Learn. Teach. Grow.
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-10">
            Mini LMS gives students and teachers everything they need — courses, lessons, assignments, and progress tracking — in one clean platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/courses" className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-lg">
              Browse Courses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-400 transition-colors border border-primary-400">
              Get Started Free
            </Link>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-700/30 rounded-full blur-3xl" />
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">Everything you need</h2>
        <p className="text-gray-500 text-center mb-12">A complete learning platform without the complexity</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Built for everyone</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { role: 'Student', color: 'bg-blue-500', items: ['Browse & enroll in courses', 'Track lesson progress', 'Submit assignments', 'View grades and feedback'] },
              { role: 'Teacher', color: 'bg-purple-500', items: ['Create and publish courses', 'Manage lessons & content', 'Create assignments', 'Monitor student progress'] },
              { role: 'Curator', color: 'bg-orange-500', items: ['Grade submissions', 'Give written feedback', 'Access course analytics', 'Support teachers'] },
              { role: 'Admin', color: 'bg-red-500', items: ['Manage all users', 'Assign roles', 'Full course control', 'Platform oversight'] },
            ].map(({ role, color, items }) => (
              <div key={role} className="card p-6">
                <div className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-3 py-1.5 rounded-full mb-4 ${color}`}>
                  {role}
                </div>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to start learning?</h2>
        <p className="text-gray-500 mb-8">Join Mini LMS today — it's free for students.</p>
        <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex">
          Create Free Account <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
