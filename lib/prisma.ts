import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
   return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
   }).$extends({
      query: {
         $allModels: {
            async $allOperations({ operation, model, args, query }) {
               const start = Date.now();
               const result = await query(args);
               const end = Date.now();
               if (process.env.NODE_ENV === 'development') {
                  console.log(`Prisma Query: ${model}.${operation} took ${end - start}ms`);
               }
               return result;
            },
         },
      },
   });
};

declare const globalThis: {
   prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
   globalThis.prismaGlobal = prisma;
}
