import { UserEntity } from '@/users/entities/user.entity'
import { convertRole } from '@/utils/convertRoleToNumber'
import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'

@Injectable()
export class CheckRoleGuard implements CanActivate {
	constructor(private reflector: Reflector) {}
	canActivate(
		context: ExecutionContext
	): boolean | Promise<boolean> | Observable<boolean> {
		const request = context.switchToHttp().getRequest<{ user: UserEntity }>()
		const user = request.user

		const role = this.reflector.getAllAndOverride<number>('role', [
			context.getHandler(),
			context.getClass(),
		])

		const userRole = convertRole(user.role)

		if (userRole >= role) {
			return true
		}
		throw new ForbiddenException("You don't have access")
	}
}
