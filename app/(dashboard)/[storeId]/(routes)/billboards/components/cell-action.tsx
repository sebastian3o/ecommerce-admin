"use client";
import axios from "axios";
import { DropdownMenu,DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BillboardColumn } from "./columns";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionsProps{
    data:BillboardColumn;
}

export const CellAction: React.FC<CellActionsProps> =({
    data
})=>{
    const router=useRouter()
    const params = useParams()

    const [loading,setLoading] = useState(false);
    const [open,setOpen] = useState(false);

    

    const onCopy=(id:string)=>{
        navigator.clipboard.writeText(id)
        toast.success("Billboard Id copied to the clipboard.")
    }
    const onDelete = async ()=>{
        try{
            setLoading(true)
            await axios.delete(`/api/${params.storeId}/billboards/${data.id}`)
            router.refresh()
            router.push(`/${params.storeId}/billboards`)
            toast.success("Billboard deleted.")
        }catch(error){
            toast.error("Make sure you remove all categories using this billboard first.")
        }finally{
            setLoading(false)
            setOpen(false)
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
               <DropdownMenuItem onClick={()=>router.push(`/${params.storeId}/billboards/${data.id}`)}>
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