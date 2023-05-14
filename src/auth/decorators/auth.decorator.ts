import { CheckRoleGuard } from '@/guards/CheckRole.guard'

import { CheckAuthGuard } from '@/guards/CheckAuth.guard'
import { convertRoleToNumber } from '@/utils/convertRoleToNumber'
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserRole } from '@/users/enums/UserRole.enum'

export const Auth = (role: UserRole = UserRole.USER) => {
	const numRole = convertRoleToNumber(role)
	if (numRole === 1) {
		return applyDecorators(UseGuards(CheckAuthGuard))
	} else if (numRole >= 2) {
		return applyDecorators(
			SetMetadata('role', numRole),
			UseGuards(CheckAuthGuard, new CheckRoleGuard(new Reflector()))
		)
	}
}
