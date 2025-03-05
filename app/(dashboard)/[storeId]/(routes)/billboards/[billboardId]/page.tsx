import prismadb from "@/lib/prismadb";
import { BillboardForm } from "./components/billboard-form";

const BillboardPage =  async ({
    params
}:{
    params:Promise<{billboardId:string}>
}) => {

    const billboard = await prismadb.billboard.findUnique({
        where:{
            id: (await params).billboardId
        }
    })
    return ( 
        <div className="flex-col ">
           <div className="flex-1 space-y-4 p-8 pt-6">
            <BillboardForm initialData={billboard}>

            </BillboardForm>
           </div>
        </div>
     );
}
 
export default  BillboardPage;