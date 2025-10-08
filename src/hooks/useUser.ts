import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createUser, markAsArrived, updateUser } from '../api/users.api';
import { CreateUserDto } from '../interfaces/dto/create-user.dto';
import { UpdateUserDto } from '../interfaces/dto/update-user.dto';

export const useUser = () => {
  const markAsArrivedMutation = useMutation({
    mutationFn: markAsArrived,
    onSuccess: async data => {
      toast.success(
        `Asistencia del participante ${data?.firstName} ${data?.paternalLastName} registrada.`
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Error al registrar la asistencia del participante'
      );
    },
  });

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: async data => {
      toast.success(
        `Participante ${data?.firstName} ${data?.paternalLastName} creado.`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear participante');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: async data => {
      toast.success(
        `Datos del participante ${data?.firstName} ${data?.paternalLastName} actualizados.`
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message || 'Error al actualizar los datos del participante'
      );
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
  };
};
