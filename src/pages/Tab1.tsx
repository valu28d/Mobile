import React, { useEffect, useState, useMemo } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonFab,
  IonFabButton,
  IonAlert,
  IonToast,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem
} from '@ionic/react';
import { 
  add, 
  walletOutline, 
  trendingUpOutline, 
  timeOutline, 
  personOutline,
  listOutline,
  checkmarkDoneOutline,
  alertCircleOutline
} from 'ionicons/icons';
import './Tab1.css';
import TaskList from '../components/TaskList';
import AddTaskModal from '../components/AddTaskModal';
import FocusModal from '../components/FocusModal';
import { Task } from '../models/task';
import { loadTasks, saveTasks, removeTask } from '../utils/storage';
import { requestPermission, scheduleForTask, cancelForTask, rescheduleAll } from '../utils/notifications';

const Tab1: React.FC = () => {
  // Logic State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const undoTimer = React.useRef<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all');

  // Load Tasks
  useEffect(() => {
    (async () => {
      const t = await loadTasks();
      setTasks(t);
      await requestPermission();
      await rescheduleAll(t);
    })();
  }, []);

  // Save Tasks
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Logic Functions
  function handleSave(task: Task) {
    setTasks(prev => {
      const exists = prev.find(p => p.id === task.id);
      if (exists) return prev.map(p => (p.id === task.id ? task : p));
      scheduleForTask(task).catch(() => {});
      return [task, ...prev];
    });
  }

  function toggle(id: string) {
    setTasks(prev => {
      const newState = prev.map(p => {
        if (p.id !== id) return p;
        const willComplete = !p.completed;
        return willComplete
          ? { ...p, completed: true, completedAt: new Date().toISOString() }
          : { ...p, completed: false, completedAt: undefined };
      });
      const updated = newState.find(x => x.id === id);
      if (updated) {
        if (updated.completed) cancelForTask(id).catch(() => {});
        else scheduleForTask(updated).catch(() => {});
      }
      return newState;
    });
  }

  function remove(id: string) {
    const task = tasks.find(t => t.id === id) || null;
    if (task) {
      setLastDeleted(task);
      setTasks(prev => prev.filter(p => p.id !== id));
      cancelForTask(id).catch(() => {});
      removeTask(id).catch(() => {});
      if (undoTimer.current) clearTimeout(undoTimer.current);
      setShowUndoToast(true);
      undoTimer.current = window.setTimeout(() => {
        setShowUndoToast(false);
        setLastDeleted(null);
        undoTimer.current = null;
      }, 8000);
    }
  }

  function startEdit(t: Task) {
    setEditing(t);
    setShowModal(true);
  }

  function startFocus(t: Task) {
    setFocusTask(t);
    setShowFocusModal(true);
  }

  function requestDelete(id: string) {
    setPendingDeleteId(id);
    setShowConfirm(true);
  }

  function confirmDelete() {
    if (pendingDeleteId) {
      remove(pendingDeleteId);
      setPendingDeleteId(null);
    }
    setShowConfirm(false);
  }

  function handleUndo() {
    if (lastDeleted) {
      setTasks(prev => [lastDeleted, ...prev]);
      scheduleForTask(lastDeleted).catch(() => {});
      setLastDeleted(null);
    }
    setShowUndoToast(false);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }

  // Filter Logic
  const filteredAndSorted = useMemo(() => {
    const now = new Date();
    const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
    
    let list = tasks.slice();
    if (filter === 'today') {
      list = list.filter(t => t.due && isSameDay(new Date(t.due), now) && !t.completed);
    } else if (filter === 'upcoming') {
      list = list.filter(t => t.due && new Date(t.due) > now && !isSameDay(new Date(t.due), now) && !t.completed);
    } else if (filter === 'completed') {
      list = list.filter(t => t.completed);
    }

    const priorityRank = (p?: string) => (p === 'high' ? 0 : p === 'medium' ? 1 : 2);
    list.sort((a, b) => {
      const pa = priorityRank(a.priority);
      const pb = priorityRank(b.priority);
      if (pa !== pb) return pa - pb;
      if (a.due && b.due) return new Date(a.due).getTime() - new Date(b.due).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return list;
  }, [tasks, filter]);

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  const pageRef = React.useRef<HTMLElement>(null);

  return (
    <IonPage ref={pageRef}>
      <IonContent fullscreen className="ion-padding-vertical apple-bg">
        
        {/* Header Section */}
        <div className="ion-padding-horizontal ion-padding-top">
          <h1 style={{ fontWeight: 800, fontSize: '28px', marginBottom: '4px' }} className="gradient-text">
            Mis Tareas
          </h1>
          <p style={{ color: 'var(--ion-color-medium)', margin: 0 }}>
            {pendingCount === 0 ? '¡Todo al día!' : `Tienes ${pendingCount} tareas pendientes`}
          </p>
        </div>

        {/* Summary Card */}
        <IonCard className="glass-effect" style={{ 
          background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.8) 0%, rgba(48, 176, 199, 0.8) 100%)', // More organic/Apple health colors
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 10px 40px rgba(48, 176, 199, 0.3)'
        }}>
          <IonCardHeader>
            <IonCardSubtitle style={{ color: 'rgba(255,255,255,0.8)' }}>Productividad</IonCardSubtitle>
            <IonCardTitle style={{ color: 'white', fontSize: '32px', fontWeight: '700' }}>
              {Math.round((completedCount / (tasks.length || 1)) * 100)}%
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent style={{ color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonIcon icon={trendingUpOutline} />
              <span>Completadas: {completedCount} de {tasks.length}</span>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Filter Segments */}
        <div className="ion-padding-horizontal" style={{ marginBottom: '16px' }}>
          <IonSegment value={filter} onIonChange={e => setFilter((e.target as any).value)} mode="ios" style={{ background: 'rgba(118, 118, 128, 0.12)', borderRadius: '9px' }}>
            <IonSegmentButton value="all">
              <IonLabel>Todas</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="today">
              <IonLabel>Hoy</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="completed">
              <IonLabel>Hecho</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Task List */}
        <div className="ion-padding-horizontal">
           <TaskList tasks={filteredAndSorted} onToggle={toggle} onDelete={requestDelete} onEdit={startEdit} onFocus={startFocus} />
        </div>

        {/* Extra Padding for FAB */}
        <div style={{ height: '80px' }}></div>

        {/* FAB */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ margin: '16px' }}>
          <IonFabButton onClick={() => { setEditing(null); setShowModal(true); }} style={{ '--background': 'var(--ion-color-primary)', boxShadow: '0 4px 16px rgba(88, 86, 214, 0.4)' }}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Modals & Alerts */}
        <AddTaskModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          onSave={handleSave} 
          editing={editing} 
          presentingElement={pageRef.current} 
          onFocus={(t) => {
            setShowModal(false); // Close edit modal
            // Small timeout to allow animation
            setTimeout(() => startFocus(t), 200);
          }}
        />
        <FocusModal 
          isOpen={showFocusModal} 
          onClose={() => setShowFocusModal(false)} 
          task={focusTask}
          onComplete={(id) => { toggle(id); }}
        />
        
        <IonAlert
          isOpen={showConfirm}
          header="Confirmar"
          message="¿Seguro que deseas eliminar esta tarea?"
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setPendingDeleteId(null) },
            { text: 'Eliminar', handler: confirmDelete, role: 'destructive' }
          ]}
        />

        <IonToast
          isOpen={showUndoToast}
          message="Tarea eliminada"
          duration={3000}
          buttons={[{ side: 'end', text: 'Deshacer', handler: handleUndo }]}
          onDidDismiss={() => setShowUndoToast(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
