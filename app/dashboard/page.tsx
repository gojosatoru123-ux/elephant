'use client'
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const Dashboard=()=>{
    const router = useRouter();
    const logout=async()=>{
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/");
                }
            }
        })
    }
    const { 
        data: session, 
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession() 
    return (
        <>
        Dashboard
        <Button onClick={logout}>logout</Button>
        {isPending && <p>Loading....</p>}
        {session && <pre>{JSON.stringify(session.user)}</pre>}
        {session?.user.image && <img src={session.user.image}/>}
        </>
    )
}
export default Dashboard;