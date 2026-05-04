import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';

const Planner = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchTasks = async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      setLoading(true);
      try {
        const res = await api.get(`/planner?date=${dateStr}`);
        setTasks(res.data.tasks);
      } catch (err) {
        console.error("Error fetching tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [selectedDate]);

  const toggleTask = async (taskId, done) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    try {
      const res = await api.post('/planner/update', { date: dateStr, taskId, done: !done });
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Error updating task");
    }
  };

  const addTask = async () => {
    const title = prompt("Enter task title:");
    if (!title) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    try {
      const res = await api.post('/planner/add', { date: dateStr, title, type: 'Study', time: '10:00 AM' });
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Error adding task");
    }
  };

  const weekStart = startOfWeek(new Date());
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Study Planner</h1>
          <p className="text-slate-500 dark:text-slate-400">Your personalized daily learning schedule.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all">
          <Sparkles className="w-5 h-5" />
          Auto-Generate Day
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="text-blue-500" />
                {format(selectedDate, 'MMMM yyyy')}
              </h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center p-4 rounded-2xl transition-all ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                      {format(day, 'EEE')}
                    </span>
                    <span className="text-xl font-black mt-1">
                      {format(day, 'd')}
                    </span>
                    {isToday && !isSelected && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h4 className="font-bold">Timeline: {format(selectedDate, 'EEEE, MMM do')}</h4>
              <button onClick={addTask} className="text-blue-600 hover:underline text-sm font-bold flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
            
            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading tasks...</div>
            ) : tasks.length > 0 ? (
              tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-slate-400 w-16 uppercase">
                      {task.time}
                    </div>
                    <div className="w-1 h-10 bg-slate-200 dark:bg-slate-700 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                    <div>
                      <h5 className={`font-bold ${task.done ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100'}`}>
                        {task.title}
                      </h5>
                      <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{task.type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleTask(task.id, task.done)}
                    className={`p-2 rounded-xl transition-all ${
                      task.done 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-blue-500'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="bg-slate-800/30 border border-dashed border-slate-700 p-12 rounded-2xl text-center">
                <p className="text-slate-500 italic">No tasks for this day. Plan something!</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="text-blue-400" />
              Focus Mode
            </h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Block distractions and stay focused on your current task for 25 minutes.
            </p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/30">
              Start Pomodoro
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl">
            <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Weekly Goal Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Course Hours</span>
                  <span>12/15h</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[80%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Projects</span>
                  <span>2/3</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[66%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Quiz Score Avg</span>
                  <span>92%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[92%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planner;
