import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Generated,
	OneToOne,
	JoinColumn,
} from 'typeorm'
import { UserRole } from '../enums/UserRole.enum'
import { CardEntity } from '@/cards/entities/card.entity'

@Entity('users')
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column({ unique: true })
	email: string

	@Column({ unique: true })
	username: string

	@Column({ default: true })
	online: boolean

	@Column()
	password: string

	@Column({
		type: 'enum',
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole

	@CreateDateColumn({ name: 'created_at' })
	createdAt: string

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: string

	@Generated('uuid')
	@Column({ name: 'activate_link' })
	activateLink: string

	@Generated('uuid')
	@Column({ name: 'reset_link' })
	resetLink: string

	@Column()
	code: number

	@Column({ default: false })
	isActivated: boolean

	@Column({ name: 'avatar_path', default: '/uploads/user.png' })
	avatarPath: string

	@OneToOne(() => CardEntity, card => card.id, {
		cascade: true,
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn()
	card: CardEntity
}
