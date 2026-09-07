import { IsOptional, Matches } from "class-validator";

export class ChangePinDto {
  @IsOptional()
  @Matches(/^\d{4,6}$/, { message: "PIN must be 4 to 6 digits" })
  currentPin?: string;

  @Matches(/^\d{4,6}$/, { message: "PIN must be 4 to 6 digits" })
  newPin!: string;
}
