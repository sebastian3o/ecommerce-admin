"use client";

import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Store } from "@prisma/client";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Form, FormControl, FormField, FormLabel,FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";
import { useAuth } from '@clerk/nextjs';

interface SettingsFormProps{
    initialData:Store;
}

const formSchema = z.object({
    name:z.string().min(1),

})

type SettingsFormValues =z.infer<typeof formSchema>

export const SettingsForm:React.FC<SettingsFormProps> = ({
    initialData
    })=>{

        const { getToken } = useAuth();

        const params = useParams()
        const router = useRouter()
        const origin = useOrigin()

        const[open,setOpen]=useState(false)
        const [loading, setLoading] = useState(false)
        const form =useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues:initialData
        })

    const onSubmit = async (data:SettingsFormValues)=>{
        for(let i=0;i<2;i++)
       {try{
        window.dispatchEvent(new Event('focus'));
    await new Promise(resolve => setTimeout(resolve, 100));
        setLoading(true)
        await getToken()
        const token = await getToken();

        

        await axios.patch(`/api/stores/${params.storeId}`,data, {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`, // Optional: Explicit token
            },
          })
        router.refresh()
        toast.success("Store updated.")
        break
       }catch(error)
       {
        console.log(error)

        if(i==1)toast.error("Something went wrong.")
       }finally{
        setLoading(false)
       }
    }
    }

    const onDelete = async ()=>{
        for(let i =0;i<2;i++)
        try{
            window.dispatchEvent(new Event('focus'));
    await new Promise(resolve => setTimeout(resolve, 100));
            setLoading(true)
            const token = await getToken();

            await axios.delete(`/api/stores/${params.storeId}`,{
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              })
            router.refresh()
            router.push("/")
            toast.success("Store deleted.")
            break
        }catch(error){
            console.log(error)
           if(i==1) toast.error("Make sure you remove all products and categories first.")
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
            loading={loading}>

            </AlertModal>
            <div className="flex items-center justify-between">
                <Heading
                title="Settings"
                description="Manage store preferences"
                />
                <Button 
                disabled={loading}
                variant="destructive"
                size="icon"
                onClick={()=>setOpen(true)}>
                <Trash className="h-4 w-4"></Trash>
                </Button>
            </div>

            <Separator></Separator>
            <Form {...form}>
                <form 
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 w-full"
                >
                    <div className="grid grid-cols-3 gap-8">
                        <FormField 
                        control={form.control}
                        name="name"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input 
                                    disabled={loading}
                                    placeholder="Store name"
                                    {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>

                        )}
                        />

                    </div>

                    <Button disabled={loading} className="ml-auto" type="submit">
                        Save changes
                    </Button>

                </form>
            </Form>
            <Separator/>
            <ApiAlert 
            title="NEXT_PUBLIC_API_URL"
            description={`${origin}/api/${params.storeId}`}
            variant="public"
            />
        </>

    )
}