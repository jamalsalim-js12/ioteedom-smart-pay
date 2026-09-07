import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "024 412 8891", description: "Ghana phone number." })
  @IsString()
  phone!: string;

  @ApiProperty({ example: "2468", description: "4 to 6 digit PIN." })
  @Matches(/^\d{4,6}$/, { message: "PIN must be 4 to 6 digits" })
  pin!: string;
}
