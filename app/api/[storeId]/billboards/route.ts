import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
    req:Request,
    {params}:{params:Promise<{storeId:string}>}
) {
try{

    const { userId } = await auth();
    const body= await req.json();
    const {label,imageUrl} =body;

    if(!userId)
    {
        return new NextResponse("Unauthenticated",{status:401});
    }
    if(!label)
        {
            return new NextResponse("Label is requiered",{status:400});
        }
    if(!imageUrl)
        {
            return new NextResponse("Image url is requiered",{status:400});
        }

    if(!(await params).storeId)
        {
            return new NextResponse("Store id is requiered",{status:400});
        }
    const storeByUserId = await prismadb.store.findFirst({
        where: {
            id: (await params).storeId,
            userId
        }
    })
    if(!storeByUserId){
        return new NextResponse("Unauthorized",{status:403})
    }
    const billboard = await prismadb.billboard.create({
        data:{
            label,
            imageUrl,
            storeId: (await params).storeId
        }
    })

    return NextResponse.json(billboard)



}catch(error){
    console.log('[BILLBOARDS_POST]',error);
    return new NextResponse("internal error",{status:500});
}
}

export async function GET(
    req:Request,
    {params}:{params:Promise<{storeId:string}>}
) {
try{


    if(!(await params).storeId)
        {
            return new NextResponse("Store id is requiered",{status:400});
        }
    const billboards = await prismadb.billboard.findMany({
        where:{
            storeId:(await params).storeId,
        }
    })

    return NextResponse.json(billboards)



}catch(error){
    console.log('[BILLBOARDS_GET]',error);
    return new NextResponse("internal error",{status:500});
}
}



