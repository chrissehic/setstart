import { Loader2 } from 'lucide-react'
import React from 'react'

function loading() {
  return (
    <div className='flex flex-1 flex-col h-screen w-full items-center justify-center'>
        <Loader2 className='size-8 animate-spin text-primary'/>
    </div>
  )
}

export default loading