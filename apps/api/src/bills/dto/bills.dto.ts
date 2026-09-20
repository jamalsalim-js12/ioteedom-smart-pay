import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class BillListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({
    enum: ["ecg_postpaid", "ecg_prepaid", "water_tenant", "water_gwcl", "utility"],
  })
  type!: "ecg_postpaid" | "ecg_prepaid" | "water_tenant" | "water_gwcl" | "utility";

  @ApiProperty({ enum: ["direct", "collect", "remit"] })
  rail!: "direct" | "collect" | "remit";

  @ApiProperty({ enum: ["ecg", "gwcl", "owner", "utility", "ev_wallet"] })
  payeeType!: "ecg" | "gwcl" | "owner" | "utility" | "ev_wallet";

  @ApiProperty({ example: "ECG" })
  payeeLabel!: string;

  @ApiProperty()
  cycle!: string;

  @ApiPropertyOptional({ nullable: true, type: String, format: "date" })
  dueAt!: string | null;

  @ApiProperty({ example: "48620", description: "Pesewas as a decimal string." })
  amountDuePesewas!: string;

  @ApiProperty({ enum: ["open", "paid", "void"] })
  status!: "open" | "paid" | "void";

  @ApiProperty()
  propertyId!: string;

  @ApiProperty()
  propertyLabel!: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  unitId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  unitName!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  accountNumber!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  meterNumber!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  usageM3!: string | null;

  @ApiProperty({
    description: "True when this actor may POST /payments against the bill.",
  })
  payable!: boolean;
}

export class BillListResponseDto {
  @ApiProperty({ type: [BillListItemDto] })
  items!: BillListItemDto[];
}
