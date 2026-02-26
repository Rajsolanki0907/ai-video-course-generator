"use client"
import { de } from 'date-fns/locale'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import { UserDetailContext } from '@/context/UserDetailContext'

function Provider({ children }:{children:React.ReactNode }){
     
    const [userDetails,setUserDetails]=useState(null);
    useEffect(() => {
        CreateNewUser();
    }, [])  
    const CreateNewUser = async () => {
        const result = await axios.post("/api/user",{})
        console.log(result.data); 
        setUserDetails(result?.data);
}
    return(
        <div>
            <UserDetailContext.Provider value={{userDetails,setUserDetails}}>
                      {children}
                </UserDetailContext.Provider></div>
    )
    

}
export default Provider