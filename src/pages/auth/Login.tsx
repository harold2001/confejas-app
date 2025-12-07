import {
  IonButton,
  IonContent,
  IonPage,
  IonText,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
} from '@ionic/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../schemas/loginSchema';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/useAuthStore';
import { useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import InputValidated from '../../components/Input/InputValidated';

const Login = () => {
  const router = useIonRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { login, isLoading } = useAuth();

  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { handleSubmit } = methods;

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
      <IonContent className='ion-padding' scrollY={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <IonGrid>
            <IonRow className='ion-justify-content-center'>
              <IonCol size='12' sizeMd='8' sizeLg='6' sizeXl='4'>
                <IonCard color='primary' className='ion-padding'>
                  <IonCardContent>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <IonText>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                          ConfeJAS Lima Oeste
                        </h1>
                      </IonText>
                      <IonText color='medium'>
                        <p style={{ margin: 0 }}>Inicia sesión para continuar</p>
                      </IonText>
                    </div>

                    <FormProvider {...methods}>
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div style={{ marginBottom: '1rem' }}>
                          <InputValidated
                            name='email'
                            type='email'
                            label='Correo electrónico'
                            placeholder='Ingrese su correo electrónico'
                            required
                          />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                          <InputValidated
                            name='password'
                            type='password'
                            label='Contraseña'
                            placeholder='Ingrese su contraseña'
                            required
                          />
                        </div>

                        <IonButton expand='block' type='submit' disabled={isLoading} color='light'>
                          {isLoading ? (
                            <>
                              <IonSpinner name='crescent' style={{ marginRight: '0.5rem' }} />
                              Iniciando sesión...
                            </>
                          ) : (
                            'Iniciar Sesión'
                          )}
                        </IonButton>
                      </form>
                    </FormProvider>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                      <IonText color='medium'>
                        <p style={{ fontSize: '0.875rem', margin: 0 }}>
                          ¿No tienes una cuenta?{' '}
                          <a href='/auth/register' style={{ color: 'var(--ion-color-tertiary)' }}>
                            Regístrate
                          </a>
                        </p>
                      </IonText>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
