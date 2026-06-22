import { z } from "zod/v4";
export declare const analysesTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "analyses";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "analyses";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "analyses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        imageData: import("drizzle-orm/pg-core").PgColumn<{
            name: "image_data";
            tableName: "analyses";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        imageName: import("drizzle-orm/pg-core").PgColumn<{
            name: "image_name";
            tableName: "analyses";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        topBreed: import("drizzle-orm/pg-core").PgColumn<{
            name: "top_breed";
            tableName: "analyses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        topConfidence: import("drizzle-orm/pg-core").PgColumn<{
            name: "top_confidence";
            tableName: "analyses";
            dataType: "number";
            columnType: "PgReal";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        predictions: import("drizzle-orm/pg-core").PgColumn<{
            name: "predictions";
            tableName: "analyses";
            dataType: "json";
            columnType: "PgJsonb";
            data: {
                breed: string;
                confidence: number;
                rank: number;
            }[];
            driverParam: unknown;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: {
                breed: string;
                confidence: number;
                rank: number;
            }[];
        }>;
        notes: import("drizzle-orm/pg-core").PgColumn<{
            name: "notes";
            tableName: "analyses";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "analyses";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertAnalysisSchema: z.ZodObject<{
    userId: z.ZodString;
    imageData: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    topBreed: z.ZodString;
    topConfidence: z.ZodNumber;
    predictions: z.ZodType<{
        breed: string;
        confidence: number;
        rank: number;
    }[], {
        breed: string;
        confidence: number;
        rank: number;
    }[], z.core.$ZodTypeInternals<{
        breed: string;
        confidence: number;
        rank: number;
    }[], {
        breed: string;
        confidence: number;
        rank: number;
    }[]>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, {
    out: {};
    in: {};
}>;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
//# sourceMappingURL=analyses.d.ts.map