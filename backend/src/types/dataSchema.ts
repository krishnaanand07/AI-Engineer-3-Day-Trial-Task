import { z } from 'zod';

// ============================================================
// DataSchema — Output of Stage 2: Schema Generation
// ============================================================

export const FieldTypeEnum = z.enum([
  'string',
  'text',
  'number',
  'integer',
  'float',
  'boolean',
  'date',
  'datetime',
  'email',
  'url',
  'phone',
  'enum',
  'json',
  'uuid',
]);

export type FieldType = z.infer<typeof FieldTypeEnum>;

export const RelationTypeEnum = z.enum([
  'hasMany',
  'belongsTo',
  'hasOne',
]);

export type RelationType = z.infer<typeof RelationTypeEnum>;

export const OnDeleteEnum = z.enum([
  'CASCADE',
  'SET_NULL',
  'RESTRICT',
  'NO_ACTION',
]);

export const FieldSchema = z.object({
  name: z.string().min(1),
  type: FieldTypeEnum,
  nullable: z.boolean().default(false),
  isRelation: z.boolean().default(false),
  isPrimary: z.boolean().default(false),
  isUnique: z.boolean().default(false),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.null()]).nullish(),
  enumValues: z.array(z.string()).nullish(),
  description: z.string().nullish(),
});

export type Field = z.infer<typeof FieldSchema>;

export const RelationSchema = z.object({
  type: RelationTypeEnum,
  target: z.string().min(1),
  foreignKey: z.string().min(1),
  onDelete: OnDeleteEnum.default('CASCADE'),
});

export type Relation = z.infer<typeof RelationSchema>;

export const EntitySchemaSchema = z.object({
  name: z.string().min(1),
  tableName: z.string().min(1).regex(/^[a-z][a-z0-9_]*$/, 'Table name must be snake_case'),
  description: z.string().nullish(),
  fields: z.array(FieldSchema).min(1, 'Entity must have at least one field'),
  relations: z.array(RelationSchema).default([]),
});

export type EntitySchema = z.infer<typeof EntitySchemaSchema>;

export const DataSchemaSchema = z.object({
  entities: z.array(EntitySchemaSchema).min(1, 'At least one entity is required'),
});

export type DataSchema = z.infer<typeof DataSchemaSchema>;
