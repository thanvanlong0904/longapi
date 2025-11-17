import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  oldprice: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  qty: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
