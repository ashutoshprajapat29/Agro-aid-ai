import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firebaseUtils";
import { useAuth } from "../lib/AuthContext";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Droplet, 
  Leaf, 
  Search, 
  CalendarDays,
  Wheat,
  Activity,
  ListTodo,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Field } from "./FieldManager";

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: "irrigation" | "fertilizer" | "follow-up" | "monitoring" | "harvest" | "other";
  dueDate: string;
  isCompleted: boolean;
  fieldId?: string;
  createdAt: any;
  updatedAt?: any;
}

const TYPE_ICONS = {
  "irrigation": <Droplet size={16} className="text-blue-500" />,
  "fertilizer": <Leaf size={16} className="text-green-500" />,
  "monitoring": <Search size={16} className="text-purple-500" />,
  "follow-up": <Activity size={16} className="text-orange-500" />,
  "harvest": <Wheat size={16} className="text-yellow-600" />,
  "other": <ListTodo size={16} className="text-gray-500" />
};

export default function TaskManager() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Reminder>>({
    title: "",
    description: "",
    type: "other",
    dueDate: new Date().toISOString().split('T')[0],
    isCompleted: false,
    fieldId: ""
  });

  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const pathFields = `users/${user.uid}/fields`;
    const qFields = query(collection(db, "users", user.uid, "fields"), orderBy("name"));
    const unsubFields = onSnapshot(qFields, (snapshot) => {
      setFields(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Field)));
    }, (err) => handleFirestoreError(err, OperationType.GET, pathFields));

    const pathTasks = `users/${user.uid}/reminders`;
    const qTasks = query(collection(db, "users", user.uid, "reminders"), orderBy("dueDate", "asc"));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reminder));
      setReminders(fetchedTasks);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, pathTasks);
      setLoading(false);
    });

    return () => {
      unsubFields();
      unsubTasks();
    };
  }, [user]);

  // Handle Notifications
  useEffect(() => {
    if (!loading && reminders.length > 0 && !notified) {
      if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            const today = new Date().toISOString().split('T')[0];
            const dueToday = reminders.filter(r => !r.isCompleted && r.dueDate === today);
            const overdue = reminders.filter(r => !r.isCompleted && r.dueDate < today);
            
            if (dueToday.length > 0 || overdue.length > 0) {
              const count = dueToday.length + overdue.length;
              new Notification("Farm Tasks Update", {
                body: `You have ${count} pending task${count > 1 ? 's' : ''} to review.`,
                icon: "/vite.svg" // Placeholder icon
              });
              setNotified(true);
            }
          }
        });
      }
    }
  }, [loading, reminders, notified]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTask.title?.trim() || !newTask.type || !newTask.dueDate) return;

    const collectionPath = `users/${user.uid}/reminders`;
    try {
      await addDoc(collection(db, collectionPath), {
        userId: user.uid,
        title: newTask.title.trim(),
        description: newTask.description?.trim() || null,
        type: newTask.type,
        dueDate: newTask.dueDate,
        isCompleted: false,
        fieldId: newTask.fieldId || null,
        createdAt: serverTimestamp()
      });
      setIsAdding(false);
      setNewTask({
        title: "",
        description: "",
        type: "other",
        dueDate: new Date().toISOString().split('T')[0],
        isCompleted: false,
        fieldId: ""
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, collectionPath);
    }
  };

  const toggleTaskStatus = async (task: Reminder) => {
    if (!user) return;
    const taskPath = `users/${user.uid}/reminders/${task.id}`;
    try {
      await updateDoc(doc(db, "users", user.uid, "reminders", task.id), {
        isCompleted: !task.isCompleted,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, taskPath);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskPath = `users/${user.uid}/reminders/${taskId}`;
    try {
      await deleteDoc(doc(db, "users", user.uid, "reminders", taskId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, taskPath);
    }
  };

  const pendingTasks = reminders.filter(r => !r.isCompleted);
  const completedTasks = reminders.filter(r => r.isCompleted);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold flex items-center gap-2">
            <ListTodo className="text-bento-primary" />
            Task Reminders
          </h2>
          <p className="text-bento-text-muted text-sm mt-1">Manage notifications for your farming activities.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-bento-primary text-white px-5 py-2.5 rounded-full flex items-center gap-2 font-bold tracking-wide hover:bg-bento-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus size={18} /> Add Task
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddTask} className="bento-card border-bento-primary/30 shadow-lg relative bg-white pb-6 z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-bento-text-main">New Reminder</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-bento-text-muted uppercase mb-1 drop-shadow-sm">Task Name / Title <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})} 
                    className="w-full bg-zinc-50 border border-bento-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bento-primary"
                    placeholder="e.g., Spray Urea" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-bento-text-muted uppercase mb-1 drop-shadow-sm">Task Type <span className="text-rose-500">*</span></label>
                  <select 
                    value={newTask.type} 
                    onChange={e => setNewTask({...newTask, type: e.target.value as any})}
                    className="w-full bg-zinc-50 border border-bento-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bento-primary"
                  >
                    <option value="irrigation">Irrigation</option>
                    <option value="fertilizer">Fertilizer Application</option>
                    <option value="monitoring">Monitoring/Scouting</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="harvest">Harvest</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-bento-text-muted uppercase mb-1 drop-shadow-sm">Due Date <span className="text-rose-500">*</span></label>
                  <input 
                    type="date" 
                    required
                    value={newTask.dueDate} 
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
                    className="w-full bg-zinc-50 border border-bento-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bento-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-bento-text-muted uppercase mb-1 drop-shadow-sm">Associated Plot</label>
                  <select 
                    value={newTask.fieldId} 
                    onChange={e => setNewTask({...newTask, fieldId: e.target.value})}
                    className="w-full bg-zinc-50 border border-bento-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bento-primary"
                  >
                    <option value="">None / General Task</option>
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.area} {f.unit})</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-bento-text-muted uppercase mb-1 drop-shadow-sm">Additional Details / Instructions</label>
                  <textarea 
                    value={newTask.description} 
                    onChange={e => setNewTask({...newTask, description: e.target.value})} 
                    className="w-full bg-zinc-50 border border-bento-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bento-primary resize-none h-20"
                    placeholder="Details to help you remember the context..." 
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-bento-text-muted hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-bento-primary text-white px-6 py-2 rounded-xl text-sm font-semibold shadow-md border-b-2 border-b-white/20 active:border-b-0 active:translate-y-px hover:bg-bento-primary/95 transition-all"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <div>
          <h3 className="bento-title flex items-center gap-2 mb-4"><CalendarDays size={16} /> Pending Tasks ({pendingTasks.length})</h3>
          
          <div className="space-y-3">
            {pendingTasks.map((task) => {
              const field = fields.find(f => f.id === task.fieldId);
              const todayStr = new Date().toISOString().split('T')[0];
              const isOverdue = task.dueDate < todayStr;
              const isToday = task.dueDate === todayStr;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={task.id} 
                  className={`p-5 rounded-3xl border flex gap-4 group transition-colors shadow-sm ${
                    isOverdue ? 'bg-rose-50/50 border-rose-200' : 
                    isToday ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-bento-border'
                  }`}
                >
                  <button 
                    onClick={() => toggleTaskStatus(task)} 
                    className="shrink-0 mt-1 hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Circle size={22} className="text-zinc-300 group-hover:text-bento-primary relative" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-bento-text-main truncate text-base leading-tight">
                        {task.title}
                      </h4>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-rose-50"
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-x-3 gap-y-1 mt-2 text-[11px] font-medium text-bento-text-muted flex-wrap">
                      <div className="flex items-center gap-1 bg-white border border-zinc-200 px-2 py-0.5 rounded-full shadow-sm">
                        {TYPE_ICONS[task.type]}
                        <span className="capitalize">{task.type}</span>
                      </div>
                      
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border shadow-sm ${
                        isOverdue ? 'text-rose-700 bg-rose-100 border-rose-200' : 
                        isToday ? 'text-amber-800 bg-amber-100 border-amber-200' : 'text-zinc-600 bg-zinc-100 border-zinc-200'
                      }`}>
                        {isOverdue && <AlertCircle size={12} />}
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                        {isToday && " (Today)"}
                        {isOverdue && " (Overdue)"}
                      </div>

                      {field && (
                        <div className="flex items-center gap-1 bg-teal-50 border border-teal-100 text-teal-800 px-2 py-0.5 rounded-full shadow-sm">
                          <Wheat size={12} />
                          {field.name}
                        </div>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-sm text-zinc-600 mt-2 leading-snug line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {!loading && pendingTasks.length === 0 && (
              <div className="bento-card border-dashed p-6 text-center shadow-none bg-zinc-50/50">
                <ListTodo size={32} className="mx-auto text-zinc-300 mb-2" />
                <p className="text-zinc-500 font-medium">No pending tasks</p>
                <button onClick={() => setIsAdding(true)} className="text-bento-primary text-sm font-semibold mt-2 hover:underline">
                  Create a new reminder
                </button>
              </div>
            )}
            {loading && <div className="h-20 flex items-center justify-center"><div className="w-6 h-6 border-2 border-zinc-300 border-t-bento-primary rounded-full animate-spin" /></div>}
          </div>
        </div>

        <div>
          <h3 className="bento-title flex items-center gap-2 mb-4"><CheckCircle2 size={16} /> Completed Tasks</h3>
          <div className="space-y-3 opacity-70 hover:opacity-100 transition-opacity">
            {completedTasks.length === 0 && !loading && (
              <p className="p-4 bg-zinc-50 rounded-xl text-center text-sm text-zinc-500 italic">No completed tasks yet</p>
            )}
            
            {completedTasks.map((task) => {
               const field = fields.find(f => f.id === task.fieldId);
               return (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={task.id} 
                  className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/80 flex gap-3 group transition-colors"
                >
                  <button 
                    onClick={() => toggleTaskStatus(task)} 
                    className="shrink-0 mt-0.5"
                    title="Mark as pending"
                  >
                    <CheckCircle2 size={20} className="text-teal-600" />
                  </button>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="overflow-hidden">
                      <h4 className="font-semibold text-zinc-500 line-through truncate text-sm">
                        {task.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {field && ` • ${field.name}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
