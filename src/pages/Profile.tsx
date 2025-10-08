import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useAuthStore } from '../store/useAuthStore';

const Profile = () => {
  const user = useAuthStore(state => state.user);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className='ion-padding'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* User Information Card */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Personal Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className='space-y-3'>
                <div>
                  <p className='text-sm text-gray-500'>Full Name</p>
                  <p className='font-medium'>
                    {user?.firstName} {user?.paternalLastName}{' '}
                    {user?.maternalLastName}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Email</p>
                  <p className='font-medium'>{user?.email}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>User ID</p>
                  <p className='font-medium text-xs'>{user?.id}</p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Actions Card */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Account Settings</IonCardTitle>
            </IonCardHeader>
            <IonCardContent className='space-y-3'>
              <IonButton expand='block' color='primary'>
                Edit Profile
              </IonButton>
              <IonButton expand='block' color='secondary'>
                Change Password
              </IonButton>
              <IonButton expand='block' color='warning'>
                Privacy Settings
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
