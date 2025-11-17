import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;
@Schema({ timestamps: true })
export class Category {
  @Prop({ require: true })
  name: string;

  @Prop({ required: true })
  des: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  status: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
