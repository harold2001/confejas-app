import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginFormData } from '../../schemas/loginSchema';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/useAuthStore';
import { useEffect } from 'react';
import { useIonRouter } from '@ionic/react';

const Login = () => {
  const router = useIonRouter();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        <div className='flex items-center justify-center min-h-full'>
          <div className='w-full max-w-md space-y-6 p-6'>
            {/* Title */}
            <div className='text-center'>
              <IonText color='primary'>
                <h1 className='text-3xl font-bold'>Welcome Back</h1>
              </IonText>
              <IonText color='medium'>
                <p className='mt-2'>Sign in to continue</p>
              </IonText>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              {/* Email Input */}
              <div>
                <IonItem className={errors.email ? 'ion-invalid' : ''}>
                  <IonLabel position='stacked'>Email</IonLabel>
                  <Controller
                    name='email'
                    control={control}
                    render={({ field }) => (
                      <IonInput
                        {...field}
                        type='email'
                        placeholder='Enter your email'
                        onIonInput={e => field.onChange(e.detail.value)}
                      />
                    )}
                  />
                </IonItem>
                {errors.email && (
                  <IonText color='danger' className='text-sm ml-4'>
                    <p>{errors.email.message}</p>
                  </IonText>
                )}
              </div>

              {/* Password Input */}
              <div>
                <IonItem className={errors.password ? 'ion-invalid' : ''}>
                  <IonLabel position='stacked'>Password</IonLabel>
                  <Controller
                    name='password'
                    control={control}
                    render={({ field }) => (
                      <IonInput
                        {...field}
                        type='password'
                        placeholder='Enter your password'
                        onIonInput={e => field.onChange(e.detail.value)}
                      />
                    )}
                  />
                </IonItem>
                {errors.password && (
                  <IonText color='danger' className='text-sm ml-4'>
                    <p>{errors.password.message}</p>
                  </IonText>
                )}
              </div>

              {/* Submit Button */}
              <IonButton
                expand='block'
                type='submit'
                disabled={isLoading}
                className='mt-6'
              >
                {isLoading ? (
                  <>
                    <IonSpinner name='crescent' className='mr-2' />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </IonButton>
            </form>

            {/* Additional Links */}
            <div className='text-center mt-4'>
              <IonText color='medium'>
                <p className='text-sm'>
                  Don't have an account?{' '}
                  <a
                    href='/auth/register'
                    className='text-blue-500 hover:underline'
                  >
                    Sign up
                  </a>
                </p>
              </IonText>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
