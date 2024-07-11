import { CreateTaskPayloadData } from '../interfaces';
import {
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTaskDto implements CreateTaskPayloadData {
  @IsOptional()
  @IsUUID()
  public id?: string;

  @IsDefined()
  @IsNumber()
  public number: number;

  @IsDefined()
  @IsString()
  public externalId: string;

  @IsDefined()
  @IsString()
  public state: string;

  @IsOptional()
  @IsString()
  public comments?: string;
}
