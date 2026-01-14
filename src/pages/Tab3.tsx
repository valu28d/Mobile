import React, { useEffect, useState, useMemo } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonAvatar,
  IonToggle,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle
} from '@ionic/react';
import { 
  moonOutline, 
  notificationsOutline,
  lockClosedOutline,
  pieChartOutline
} from 'ionicons/icons';
import './Tab3.css';
import { loadTasks } from '../utils/storage';
import { Task } from '../models/task';
import { User } from '../utils/userStorage';

function donutPath(radius: number, stroke: number, percent: number) {
  const cx = radius + stroke;
  const cy = cx;
  const r = radius;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  return { cx, cy, r, c, dash };
}

interface Tab3Props {
  user: User | null;
}

const Tab3: React.FC<Tab3Props> = ({ user }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Apply initial theme
    document.body.classList.toggle('dark', darkMode);
  }, []);

  useEffect(() => {
    (async () => {
      const t = await loadTasks();
      setTasks(t || []);
    })();
    const handler = (e: any) => {
      setTasks(e?.detail ?? []);
    };
    window.addEventListener('tasks:changed', handler as EventListener);
    return () => window.removeEventListener('tasks:changed', handler as EventListener);
  }, []);

  const toggleDarkMode = (isDark: boolean) => {
    setDarkMode(isDark);
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', isDark.toString());
  };

  // Stats Logic
  const completed = tasks.filter(t => t.completed);
  const total = tasks.length;
  const percent = total ? Math.round((completed.length / total) * 100) : 0;
  
  // Donut chart calc
  const d = donutPath(40, 6, percent);
  const strokeDashoffset = d.c - d.dash;

const SettingIcon = ({ color, icon, slot }: { color: string, icon: any, slot?: string }) => (
  <div slot={slot} style={{
    background: color,
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px'
  }}>
    <IonIcon icon={icon} style={{ color: 'white', fontSize: '18px' }} />
  </div>
);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': 'transparent' }}>
          <IonTitle style={{ fontWeight: 800, fontSize: '34px' }}>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="profile-page apple-bg">
        
        {/* Profile Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 16px 30px 16px' }}>
          <div style={{ position: 'relative' }}>
             <IonAvatar style={{ width: '96px', height: '96px', boxShadow: '0 12px 24px rgba(0,0,0,0.12)', border: '4px solid rgba(255,255,255,0.8)' }}>
               <img alt="Avatar" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
             </IonAvatar>
          </div>
          <h2 style={{ marginTop: '16px', fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px' }}>{user?.name || 'Usuario'}</h2>
          <p style={{ margin: '4px', color: 'var(--ion-color-medium)', fontSize: '15px' }}>Gestor de Tareas</p>
        </div>

        {/* Stats Card */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <IonCard className="glass-effect" style={{ margin: 0, borderRadius: '20px' }}>
            <IonCardHeader style={{ paddingBottom: '0' }}>
              <IonCardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IonIcon icon={pieChartOutline} /> Productividad
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingtop: '16px' }}>
               {/* SVG Donut */}
               <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <svg width="100" height="100" viewBox={`0 0 ${ (d.cx+d.r)*2 } ${ (d.cy+d.r)*2 }`} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={d.cx} cy={d.cy} r={d.r} strokeWidth={8} stroke="rgba(0,0,0,0.1)" fill="none" />
                    <circle
                      cx={d.cx}
                      cy={d.cy}
                      r={d.r}
                      strokeWidth={8}
                      stroke="url(#gradient)"
                      fill="none"
                      strokeDasharray={d.c}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#007aff" />
                        <stop offset="100%" stopColor="#34c759" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                    {percent}%
                  </div>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>{completed.length}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>Completadas</div>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>{total}</div>
                    <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>Totales</div>
                 </div>
               </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Settings List */}
        {/* Settings List */}
        <IonList inset={true} className="glass-effect" style={{ borderRadius: '14px', marginBottom: '24px', padding: 0 }}>
          <IonItem lines="full" detail={false} style={{ '--background': 'transparent' }}>
            <SettingIcon slot="start" icon={moonOutline} color="#5856d6" />
            <IonLabel style={{ fontWeight: 500 }}>Modo Oscuro</IonLabel>
            <IonToggle 
              checked={darkMode} 
              onIonChange={e => toggleDarkMode(e.detail.checked)} 
            />
          </IonItem>
          <IonItem lines="none" detail={false} style={{ '--background': 'transparent' }}>
            <SettingIcon slot="start" icon={notificationsOutline} color="#ff2d55" />
            <IonLabel style={{ fontWeight: 500 }}>Notificaciones</IonLabel>
            <IonToggle defaultChecked={true} />
          </IonItem>
        </IonList>

        <IonList inset={true} className="glass-effect" style={{ borderRadius: '14px', padding: 0 }}>
          <IonItem button detail={true} lines="none" style={{ '--background': 'transparent' }}>
            <SettingIcon slot="start" icon={lockClosedOutline} color="#34c759" />
            <IonLabel style={{ fontWeight: 500 }}>Privacidad</IonLabel>
          </IonItem>
        </IonList>

      </IonContent>
    </IonPage>
  );
};

export default Tab3;
