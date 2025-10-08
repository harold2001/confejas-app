import { IonRouterOutlet, IonSplitPane } from '@ionic/react';
import Menu from './Menu';
import ProtectedRoute from './ProtectedRoute';

interface ProtectedRouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
}

interface ProtectedLayoutProps {
  routes: ProtectedRouteConfig[];
}

/**
 * Layout component that wraps multiple protected routes with Menu and SplitPane
 * Usage:
 * <ProtectedLayout routes={[
 *   { path: '/dashboard', component: Dashboard, exact: true },
 *   { path: '/profile', component: Profile, exact: true },
 *   { path: '/settings', component: Settings, exact: true },
 * ]} />
 */
const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ routes }) => {
  return (
    <IonSplitPane contentId='protected'>
      <Menu />
      <IonRouterOutlet id='protected'>
        {routes.map((route, index) => (
          <ProtectedRoute
            key={index}
            path={route.path}
            exact={route.exact ?? true}
            component={route.component}
          />
        ))}
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

export default ProtectedLayout;
