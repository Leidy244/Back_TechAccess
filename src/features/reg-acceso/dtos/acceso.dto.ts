import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateAccesoDto {

  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  readonly horafecha!: Date;
  
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  readonly accion!: boolean;

  @ApiProperty()
  @IsString()
  readonly observacion?: string;

  @IsInt({ each: true })
  @Type(() => Number)
  @ApiProperty()
  readonly usuarioId!: number;
}

export class UpdateAccesoDto extends PartialType(CreateAccesoDto){}