import { usePathname } from "next/navigation";
import { JSX } from "react";
const ClientPathName = ({children}:{children:(pathname:string)=>JSX.Element})=>{
    const pathName = usePathname()
    return children(pathName)
}

export default ClientPathName