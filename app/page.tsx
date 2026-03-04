"use client"
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const  Home=()=> {
  const signinwithgoogle = async ()=>{
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    })
    // await authClient.linkSocial({
    //   provider: "google",
    //   scopes: ["https://www.googleapis.com/auth/drive.file"],
    // });
  }
  return (
    <>
    <Button onClick={signinwithgoogle}>signIn with Google</Button>
    </>
  );
}
export default Home;