import { IonContent, IonPage, IonSplitPane } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import Menu from '../components/Menu';

interface ConditionalSplitPaneProps {
  children: React.ReactNode;
  contentId: string;
}

/**
 * Conditionally renders IonSplitPane with Menu based on the current route
 * Shows Menu only on protected routes, not on auth or public routes
 */
const MainLayout: React.FC<ConditionalSplitPaneProps> = ({
  children,
  contentId,
}) => {
  const location = useLocation();

  // Routes that should NOT show the menu
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route =>
    location.pathname.startsWith(route)
  );

  // If it's a public route, don't render SplitPane or Menu
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, render with SplitPane and Menu
  return (
    <IonSplitPane contentId={contentId}>
      <Menu />
      {children}
    </IonSplitPane>
  );
};

export default MainLayout;
