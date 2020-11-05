import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
export class Session {
  @PrimaryColumn()
  id: string

  @Column()
  data: string

  @Column()
  created_at: Date

  @Column()
  expired_at: Date
}
