import axios from 'axios';

const api = axios.create({
  baseURL: 'https://66691d722e964a6dfed3dd8f.mockapi.io',
});

export interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    skills: string[];
    regDate: string;
}

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getUser = async (id: number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const addUser = async (userData: Partial<User>) => {
  const response = await api.post('/users', userData);
  return response.data;
};

export const updateUser = async (userData: User) => {
  const response = await api.put(`/users/${userData.id}`, userData);
  return response.data;
};

export const deleteUser = async (id: number) => {
  await api.delete(`/users/${id}`);
};
