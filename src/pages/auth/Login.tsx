import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonText,
  IonSpinner,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../schemas/loginSchema';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/useAuthStore';
import { useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import styles from './Login.module.scss';

const Login = () => {
  const router = useIonRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { login, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard', 'root', 'replace');
    }
  }, [isAuthenticated, router]);

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <IonPage>
      <IonContent>
        <IonGrid className={`ion-padding ${styles.gridContainer}`}>
          <IonRow>
            <IonCol>
              <IonText color='light'>
                <h1 className='text-3xl font-bold'>Sistema de Asistencia</h1>
              </IonText>
              <IonText color='light'>
                <p className='mt-2'>Inicia sesión para continuar</p>
              </IonText>
            </IonCol>
          </IonRow>

          <form onSubmit={handleSubmit(onSubmit)}>
            <IonRow className='ion-margin-bottom'>
              <IonCol>
                <IonItem className={errors.email ? 'ion-invalid' : ''}>
                  <IonLabel position='stacked'>Correo electrónico</IonLabel>
                  <Controller
                    name='email'
                    control={control}
                    render={({ field }) => (
                      <IonInput
                        {...field}
                        type='email'
                        placeholder='Ingrese su correo electrónico'
                        onIonInput={(e) => field.onChange(e.detail.value)}
                      />
                    )}
                  />
                </IonItem>
                {errors.email && (
                  <IonText color='danger'>
                    <p>{errors.email.message}</p>
                  </IonText>
                )}
              </IonCol>
            </IonRow>

            <IonRow className='ion-margin-bottom'>
              <IonCol>
                <IonItem className={errors.password ? 'ion-invalid' : ''}>
                  <IonLabel position='stacked'>Contraseña</IonLabel>
                  <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                      <IonInput
                        {...field}
                        type='password'
                        placeholder='Ingrese su contraseña'
                        onIonInput={(e) => field.onChange(e.detail.value)}
                      />
                    )}
                  />
                </IonItem>
                {errors.password && (
                  <IonText color='danger'>
                    <p>{errors.password.message}</p>
                  </IonText>
                )}
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton expand='block' type='submit' disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <IonSpinner name='crescent' className='mr-2' />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </IonButton>
              </IonCol>
            </IonRow>
          </form>

          {/* Additional Links */}
          <IonRow>
            <IonCol>
              <IonText color='medium'>
                <p className='text-sm'>
                  ¿No tienes una cuenta?{' '}
                  <a href='/auth/register' className='text-blue-500 hover:underline'>
                    Regístrate
                  </a>
                </p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login;
