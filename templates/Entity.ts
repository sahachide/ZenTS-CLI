import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class <%= name %> {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  example: string
}