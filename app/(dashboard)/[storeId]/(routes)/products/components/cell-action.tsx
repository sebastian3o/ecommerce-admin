"use client";
import axios from "axios";
import { DropdownMenu,DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ProductColumn } from "./columns";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";
import { useAuth } from "@clerk/nextjs";

interface CellActionsProps{
    data:ProductColumn;
}

export const CellAction: React.FC<CellActionsProps> =({
    data
})=>{

    const { getToken, isLoaded } = useAuth();


    const router=useRouter()
    const params = useParams()

    const [loading,setLoading] = useState(false);
    const [open,setOpen] = useState(false);

    

    const onCopy=(id:string)=>{
        navigator.clipboard.writeText(id)
        toast.success("Product Id copied to the clipboard.")
    }
    const onDelete = async ()=>{
        
       
        

        for (let attempt = 1; attempt <= 2; attempt++) {
        try{
            window.dispatchEvent(new Event('focus'));
            await new Promise(resolve => setTimeout(resolve, 100));
            setLoading(true)
            const token = await getToken();


            await axios.delete(`/api/${params.storeId}/products/${data.id}`,{
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              })
            router.refresh()
            router.push(`/${params.storeId}/products`)
            toast.success("Product deleted.") 
            
            break;
        }catch(error){
            if (attempt === 2) {
                toast.error("Something went wrong");
            }
        }finally{
            setLoading(false)
            setOpen(false)
        }
    }
    }
    return (
        <>
        <AlertModal
        isOpen={open}
        onClose={()=>setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
        ></AlertModal>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 s-4"></MoreHorizontal>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                    Actions
                </DropdownMenuLabel>

                <DropdownMenuItem onClick={()=>onCopy(data.id)}>
                
                    <Copy className="mr-2 h-4 w-4"></Copy>
                     Copy
                    </DropdownMenuItem> 
               <DropdownMenuItem onClick={()=>router.push(`/${params.storeId}/products/${data.id}`)}>
                    <Edit className="mr-2 h-4 w-4"></Edit>
                    Update
                </DropdownMenuItem> 
                <DropdownMenuItem onClick={()=>setOpen(true)}>
                    <Trash className="mr-2 h-4 w-4"></Trash>
                    Delete
                </DropdownMenuItem> 
            </DropdownMenuContent>
        </DropdownMenu>
        </>

    );
};