import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<React.PropsWithChildren>;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, allowedRoles, ...rest }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);

  const hasRequiredRole = () => {
    if (!allowedRoles || allowedRoles.length === 0) {
      return true; // No role restriction
    }

    if (!user?.roles) {
      return false;
    }

    return user.roles.some((role) => allowedRoles.includes(role.name));
  };

  return (
    <Route
      {...rest}
      render={() => {
        if (!isAuthenticated) {
          return <Redirect to='/auth/login' />;
        }

        if (!hasRequiredRole()) {
          return <Redirect to='/dashboard' />;
        }

        return <Component />;
      }}
    />
  );
};

export default ProtectedRoute;
