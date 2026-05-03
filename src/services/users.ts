import pb from '@/lib/pocketbase/client'

export const getUsers = () => pb.collection('users').getFullList({ sort: '-created' })

export const createUser = async (data: any) => {
  return pb.collection('users').create({
    ...data,
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    is_paid: false,
  })
}

export const updateUser = (id: string, data: any) => pb.collection('users').update(id, data)

export const requestPasswordReset = (email: string) =>
  pb.collection('users').requestPasswordReset(email)
