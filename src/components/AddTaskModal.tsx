import React, { useEffect, useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonList,
  IonIcon,
  IonDatetime,
  IonDatetimeButton,
  IonPopover
} from '@ionic/react';
import { 
  closeOutline, 
  calendarOutline, 
  listOutline, 
  alertCircleOutline,
  briefcaseOutline,
  homeOutline,
  schoolOutline,
  cartOutline,
  sparklesOutline,
  cameraOutline,
  closeCircle,
  timerOutline
} from 'ionicons/icons';
import { Task } from '../models/task';
import './AddTaskModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (t: Task) => void;
  editing?: Task | null;
  presentingElement?: HTMLElement | null;
  onFocus?: (t: Task) => void;
}

const AddTaskModal: React.FC<Props> = ({ isOpen, onClose, onSave, editing, presentingElement, onFocus }) => {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [due, setDue] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [attachments, setAttachments] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title);
      setNotes(editing.notes || '');
      setDue(editing.due);
      setPriority(editing.priority || 'medium');
      setCategory(editing.category);
      setAttachments(editing.attachments || []);
    } else {
      setTitle('');
      setNotes('');
      setDue(undefined);
      setPriority('medium');
      setCategory(undefined);
      setAttachments([]);
    }
  }, [editing, isOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAttachments(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  function handleSave() {
    const now = new Date().toISOString();
    const task: Task = editing
      ? { ...editing, title, notes, due, priority, category: category as any, attachments }
      : { id: `${Date.now()}`, title, notes, due, completed: false, createdAt: now, priority, category: category as any, attachments };
    onSave(task);
    onClose();
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} presentingElement={presentingElement || undefined} className="apple-modal">
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'transparent' }}>
          <IonTitle style={{ fontWeight: 700 }}>
            {editing ? 'Editar Tarea' : 'Nueva Tarea'}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} fill="clear" color="medium">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="modal-content">
        
        {/* Main Inputs Group */}
        <IonList inset={true} style={{ margin: '16px', borderRadius: '16px' }}>
          <IonItem lines="full">
            <IonInput 
              value={title} 
              placeholder="¿Qué tienes que hacer?" 
              onIonChange={e => setTitle((e.target as any).value)} 
              className="cute-input"
              style={{ fontWeight: '600' }}
            />
          </IonItem>
          <IonItem lines="none">
             <IonInput 
              value={notes} 
              placeholder="Notas adicionales (opcional)" 
              onIonChange={e => setNotes((e.target as any).value)} 
              className="cute-input"
            />
          </IonItem>
        </IonList>

        {/* Date Section */}
        <div style={{ padding: '0 20px', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--ion-color-medium)' }}>
          FECHA Y HORA
        </div>
        <IonList inset={true} style={{ margin: '0 16px 24px 16px', borderRadius: '16px' }}>
           <IonItem lines="none">
             <IonIcon icon={calendarOutline} slot="start" style={{ color: '#007aff' }} />
             <IonLabel>Vencimiento</IonLabel>
             <IonDatetimeButton datetime="datetime"></IonDatetimeButton>
              <IonModal keepContentsMounted={true}>
                <IonDatetime 
                  id="datetime" 
                  presentation="date-time"
                  value={due}
                  onIonChange={e => setDue(e.detail.value as string)}
                ></IonDatetime>
              </IonModal>
           </IonItem>
        </IonList>

        {/* Priority Section */}
        <div style={{ padding: '0 20px', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--ion-color-medium)' }}>
          PRIORIDAD
        </div>
        <div style={{ padding: '0 16px 24px 16px' }}>
          <div className="chips-container">
            <div className={`custom-chip prio-low ${priority === 'low' ? 'selected' : ''}`} onClick={() => setPriority('low')}>Baja</div>
            <div className={`custom-chip prio-medium ${priority === 'medium' ? 'selected' : ''}`} onClick={() => setPriority('medium')}>Media</div>
            <div className={`custom-chip prio-high ${priority === 'high' ? 'selected' : ''}`} onClick={() => setPriority('high')}>Alta</div>
          </div>
        </div>

        {/* Category Section */}
        <div style={{ padding: '0 20px', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--ion-color-medium)' }}>
          CATEGORÍA
        </div>
        <div style={{ padding: '0 16px 24px 16px' }}>
          <div className="chips-container">
            <div className={`custom-chip cat-work ${category === 'work' ? 'selected' : ''}`} onClick={() => setCategory('work')}>
              <IonIcon icon={briefcaseOutline} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Trabajo
            </div>
            <div className={`custom-chip cat-personal ${category === 'personal' ? 'selected' : ''}`} onClick={() => setCategory('personal')}>
              <IonIcon icon={homeOutline} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Personal
            </div>
            <div className={`custom-chip cat-study ${category === 'study' ? 'selected' : ''}`} onClick={() => setCategory('study')}>
              <IonIcon icon={schoolOutline} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Estudios
            </div>
            <div className={`custom-chip cat-shopping ${category === 'shopping' ? 'selected' : ''}`} onClick={() => setCategory('shopping')}>
              <IonIcon icon={cartOutline} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Compras
            </div>
            <div className={`custom-chip ${category === 'others' ? 'selected' : ''}`} onClick={() => setCategory('others')}>
              <IonIcon icon={sparklesOutline} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} /> Otros
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div style={{ padding: '0 20px', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--ion-color-medium)' }}>
          ADJUNTOS
        </div>
        <div style={{ padding: '0 16px 24px 16px' }}>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileSelect} 
          />
          <IonButton 
            fill="outline" 
            shape="round" 
            size="small" 
            onClick={() => fileInputRef.current?.click()}
            style={{ marginBottom: '12px' }}
          >
            <IonIcon slot="start" icon={cameraOutline} />
            Adjuntar Foto
          </IonButton>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {attachments.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
                <img 
                  src={img} 
                  alt="attachment" 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e0e0e0' }} 
                />
                <div 
                  onClick={() => removeAttachment(idx)}
                  style={{ 
                    position: 'absolute', 
                    top: -6, 
                    right: -6, 
                    background: 'white', 
                    borderRadius: '50%', 
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                  }}
                >
                  <IonIcon icon={closeCircle} color="danger" style={{ fontSize: '20px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save & Focus Buttons */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <IonButton 
            expand="block" 
            onClick={handleSave} 
            disabled={!title.trim()}
            style={{ 
              '--border-radius': '24px', 
              '--background': 'linear-gradient(135deg, #007aff 0%, #005ec4 100%)',
              height: '50px',
              fontSize: '18px',
              fontWeight: '700',
              boxShadow: '0 8px 16px rgba(0, 122, 255, 0.3)'
            }}
          >
            {editing ? 'Guardar Cambios' : 'Crear Tarea'}
          </IonButton>

          {editing && onFocus && (
            <IonButton 
              expand="block" 
              fill="outline"
              onClick={() => {
                const updatedTask = { ...editing, title, notes, due, priority, category: category as any, attachments };
                onFocus(updatedTask);
              }}
              style={{ 
                '--border-radius': '24px', 
                height: '50px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              <IonIcon slot="start" icon={timerOutline} />
              Iniciar Modo Enfoque 🍅
            </IonButton>
          )}
        </div>

      </IonContent>
    </IonModal>
  );
};

export default AddTaskModal;
