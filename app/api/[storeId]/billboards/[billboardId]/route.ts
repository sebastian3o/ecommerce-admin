import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export async function GET(
    req:Request,
    {params}:{params:{billboardId:string}}
){
try{
 
 if(!params.billboardId){
    return new NextResponse("Billboard id is required",{status:400})
 }
 
 const billboard = await prismadb.billboard.findUnique({
    where:{
        id:(await params).billboardId,
    }
 })

 return NextResponse.json(billboard)

}catch(error){
    console.log('[BILLBOARD_GET]',error);
    return new NextResponse("internal error",{status:500});

}
}


export async function PATCH(
    req:Request,
    {params}:{params:{storeId:string,billboardId:string}}
){
try{
 const {userId }=await auth();
 const body = await req.json();
 const {label,imageUrl} = body;

  
 if(!userId){

  return new NextResponse("Unauthenticated",{status:401})  
 }
 if(!label){
    return new NextResponse("Label is required",{status:400})
 }
 if(!imageUrl){
    return new NextResponse("Image url is required",{status:400})
 }
 if(!(await params).billboardId){
    return new NextResponse("Billboard id is required",{status:400})
 }
 const storeByUserId = await prismadb.store.findFirst({
    where: {
        id:(await params).storeId,
        userId
    }
})
if(!storeByUserId){
    return new NextResponse("Unauthorized",{status:403})
}
 const billboard = await prismadb.billboard.updateMany({
    where:{
        id:(await params).billboardId,
    },
    data:{
        label,
        imageUrl
    }
 })

 return NextResponse.json(billboard)

}catch(error){
    console.log('[BILLBOARD_PATCH]',error);
    return new NextResponse("internal error",{status:500});

}
}

export async function DELETE(
    req:Request,
    {params}:{params:{storeId:string,billboardId:string}}
){
try{
 const {userId}=await auth();
 
 if(!userId){
  return new NextResponse("Unauthenticated",{status:401})  
 }

 if(!(await params).billboardId){
    return new NextResponse("Billboard id is required to delete",{status:400})
 }
 const storeByUserId = await prismadb.store.findFirst({
    where: {
        id:(await params).storeId,
        userId
    }
})
if(!storeByUserId){
    return new NextResponse("Unauthorized",{status:403})
}
 const billboard = await prismadb.billboard.deleteMany({
    where:{
        id:(await params).billboardId,
    }
 })

 return NextResponse.json(billboard)

}catch(error){
    console.log('[BILLBOARD_DELETE]',error);
    return new NextResponse("internal error",{status:500});

}
}
