import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useQueryClient,
  InvalidateQueryFilters,
} from '@tanstack/react-query';
import { getUser, addUser, updateUser } from '../api/api';
import { TextField, Button, Typography, Box, IconButton, Container, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface UserFormInputs {
  name: string;
  surname: string;
  email: string;
  skills: { value: string }[];
}

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    register,
    setValue,
    formState: { errors },
    watch,
  } = useForm<UserFormInputs>({
    defaultValues: {
      name: '',
      surname: '',
      email: '',
      skills: [{ value: '' }],
    },
  });

  const isHasValues = watch();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  });

  const { data: user } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('surname', user.surname);
      setValue('email', user.email);
      setValue(
        'skills',
        user.skills.map((skill: string) => ({ value: skill })),
      );
    }
  }, [user, setValue]);

  const addUserMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users'] as InvalidateQueryFilters);
      navigate('/');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users'] as InvalidateQueryFilters);
      navigate('/');
    },
  });

  const onSubmit = async (data: UserFormInputs) => {
    const userData = {
      id: id ? Number(id) : new Date().getTime(),
      name: data.name,
      surname: data.surname,
      email: data.email,
      skills: data.skills.map((skill) => skill.value),
      regDate: new Date().toISOString().split('T')[0],
    };

    if (id) {
      await updateUserMutation.mutateAsync(userData);
    } else {
      await addUserMutation.mutateAsync(userData);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {id ? 'Edit User' : 'Add User'}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                InputLabelProps={{ shrink: !!isHasValues.name }}
                {...register('name', { required: 'Name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Surname"
                InputLabelProps={{ shrink: !!isHasValues.surname }}
                {...register('surname', { required: 'Surname is required' })}
                error={!!errors.surname}
                helperText={errors.surname?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                InputLabelProps={{ shrink: !!isHasValues.email }}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Email is not valid' },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
          </Grid>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Skills
          </Typography>
          {fields.map((field, index) => (
            <Box key={field.id} display="flex" alignItems="center" sx={{ mb: 2 }}>
              <Controller
                name={`skills.${index}.value`}
                control={control}
                defaultValue={field.value}
                rules={{ required: 'Skill is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={`Skill ${index + 1}`}
                    error={!!errors.skills?.[index]?.value}
                    helperText={errors.skills?.[index]?.value?.message}
                  />
                )}
              />
              <IconButton onClick={() => remove(index)} sx={{ ml: 2 }}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => append({ value: '' })}
            sx={{ mt: 2 }}>
            Add Skill
          </Button>
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3 }}>
            {id ? 'Update' : 'Add'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default UserForm;
