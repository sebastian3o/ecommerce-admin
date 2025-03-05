import {PrismaClient} from "@prisma/client";
declare global{
    //@ts-ignore
    var prisma:PrismaClient|undefined
};

const prismadb = globalThis.prisma || new PrismaClient();
if(process.env.NODE_ENV!=="production")globalThis.prisma=prismadb;
//@ts-ignore
export default prismadb;