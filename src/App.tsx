import React, { useState, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { list, calendar, personOutline, hourglass } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Tab4 from './pages/Tab4';
import WelcomeModal from './components/WelcomeModal';
import { getUser, saveUser, User } from './utils/userStorage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
import '@ionic/react/css/palettes/dark.class.css';
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';
import './theme/global.css';

setupIonicReact();

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    (async () => {
      // Initialize Theme
      const savedTheme = localStorage.getItem('darkMode');
      const isDark = savedTheme !== null 
        ? savedTheme === 'true' 
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('dark', isDark);

      const existingUser = await getUser();
      if (existingUser) {
        setUser(existingUser);
      } else {
        setShowWelcome(true);
      }
    })();
  }, []);

  const handleWelcomeComplete = async (newUser: User) => {
    await saveUser(newUser);
    setUser(newUser);
    setShowWelcome(false);
  };

  return (
    <IonApp>
      <WelcomeModal isOpen={showWelcome} onComplete={handleWelcomeComplete} />
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tab1">
              <Tab1 />
            </Route>
            <Route exact path="/tab2">
              <Tab2 />
            </Route>
            <Route path="/tab3">
              <Tab3 user={user} />
            </Route>
            <Route path="/tab4">
              <Tab4 />
            </Route>
            <Route exact path="/">
              <Redirect to="/tab1" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom" style={{ borderTop: 'none', boxShadow: '0 -4px 12px rgba(0,0,0,0.03)' }}>
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon aria-hidden="true" icon={list} />
              <IonLabel>Tareas</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href="/tab2">
              <IonIcon aria-hidden="true" icon={calendar} />
              <IonLabel>Agenda</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab4" href="/tab4">
               <IonIcon aria-hidden="true" icon={hourglass} />
               <IonLabel>Enfoque</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tab3">
               <IonIcon aria-hidden="true" icon={personOutline} />
               <IonLabel>Perfil</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
