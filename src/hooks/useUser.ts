import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createUser, markAsArrived, updateUser, permutaUser } from '../api/users.api';
import { CreateUserDto } from '../interfaces/dto/create-user.dto';
import { UpdateUserDto } from '../interfaces/dto/update-user.dto';
import { MarkAsArrivedDto } from '../interfaces/dto/mark-as-arrived.dto';

export const useUser = () => {
  const markAsArrivedMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: MarkAsArrivedDto }) => markAsArrived(id, body),
    onMutate: () => {
      toast.loading('Registrando asistencia...');
    },
    onSuccess: async (data) => {
      toast.dismissAll();
      toast.success(`Asistencia del participante ${data?.firstName} ${data?.paternalLastName} modificada.`);
    },
    onError: (error: Error) => {
      toast.dismissAll();
      toast.error(error.message || 'Error al registrar la asistencia del participante');
    },
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onMutate: () => {
      toast.loading('Creando participante...');
    },
    onSuccess: async (data) => {
      toast.dismissAll();
      toast.success(`Participante ${data?.firstName} ${data?.paternalLastName} creado.`);
    },
    onError: (error: Error) => {
      toast.dismissAll();
      toast.error(error.message || 'Error al crear participante');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onMutate: () => {
      toast.loading('Actualizando datos del participante...');
    },
    onSuccess: async (data) => {
      toast.dismissAll();
      toast.success(`Datos del participante ${data?.firstName} ${data?.paternalLastName} actualizados.`);
    },
    onError: (error: Error) => {
      toast.dismissAll();
      toast.error(error.message || 'Error al actualizar los datos del participante');
    },
  });

  const permutaUserMutation = useMutation({
    mutationFn: permutaUser,
    onMutate: () => {
      toast.loading('Realizando permuta...');
    },
    onSuccess: async (data) => {
      toast.dismissAll();
      toast.success(`Permuta realizada. Nuevo participante: ${data?.firstName} ${data?.paternalLastName}`);
    },
    onError: (error: Error) => {
      toast.dismissAll();
      toast.error(error.message || 'Error al realizar la permuta');
    },
  });

  const saveUser = async (user: CreateUserDto | UpdateUserDto) => {
    if ('id' in user) {
      return updateUserMutation.mutateAsync(user);
    } else {
      return createUserMutation.mutateAsync(user);
    }
  };

  return {
    markAsArrived: markAsArrivedMutation.mutateAsync,
    saveUser: saveUser,
    permutaUser: permutaUserMutation.mutateAsync,
  };
};
