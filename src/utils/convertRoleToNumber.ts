import { UserRole } from '@/users/enums/UserRole.enum'

export const convertRole = (userRole: UserRole) => {
	return userRole === UserRole.OWNER
		? 3
		: userRole === UserRole.ADMIN
		? 2
		: userRole === UserRole.USER
		? 1
		: 0
}
