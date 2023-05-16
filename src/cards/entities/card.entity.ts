import { UserEntity } from '@/users/entities/user.entity'
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToOne,
	JoinColumn,
} from 'typeorm'

@Entity('cards')
export class CardEntity {
	@PrimaryGeneratedColumn()
	id: number

	@CreateDateColumn({ name: 'created_at' })
	createdAt: string

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: string

	@Column({ type: 'float', default: 0 })
	balance: number

	@Column({ unique: true })
	number: string

	@Column()
	cvc: number

	@Column()
	term: string

	@OneToOne(() => UserEntity, user => user.id)
	@JoinColumn()
	user: UserEntity
}
