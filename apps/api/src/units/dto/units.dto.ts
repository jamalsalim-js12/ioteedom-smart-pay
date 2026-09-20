import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UnitEcgStatusDto {
  @ApiProperty()
  unitId!: string;

  @ApiProperty()
  unitName!: string;

  @ApiProperty()
  propertyId!: string;

  @ApiProperty()
  propertyLabel!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  tenantName!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  accountNumber!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  meterNumber!: string | null;

  @ApiProperty({
    enum: ["open", "paid", "none"],
    description: "open = money still due; paid = settled this cycle; none = no ECG bill row.",
  })
  status!: "open" | "paid" | "none";

  @ApiProperty({ example: "42000", description: "Pesewas as a decimal string." })
  amountDuePesewas!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  billId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  cycle!: string | null;

  @ApiProperty({
    description: "Owners never pay this bill. Status only.",
  })
  ownerCanPay!: false;
}

export class UnitEcgStatusListResponseDto {
  @ApiProperty({ type: [UnitEcgStatusDto] })
  items!: UnitEcgStatusDto[];
}
