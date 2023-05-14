import { UserEntity } from '@/users/entities/user.entity'

export const returnProfile = (user: UserEntity) => {
	return {
		id: user.id,
		email: user.email,
		name: user.name,
		username: user.username,
		role: user.role,
		createdAt: user.createdAt,
		isActivated: user.isActivated,
		avatarPath: user.avatarPath,
		updatedAt: user.updatedAt,
		online: user.online,
	}
}
