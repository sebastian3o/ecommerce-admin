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
    const {name,billboardId} =body;

    if(!userId)
    {
        return new NextResponse("Unauthenticated",{status:401});
    }
    if(!name)
        {
            return new NextResponse("Name is requiered",{status:400});
        }
    if(!billboardId)
        {
            return new NextResponse("Billboard id is requiered",{status:400});
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
    const category = await prismadb.category.create({
        data:{
            name,
            billboardId,
            storeId: (await params).storeId
        }
    })

    return NextResponse.json(category)



}catch(error){
    console.log('[CATEGORIES_POST]',error);
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
    const categories = await prismadb.category.findMany({
        where:{
            storeId:(await params).storeId,
        }
    })

    return NextResponse.json(categories)



}catch(error){
    console.log('[CATEGORIES_GET]',error);
    return new NextResponse("internal error",{status:500});
}
}



