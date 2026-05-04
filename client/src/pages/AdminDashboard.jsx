import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, GraduationCap, TrendingUp, Trash2, ShieldAlert, Search, Shield, ShieldOff, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [paths, setPaths] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [statsRes, usersRes, pathsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', config),
          axios.get('http://localhost:5000/api/admin/users', config),
          axios.get('http://localhost:5000/api/admin/paths', config)
        ]);

        setStats(statsRes.data.stats);
        setUsers(usersRes.data);
        setPaths(pathsRes.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError('Access Denied. Admin privileges required.');
        } else {
          setError('Failed to load admin data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [navigate]);

  const handleToggleRole = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/admin/users/${user._id}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u => u._id === user._id ? res.data : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating role');
    }
  };

  const handleDeletePath = async (id) => {
    if (!window.confirm('Are you sure you want to delete this learning path?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/paths/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPaths(paths.filter(p => p._id !== id));
      setStats(prev => ({ ...prev, learningPaths: prev.learningPaths - 1 }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting learning path');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== id));
      setStats(prev => ({ ...prev, users: prev.users - 1 }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{error}</h2>
      <button onClick={() => navigate('/dashboard')} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg">
        Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Admin Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Users</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.users || 0}</h3>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Learning Paths</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.learningPaths || 0}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">User Profiles</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.profiles || 0}</h3>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Manage Users</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Name</th>
                  <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Email</th>
                  <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Role</th>
                  <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Joined</th>
                  <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                {users.filter(user => 
                  user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  user.email.toLowerCase().includes(searchQuery.toLowerCase())
                ).map(user => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {user.email !== 'admin@careersetu.com' && (
                          <button 
                            onClick={() => handleToggleRole(user)}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                            title={user.role === 'admin' ? "Remove Admin" : "Make Admin"}
                          >
                            {user.role === 'admin' ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Learning Paths Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Map className="w-6 h-6 text-emerald-500" />
              Manage Learning Paths
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Goal / Role</th>
                  <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">User</th>
                  <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Current Level</th>
                  <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700">Created At</th>
                  <th className="p-4 font-medium border-b border-slate-100 dark:border-slate-700 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                {paths.map(path => (
                  <tr key={path._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{path.goal}</td>
                    <td className="p-4">
                      {path.userId ? (
                        <div>
                          <p className="font-medium">{path.userId.name}</p>
                          <p className="text-xs text-slate-500">{path.userId.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unknown User</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {path.currentLevel}
                      </span>
                    </td>
                    <td className="p-4">{new Date(path.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleDeletePath(path._id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Learning Path"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {paths.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No learning paths generated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
